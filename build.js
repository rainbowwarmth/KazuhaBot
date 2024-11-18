const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 编译 TypeScript 文件并捕获错误
  execSync("tsc", { stdio: 'inherit' });
} catch (error) {
  console.error("TypeScript 编译过程中发生错误:", error.message);
  process.exit(1); // 编译失败时退出程序
}

// 删除 .map 文件的函数
function deleteMapFiles(dir) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      deleteMapFiles(filePath); // 递归删除子目录中的 .map 文件
    } else if (file.endsWith('.map')) {
      fs.unlinkSync(filePath);
      console.log(`已删除: ${filePath}`);
    }
  }
}

// 删除编译输出目录中的 .map 文件 (但不删除文件夹)
deleteMapFiles(path.join(__dirname, 'dist'));

// 定义源目录和目标目录
const sourceDir = path.join(__dirname, 'resources');
const targetDir = path.join(__dirname, 'dist', 'resources');

const packageJsonPath = path.join(__dirname, 'package.json');
const distPackageJsonPath = path.join(__dirname, 'dist', 'package.json');

// 复制 package.json 文件到 dist 目录
if (fs.existsSync(packageJsonPath)) {
  fs.copyFileSync(packageJsonPath, distPackageJsonPath);
  console.log(`已复制 package.json 到: ${distPackageJsonPath}`);
} else {
  console.log("未找到 package.json 文件，无法复制");
}

// 递归复制目录函数
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`源目录不存在: ${src}`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath); // 递归复制子目录
    } else {
      fs.copyFileSync(srcPath, destPath); // 复制文件
    }
  }
}

// 执行复制资源文件夹
copyDir(sourceDir, targetDir);

// 复制 config 文件夹到 dist
const configSourceDir = path.join(__dirname, 'config');
const configTargetDir = path.join(__dirname, 'dist', 'config');
copyDir(configSourceDir, configTargetDir);

// 复制插件目录内的 resources 和 config 文件夹
const pluginsDir = path.resolve(__dirname, './src/plugins');
const distPluginsDir = path.resolve(__dirname, './dist/plugins');
const pluginPaths = fs.readdirSync(pluginsDir).filter((file) => {
  const filePath = path.join(pluginsDir, file);
  return fs.statSync(filePath).isDirectory(); // 只筛选目录
});

const excludedPlugins = ['other', 'system', 'example'];

for (const plugin of pluginPaths) {
  if (excludedPlugins.includes(plugin)) {
    continue; // 跳过被排除的插件
  }

  const pluginPath = path.join(pluginsDir, plugin); // 插件的路径
  const pluginDistPath = path.join(distPluginsDir, plugin); // 目标路径

  // 如果插件包内存在 resources 文件夹，则复制
  const pluginResourcesDir = path.join(pluginPath, 'resources');
  if (fs.existsSync(pluginResourcesDir)) {
    const pluginDistResourcesDir = path.join(pluginDistPath, 'resources');
    copyDir(pluginResourcesDir, pluginDistResourcesDir);
    console.log(`已复制插件 ${plugin} 的 resources 文件夹`);
  }

  // 如果插件包内存在 config 文件夹，则复制
  const pluginConfigDir = path.join(pluginPath, 'config');
  if (fs.existsSync(pluginConfigDir)) {
    const pluginDistConfigDir = path.join(pluginDistPath, 'config');
    copyDir(pluginConfigDir, pluginDistConfigDir);
    console.log(`已复制插件 ${plugin} 的 config 文件夹`);
  }
}

// 删除 dist/src 目录的函数
function deleteDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`目录不存在: ${dir}`);
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      deleteDir(fullPath);  // 递归删除子目录
    } else {
      fs.unlinkSync(fullPath);  // 删除文件
    }
  }
  fs.rmdirSync(dir);  // 删除空目录
  console.log(`已删除目录: ${dir}`);
}

// 删除 dist/src 目录（如果存在）
const srcDir = path.join(__dirname, 'dist', 'src');
deleteDir(srcDir);
