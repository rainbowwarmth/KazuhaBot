import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const currentDir = process.cwd();
const sourceDir = path.join(currentDir, 'dist');
const targetDir = currentDir; // 目标目录为项目根目录
const pluginsDir = path.join(currentDir, 'src', 'plugins'); // 插件目录路径

// 检查并删除目标目录中的指定文件或文件夹
function deleteIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmdirSync(filePath, { recursive: true });
      console.log(`已删除目录: ${filePath}`);
    } else {
      fs.unlinkSync(filePath);
      console.log(`已删除文件: ${filePath}`);
    }
  }
}

// 递归复制目录函数
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`源目录不存在: ${src}`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // 遍历源目录的所有文件和文件夹
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath); // 如果是目录，递归复制
    } else {
      fs.copyFileSync(srcPath, destPath); // 如果是文件，直接复制
    }
  }
}

// 在目标目录下运行 pnpm install
function installDependencies() {
  try {
    console.log('运行 pnpm install...');
    execSync('pnpm install --registry=https://registry.npmmirror.com', { stdio: 'inherit', cwd: currentDir });
    console.log('依赖项安装成功!');
  } catch (error) {
    console.error('pnpm 安装期间出错:', error);
  }
}

// 删除目标目录中的指定文件和文件夹（src 和 dist 目录会被删除）
const directoriesToDelete = ['src', 'dist'];

if (fs.existsSync(sourceDir)) {
  copyDir(sourceDir, targetDir); // 先复制 dist 目录到根目录
  console.log('“dist” 目录的内容已复制到项目根目录下!');
} else {
  console.error('未找到 “dist” 目录，无法复制!');
}

// 复制插件包中的 config 和 resources 目录到根目录 plugins/<plugin_name> 下
const pluginDirs = fs.readdirSync(pluginsDir, { withFileTypes: true }).filter((dir) => dir.isDirectory());

pluginDirs.forEach((pluginDir) => {
  const pluginSrcDir = path.join(pluginsDir, pluginDir.name); // 插件包的源目录
  const pluginTargetDir = path.join(targetDir, 'plugins', pluginDir.name); // 插件包的目标目录

  // 复制 config 目录
  const configDir = path.join(pluginSrcDir, 'config');
  if (fs.existsSync(configDir)) {
    fs.mkdirSync(pluginTargetDir, { recursive: true }); // 创建插件包目标目录
    const pluginConfigDir = path.join(pluginTargetDir, 'config');
    copyDir(configDir, pluginConfigDir); // 执行复制
    console.log(`插件 ${pluginDir.name} 的 config 目录已复制到根目录下 plugins/${pluginDir.name}`);
  } else {
    console.error(`未找到插件 ${pluginDir.name} 的 config 目录!`);
  }

  // 复制 resources 目录
  const resourcesDir = path.join(pluginSrcDir, 'resources');
  if (fs.existsSync(resourcesDir)) {
    const pluginResourcesDir = path.join(pluginTargetDir, 'resources');
    copyDir(resourcesDir, pluginResourcesDir); // 执行复制
    console.log(`插件 ${pluginDir.name} 的 resources 目录已复制到根目录下 plugins/${pluginDir.name}`);
  } else {
    console.error(`未找到插件 ${pluginDir.name} 的 resources 目录!`);
  }
});

// 删除目标目录中的指定文件和文件夹
directoriesToDelete.forEach((dir) => {
  const filePath = path.join(targetDir, dir);
  deleteIfExists(filePath);
});

// 执行安装依赖
installDependencies();
