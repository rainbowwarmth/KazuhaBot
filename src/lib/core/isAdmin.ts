import { adminId, redis } from "@src/lib/global/global";
import { IMember } from "@src/lib/global/qq-guild-bot";
import { client } from "./link";
import logger from "@src/lib/logger/logger";

async function isAdmin(uid: string, iMember?: IMember, srcGuild?: string): Promise<boolean> {
    if (adminId.includes(uid)) return true;
    if (srcGuild) {
        iMember = await client.guildApi.guildMember(srcGuild, uid).then(d => {
            return d.data;
        }).catch(err => {
            logger.error(err);
            return undefined;
        });
    }
    if (iMember && (iMember.roles.includes("2") || iMember.roles.includes("4")))
        return true;
    return await redis.hGet("auth", uid).then(auth => {
        if (auth == "admin") return true;
        return false;
    });
}

export default isAdmin;