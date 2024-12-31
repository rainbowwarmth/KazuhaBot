import { client } from "@src/lib/core/link";

async function loadGuildTree(init = false) {
    global.saveGuildsTree = [];
    const guilds = (await client.meApi.meGuilds()).data;

    for (const guild of guilds) {
        if (init) logger.info(`${guild.name}(${guild.id})`);
        
        const channels = (await client.channelApi.channels(guild.id)).data.map(channel => {
            if (init) logger.info(`${guild.name}(${guild.id})-${channel.name}(${channel.id})-father:${channel.parent_id}`);
            return { name: channel.name, id: channel.id };
        });

        global.saveGuildsTree.push({ name: guild.name, id: guild.id, channel: channels });
    }
}

export default loadGuildTree;