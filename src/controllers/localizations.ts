import { DocumentType } from '@typegoose/typegoose'
import { LocalizationModel, Localization } from '../models/localization'
import { Context } from 'koa'
import { Controller, Post, Get } from 'koa-router-ts'
import { checkPassword } from '../middlewares/checkPassword'

@Controller('/localizations')
export default class {
  @Get('/')
  async getLocalizations(ctx: Context) {
    const localizations = await LocalizationModel.find()
    ctx.body = localizations.map((l) => l.stripped())
  }

  @Post('/', checkPassword)
  async postLocalizations(ctx: Context) {
    // Get new and old localizations
    const newLocalizations = ctx.request.body.localizations // { key: { en: '', ru: '' }}
    const oldLocalizations = await LocalizationModel.find({})
    // Map old localizations to key
    const oldLocalizationsMap = oldLocalizations.reduce((p, c) => {
      p[c.key] = c
      return p
    }, {} as { [index: string]: DocumentType<Localization> })
    // Loop through new localizations
    for (const key in newLocalizations) {
      // Get localizations
      const oldLocalization = oldLocalizationsMap[key]
      const newLocalization = newLocalizations[key] as {
        [index: string]: string
      } // { en: '', ru: '' }
      // Check if this localization didn't exist
      if (!oldLocalization) {
        await new LocalizationModel({
          key,
          tags: ctx.request.body.tags, // ['ios', 'web']
          variants: Object.keys(newLocalization).map((language) => {
            return {
              username: ctx.request.body.username || 'admin', // 'borodutch',
              language,
              text: newLocalization[language],
              selected: true,
            }
          }),
        }).save()
      } else {
        // Loop through languages in new localization
        for (const language in newLocalization) {
          // Create placeholder variables for future
          let alreadyExists = false
          // Loop through the old localization variants for this language
          console.log(
            oldLocalization.variants.filter((v) => v.language === language)
          )
          for (const variant of oldLocalization.variants.filter(
            (v) => v.language === language
          )) {
            if (variant.text === newLocalization[language]) {
              alreadyExists = true
              variant.selected = true
            } else {
              variant.selected = false
            }
          }
          // Create a new variant if not already there
          if (!alreadyExists) {
            oldLocalization.variants.push({
              username: ctx.request.body.username || 'admin', // 'borodutch',
              language,
              text: newLocalization[language],
              selected: true,
            })
          }
          // Save old localization
          await oldLocalization.save()
        }
      }
    }
    ctx.status = 200
  }

  @Post('/select', checkPassword)
  async selectVariant(ctx: Context) {
    const { key, id } = ctx.request.body
    if (!key || !id) {
      return ctx.throw(403)
    }
    const localization = await LocalizationModel.findOne({ key })
    if (!localization) {
      return ctx.throw(404)
    }
    const variantToSelect = localization.variants.find(
      (v: any) => v._id.toString() === id
    )
    if (!variantToSelect) {
      return ctx.throw(404)
    }
    for (const variant of localization.variants) {
      if (variant.language === variantToSelect.language) {
        variant.selected = false
      }
    }
    variantToSelect.selected = true
    await localization.save()
    ctx.status = 200
  }

  @Post('/delete', checkPassword)
  async deleteVariant(ctx: Context) {
    const { key, id } = ctx.request.body
    if (!key || !id) {
      return ctx.throw(403)
    }
    const localization = await LocalizationModel.findOne({ key })
    if (!localization) {
      return ctx.throw(404)
    }
    localization.variants = localization.variants.filter(
      (v: any) => v._id.toString() !== id
    )
    await localization.save()
    ctx.status = 200
  }

  @Post('/localization/delete', checkPassword)
  async deleteLocalization(ctx: Context) {
    const { key } = ctx.request.body
    if (!key) {
      return ctx.throw(403)
    }
    const localization = await LocalizationModel.findOne({ key })
    if (!localization) {
      return ctx.throw(404)
    }
    await localization.remove()
    ctx.status = 200
  }

  @Post('/localization')
  async postLocalization(ctx: Context) {
    const { key, text, language, username } = ctx.request.body
    if (!key || !text || !language) {
      return ctx.throw(403)
    }
    const localization = await LocalizationModel.findOne({ key })
    if (!localization) {
      return ctx.throw(404)
    }
    // Check if this variant already exists
    for (const variant of localization.variants.filter(
      (v) => v.language === language
    )) {
      if (variant.text === text) {
        return 403
      }
    }
    localization.variants.push({
      username,
      language,
      text,
      selected: false,
    })
    await localization.save()
    ctx.status = 200
  }
}
