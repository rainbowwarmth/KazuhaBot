import fs from "fs";
import fetch from 'node-fetch';
import FormData from 'form-data';
import { config } from "../../lib/config/config.js";
import { botStatus } from "../../lib/global/global.js";
import { client } from "../../lib/core/link.js";
export class IMessageEx {
    id;
    channel_id;
    guild_id;
    content;
    timestamp;
    edited_timestamp;
    mention_everyone;
    author;
    member;
    attachments;
    embeds;
    mentions;
    ark;
    seq;
    seq_in_channel;
    src_guild_id;
    guild_name;
    channel_name;
    messageType;
    constructor(msg, messageType) {
        this.id = msg.id;
        this.channel_id = msg.channel_id;
        this.guild_id = msg.guild_id;
        this.content = msg.content;
        this.timestamp = msg.timestamp;
        this.edited_timestamp = msg.edited_timestamp;
        this.mention_everyone = msg.mention_everyone;
        this.author = msg.author;
        this.member = msg.member;
        this.attachments = msg.attachments;
        this.embeds = msg.embeds;
        this.mentions = msg.mentions;
        this.ark = msg.ark;
        this.seq = msg.seq;
        this.seq_in_channel = msg.seq_in_channel;
        this.messageType = messageType;
        if (messageType == "DIRECT") {
            logger.info(`私信[${msg.guild_id}][${msg.channel_id}](${msg.author.username}):${msg.content}`);
            return;
        }
        for (const guild of saveGuildsTree) {
            if (guild.id == this.guild_id) {
                for (const channel of guild.channel) {
                    if (channel.id == this.channel_id) {
                        this.guild_name = guild.name;
                        this.channel_name = channel.name;
                        logger.info(`频道[${this.guild_name}][${this.channel_name}](${this.author.username}|${this.author.id}):${this.content}`);
                        return;
                    }
                }
            }
        }
        logger.warn(`unKnown message:[${msg.guild_id}][${msg.channel_id}](${msg.author.username}):${msg.content}`);
    }
    async sendMsgEx(option) {
        botStatus.msgSendNum++;
        const { ref, imagePath, content, initiative } = option;
        const { id, guild_id, channel_id } = this;
        if (imagePath) {
            option.messageType = option.messageType || this.messageType;
            option.msgId = option.msgId || this.id;
            option.guildId = option.guildId || this.guild_id;
            option.channelId = option.channelId || this.channel_id;
            return sendImage(option);
        }
        else {
            if (this.messageType == "GUILD") {
                return client.messageApi.postMessage(channel_id, {
                    content: content,
                    msg_id: initiative ? undefined : id,
                    message_reference: ref ? { message_id: id, } : undefined
                });
            }
            else {
                return client.directMessageApi.postDirectMessage(guild_id, {
                    msg_id: initiative ? undefined : id,
                    content: content,
                });
            }
        }
    }
}
export async function sendImage(option) {
    const { messageType, initiative, content, imagePath, msgId, guildId, channelId } = option;
    if (!imagePath)
        return;
    var pushUrl = messageType == "DIRECT" ?
        `https://api.sgroup.qq.com/dms/${guildId}/messages` :
        `https://api.sgroup.qq.com/channels/${channelId}/messages`;
    const formdata = new FormData();
    if (!initiative)
        formdata.append("msg_id", msgId);
    if (content)
        formdata.append("content", content);
    formdata.append("file_image", fs.createReadStream(imagePath));
    return fetch(pushUrl, {
        method: "POST",
        headers: {
            "Content-Type": formdata.getHeaders()["content-type"],
            "Authorization": `Bot ${config.initConfig.appID}.${config.initConfig.token}`,
        }, body: formdata
    }).then(res => {
        return res.json();
    }).then(body => {
        if (body.code)
            logger.error(body);
        return body;
    }).catch(error => {
        logger.error(error);
    });
}