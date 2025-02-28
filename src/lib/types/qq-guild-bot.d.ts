import { RestyResponse, RequestOptions } from 'resty-client';
import WebSocket, { EventEmitter } from 'ws';

interface wsResData {
    op: number;
    d?: {
        heartbeat_interval?: number;
    };
    s: number;
    t: string;
    id?: string;
}
interface HeartbeatParam {
    op: number;
    d: number;
}
interface EventTypes {
    eventType: string;
    eventMsg?: object;
}
interface GetWsParam {
    appID: string;
    token: string;
    sandbox?: boolean;
    shards?: Array<number>;
    intents?: Array<AvailableIntentsEventsEnum>;
    maxRetry?: number;
}
interface WsAddressObj {
    url: string;
    shards: number;
    session_start_limit: {
        total: number;
        remaining: number;
        reset_after: number;
        max_concurrency: number;
    };
}
interface WsDataInfo {
    data: WsAddressObj;
}
interface SessionRecord {
    sessionID: string;
    seq: number;
}
declare enum OpCode {
    DISPATCH = 0,
    HEARTBEAT = 1,
    IDENTIFY = 2,
    RESUME = 6,
    RECONNECT = 7,
    INVALID_SESSION = 9,
    HELLO = 10,
    HEARTBEAT_ACK = 11
}
declare enum AvailableIntentsEventsEnum {
    GUILDS = "GUILDS",
    GUILD_MEMBERS = "GUILD_MEMBERS",
    GUILD_MESSAGES = "GUILD_MESSAGES",
    GUILD_MESSAGE_REACTIONS = "GUILD_MESSAGE_REACTIONS",
    DIRECT_MESSAGE = "DIRECT_MESSAGE",
    FORUMS_EVENT = "FORUMS_EVENT",
    AUDIO_ACTION = "AUDIO_ACTION",
    PUBLIC_GUILD_MESSAGES = "PUBLIC_GUILD_MESSAGES",
    MESSAGE_AUDIT = "MESSAGE_AUDIT",
    INTERACTION = "INTERACTION",
    GROUP_AND_C2C_EVENT = "GROUP_AND_C2C_EVENT"
}
declare const WsEventType: {
    [key: string]: AvailableIntentsEventsEnum;
};
declare const WSCodes: {
    1000: string;
    4004: string;
    4010: string;
    4011: string;
    4013: string;
    4014: string;
};
declare const enum WebsocketCode {
    INVALID_OPCODE = 4001,
    INVALID_PAYLOAD = 4002,
    ERROR_SEQ = 4007,
    TOO_FAST_PAYLOAD = 4008,
    EXPIRED = 4009,
    INVALID_SHARD = 4010,
    TOO_MACH_GUILD = 4011,
    INVALID_VERSION = 4012,
    INVALID_INTENTS = 4013,
    DISALLOWED_INTENTS = 4014,
    ERROR = 4900
}
declare const WebsocketCloseReason: ({
    code: number;
    reason: string;
    resume?: undefined;
} | {
    code: number;
    reason: string;
    resume: boolean;
})[];
type IntentEventsMapType = {
    [key in AvailableIntentsEventsEnum]: number;
};
declare const IntentEvents: IntentEventsMapType;
declare const Intents: {
    GUILDS: number;
    GUILD_MEMBERS: number;
    GUILD_BANS: number;
    GUILD_EMOJIS: number;
    GUILD_INTEGRATIONS: number;
    GUILD_WEBHOOKS: number;
    GUILD_INVITES: number;
    GUILD_VOICE_STATES: number;
    GUILD_PRESENCES: number;
    GUILD_MESSAGES: number;
    GUILD_MESSAGE_REACTIONS: number;
    GUILD_MESSAGE_TYPING: number;
    DIRECT_MESSAGES: number;
    DIRECT_MESSAGE_REACTIONS: number;
    DIRECT_MESSAGE_TYPING: number;
};
declare const SessionEvents: {
    CLOSED: string;
    READY: string;
    ERROR: string;
    INVALID_SESSION: string;
    RECONNECT: string;
    DISCONNECT: string;
    EVENT_WS: string;
    RESUMED: string;
    DEAD: string;
};
declare const WsObjRequestOptions: (sandbox: boolean) => {
    method: "GET";
    url: string;
    headers: {
        Accept: string;
        'Accept-Encoding': string;
        'Accept-Language': string;
        Connection: string;
        'User-Agent': string;
        Authorization: string;
    };
};

