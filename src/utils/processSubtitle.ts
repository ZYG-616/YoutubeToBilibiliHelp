import fs from "fs";
import path from "path";

/**
 * 将双行字幕变成单行字幕
 * @param subtitlePath
 */
export const processSubtitle: (subtitlePath: string) => Promise<string> = (subtitlePath: string) => {
    return new Promise((resolve) => {
            const subString = fs.readFileSync(subtitlePath, "utf-8");
            const dataArray = subString.split("\n\n");
            const newDataArray = dataArray.map(item => {
                const itemArray = item.split("\n");
                if (itemArray.length === 3) {
                    // 00:01:11 ... <-- 时间戳
                    // dddd <--- 第一句话，此句是重复的
                    // xxx  <--- 第二句话，保留
                    // 删除多行字幕为单行，删除dddd
                    itemArray.splice(1, 1);
                }
                return itemArray.join("\n");
            });
            const newData = newDataArray.join("\n\n");
            fs.writeFileSync(subtitlePath, newData, "utf-8");
            resolve(subtitlePath);
        }
    );
};


// C:\xxx\project\YoutubeToBilibiliHelp\videos\SeanAslam\2023_05_13__mqoCtTvTO1U.en.vtt
// 转换后
// 'C\:/xxx/project/YoutubeToBilibiliHelp/videos/Sean Aslam/2023_05_13__mqoCtTvTO1U.en.vtt'
export const processWinPath = (pathString: string): string => {
    let normalizedPath = pathString.split(path.sep).join("/");
    normalizedPath = normalizedPath.replace(":", "\\:");
    return `\'${normalizedPath}\'`;
};