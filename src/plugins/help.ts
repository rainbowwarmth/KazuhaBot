import { IMessageEx } from "../lib/IMessageEx";

export async function helpimage(msg: IMessageEx) {
    fetch('https://gitee.com/rainbowwarmth/qqguid-bot-plugin/raw/master/help.json')
    .then(response => response.json())
    .then(data =>{
        return msg.sendMsgEx({
            content: `${data.New}`+
            `\n${data.desc}`+
            `\n${data.NewList}`+
            `\n${data.Listdesc}`+
            `\n${data.taskNew}`+
            `\n${data.taskdesc}`
        })
    })
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

export async function commits(msg: IMessageEx) {
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
            console.log('Author Name:', commit.authorName);
            console.log('Author Date:', commit.authorDate);
            console.log('Commit Message:', commit.commitMessage);
            console.log('\n');
        });

        let content = '更新日志\n';
        extractedData.forEach((commit: Commit) => {
            content += `\n作者：${commit.authorName}\n时间：${commit.authorDate}\n内容：${commit.commitMessage}\n`;
        });

        return msg.sendMsgEx({
            content: content
        });

    } catch (error) {
        console.error('Error fetching or parsing data:', error);
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

export async function info(msg: IMessageEx) {

    const markdown = fs.readFileSync('CHANGELOG.md', 'utf-8');
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
