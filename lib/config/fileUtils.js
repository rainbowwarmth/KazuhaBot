// fileUtils.js
import fs from 'fs/promises'
import path from 'path'

/**
 * 递归创建目录（如果不存在）
 * @param {string} dirPath - 需要创建的目录路径
 */
export async function createDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw new Error(`无法创建目录 ${dirPath}: ${error.message}`)
    }
  }
}

/**
 * 安全写入文件（自动创建目录）
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 */
export async function writeFileWithCheck(filePath, content) {
  try {
    const dir = path.dirname(filePath)
    await createDirectory(dir)
    await fs.writeFile(filePath, content, 'utf8')
  } catch (error) {
    throw new Error(`文件写入失败 ${filePath}: ${error.message}`)
  }
}

// 可选：添加同步版本
export function writeFileSyncEx(filePath, content) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, content, 'utf8')
}