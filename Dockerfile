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

# Удаляем явно не нужные в проде каталоги и файлы (если их пропустил dockerignore)
RUN rm -rf .git .github docs tests .npmrc .nvmrc .editorconfig .eslintrc .foreverignore .gitignore .dockerignore Dockerfile


# 
# Запуск в продакшн
# 
FROM node:14-alpine3.10

WORKDIR /app

# Копируем из билдера "чистое" приложение
COPY --from=builder /sources/ .
# в данном случае к базовому образу node:14-alpine3.10 добавляется только один слой файловой системы - COPY
# слои со всеми install, rm остаются в предыдущем, неиспользуемом образе(builder)

EXPOSE 1337

CMD [ "node", "dist/app.js" ]