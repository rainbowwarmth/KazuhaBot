"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const kazuha_1 = __importDefault(require("./kazuha"));
(0, index_1.initialize)().then(() => {
    kazuha_1.default.logger.mark(kazuha_1.default.chalk.cyan('kazuhaBot' + ' v' + kazuha_1.default.Bot.version + '启动成功'));
});
//# sourceMappingURL=app.js.map