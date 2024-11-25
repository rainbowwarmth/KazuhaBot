import { initialize } from "@src/index";
import kazuha from "@src/kazuha";

initialize().then(() => {
    kazuha.logger.mark(kazuha.chalk.cyan('kazuhaBot' + ' v' + kazuha.Bot.version + '启动成功'))
})