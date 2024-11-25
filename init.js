import { initGlobals } from './lib/Bot.js';
import kazuha from './kazuha.js';
export async function init() {
    kazuha.logger.mark(`-------(≡^∇^≡)-------`);
    kazuha.logger.mark(kazuha.chalk.cyan(kazuha.Bot.name + ' v' + kazuha.Bot.version + '启动中...'));
    kazuha.logger.mark(kazuha.chalk.greenBright('https://github.com/rainbowwarmth/KazuhaBot_Newmys.git'));
    process.title = 'kazuhaBot' + ' v' + kazuha.Bot.version + ' © 2023-2024 ' + '@' + kazuha.Bot.author;
    process.env.TZ = "Asia/Shanghai";
    await initGlobals();
}
