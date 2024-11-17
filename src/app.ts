import { initialize } from "./index";
import kazuha from "./kazuha";

initialize().then(() => {
    kazuha.logger.mark(kazuha.chalk.cyan('kazuhaBot' + ' v' + kazuha.Bot.version + '启动成功'))
})