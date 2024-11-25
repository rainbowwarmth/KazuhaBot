import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import logger, { setDevLog } from "@src/lib/logger";
import { findOpts } from "@src/lib/findOpts" 
import { render } from "@src/lib/render";

const configFilePath = path.resolve(process.cwd(), 'config', 'config.json');
const botFilePath = path.resolve(process.cwd(), 'package.json');
if (!fs.existsSync(configFilePath)) {
  process.exit(1);
}
if (!fs.existsSync(botFilePath)) {
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
const Bot = JSON.parse(fs.readFileSync(botFilePath, 'utf8'));
export { config, Bot };

// 导出读取的配置数据

let kazuha: any = { 
    chalk,
    findOpts,
    Bot,
    config,
    logger,
    setDevLog,
    render,
}

export default kazuha