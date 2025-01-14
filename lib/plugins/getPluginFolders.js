import * as fs from 'fs';
import * as path from 'path';
const _path = process.cwd();
function getPluginFolders() {
    const pluginsDir = path.join(_path, 'plugins');
    return fs.readdirSync(pluginsDir).filter(folder => {
        const fullPath = path.join(pluginsDir, folder);
        return fs.statSync(fullPath).isDirectory() && !['other', 'example', 'system'].includes(folder);
    });
}
const pluginFolders = getPluginFolders();
export default pluginFolders;
