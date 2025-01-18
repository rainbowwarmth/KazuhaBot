import { client } from "../../lib/core/link.js"

async function loadGuildTree(init = false) {
    global.saveGuildsTree = []
    for (const guild of (await client.meApi.meGuilds()).data) {
        if (init)
            logger.info(`${guild.name}(${guild.id})`)
        const _guild = []
        for (const channel of (await client.channelApi.channels(guild.id)).data) {
            if (init)
                logger.info(`${guild.name}(${guild.id})-${channel.name}(${channel.id})-father:${channel.parent_id}`)
            _guild.push({ name: channel.name, id: channel.id })
        }
        global.saveGuildsTree.push({ name: guild.name, id: guild.id, channel: _guild })
    }
}
export default loadGuildTree