interface AudioAPI {
    postAudio: (channelID: string, value: AudioControl) => Promise<RestyResponse<AudioControl>>;
    botOnMic: (channelID: string) => Promise<RestyResponse<{}>>;
    botOffMic: (channelID: string) => Promise<RestyResponse<{}>>;
}
interface AudioControl {
    audioUrl: string;
    text: string;
    status: number;
}

/**
 * =============  Channel 子频道接口  =============
 */
interface ChannelAPI {
    channel: (channelID: string) => Promise<RestyResponse<IChannel>>;
    channels: (guildID: string) => Promise<RestyResponse<IChannel[]>>;
    postChannel: (guildID: string, channel: PostChannelObj) => Promise<RestyResponse<IChannel>>;
    patchChannel: (channelID: string, channel: PatchChannelObj) => Promise<RestyResponse<IChannel>>;
    deleteChannel: (channelID: string) => Promise<RestyResponse<any>>;
}
type ChannelType = 0 | 1 | 2 | 3 | 4 | 10005;
type ChannelSubType = 0 | 1 | 2 | 3;
interface IChannel extends PostChannelObj {
    id: string;
    guild_id: string;
    owner_id: string;
    speak_permission?: number;
    application_id?: string;
}
interface PostChannelObj {
    name: string;
    type: ChannelType;
    sub_type?: ChannelSubType;
    position: number;
    parent_id: string;
    private_type?: number;
    private_user_ids?: string[];
    permissions?: string;
}
type PatchChannelObj = Partial<Omit<PostChannelObj, 'sub_type' | 'private_user_ids'>>;

/**
 * =============  ChannelPermissions 子频道权限接口  =============
 */
interface ChannelPermissionsAPI {
    channelPermissions: (channelID: string, userID: string) => Promise<RestyResponse<IChannelPermissions>>;
    putChannelPermissions: (channelID: string, userID: string, p: UpdateChannelPermissions) => Promise<RestyResponse<any>>;
    channelRolePermissions: (channelID: string, roleID: string) => Promise<RestyResponse<IChannelRolePermissions>>;
    putChannelRolePermissions: (channelID: string, roleID: string, p: UpdateChannelPermissions) => Promise<RestyResponse<any>>;
}
interface IChannelPermissions {
    channel_id: string;
    user_id: string;
    permissions: string;
}
interface IChannelRolePermissions {
    channel_id: string;
    role_id: string;
    permissions: string;
}
interface UpdateChannelPermissions {
    add: string;
    remove: string;
}

/**
 * =============  User 用户接口  =============
 */
interface MeAPI {
    me: () => Promise<RestyResponse<IUser>>;
    meGuilds: (options?: MeGuildsReq) => Promise<RestyResponse<IGuild[]>>;
}
interface IUser {
    id: string;
    username: string;
    avatar: string;
    bot: boolean;
    union_openid: string;
    union_user_account: string;
}
interface MeGuildsReq {
    before?: string;
    after?: string;
    limit?: number;
}

/**
 * =============  Guild 频道接口  =============
 */
interface GuildAPI {
    guild: (guildID: string) => Promise<RestyResponse<IGuild>>;
    guildMember: (guildID: string, userID: string) => Promise<RestyResponse<IMember>>;
    guildMembers: (guildID: string, pager?: GuildMembersPager) => Promise<RestyResponse<IMember[]>>;
    deleteGuildMember: (guildID: string, userID: string) => Promise<RestyResponse<any>>;
    guildVoiceMembers: (channelID: string) => Promise<RestyResponse<IVoiceMember[]>>;
}
interface IGuild {
    id: string;
    name: string;
    icon: string;
    owner_id: string;
    owner: boolean;
    member_count: number;
    max_members: number;
    description: string;
    joined_at: number;
    channels: IChannel[];
    unionworld_id: string;
    union_org_id: string;
}
interface IMember {
    guild_id: string;
    joined_at: string;
    nick: string;
    user: IUser;
    roles: string[];
    deaf: boolean;
    mute: boolean;
}
interface IVoiceMember {
    user: IUser;
    nick: string;
    joined_at: string;
    mute: boolean;
}
interface GuildMembersPager {
    after: string;
    limit: number;
}

