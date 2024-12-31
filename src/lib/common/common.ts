import fs from "fs";
import { _path, redis } from "@src/lib/global/global";

export function common(filePath: string, data: string | Buffer, options?: fs.WriteFileOptions) {
    const dirPath = filePath.split("/").slice(0, -1).join("/");
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, data, options);
}

export default common