import { readdirSync, statSync } from 'fs';
import { join } from 'path';
const pluginsDir = join(process.cwd(), 'plugins');
const pluginFolders = readdirSync(pluginsDir).filter(folder => {
    const fullPath = join(pluginsDir, folder);
    return statSync(fullPath).isDirectory() && !['other', 'example', 'system'].includes(folder);
});
export default pluginFolders;
