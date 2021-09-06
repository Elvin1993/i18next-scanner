const fs = require('fs')
const path = require('path')
const typescript = require('typescript')

const extendions = ['.ts', '.tsx']

module.exports = {
  input: [
    // './src/pages/**/*.{ts,tsx}',
    // './src/hooks/**/*.{ts,tsx}',
    // './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // Use ! to filter out files or directories
    '!./src/assets/**',
    '!./src/locales/**',
    '!./src/locales_/**',
    // '!./src/locales/**',
    '!**/node_modules/**',
  ],
  output: './src/',
  options: {
    debug: true,
    // func: {
    //     list: ['TranslateString', 't'],
    //     extensions: extendions,
    // },
    // trans: {
    //     extensions: extendions
    // },
    lngs: ['en'],
    defaultLng: 'en',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'locales_/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  transform: function customTransform(file, enc, done) {
    const { base, ext } = path.parse(file.path)
    console.log(file.path, extendions.includes(ext) && !base.includes('.d.ts') )

    if (extendions.includes(ext) && !base.includes('.d.ts')) {
      const parser = this.parser
      const content = fs.readFileSync(file.path, enc)
      let count = 0

      const { outputText } = typescript.transpileModule(content, {
        compilerOptions: {
            target: 'es2018',
          },
        fileName: path.basename(file.path),
      })
      parser.parseTransFromString(
        outputText,
        { component: 'TranslatedText', i18nKey: 'translationId', defaultsKey: 'defaults' },
        (key, options) => {
          parser.set(key, options)
          count++
        }
      )

      parser.parseTransFromString(
        outputText,
        { component: 'Trans', i18nKey: 'translationId', defaultsKey: 'defaults' },
        (key, options) => {
          parser.set(key, options)
          count++
        }
      )
      // console.log(file.path)
      parser.parseFuncFromString(outputText, { list: ['TranslateString', 't']}, (key, options) => {
        parser.set(key, options)
        count++
      });

      console.log(file.path + ' - ' + count)
    }

    done()
  },
}