/**
 * =============  Message 消息接口  =============
 */
interface MessageAPI {
    message: (channelID: string, messageID: string) => Promise<RestyResponse<IMessageRes>>;
    messages: (channelID: string, pager: MessagesPager) => Promise<RestyResponse<IMessage[]>>;
    postMessage: (channelID: string, message: MessageToCreate) => Promise<RestyResponse<IMessage>>;
    deleteMessage: (channelID: string, messageID: string, hideTip?: boolean) => Promise<RestyResponse<any>>;
}
interface MessageAttachment {
    url: string;
}
interface EmbedThumbnail {
    url: string;
}
interface EmbedField {
    name: string;
}
interface Embed {
    title: string;
    description?: string;
    prompt?: string;
    thumbnail?: EmbedThumbnail;
    fields?: EmbedField[];
}
interface Ark {
    template_id: string;
    kv: ArkKV[];
}
interface ArkKV {
    key: string;
    value: string;
    obj?: ArkObj[];
}
interface ArkObj {
    obj_kv: ArkObjKV[];
}
interface ArkObjKV {
    key: string;
    value: string;
}
interface IMessage {
    id: string;
    channel_id: string;
    guild_id: string;
    content: string;
    timestamp: string;
    edited_timestamp: string;
    mention_everyone: boolean;
    author: IUser;
    member: IMember;
    attachments: MessageAttachment[];
    embeds: Embed[];
    mentions: IUser[];
    ark: Ark;
    seq?: number;
    seq_in_channel?: string;
}
interface IMessageRes {
    message: IMessage;
}
interface MessagesPager {
    type: 'around' | 'before' | 'after';
    id: string;
    limit: string;
}
interface MessageReference {
    message_id: string;
    ignore_get_message_error?: boolean;
}
interface MessageToCreate {
    content?: string;
    embed?: Embed;
    ark?: Ark;
    message_reference?: MessageReference;
    image?: string;
    msg_id?: string;
    keyboard?: MessageKeyboard;
    markdown?: MessageMarkdown;
}
interface MessageMarkdown {
    custom_template_id?: string;
    content?: string;
    params?: MessageMarkdownParam[];
}
interface MessageMarkdownParam {
    key: string;
    values: string[];
}
interface MessageKeyboard {
    id?: string;
    content?: CustomKeyboard;
}
interface CustomKeyboard {
    rows?: Row[];
}
interface Row {
    buttons?: Button[];
}
interface Button {
    id?: string;
    render_data?: RenderData;
    action?: Action;
}
interface RenderData {
    label?: string;
    visited_label?: string;
    style?: number;
}
interface Action {
    type?: number;
    permission?: Permission;
    click_limit?: number;
    data?: string;
    at_bot_show_channel_list?: boolean;
}
interface Permission {
    type?: number;
    specify_role_ids?: string[];
    specify_user_ids?: string[];
}

/**
 * =============  DirectMessage 私信接口  =============
 */
interface DirectMessageAPI {
    createDirectMessage: (dm: DirectMessageToCreate) => Promise<RestyResponse<IDirectMessage>>;
    postDirectMessage: (guildID: string, msg: MessageToCreate) => Promise<RestyResponse<IMessage>>;
}
interface DirectMessageToCreate {
    source_guild_id: string;
    recipient_id: string;
}
interface IDirectMessage {
    guild_id: string;
    channel_id: string;
    create_time: string;
}

/**
 * =============  Member 成员接口  =============
 */
