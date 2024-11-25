FROM node:22-alpine
WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

CMD ["yarn", "build"]
