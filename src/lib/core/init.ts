import path from 'path';
import fs from 'fs';
import { copyFileSync, readdirSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';

// 使用 process.cwd() 获取项目根目录
const projectRoot = process.cwd();

// 复制目录的函数
function copyDirectory(src: string, dest: string) {
    // 确保目标目录存在
    mkdirSync(dest, { recursive: true });

    // 获取源目录中的文件列表
    const files = readdirSync(src);

    // 遍历每个文件或子目录
    files.forEach(file => {
        const srcPath = join(src, file);
        const destPath = join(dest, file);

        // 检查是文件还是目录
        const stat = statSync(srcPath);
        if (stat.isDirectory()) {
            // 如果是目录，则递归调用
            copyDirectory(srcPath, destPath);
        } else {
            // 如果是文件，则复制文件
            copyFileSync(srcPath, destPath);
        }
    });
}

// 主执行函数
async function setup() {
    try {
        // 复制plugins文件夹
        const sourcePluginsDir = path.join(projectRoot, 'node_modules', 'kazuha-bot', 'plugins');
        const destinationPluginsDir = path.join(projectRoot, 'plugins');
        copyDirectory(sourcePluginsDir, destinationPluginsDir);

        console.log('Plugins folder copied successfully');
    } catch (error) {
        console.error('Failed to copy plugins folder:', error);
    }
}

const configJsonContent = JSON.stringify({
    initConfig: {
        appID: "APPID",
        token: "TOKEN",
        intents: [
            "GUILD_MESSAGES",
            "DIRECT_MESSAGE"
        ],
        sandbox: false,
        adminId: [
            "2492083538938174755"
        ]
    },
    databaseConfig: {
        unixsocket: "/run/redis/redis-server.sock"
    },
    log_level: "all",
    loadGuild: false,
    devEnv: "false",
    render: {
        useExternalBrowser: false,
        host: "http://127.0.0.1:7005/puppeteer",
        authorization: "123456",
        timeout: 120
    }
}, null, 2);

// 定义pm2-run.js文件的内容
const pm2RunJsContent = `import '../../app.js';`;

// 定义pm2.yaml文件的内容
const pm2YamlContent = `
apps:
  - cwd: ./ #
    min_uptime: 10000 
    max_restarts: 3
    name: KazuhaBot
    script: ./config/pm2/pm2-run.js 
    error_file: ./pm2/error.log
    out_file: ./pm2/out.log
    max_memory_restart: 512M
    cron_restart: '0 8 * * *'
`;

const configDir = path.join(projectRoot, 'config');
const pm2Dir = path.join(configDir, 'pm2');

// 创建config目录和pm2目录
mkdirSync(configDir, { recursive: true });
mkdirSync(pm2Dir, { recursive: true });

// 创建config.json文件
fs.writeFileSync(path.join(configDir, 'config.json'), configJsonContent);

// 创建pm2-run.js文件
fs.writeFileSync(path.join(pm2Dir, 'pm2-run.js'), pm2RunJsContent);

// 创建pm2.yaml文件
fs.writeFileSync(path.join(pm2Dir, 'pm2.yaml'), pm2YamlContent);

console.log('Files created successfully!');
setup();
