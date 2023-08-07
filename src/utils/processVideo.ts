import * as path from "path";
import * as fs from "fs";
import { execCommand } from "./execCommand";
import { processSubtitle } from "./processSubtitle";
import { logger } from "./logger";

// 给视频加字幕
export const processVideo = (dirPath: string, filename: string) => {
    return new Promise(async (resolve, reject) => {
        logger.info("-----加字幕阶段开始-----\n");
        logger.info("processVideo:", dirPath, filename);

        const videoPath = path.resolve(dirPath, filename + ".mp4");
        const outputFile = path.resolve(dirPath, filename + ".output.mp4");

        // 如果要输出的视频（.output.mp4）已经存在，跳过，表示之前已经转换过了
        if (fs.existsSync(outputFile)) {
            resolve(true);
            return;
        }

        let enSubPath = path.resolve(dirPath, filename + ".en.vtt");
        const zhSubtitle = path.resolve(dirPath, filename + ".zh-Hans.vtt");
        const zhEnSubtitle = path.resolve(dirPath, filename + ".zh-Hans-en.vtt");


        if (!fs.existsSync(enSubPath)) {
            logger.info("英语字幕不存在,视频不做加字幕的处理,将输出原视频");
            fs.copyFileSync(videoPath, outputFile);
            resolve(true);
            return;
        }

        let zhSubPath = ""; // 确定 中文字幕路径
        let isSingle = false;
        if (fs.existsSync(zhEnSubtitle)) {
            // 双行字幕->但是单句显示
            zhSubPath = zhEnSubtitle;
        } else if (fs.existsSync(zhSubtitle)) {
            zhSubPath = zhSubtitle;
            // 将双行重叠字幕变成单行
            enSubPath = await processSubtitle(enSubPath);
            zhSubPath = await processSubtitle(zhSubPath);
            isSingle = true;
        }

        const commonStyle = "FontName=微软雅黑,PrimaryColour=&HFFFFFF&,BackColour=&H80000000&,BorderStyle=4,Outline=0,";
        const enStyle = commonStyle + "FontSize=9,MarginV=3";
        const zhStyle = commonStyle + `FontSize=14,MarginV=${isSingle ? 15 : 25}`;

        if (process.platform === "win32") {
            enSubPath = processWinPath(enSubPath);
            zhSubPath = processWinPath(zhSubPath);
        }

        // 给视频压制双字幕
        let command = `ffmpeg -i "${videoPath}" -vf "subtitles=${enSubPath}:force_style='${enStyle}',subtitles=${zhSubPath}:force_style='${zhStyle}'" -c:a copy "${outputFile}" -hide_banner`;
        if (zhSubPath === "") {
            logger.info("中文字幕不存在,只压制英语字幕");
            command = `ffmpeg -i "${videoPath}" -vf "subtitles=${enSubPath}:force_style='${zhStyle}'" -c:a copy "${outputFile}" -hide_banner`;
        }
        logger.warn(command);
        execCommand(command, resolve, reject);
    });
};

// C:\gkd\project\YoutubeToBilibiliHelp\videos\SeanAslam\2023_05_13__mqoCtTvTO1U.en.vtt
// 转换后
// 'C\:/gkd/project/YoutubeToBilibiliHelp/videos/Sean Aslam/2023_05_13__mqoCtTvTO1U.en.vtt'
const processWinPath = (pathString: string): string => {
    let normalizedPath = pathString.split(path.sep).join("/");
    normalizedPath = normalizedPath.replace(":", "\\:");
    return `\'${normalizedPath}\'`;
};
