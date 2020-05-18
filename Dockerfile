FROM node:latest

RUN mkdir /app
WORKDIR /app
COPY . /app/

RUN yarn install

CMD yarn distribute
