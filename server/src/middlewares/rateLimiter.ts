import { Request, Response, NextFunction } from "express";
import { Redis } from "../lib/redis.js";
import { asyncHandler } from "./asyncHandler.js";

const CAPACITY = 100;
const WINDOW = 60;
const REFILL_RATE = CAPACITY / WINDOW;

export const rateLimiter = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate-limit:${req.ip}`;
    const now = Date.now();

    const data = await Redis.hgetall(key);

    let tokens = data.tokens ? parseFloat(data.tokens) : CAPACITY;
    let lastRefill = data.lastRefill ? parseInt(data.lastRefill) : now;

    const elapsed = (now - lastRefill) / 1000;
    tokens = Math.min(CAPACITY, tokens + elapsed * REFILL_RATE);

    if (tokens < 1) {
        return res.status(429).json({
            message: "Too many requests",
        });
    }

    tokens -= 1;

    await Redis
        .multi()
        .hset(key, "tokens", tokens, "lastRefill", now)
        .expire(key, WINDOW)
        .exec();

    res.setHeader("X-RateLimit-Remaining", Math.floor(tokens));
    next();
});