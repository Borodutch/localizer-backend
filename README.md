# Localizer backend

This is the backend part of Localizer.

## Installation and local launch

1. Clone this repo: `git clone https://github.com/backmeupplz/localizer-backend`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn install` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests. Also check out `/src/conrollers` for the API.

## Run with docker compose

1. Create `.env` with the environment variables listed below (exclude `MONGO`)
2. Run `docker-compose up` or `docker-compose up -d` for daemon

## Environment variables

| Name             | Description                                        |
| ---------------- | -------------------------------------------------- |
| `MONGO`          | URL of the mongo database                          |
| `PASSWORD`       | Admin password to use on frontend                  |
| `TELEGRAM_TOKEN` | Token of Telegram bot to report errors             |
| `TELEGRAM_ADMIN` | Telegram user id that should receive error reports |

Also, please, consider looking at `.env.sample`.
