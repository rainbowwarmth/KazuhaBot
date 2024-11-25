"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bbbtaskPushNews = bbbtaskPushNews;
exports.ystaskPushNews = ystaskPushNews;
exports.bbtaskPushNews = bbtaskPushNews;
exports.wdtaskPushNews = wdtaskPushNews;
exports.dbytaskPushNews = dbytaskPushNews;
exports.srtaskPushNews = srtaskPushNews;
exports.zzztaskPushNews = zzztaskPushNews;
const mysNew_1 = require("../apps/mysNew");
async function bbbtaskPushNews() {
    await (0, mysNew_1.taskPushNewsForGame)(1);
}
async function ystaskPushNews() {
    await (0, mysNew_1.taskPushNewsForGame)(2);
}
async function bbtaskPushNews() {
    await (0, mysNew_1.taskPushNewsForGame)(3);
}
async function wdtaskPushNews() {
    await (0, mysNew_1.taskPushNewsForGame)(4);
}
async function dbytaskPushNews() {
    await (0, mysNew_1.taskPushNewsForGame)(5);
}
async function srtaskPushNews() {
    await (0, mysNew_1.taskPushNewsForGame)(6);
}
async function zzztaskPushNews() {
    await (0, mysNew_1.taskPushNewsForGame)(8);
}
//# sourceMappingURL=task.js.map