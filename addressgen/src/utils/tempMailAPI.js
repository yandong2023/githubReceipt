const axios = require('axios');
const md5 = require('md5');

const API_BASE_URL = 'https://api.temp-mail.org/request';

function generateTempEmail() {
    const randomString = Math.random().toString(36).substring(2, 12);
    return `${randomString}@temp-mail.org`;
}

function getEmailHash(email) {
    return md5(email.toLowerCase());
}

async function checkEmail(email) {
    try {
        const hash = getEmailHash(email);
        const response = await axios.get(`${API_BASE_URL}/mail/id/${hash}`);
        return response.data.map(email => ({
            id: email.mail_id,
            from: email.mail_from,
            subject: email.mail_subject,
            date: email.mail_timestamp * 1000, // 转换为毫秒
            preview: email.mail_preview
        }));
    } catch (error) {
        console.error('获取邮件失败:', error);
        throw error;
    }
}

async function getEmailContent(id) {
    try {
        const response = await axios.get(`${API_BASE_URL}/mail/id/${id}`);
        const email = response.data;
        return {
            id: email.mail_id,
            from: email.mail_from,
            subject: email.mail_subject,
            date: email.mail_timestamp * 1000,
            text: email.mail_text,
            html: email.mail_html
        };
    } catch (error) {
        console.error('获取邮件内容失败:', error);
        throw error;
    }
}

module.exports = {
    generateTempEmail,
    checkEmail,
    getEmailContent
};
