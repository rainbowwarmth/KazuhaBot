"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = void 0;
const logger_1 = __importDefault(require("../../lib/logger"));
const task_1 = require("./models/task");
exports.tasks = [
    { taskFunction: task_1.bbbtaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: task_1.bbtaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: task_1.ystaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: task_1.wdtaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: task_1.dbytaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: task_1.zzztaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: task_1.srtaskPushNews, cronExpression: '0/1 * * * * ?' },
];
logger_1.default.info('mihoyo 插件中的所有推送任务已注册');
//# sourceMappingURL=index.js.map