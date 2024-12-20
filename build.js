import fs from 'fs'; 
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 执行 TypeScript 编译并捕获错误
try {
  execSync("tsc --project tsconfig.json && tsc-alias -p tsconfig.json", { stdio: 'inherit' });
} catch (error) {
  console.error("TypeScript 编译过程中发生错误:", error.message);
  process.exit(1);
}

/**
 * 给 dist 目录中的 .js 文件添加 .js 后缀到 import 路径
 * @param {string} dir 要处理的目录路径
 */
function addJsSuffixToImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      addJsSuffixToImports(fullPath); // 递归处理子目录
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      let content = fs.readFileSync(fullPath, "utf-8");

      // 修改 import 语句，针对相对路径添加 .js 后缀
      const updatedContent = content.replace(
        /import\s+(.+?)\s+from\s+['"](\.\.?\/.+?)['"]/g,
        (match, imports, importPath) => {
          // 排除不以 ./ 或 ../ 开头的路径，避免修改内置模块
          if (importPath.startsWith("./") || importPath.startsWith("../")) {
            if (!importPath.endsWith(".js")) {
              return `import ${imports} from '${importPath}.js'`;
            }
          }
          return match;
        }
      );

      // 如果文件内容有修改则写回
      if (content !== updatedContent) {
        fs.writeFileSync(fullPath, updatedContent, "utf-8");
        console.log(`已处理文件: ${fullPath}`);
      }
    }
  }
}

// 获取 dist 目录
const distDir = path.join(__dirname, "dist");

// 开始处理 dist 目录下的文件
addJsSuffixToImports(distDir);
console.log("所有文件已处理完毕！");

// 复制文件夹的函数
function copyDir(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 复制资源文件夹
const sourceDir = path.join(__dirname, 'resources');
const targetDir = path.join(__dirname, 'dist', 'resources');
copyDir(sourceDir, targetDir);

const packageJsonPath = path.join(__dirname, 'package.json');
const distPackageJsonPath = path.join(__dirname, 'dist', 'package.json');

if (fs.existsSync(packageJsonPath)) {
  fs.copyFileSync(packageJsonPath, distPackageJsonPath);
  console.log(`已复制 package.json 到: ${distPackageJsonPath}`);
} else {
  console.log("未找到 package.json 文件，无法复制");
}


// 复制 config 文件夹
const configSourceDir = path.join(__dirname, 'config');
const configTargetDir = path.join(__dirname, 'dist', 'config');
copyDir(configSourceDir, configTargetDir);

// 复制插件目录内的 resources 和 config 文件夹
const pluginsDir = path.join(__dirname, 'src/plugins');
const distPluginsDir = path.join(__dirname, 'dist/plugins');
const pluginPaths = fs.readdirSync(pluginsDir).filter((file) => {
  const filePath = path.join(pluginsDir, file);
  return fs.statSync(filePath).isDirectory(); // 只筛选目录
});

// 取消排除插件文件夹逻辑，包含所有插件文件夹
for (const plugin of pluginPaths) {
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
