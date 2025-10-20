const inputfileEn = 'src/locales/en.yml'
const inputfileDe = 'src/locales/de.yml'
const localesFile = 'dist/locales/locales.json'
const locales = {}

const fs = require('node:fs')
const yaml = require('js-yaml')

const objFileEn = yaml.load(fs.readFileSync(inputfileEn, { encoding: 'utf-8' }))
const objFileDe = yaml.load(fs.readFileSync(inputfileDe, { encoding: 'utf-8' }))

if (!fs.existsSync('dist/locales/')) {
  fs.mkdirSync('dist/locales/')
}

locales.en = objFileEn
locales.de = objFileDe

fs.writeFileSync(localesFile, JSON.stringify(locales, null, 2))
