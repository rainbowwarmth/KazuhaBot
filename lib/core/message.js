import fs from "fs"
import axios from "axios"
import FormData from "form-data"
import { config } from "../config/config.js"
import { botStatus } from "../../lib/global/global.js"
import { client } from "../core/init.js"
import { logger } from "../config/logger.js"

export class IMessageEx {
  id
  channel_id
  guild_id
  content
  timestamp
  edited_timestamp
  mention_everyone
  author
  member
  attachments
  embeds
  mentions
  ark
  seq
  seq_in_channel
  src_guild_id
  guild_name
  channel_name
  messageType
  constructor(msg, messageType) {
    this.id = msg.id
    this.channel_id = msg.channel_id
    this.guild_id = msg.guild_id
    this.content = msg.content
    this.timestamp = msg.timestamp
    this.edited_timestamp = msg.edited_timestamp
    this.mention_everyone = msg.mention_everyone
    this.author = msg.author
    this.member = msg.member
    this.attachments = msg.attachments
    this.embeds = msg.embeds
    this.mentions = msg.mentions
    this.ark = msg.ark
    this.seq = msg.seq
    this.seq_in_channel = msg.seq_in_channel
    this.messageType = messageType
    if (messageType == "DIRECT") {
      logger.info(
        `私信[${msg.guild_id}][${msg.channel_id}](${msg.author.username}):${msg.content}`
      )
      return
    }
    for (const guild of saveGuildsTree) {
      if (guild.id == this.guild_id) {
        for (const channel of guild.channel) {
          if (channel.id == this.channel_id) {
            this.guild_name = guild.name
            this.channel_name = channel.name
            logger.info(
              `频道[${this.guild_name}][${this.channel_name}](${this.author.username}|${this.author.id}):${this.content}`
            )
            return
          }
        }
      }
    }
    logger.warn(
      `unKnown message:[${msg.guild_id}][${msg.channel_id}](${msg.author.username}):${msg.content}`
    )
  }
  async sendMsgEx(option) {
    botStatus.msgSendNum++
    const { ref, imagePath, content, initiative } = option
    const { id, guild_id, channel_id } = this
    if (imagePath) {
      option.messageType = option.messageType || this.messageType
      option.msgId = option.msgId || this.id
      option.guildId = option.guildId || this.guild_id
      option.channelId = option.channelId || this.channel_id
      return sendImage(option)
    } else {
      if (this.messageType == "GUILD") {
        return client.messageApi.postMessage(channel_id, {
          content: content,
          msg_id: initiative ? undefined : id,
          message_reference: ref ? { message_id: id } : undefined,
        })
      } else {
        return client.directMessageApi.postDirectMessage(guild_id, {
          msg_id: initiative ? undefined : id,
          content: content,
        })
      }
    }
  }
}
export async function sendImage(option) {
  const { messageType, content, imagePath, guildId, channelId } = option

  if (!imagePath) return

  const pushUrl =
    messageType === "DIRECT"
      ? `https://api.sgroup.qq.com/dms/${guildId}/messages`
      : `https://api.sgroup.qq.com/channels/${channelId}/messages`

  try {
    const formData = new FormData()
    if (content) formData.append("content", content)
    formData.append("file_image", fs.createReadStream(imagePath))

    const response = await axios.post(pushUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bot ${config.initConfig.appID}.${config.initConfig.token}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    if (response.data?.code) {
      if (response.data.code === 304023) {
        logger.info(`消息审核成功`, {
          audit_id: response.data.data.message_audit.audit_id,
          trace_id: response.data.trace_id,
        })
      } else {
        logger.error("API Error:", response.data)
      }
    }

    return response.data
  } catch (error) {
    const errorData = error.response?.data || {
      code: "NETWORK_ERROR",
      message: error.message,
    }

    logger.error("Request Failed:", {
      url: pushUrl,
      error: errorData,
    })

    return errorData
  }
}
