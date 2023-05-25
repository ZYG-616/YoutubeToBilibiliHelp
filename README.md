# 从油管自动化搬运视频到X平台

> 目前仅支持B站：自动监听油管频道更新->自动加字幕->上传B站
> 以下是win系统用户教程，unix系统使用同理，也可以等待更新unix文档

## 所需依赖：

### [git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)

```bash
git clone https://github.com/gaoxiaoduan/YoutubeToBilibiliHelp.git
```

### [node](https://nodejs.org/en)

```bash
npm i pnpm -g #安装pnpm
cd YoutubeToBilibiliHelp #进入项目中
pnpm i #安装依赖

# 安装过程中可能会出现报错
# ERROR: Failed to set up Chromium r782078! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download
SET PUPPETEER_SKIP_DOWNLOAD='true' #win
export PUPPETEER_SKIP_DOWNLOAD='true' #linux
```


### yt-dlp

- [https://github.com/yt-dlp/yt-dlp#installation](https://github.com/yt-dlp/yt-dlp#installation)
- 多种安装方式
  - 这里选择win

![image.png](https://cdn.jsdelivr.net/gh/gaoxiaoduan/picGoImg@main/images/202305251129146.png)
点击下载
![image.png](https://cdn.jsdelivr.net/gh/gaoxiaoduan/picGoImg@main/images/202305251129461.png)
添加到环境变量
![image.png](https://cdn.jsdelivr.net/gh/gaoxiaoduan/picGoImg@main/images/202305251129370.png)
![image.png](https://cdn.jsdelivr.net/gh/gaoxiaoduan/picGoImg@main/images/202305251130475.png)

### ffmpeg

[https://github.com/yt-dlp/FFmpeg-Builds](https://github.com/yt-dlp/FFmpeg-Builds)
下载对应的环境安装包
![image.png](https://cdn.jsdelivr.net/gh/gaoxiaoduan/picGoImg@main/images/202305251130129.png)
添加到环境变量
![image.png](https://cdn.jsdelivr.net/gh/gaoxiaoduan/picGoImg@main/images/202305251130077.png)
测试是否生效
![image.png](https://cdn.jsdelivr.net/gh/gaoxiaoduan/picGoImg@main/images/202305251130083.png)

## 配置监听频道

例如：.env.template和upload_log.template.json都是模版文件
注意：需要删除template后缀使用

- .dev 配置文件
- 主要功能：一些账号密码

```bash
BliBli_USERNAME="xxx" # B站用户名
BliBli_PASSWORD="xxx" # B站密码

# 平台链接：http://www.ttshitu.com/
TJ_USERNAME="xxx" #打码平台账号
TJ_PASSWORD="xxx" #打码平台密码
```

- upload_log.json 配置文件
- 主要功能：监听用户频道信息
- json有多个配置字段，具体可以查看IChangedInfo接口定义
- 但是只有几个字段是监听所必要的，下面用*号标记出来，也可以直接使用upload_log.template.json

```json3
{
  // 支持上传的平台，目前仅支持B站
  "supported_target_platform": [
    "BZ"
  ],
  "uploads": [
    // 要监听的频道内容，支持多频道监测
    {
      // 要监听的用户名
      "user": "user1", 
      // *监听频道的地址,若要监听油管短视频，可把url最后的videos换成shorts
      "user_url": "https://www.youtube.com/@addyvisuals/videos",
      // *发布时候，标题党前缀，若不需要设置，可以设置为空字符串""
      "publish_prefix": "[教授Professor]",
      // *发布B站分区，默认是B站推荐分区，也就是[0,0]
      "blibli_classification": [
        0,
        0
      ],
      // *视频的自定义tag，最多支持10个tag
      "prefix_tags": [
        "科技",
        "技术"
      ],
      // 保存捕获到的视频信息
      "videos": []
    },
    // 多频道监测,直接在下面填写要监控的频道信息即可
    {
      // 要监听的用户名
      "user": "user2", 
      // *监听频道的地址,若要监听油管短视频，可把url最后的videos换成shorts
      "user_url": "https://www.youtube.com/@addyvisuals/shorts",
      ...
    },
  ]
}
```

## 启动项目

- 安装pm2

```bash
npm i pm2 -g # 安装pm2
```

- 启动项目

```bash
pnpm dev # 开发启动命令

#挂机运行模式
pnpm build # build项目
pm2 start pm2.config.json # 启动项目
pm2 stop pm2.config.json # 停止项目
```

## 可能会遇到的问题：

关于代理：

```typescript
// src\constant\index.ts
// 代理->设置为"",则不走代理｜若直连，可能会被墙，建议给终端走代理，这里默认使用clash本地代理
export const PROXY = "http://127.0.0.1:7890";
```

- 若报下面的错误，可以将package.json中把puppeteer改为：^18，然后再次pnpm i

```bash
Error: Could not find Chromium (rev. 1108766).
```

- 若报下面的错误，可以跳过Chrome的安装
  - mac export PUPPETEER_SKIP_DOWNLOAD='true'
  - win SET PUPPETEER_SKIP_DOWNLOAD='true'

```bash
.../node_modules/puppeteer postinstall$ node install.js
│ ERROR: Failed to set up Chrome r113.0.5672.63! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.
```

