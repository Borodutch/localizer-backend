const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../.env` })
const axios = require('axios')
const flatten = require('flat')
const localizations = require('./localizations-web.js')

const flattenedLocalizations = {}
Object.keys(localizations).forEach((language) => {
  flattenedLocalizations[language] = flatten(localizations[language])
})

const result = {}

const firstLanguage = Object.keys(flattenedLocalizations)[0]
Object.keys(flattenedLocalizations[firstLanguage]).forEach((key) => {
  const keyObject = {}
  for (const language in flattenedLocalizations) {
    if (flattenedLocalizations[language][key]) {
      keyObject[language] = flattenedLocalizations[language][key]
    }
  }
  result[key] = keyObject
})
;(async function postLocalizations() {
  console.log('==== Posting body:')
  console.log(JSON.stringify(result, undefined, 2))
  try {
    await axios.post(`http://localhost:1337/localizations`, {
      localizations: result,
      password: process.env.PASSWORD,
      username: 'borodutch',
      tags: ['web'],
    })
    console.error(`==== Body posted!`)
  } catch (err) {
    console.error(`==== Error posting: ${err.message}`)
  }
})()
