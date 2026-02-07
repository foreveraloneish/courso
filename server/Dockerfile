FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g typescript ts-node

EXPOSE 3000

CMD ["npm", "run", "dev"]