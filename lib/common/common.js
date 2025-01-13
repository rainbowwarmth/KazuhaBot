import fs from "fs";
export function common(filePath, data, options) {
    const dirPath = filePath.split("/").slice(0, -1).join("/");
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, data, options);
}
export default common;
