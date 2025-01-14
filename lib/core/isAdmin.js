import { adminId, redis } from "../../lib/global/global.js";
import { client } from "./link.js";
async function isAdmin(uid, iMember, srcGuild) {
    if (adminId.includes(uid))
        return true;
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
        if (auth == "admin")
            return true;
        return false;
    });
}
export default isAdmin;