interface MemberAPI {
    memberAddRole: (guildID: string, roleID: string, userID: string, 
    /**  兼容原来传递 channel 对象的逻辑，后续仅支持 string */
    channel?: string | MemberAddRoleBody) => Promise<RestyResponse<any>>;
    memberDeleteRole: (guildID: string, roleID: string, userID: string, 
    /**  兼容原来传递 channel 对象的逻辑，后续仅支持 string */
    channel?: string | MemberAddRoleBody) => Promise<RestyResponse<any>>;
}
type MemberAddRoleBody = Pick<IChannel, 'id'>;

/**
 * =============  Role 身份组接口  =============
 */
interface RoleAPI {
    roles: (guildID: string) => Promise<RestyResponse<GuildRoles>>;
    postRole: (guildID: string, role: Omit<IRole, 'id'>, filter?: IRoleFilter) => Promise<RestyResponse<UpdateRoleRes>>;
    patchRole: (guildID: string, roleID: string, role: IRole, filter?: IRoleFilter) => Promise<RestyResponse<UpdateRoleRes>>;
    deleteRole: (guildID: string, roleID: string) => Promise<RestyResponse<any>>;
}
interface IRole {
    id: string;
    name: string;
    color: number;
    hoist: number;
    number: number;
    member_limit: number;
}
interface IRoleFilter {
    name?: number;
    color?: number;
    hoist?: number;
}
interface GuildRoles {
    guild_id: string;
    roles: IRole[];
    role_num_limit: string;
}
interface UpdateRoleRes {
    role_id: string;
    guild_id: string;
    role: IRole;
}

/**
 * =============  Mute 禁言接口  =============
 */
interface MuteAPI {
    muteMember: (guildID: string, userID: string, options: MuteOptions) => Promise<RestyResponse<any>>;
    muteAll: (guildID: string, options: MuteOptions) => Promise<RestyResponse<any>>;
    muteMembers: (guildID: string, userIDList: Array<string>, options: MuteOptions) => Promise<RestyResponse<any>>;
}
interface MuteOptions {
    timeTo?: string;
    seconds?: string;
}

/**
 * =============  Announce 公告接口  =============
 */
interface AnnounceAPI {
    postGuildAnnounce: (guildID: string, channelID: string, messageID: string) => Promise<RestyResponse<IAnnounce>>;
    deleteGuildAnnounce: (guildID: string, messageID: string) => Promise<RestyResponse<any>>;
    postGuildRecommend: (guildID: string, recommendObj: RecommendObj) => Promise<RestyResponse<IAnnounce>>;
    postChannelAnnounce: (channelID: string, messageID: string) => Promise<RestyResponse<IAnnounce>>;
    deleteChannelAnnounce: (channelID: string, messageID: string) => Promise<RestyResponse<any>>;
}
interface IAnnounce {
    guild_id: string;
    channel_id: string;
    message_id: string;
    announce_type?: number;
    recommend_channels?: RecommendChannel[];
}
interface RecommendObj {
    announces_type?: number;
    recommend_channels: RecommendChannel[];
}
interface RecommendChannel {
    channel_id: string;
    introduce: string;
}

/**
 * =============  Schedule 日程接口  =============
 */
interface ScheduleAPI {
    schedule: (channelID: string, scheduleID: string) => Promise<RestyResponse<ISchedule>>;
    schedules: (channelID: string, since?: string) => Promise<RestyResponse<ISchedule[]>>;
    postSchedule: (channelID: string, schedule: ScheduleToCreate) => Promise<RestyResponse<ISchedule>>;
    patchSchedule: (channelID: string, scheduleID: string, schedule: ScheduleToPatch) => Promise<RestyResponse<ISchedule>>;
    deleteSchedule: (channelID: string, scheduleID: string) => Promise<RestyResponse<any>>;
}
type ScheduleRemindType = '0' | '1' | '2' | '3' | '4' | '5';
interface ScheduleToCreate {
    name: string;
    description?: string;
    creator?: IMember;
    start_timestamp: string;
    end_timestamp: string;
    jump_channel_id?: string;
    remind_type: ScheduleRemindType;
}
interface ISchedule extends ScheduleToCreate {
    id: string;
}
type ScheduleToPatch = Partial<Omit<ISchedule, 'id'>>;

