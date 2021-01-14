FROM node:14-alpine3.10 as builder

WORKDIR /sources
COPY . .

RUN npm i --ignore-scripts
RUN npm run build-ts 
RUN rm -rf ./src

# удаляем devDependencies
RUN npm prune --production

# Чистка node_modules от "хлама" файлов README LICENSE etc
RUN npx modclean --no-progress --run


# 
# Запуск в продакшн
# 
FROM node:14-alpine3.10

WORKDIR /app

# Копируем из билдера "чистое" приложение
COPY --from=builder /sources/dist ./dist
COPY --from=builder /sources/package.json .
COPY --from=builder /sources/package-lock.json .
COPY --from=builder /sources/node_modules ./node_modules

EXPOSE 1337

CMD [ "node", "dist/app.js" ]