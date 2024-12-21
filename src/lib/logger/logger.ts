import log4js from "log4js";
import { _path } from "@src/lib/global/global"

const logger = log4js.configure({
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
            level: "all",
            enableCallStack: true
        },
        error: { 
            appenders: ["console", "error"], 
            level: "error" 
        }
    },
    
}).getLogger();

    export function setDevLog() {
        logger.setParseCallStackFunction((error: Error, linesToSkip: number) => {
            const stacklines = error.stack?.split("\n")!.splice(4)!;
            const lineMatch = /at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/.exec(stacklines[0]);
            /* istanbul ignore else: failsafe */
            if (lineMatch && lineMatch.length === 6)
                return { 
            functionName: 'FunctionName',
            lineNumber: 23,
            columnNumber: 35,
            callStack: 'CallStackInformation',
            fileName: ` [${lineMatch[2].replace(`${_path}/`, "")}:${lineMatch[3]}:${lineMatch[4]}]` 
        };
    });
}

export default logger;