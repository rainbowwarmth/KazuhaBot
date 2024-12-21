import log4js from "log4js";
import { RedisClientType } from "redis";
import { IMessage } from "qq-bot-sdk";
import { IOpenAPI, WebsocketCode } from "qq-bot-sdk";

export let _path: string;
export let devEnv: boolean;
export let client: IOpenAPI;
export let adminId: string[];
export let ws: WebsocketCode;
export let redis: RedisClientType;
export let botStatus: {
    startTime: Date;
    msgSendNum: number;
    imageRenderNum: number;
  }
export let xyResources: {
    [name: string]: string;
  };

export let log: log4js.Logger;


export interface IntentMessage {
  eventType: "MESSAGE_CREATE" | "PUBLIC_MESSAGE_DELETE" | "GUILD_MEMBER_REMOVE" | "GUILD_MEMBER_ADD" | "GUILD_MEMBER_UPDATE" | "DIRECT_MESSAGE_CREATE",
  eventId: string,
  msg: IMessage & GUILD_MEMBER,
}

export interface GUILD_MEMBER {
  guild_id: string;
  joined_at: string;
  nick: string;
  op_user_id: string;
  roles?: string[];
  user: {
    avatar: string;
    bot: boolean;
    id: string;
    username: string;
  };
}

export interface MihoyoAPI<T> {
  retcode: number;
  message: string;
  data: T | null;
}
