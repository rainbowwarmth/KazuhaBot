"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDevLog = setDevLog;
const log4js_1 = __importDefault(require("log4js"));
const global_1 = require("./global");
const logger = log4js_1.default.configure({
    appenders: {
        console: {
            type: "console",
            layout: {
                type: "pattern",
                pattern: "%[[KazuhaBot][%d{yyyy-MM-dd hh:mm:ss.SSS}[%p]%] %m"
            }
        },
        error: {
            type: "file",
            filename: "logs/error.log",
            alwaysIncludePattern: true,
            layout: {
                type: "pattern",
                pattern: "%[[KazuhaBot][%d{yyyy-MM-dd hh:mm:ss.SSS}[%p]%] %m"
            }
        }
    },
    categories: {
        default: {
            appenders: ["console"],
            level: "mark",
            enableCallStack: true
        },
        error: {
            appenders: ["console", "error"],
            level: "error"
        }
    },
}).getLogger();
function setDevLog() {
    logger.setParseCallStackFunction((error, linesToSkip) => {
        const stacklines = error.stack?.split("\n").splice(4);
        const lineMatch = /at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/.exec(stacklines[0]);
        /* istanbul ignore else: failsafe */
        if (lineMatch && lineMatch.length === 6)
            return {
                functionName: 'FunctionName',
                lineNumber: 23,
                columnNumber: 35,
                callStack: 'CallStackInformation',
                fileName: ` [${lineMatch[2].replace(`${global_1._path}/`, "")}:${lineMatch[3]}:${lineMatch[4]}]`
            };
    });
}
exports.default = logger;
//# sourceMappingURL=logger.js.map