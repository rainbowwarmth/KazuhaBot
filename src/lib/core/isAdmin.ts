import { adminId, redis } from "@src/lib/global/global";
import { IMember } from "@src/lib/types/qq-guild-bot";
import { client } from "./link";

async function isAdmin(uid: string, iMember?: IMember, srcGuild?: string): Promise<boolean> {
    if (adminId.includes(uid)) return true;

    if (srcGuild && !iMember) {
        try {
            const response = await client.guildApi.guildMember(srcGuild, uid);
            iMember = response.data;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    if (iMember && (iMember.roles.includes("2") || iMember.roles.includes("4"))) return true;

    const auth = await redis.hGet("auth", uid);
    return auth === "admin";
}

export default isAdmin;