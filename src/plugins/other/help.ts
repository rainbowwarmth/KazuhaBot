import fs from "fs";
import { IMessageEx } from "@src/lib/core/IMessageEx";
import logger from "@src/lib/logger/logger";

async function helpimage(msg: IMessageEx) {

    const markdown = fs.readFileSync('resources/markdown/HELP.md', 'utf-8');
    const { headings, emphasis } = extractContentFromMarkdown(markdown);
    let content = '米游社小助手使用指南\n';

    // 将解析后的标题和强调内容按顺序添加到content中
    for (let i = 0; i < headings.length; i++) {
        content += `\n功能名:${headings[i]}\n`;
        if (emphasis[i]) {
            content += `命令:${emphasis[i]}\n`;
        }
    
    }

    // 发送格式化后的消息内容
    return msg.sendMsgEx({
        content
    });
}

interface Commit {
    commit: {
        author: {
            name: string;
            date: string;
        };
        message: string;
    };
    authorName: string;
    authorDate: string;
    commitMessage: string;
}

async function commits(msg: IMessageEx) {
    try {
        const response = await fetch('https://gitee.com/api/v5/repos/rainbowwarmth/KazuhaBot_Newmys/commits');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        // 提取项目中的信息
        const extractedData = data.slice(0, 15).map((commit: Commit) => {
            const messageWithoutLinks = commit.commit.message.replace(/\./g, ' ');
            return {
                authorName: commit.commit.author.name,
                authorDate: commit.commit.author.date,
                commitMessage: messageWithoutLinks,
            };
        });
        // 循环遍历提取的数据发送到控制台
        extractedData.forEach((commit: Commit) => {
            logger.info('Author Name:', commit.authorName);
            logger.info('Author Date:', commit.authorDate);
            logger.info('Commit Message:', commit.commitMessage);
            logger.info('\n');
        });

        let content = '提交日志\n';
        extractedData.forEach((commit: Commit) => {
            content += `\n作者：${commit.authorName}\n时间：${commit.authorDate}\n内容：${commit.commitMessage}\n`;
        });

        return msg.sendMsgEx({
            content: content
        });

    } catch (error) {
        logger.error('Error fetching or parsing data:', error);
        return null;
    }
}

function extractContentFromMarkdown(markdown: string): { headings: string[], emphasis: string[] } {
    const headingRegex = /^#+\s+(.+)/gm;
    const emphasisRegex = /\*{1,2}(.*?)\*{1,2}/g;

    const headingsMatch = markdown.match(headingRegex);
    const emphasisMatch = markdown.match(emphasisRegex);

    const headings: string[] = headingsMatch ? headingsMatch.map(match => match.replace(/^#+\s+/, '')) : [];
    const emphasis: string[] = emphasisMatch ? emphasisMatch.map(match => match.replace(/\*/g, '')) : [];

    return { headings, emphasis };
}


async function info(msg: IMessageEx) {

    const markdown = fs.readFileSync('resources/markdown/CHANGELOG.md', 'utf-8');
    const { headings, emphasis } = extractContentFromMarkdown(markdown);
    let content = '更新日志\n';

    // 将解析后的标题和强调内容按顺序添加到content中
    for (let i = 0; i < headings.length; i++) {
        content += `\n版本:${headings[i]}\n`;
        if (emphasis[i]) {
            content += `内容:${emphasis[i]}\n`;
        }
    
    }

    // 发送格式化后的消息内容
    return msg.sendMsgEx({
        content
    });
}

export { helpimage, commits, info };