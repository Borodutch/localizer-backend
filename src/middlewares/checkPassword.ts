import { Context } from 'koa'

export function checkPassword(ctx: Context, next: Function) {
  if (ctx.request.body.password !== process.env.PASSWORD) {
    return ctx.throw(403)
  }
  return next()
}