/**
 * =============  Reaction 接口  =============
 */
interface ReactionAPI {
    postReaction: (channelID: string, reactionToCreate: ReactionObj) => Promise<RestyResponse<any>>;
    deleteReaction: (channelID: string, reactionToDelete: ReactionObj) => Promise<RestyResponse<any>>;
    getReactionUserList: (channelID: string, reactionToDelete: ReactionObj, options: ReactionUserListObj) => Promise<RestyResponse<any>>;
}
interface ReactionObj {
    message_id: string;
    emoji_type: number;
    emoji_id: string;
}
interface ReactionUserListObj {
    cookie: string;
    limit: number;
}

/**
 * =============  Interaction 接口  =============
 */
interface InteractionAPI {
    putInteraction: (interactionID: string, interactionData: InteractionData) => Promise<RestyResponse<any>>;
}
interface InteractionData {
    code: number;
}

/**
 * =============  PinsMessage 接口  =============
 */
interface PinsMessageAPI {
    pinsMessage: (channelID: string) => Promise<RestyResponse<IPinsMessage>>;
    putPinsMessage: (channelID: string, messageID: string) => Promise<RestyResponse<IPinsMessage>>;
    deletePinsMessage: (channelID: string, messageID: string) => Promise<RestyResponse<any>>;
}
interface IPinsMessage {
    guild_id: string;
    channel_id: string;
    message_ids: string[];
}

/**
 * =============  GuildPermission API权限接口  =============
 */
interface GuildPermissionsAPI {
    permissions: (guildID: string) => Promise<RestyResponse<GuildPermissionRes>>;
    postPermissionDemand: (guildID: string, permissionDemandObj: PermissionDemandToCreate) => Promise<RestyResponse<GuildPermissionDemand>>;
}
interface GuildPermission {
    path: string;
    method: string;
    desc: string;
    auth_status: number;
}
interface GuildPermissionRes {
    apis: GuildPermission[];
}
interface GuildPermissionDemand {
    guild_id: string;
    channel_id: string;
    api_identify: GuildPermissionDemandIdentify;
    title: string;
    desc: string;
}
interface PermissionDemandToCreate {
    channel_id: string;
    api_identify: GuildPermissionDemandIdentify;
    desc?: string;
}
interface GuildPermissionDemandIdentify {
    path: string;
    method: string;
}

/**
 * =============  Group 消息接口  =============
 */
interface GroupAPI {
    postMessage: (openID: string, message: GMessageToCreate) => Promise<RestyResponse<GMessageRec>>;
    postFile: (openID: string, message: GFileToCreate) => Promise<RestyResponse<GFileRec>>;
    deleteMessage: (openID: string, messageID: string) => Promise<RestyResponse<any>>;
}
interface GMessageToCreate {
    content?: string;
    msg_type: number;
    msg_id?: string;
    msg_seq?: number;
    media?: GMedia;
    ark?: Ark;
    keyboard?: MessageKeyboard;
    markdown?: MessageMarkdown;
    event_id?: string;
}
interface GMedia {
    file_info: string;
}
interface GFileToCreate {
    file_type: number;
    file_data?: string;
    url?: string;
    srv_send_msg: boolean;
}
interface GMessageRec {
    group_code: string;
    msg?: string;
    msg_seq?: string;
    ret?: number;
}
interface GFileRec {
    file_uuid: string;
    file_info: string;
    ttl: string;
}

/**
 * =============  C2C 消息接口  =============
 */
interface C2CAPI {
    postMessage: (openID: string, message: GMessageToCreate) => Promise<RestyResponse<GMessageRec>>;
    postFile: (openID: string, message: GFileToCreate) => Promise<RestyResponse<GFileRec>>;
    deleteMessage: (openID: string, messageID: string) => Promise<RestyResponse<any>>;
}

