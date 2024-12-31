import * as fs from 'fs';
import * as path from 'path';
const checkFileExists = (filePath) => {
    if (!fs.existsSync(filePath)) {
        process.exit(1);
    }
};
const configFilePath = path.resolve(process.cwd(), 'config', 'config.json');
const botFilePath = path.resolve(process.cwd(), 'package.json');
checkFileExists(configFilePath);
checkFileExists(botFilePath);
const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
const Bot = JSON.parse(fs.readFileSync(botFilePath, 'utf8'));
export { config, Bot };
