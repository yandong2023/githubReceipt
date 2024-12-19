const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const { v4: uuidv4 } = require('uuid');

// 存储邮件的内存数据库
const emailStore = new Map();
const addressStore = new Map();

// 创建SMTP服务器
const smtpServer = new SMTPServer({
    secure: false,
    disabledCommands: ['AUTH', 'STARTTLS'],
    onData(stream, session, callback) {
        let mailData = '';
        stream.on('data', (chunk) => {
            mailData += chunk;
        });

        stream.on('end', async () => {
            try {
                // 解析邮件内容
                const parsed = await simpleParser(mailData);
                const to = parsed.to.text;
                const mailId = uuidv4();
                
                // 存储邮件
                if (addressStore.has(to)) {
                    const emails = emailStore.get(to) || [];
                    emails.push({
                        id: mailId,
                        from: parsed.from.text,
                        subject: parsed.subject,
                        text: parsed.text,
                        html: parsed.html,
                        date: parsed.date,
                        attachments: parsed.attachments
                    });
                    emailStore.set(to, emails);
                }
                
                callback();
            } catch (err) {
                console.error('处理邮件时出错:', err);
                callback(new Error('处理邮件失败'));
            }
        });
    }
});

// 生成临时邮箱地址
function generateTempEmail() {
    const id = Math.random().toString(36).substring(2, 12);
    const domain = 'temp-mail.local';
    const email = `${id}@${domain}`;
    addressStore.set(email, true);
    emailStore.set(email, []);
    return email;
}

// 获取邮箱的所有邮件
function getEmails(email) {
    return emailStore.get(email) || [];
}

// 删除临时邮箱
function deleteTempEmail(email) {
    addressStore.delete(email);
    emailStore.delete(email);
}

// 清理过期的临时邮箱（24小时后）
setInterval(() => {
    const now = Date.now();
    for (const [email, timestamp] of addressStore.entries()) {
        if (now - timestamp > 24 * 60 * 60 * 1000) {
            deleteTempEmail(email);
        }
    }
}, 60 * 60 * 1000); // 每小时检查一次

module.exports = {
    smtpServer,
    generateTempEmail,
    getEmails,
    deleteTempEmail
};
