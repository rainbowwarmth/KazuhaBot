import fs from "fs";
async function helpimage(msg) {
    const content = await generateContentFromMarkdown('resources/markdown/HELP.md', '米游社小助手使用指南', '功能名', '命令');
    return msg.sendMsgEx({ content });
}
async function info(msg) {
    const content = await generateContentFromMarkdown('resources/markdown/CHANGELOG.md', '更新日志', '版本', '内容');
    return msg.sendMsgEx({ content });
}
async function generateContentFromMarkdown(filePath, title, headingLabel, emphasisLabel) {
    const markdown = fs.readFileSync(filePath, 'utf-8');
    const { headings, emphasis } = extractContentFromMarkdown(markdown);
    let content = `${title}\n`;
    for (let i = 0; i < headings.length; i++) {
        content += `\n${headingLabel}:${headings[i]}\n`;
        if (emphasis[i]) {
            content += `${emphasisLabel}:${emphasis[i]}\n`;
        }
    }
    return content;
}
async function commits(msg) {
    try {
        const response = await fetch('https://gitee.com/api/v5/repos/rainbowwarmth/KazuhaBot_Newmys/commits');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const extractedData = data.slice(0, 15).map((commit) => ({
            authorName: commit.commit.author.name,
            authorDate: commit.commit.author.date,
            commitMessage: commit.commit.message.replace(/\./g, ' '),
        }));
        let content = '提交日志\n';
        extractedData.forEach((commit) => {
            content += `\n作者：${commit.authorName}\n时间：${commit.authorDate}\n内容：${commit.commitMessage}\n`;
        });
        return msg.sendMsgEx({ content });
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
export { helpimage, commits, info };
