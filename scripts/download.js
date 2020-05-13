const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../.env` })
const axios = require('axios')
const unflatten = require('flat').unflatten
const fs = require('fs')

;(async function getTranslations() {
  console.log('==== Getting localizations')
  const translations = (await axios.get('http://localhost:1337/localizations'))
    .data
  console.log('==== Got localizations:')
  console.log(JSON.stringify(translations, undefined, 2))
  // Get flattened map
  const flattenedMap = {} // { key: {en: '', ru: ''}}
  translations.forEach((t) => {
    const key = t.key
    const variants = t.variants.filter((v) => !!v.selected)
    flattenedMap[key] = variants.reduce((p, c) => {
      p[c.language] = c.text
      return p
    }, {})
  })
  console.log('==== Decoded response:')
  console.log(flattenedMap)
  // Reverse the map
  const reversedMap = {}
  Object.keys(flattenedMap).forEach((k) => {
    const internals = flattenedMap[k]
    for (const language in internals) {
      const text = internals[language]
      if (!reversedMap[language]) {
        reversedMap[language] = {}
      }
      reversedMap[language][k] = text
    }
  })
  const unflattened = unflatten(reversedMap)
  console.log('==== Reversed and unflattened map')
  console.log(unflattened)
  fs.writeFileSync(
    `${__dirname}/downloaded.js`,
    `module.exports = ${JSON.stringify(unflattened, undefined, 2)}`
  )
  console.log('==== Saved object to the file')
})()
