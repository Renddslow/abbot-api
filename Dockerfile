FROM node:14

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8080

CMD ["node", "dist/index.js"]