declare class WebhookAPI {
    private request;
    private config;
    constructor(request: OpenAPIRequest, config: Config);
    /**
     * 用于校验消息正文，对于所有正文全部适用
     *
     * __注意：需要设置 `secret` 才可使用，否则会抛出错误__
     * @param ts 时间戳，从 `header` 中 `x-signature-timestamp` 字段获取
     * @param body 收到的消息正文，需要以源文本传入
     * @param sign sign签名，从 `header` 中的 `x-signature-ed25519` 字段获取
     * @returns 返回 `true`/`false` 布尔值，代表是否通过了校验
     */
    validSign(ts: string, body: string | Buffer, sign: string | Buffer): boolean;
    /**
     * 校验 url 时用到的函数，此时消息正文（使用 `body` 表示）中 `body.d = 13`
     *
     * __注意：需要设置 `secret` 才可使用，否则会抛出错误__
     * @param eventTs 从消息正文中获取 `body.d.event_ts`
     * @param plainToken 从消息正文中获取 `body.d.plain_token`
     * @returns 返回 `sign` 签名，使用 `{ plain_token: plainToken, signature: sign }` 的 json 形式对 webhook 做出回应
     */
    getSign(eventTs: string, plainToken: string): string;
    /**
     * 通过 `secret` 进行 `ed25519` 密钥算法获取 `key`
     *
     * __注意：需要设置 `secret` 才可使用，否则会抛出错误__
     * @returns 返回 `privateKey` 与 `publicKey`
     */
    getKey(): {
        privateKey: Buffer;
        publicKey: Uint8Array;
    };
}

type OpenAPIRequest = <T extends Record<any, any> = any>(options: RequestOptions) => Promise<RestyResponse<T>>;
interface Config {
    appID: string;
    token: string;
    sandbox?: boolean;
    secret?: string;
}
interface ConfigLogger {
    logger: Logger;
}
interface Logger {
    info: (message: any, ...args: any[]) => void;
}
interface IOpenAPI {
    config: Config;
    request: OpenAPIRequest;
    guildApi: GuildAPI;
    channelApi: ChannelAPI;
    meApi: MeAPI;
    messageApi: MessageAPI;
    memberApi: MemberAPI;
    roleApi: RoleAPI;
    muteApi: MuteAPI;
    announceApi: AnnounceAPI;
    scheduleApi: ScheduleAPI;
    directMessageApi: DirectMessageAPI;
    channelPermissionsApi: ChannelPermissionsAPI;
    audioApi: AudioAPI;
    guildPermissionsApi: GuildPermissionsAPI;
    reactionApi: ReactionAPI;
    interactionApi: InteractionAPI;
    pinsMessageApi: PinsMessageAPI;
    groupApi: GroupAPI;
    c2cApi: C2CAPI;
    webhookApi: WebhookAPI;
}
type APIVersion = `v${number}`;
interface Token {
    appID: number;
    accessToken: string;
    type: string;
}
interface WebsocketAPI {
    ws: () => any;
}

type Nullish = null | undefined;

declare class OpenAPI implements IOpenAPI {
    static newClient(config: Config): OpenAPI;
    config: Config;
    guildApi: GuildAPI;
    channelApi: ChannelAPI;
    meApi: MeAPI;
    messageApi: MessageAPI;
    memberApi: MemberAPI;
    roleApi: RoleAPI;
    muteApi: MuteAPI;
    announceApi: AnnounceAPI;
    scheduleApi: ScheduleAPI;
    directMessageApi: DirectMessageAPI;
    channelPermissionsApi: ChannelPermissionsAPI;
    audioApi: AudioAPI;
    reactionApi: ReactionAPI;
    interactionApi: InteractionAPI;
    pinsMessageApi: PinsMessageAPI;
    guildPermissionsApi: GuildPermissionsAPI;
    groupApi: GroupAPI;
    c2cApi: C2CAPI;
    webhookApi: WebhookAPI;
    constructor(config: Config);
    register(client: IOpenAPI): void;
    request<T extends Record<any, any> = any>(options: RequestOptions): Promise<RestyResponse<T>>;
}

