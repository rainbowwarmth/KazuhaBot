import { adminId, redis } from "../../lib/global/global.js";
import { client } from "./link.js";
async function isAdmin(uid, iMember, srcGuild) {
    if (adminId.includes(uid))
        return true;
    if (srcGuild && !iMember) {
        try {
            const response = await client.guildApi.guildMember(srcGuild, uid);
            iMember = response.data;
        }
        catch (err) {
            logger.error(err);
            return false;
        }
    }
    if (iMember && (iMember.roles.includes("2") || iMember.roles.includes("4")))
        return true;
    const auth = await redis.hGet("auth", uid);
    return auth === "admin";
}
export default isAdmin;
