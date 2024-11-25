import fs from 'fs'
import path from 'path'
import { execSync} from 'child_process'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 获取当前工作目录
const currentDir = process.cwd()

// 定义源目录（node_modules/kazuha-bot/dist）和目标目录（当前工作目录）
const sourceDir = path.join(currentDir, 'node_modules', 'kazuha-bot', 'dist')
const targetDir = currentDir; // 目标目录为当前工作目录

// 递归复制目录函数
function copyDir(src, dest) {
  // 创建目标目录
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })

  // 遍历源目录的所有文件和文件夹
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      // 如果是目录，递归调用复制函数
      copyDir(srcPath, destPath)
    } else {
      // 如果是文件，直接复制
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 在目标目录下运行 pnpm install
function installDependencies() {
  try {
    console.log('运行 pnpm install...')
    // Ensure pnpm install runs in the target directory (which is set to the root)
    execSync('pnpm install --registry=https://registry.npmmirror.com', { stdio: 'inherit', cwd: currentDir })
    console.log('依赖项安装成功!')
  } catch (error) {
    console.error('pnpm 安装期间出错:', error)
  }
}

// 执行复制

copyDir(sourceDir, targetDir)
console.log('“dist” 目录的内容已复制到项目根目录下!')
// 执行安装依赖
installDependencies()



