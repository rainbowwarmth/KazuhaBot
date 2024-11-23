"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = exports.config = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = __importStar(require("./lib/logger"));
const findOpts_1 = require("./lib/findOpts");
const render_1 = require("./lib/render");
const configFilePath = path.resolve(process.cwd(), 'config', 'config.json');
const botFilePath = path.resolve(process.cwd(), 'package.json');
if (!fs.existsSync(configFilePath)) {
    process.exit(1);
}
if (!fs.existsSync(botFilePath)) {
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
exports.config = config;
const Bot = JSON.parse(fs.readFileSync(botFilePath, 'utf8'));
exports.Bot = Bot;
// 导出读取的配置数据
let kazuha = {
    chalk: chalk_1.default,
    findOpts: findOpts_1.findOpts,
    Bot,
    config,
    logger: logger_1.default,
    setDevLog: logger_1.setDevLog,
    render: render_1.render,
};
exports.default = kazuha;
//# sourceMappingURL=kazuha.js.map