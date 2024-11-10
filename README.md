# KazuhaBot_NewMys

<p align="center">
  <a href="https://github.com/rainbowwarmth/KazuhaBot_Newmys"><img src="https://upload-bbs.miyoushe.com/upload/2021/12/05/82642572/3196a8010ff14dd131d5192ba9b9743a_5729765311568100837.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg" width="256" height="256" alt="KazuhaBot_NewMys"></a>
</p>
<h1 align = "center">KazuhaBot_NewMys</h1>

[![Node.js Package](https://github.com/rainbowwarmth/KazuhaBot/actions/workflows/npm-publish-github-packages.yml/badge.svg?branch=main)](https://github.com/rainbowwarmth/KazuhaBot/actions/workflows/npm-publish-github-packages.yml)
[![npm version](https://img.shields.io/npm/v/kazuha-bot.svg)](https://www.npmjs.com/package/kazuha-bot)

## 使用方法
> 环境准备： Windows or Linux，Node.js（ [版本至少v16以上](http://nodejs.cn/download/) ）， [Redis](https://redis.io/docs/getting-started/installation/ )

> 与[KazuhaBot](https://github.com/feilongproject/KazuhaBot)对比
 * 本项目仅保留了公告推送内容，更加简洁高效。

> 注意V2.1.5开始使用js运行，抛弃之前的ts方法，请务必进行编译后运行项目

---

## 安装[pnpm](https://pnpm.io/zh/installation)

> 已安装的可以跳过

```sh
npm install pnpm -g
```

## 安装项目
### 使用PNPM安装（优先推荐）

请先创建一个空目录，然后在 你创建的空目录 根目录夹打开终端，运行下述指令之一

```
// 使用PNPM
pnpm init && pnpm pkg set scripts.start="node app.js start" && pnpm i kazuha-bot && node node_modules\kazuha-bot\init.js

// 使用PNPM镜像(网络不好首选)
pnpm init && pnpm pkg set scripts.start="node app.js start" && pnpm i kazuha-bot --registry=https://registry.npmmirror.com && node node_modules\kazuha-bot\init.js
```

### 使用Git安装（第二推荐）
> 请根据网络情况选择Github安装或Gitee安装

```
// 使用gitee
git clone --depth=1 https://gitee.com/rainbowwarmth/KazuhaBot -b build
pnpm install -P

// 使用github
git clone --depth=1 https://github.com/rainbowwarmth/KazuhaBot -b build
pnpm install -P
```

---

## 修改设置文件

打开config文件夹中的config.json，并更改其中的APP_ID和APP_TOKEN为机器人对应ID与TOKEN

## 运行
> 启动redis后

在终端输入`npm start`运行


## 致谢

|                           名称                                                         |        介绍           |
|:-------------------------------------------------------------:|:------------------:|
|[KazuhaBot](https://github.com/feilongproject/KazuhaBot)| 飞龙大佬的KazuhaBot |

## 其他
* 项目仅供学习交流使用，严禁用于任何商业用途和非法行为
* [MIT 许可证](https://github.com/rainbowwarmth/KazuhaBot_Newmys/blob/main/LICENSE)
