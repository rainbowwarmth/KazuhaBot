import { initialize } from './index.js';
import kazuha from './kazuha.js';
initialize().then(() => {
    kazuha.logger.mark(kazuha.chalk.cyan('kazuhaBot' + ' v' + kazuha.Bot.version + '启动成功'));
});
