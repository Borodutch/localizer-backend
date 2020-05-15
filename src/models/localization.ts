import { prop, getModelForClass, arrayProp } from '@typegoose/typegoose'
import { omit } from 'lodash'

class Comment {
  @prop()
  username?: string
  @prop({ required: true })
  text: string
  @prop()
  createdAt: Date
}

class LocalizationVariant {
  @prop()
  username?: string
  @prop({ required: true })
  language: string
  @prop({ required: true })
  text: string
  @prop({ required: true, default: false })
  selected: boolean
  @prop()
  createdAt: Date
  @prop({ required: true, default: 0 })
  upvotes: number
  @prop({ required: true, default: 0 })
  downvotes: number
  @arrayProp({ items: Comment, required: true, default: [] })
  comments: Comment[]
}

export class Localization {
  @prop({ index: true, required: true })
  key: string
  @arrayProp({ items: String, default: [] })
  tags: string[]
  @arrayProp({ items: LocalizationVariant, default: [] })
  variants: LocalizationVariant[]

  stripped() {
    const stripFields = ['updatedAt', '__v']
    return omit(this._doc, stripFields)
  }

  // Mongo property
  _doc: any
}

export const LocalizationModel = getModelForClass(Localization, {
  schemaOptions: { timestamps: true },
})
