# KazuhaBot_NewMys

<p align="center">
  <a href="https://github.com/rainbowwarmth/KazuhaBot_Newmys"><img src="https://upload-bbs.miyoushe.com/upload/2021/12/05/82642572/3196a8010ff14dd131d5192ba9b9743a_5729765311568100837.jpg?x-oss-process=image/resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg" width="256" height="256" alt="KazuhaBot_NewMys"></a>
</p>
<h1 align = "center">KazuhaBot_NewMys</h1>

## 使用方法
>
> 前往[QQ开放平台](https://q.qq.com/)，注册QQ机器人获取APPID和TOKEN

> 环境准备： Windows or Linux，Node.js（ [版本至少v16以上](http://nodejs.cn/download/) ）， [Redis](https://redis.io/docs/getting-started/installation/ )

> 与[KazuhaBot](https://github.com/feilongproject/KazuhaBot)对比

* 本项目仅保留了公告推送内容，更加简洁高效。
* 使用外置渲染器，图片渲染更高效。

> 注意V2.1.5开始使用js运行，抛弃之前的ts方法。

---

## 安装[pnpm](https://pnpm.io/zh/installation)

> 已安装的可以跳过

```sh
npm install pnpm -g
```

## 安装项目

### 使用Git安装
>
> 请根据网络情况选择Github安装或Gitee安装

```
// 使用gitee
git clone --depth=1 https://gitee.com/rainbowwarmth/KazuhaBot
pnpm i

// 使用github
git clone --depth=1 https://github.com/rainbowwarmth/KazuhaBot
```

---

## 修改设置文件

打开config文件夹,选中config.example.json文件重命名为config.json文件，并更改其中的APP_ID和APP_TOKEN为机器人对应ID与TOKEN

### 使用外置渲染器

必须安装并运行[@Karinjs/puppeteer](https://github.com/KarinJS/puppeteer/)

#### 安装方法

```
//使用pnpm
pnpm init && pnpm install @karinjs/puppeteer --registry=https://registry.npmmirror.com && node .

//使用Github
git clone https://github.com/KarinJS/puppeteer
npm run build
node .
```

运行`@Karinjs/puppeteer`后打开config文件夹,选中打开config.json文件，将`useExternalBrowser`的值flase改为true即可

## 运行
>
> 启动redis后

在终端输入`node .`运行

## 致谢

|                           名称                                                         |        介绍           |
|:-------------------------------------------------------------:|:------------------:|
|[KazuhaBot](https://github.com/feilongproject/KazuhaBot)| 飞龙大佬的KazuhaBot |
|[@Karinjs/puppeteer](https://github.com/KarinJS/puppeteer/)| Karin外置渲染器|

## 其他

* 项目仅供学习交流使用，严禁用于任何商业用途和非法行为
* [MIT 许可证](https://github.com/rainbowwarmth/KazuhaBot_Newmys/blob/main/LICENSE)
