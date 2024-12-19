const express = require('express');
const path = require('path');
const cors = require('cors');
const { generateAddress } = require('./utils/addressGenerator');
const { generateTempEmail, getEmails } = require('./utils/tempMailAPI');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 临时邮箱相关路由
app.post('/api/email/create', (req, res) => {
    try {
        const email = generateTempEmail();
        res.json({ email });
    } catch (error) {
        console.error('创建临时邮箱失败:', error);
        res.status(500).json({ error: '创建临时邮箱失败' });
    }
});

app.get('/api/email/:email/messages', async (req, res) => {
    try {
        const { email } = req.params;
        const messages = await getEmails(email);
        res.json({ messages });
    } catch (error) {
        console.error('获取邮件失败:', error);
        res.status(500).json({ error: '获取邮件失败' });
    }
});

// 地址生成相关路由
app.get('/api/address/:country', (req, res) => {
    try {
        const { country } = req.params;
        const { city } = req.query;
        
        if (!['us', 'uk'].includes(country.toLowerCase())) {
            return res.status(400).json({ error: '不支持的国家代码' });
        }

        const address = generateAddress(country.toLowerCase(), city);
        res.json(address);
    } catch (error) {
        console.error('生成地址时出错:', error);
        res.status(500).json({ error: '生成地址失败' });
    }
});

// 批量生成地址
app.post('/api/address/batch/:country', (req, res) => {
    try {
        const { country } = req.params;
        const { count = 1 } = req.body;
        
        if (!['us', 'uk'].includes(country.toLowerCase())) {
            return res.status(400).json({ error: '不支持的国家代码' });
        }

        if (count < 1 || count > 100) {
            return res.status(400).json({ error: '数量必须在1-100之间' });
        }

        const addresses = Array.from({ length: count }, () => 
            generateAddress(country.toLowerCase())
        );

        res.json({ addresses });
    } catch (error) {
        console.error('批量生成地址时出错:', error);
        res.status(500).json({ error: '生成地址失败' });
    }
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '未找到请求的资源' });
});

// 启动服务器
app.listen(port, () => {
    console.log(`HTTP服务器运行在 http://localhost:${port}`);
});
