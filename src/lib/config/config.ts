import * as fs from 'fs'
import * as path from 'path'

const configFilePath = path.resolve(process.cwd(), 'config', 'config.json')
const botFilePath = path.resolve(process.cwd(), 'package.json')
if (!fs.existsSync(configFilePath)) {
  process.exit(1);
}
if (!fs.existsSync(botFilePath)) {
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'))
const Bot = JSON.parse(fs.readFileSync(botFilePath, 'utf8'))

export { config, Bot }