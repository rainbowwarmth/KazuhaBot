import { redis } from "@src/lib/global/global";
import logger from "@src/lib/logger/logger";

async function database() {
    logger.info('初始化：正在连接数据库');
    await redis.connect().then(() => {
        logger.info('初始化：redis数据库连接成功');
    }).catch(err => {
        logger.error(`初始化：redis数据库连接失败，正在退出程序\n${err}`);
        process.exit();
    });
}

export default database;