declare class Ws {
    ws: WebSocket;
    event: EventEmitter;
    config: GetWsParam & ConfigLogger;
    heartbeatInterval: number;
    heartbeatParam: {
        op: OpCode;
        d: null;
    };
    isReconnect: boolean;
    sessionRecord: {
        sessionID: string;
        seq: number;
    };
    alive: boolean;
    constructor(config: GetWsParam & ConfigLogger, event: EventEmitter, sessionRecord?: SessionRecord);
    createWebsocket(wsData: WsAddressObj): WebSocket;
    createListening(): WebSocket;
    connectWs(wsData: WsAddressObj): void;
    authWs(): void;
    getValidIntents(): number | undefined;
    getValidIntentsType(): AvailableIntentsEventsEnum[];
    checkShards(shardsArr: Array<number> | undefined): void | number[];
    sendWs(msg: unknown): void;
    reconnect(): void;
    reconnectWs(): void;
    dispatchEvent(eventType: string, wsRes: wsResData): void;
    closeWs(): void;
    handleWsCloseEvent(code: number): void;
}

declare class Session {
    config: GetWsParam & ConfigLogger;
    heartbeatInterval: number;
    ws: Ws;
    event: EventEmitter;
    sessionRecord: SessionRecord | undefined;
    constructor(config: GetWsParam & ConfigLogger, event: EventEmitter, sessionRecord?: SessionRecord);
    createSession(): void;
    closeSession(): void;
}

declare class WebsocketClient extends EventEmitter {
    session: Session;
    retry: number;
    constructor(config: GetWsParam & ConfigLogger);
    connect(config: GetWsParam & ConfigLogger, sessionRecord?: SessionRecord): Session;
    disconnect(): void;
}

declare function selectOpenAPIVersion(version: APIVersion): false | undefined;
declare function createOpenAPI(config: Config): OpenAPI;
declare function createWebsocket(config: GetWsParam & Partial<ConfigLogger>): WebsocketClient;

export { APIVersion, Action, AnnounceAPI, Ark, ArkKV, ArkObj, ArkObjKV, AudioAPI, AudioControl, AvailableIntentsEventsEnum, Button, C2CAPI, ChannelAPI, ChannelPermissionsAPI, ChannelSubType, ChannelType, Config, ConfigLogger, CustomKeyboard, DirectMessageAPI, DirectMessageToCreate, Embed, EmbedField, EmbedThumbnail, EventTypes, GFileRec, GFileToCreate, GMedia, GMessageRec, GMessageToCreate, GetWsParam, GroupAPI, GuildAPI, GuildMembersPager, GuildPermission, GuildPermissionDemand, GuildPermissionDemandIdentify, GuildPermissionRes, GuildPermissionsAPI, GuildRoles, HeartbeatParam, IAnnounce, IChannel, IChannelPermissions, IChannelRolePermissions, IDirectMessage, IGuild, IMember, IMessage, IMessageRes, IOpenAPI, IPinsMessage, IRole, IRoleFilter, ISchedule, IUser, IVoiceMember, IntentEvents, IntentEventsMapType, Intents, InteractionAPI, InteractionData, Logger, MeAPI, MeGuildsReq, MemberAPI, MemberAddRoleBody, MessageAPI, MessageAttachment, MessageKeyboard, MessageMarkdown, MessageMarkdownParam, MessageReference, MessageToCreate, MessagesPager, MuteAPI, MuteOptions, Nullish, OpCode, OpenAPIRequest, PatchChannelObj, Permission, PermissionDemandToCreate, PinsMessageAPI, PostChannelObj, ReactionAPI, ReactionObj, ReactionUserListObj, RecommendChannel, RecommendObj, RenderData, RoleAPI, Row, ScheduleAPI, ScheduleRemindType, ScheduleToCreate, ScheduleToPatch, SessionEvents, SessionRecord, Token, UpdateChannelPermissions, UpdateRoleRes, WSCodes, WebsocketAPI, WebsocketCloseReason, WebsocketCode, WsAddressObj, WsDataInfo, WsEventType, WsObjRequestOptions, createOpenAPI, createWebsocket, selectOpenAPIVersion, wsResData };