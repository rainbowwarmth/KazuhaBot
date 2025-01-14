import { createOpenAPI, createWebsocket } from "qq-bot-sdk";
import { config } from "../../lib/config/config.js";
import logger from "../../lib/config/logger.js";
const initConfig = {
    appID: config.initConfig.appID,
    token: config.initConfig.token,
    intents: config.initConfig.intents,
    sandbox: config.initConfig.sandbox,
    logger: logger
};
const client = createOpenAPI(initConfig);
const ws = createWebsocket(initConfig);
export { client, ws };
