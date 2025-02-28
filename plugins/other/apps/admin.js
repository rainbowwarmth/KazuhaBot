import { botStatus, redis } from "../../../lib/global/global.js"
async function status(msg) {
    return msg.sendMsgEx({
        content: `------状态------` +
            `\n运行时间：${timeConver(new Date().getTime() - botStatus.startTime.getTime())}` +
            `\n发送消息：${botStatus.msgSendNum}条` +
            `\n生成图片：${botStatus.imageRenderNum}次` +
            `\n内存使用：${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`
    });
}
async function ping(msg) {
    msg.sendMsgEx({ content: await redis.ping() })
}
async function msgconnnet(msg) {
    return msg.sendMsgEx({
        content: msg.content
    });
}
function timeConver(time) {
    time /= 1000;
    if (time < 60) {
        return "不足1分钟"
    }
    time /= 60
    time = parseInt(time.toFixed(0))
    const m = time % 60
    if (time < 60)
        return `${m}分钟`
    time /= 60
    time = parseInt(time.toFixed(0))
    return `${time}小时${m}分钟`
}
export { status, ping, msgconnnet }
