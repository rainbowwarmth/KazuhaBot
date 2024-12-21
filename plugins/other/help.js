import fs from "fs";
async function helpimage(msg) {
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
async function commits(msg) {
    try {
        const response = await fetch('https://gitee.com/api/v5/repos/rainbowwarmth/KazuhaBot_Newmys/commits');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        // 提取项目中的信息
        const extractedData = data.slice(0, 15).map((commit) => {
            const messageWithoutLinks = commit.commit.message.replace(/\./g, ' ');
            return {
                authorName: commit.commit.author.name,
                authorDate: commit.commit.author.date,
                commitMessage: messageWithoutLinks,
            };
        });
        // 循环遍历提取的数据发送到控制台
        extractedData.forEach((commit) => {
            logger.info('Author Name:', commit.authorName);
            logger.info('Author Date:', commit.authorDate);
            logger.info('Commit Message:', commit.commitMessage);
            logger.info('\n');
        });
        let content = '提交日志\n';
        extractedData.forEach((commit) => {
            content += `\n作者：${commit.authorName}\n时间：${commit.authorDate}\n内容：${commit.commitMessage}\n`;
        });
        return msg.sendMsgEx({
            content: content
        });
    }
    catch (error) {
        logger.error('Error fetching or parsing data:', error);
        return null;
    }
}
function extractContentFromMarkdown(markdown) {
    const headingRegex = /^#+\s+(.+)/gm;
    const emphasisRegex = /\*{1,2}(.*?)\*{1,2}/g;
    const headingsMatch = markdown.match(headingRegex);
    const emphasisMatch = markdown.match(emphasisRegex);
    const headings = headingsMatch ? headingsMatch.map(match => match.replace(/^#+\s+/, '')) : [];
    const emphasis = emphasisMatch ? emphasisMatch.map(match => match.replace(/\*/g, '')) : [];
    return { headings, emphasis };
}
async function info(msg) {
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
