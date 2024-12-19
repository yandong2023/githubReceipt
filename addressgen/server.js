require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const XLSX = require('xlsx');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB连接
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 用户模型
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    apiKey: String,
    usage: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// 中间件：验证JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未授权' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: '无效令牌' });
        req.user = user;
        next();
    });
};

// 注册路由
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const apiKey = jwt.sign({ email }, process.env.JWT_SECRET);
        
        const user = new User({
            email,
            password: hashedPassword,
            apiKey
        });
        
        await user.save();
        res.json({ message: '注册成功' });
    } catch (error) {
        res.status(400).json({ error: '注册失败' });
    }
});

// 登录路由
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: '邮箱或密码错误' });
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: '登录失败' });
    }
});

// 高级地址生成API
app.post('/api/address/generate', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.plan === 'free' && user.usage >= 100) {
            return res.status(403).json({ error: '已达到免费版使用限制' });
        }

        const { country, count = 1, format = 'json' } = req.body;
        const addresses = [];

        for (let i = 0; i < count; i++) {
            // 这里使用本地数据生成地址
            const address = generateAddress(country);
            addresses.push(address);
        }

        user.usage += count;
        await user.save();

        if (format === 'xlsx') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(addresses);
            XLSX.utils.book_append_sheet(wb, ws, "Addresses");
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=addresses.xlsx');
            return res.send(buffer);
        }

        res.json({ addresses });
    } catch (error) {
        res.status(500).json({ error: '生成地址失败' });
    }
});

// 订阅处理
app.post('/api/subscribe', authenticateToken, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.protocol}://${req.get('host')}/success.html`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: '创建订阅失败' });
    }
});

// 用户使用统计
app.get('/api/usage', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            usage: user.usage,
            plan: user.plan,
            remaining: user.plan === 'free' ? 100 - user.usage : 'unlimited'
        });
    } catch (error) {
        res.status(500).json({ error: '获取使用统计失败' });
    }
});

// 代理 API 请求
app.get('/api/address/:country', async (req, res) => {
    const country = req.params.country;
    const apiUrls = {
        'us': 'https://www.meiguodizhi.com/api/v1/dz',
        'gb': 'https://www.meiguodizhi.com/api/v1/uk-address'
    };

    const apiUrl = apiUrls[country.toLowerCase()];
    if (!apiUrl) {
        return res.status(400).json({ error: '不支持的国家代码' });
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.log('API 返回的原始数据:', text);
            // 如果返回的不是 JSON，尝试从 HTML 中提取地址
            const addressMatch = text.match(/<div[^>]*>([^<]+)<\/div>/);
            if (addressMatch) {
                data = { address: addressMatch[1].trim() };
            } else {
                throw new Error('无法解析返回的数据');
            }
        }

        res.json(data);
    } catch (error) {
        console.error('API请求失败:', error);
        res.status(500).json({ error: '获取地址数据失败', details: error.message });
    }
});

// 生成单个地址
app.post('/generate-address', async (req, res) => {
    try {
        const { country, city } = req.body;
        const address = await generateAddress(country, city);
        res.json(address);
    } catch (error) {
        console.error('生成地址失败:', error);
        res.status(500).json({ error: '生成地址失败' });
    }
});

// 批量生成地址
app.post('/batch-generate', async (req, res) => {
    try {
        const { country, city, count = 10 } = req.body;
        const addresses = [];
        
        for (let i = 0; i < count; i++) {
            const address = await generateAddress(country, city);
            addresses.push(address);
        }
        
        res.json({ addresses });
    } catch (error) {
        console.error('批量生成地址失败:', error);
        res.status(500).json({ error: '批量生成地址失败' });
    }
});

// 检查邮箱
app.get('/check-email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: '邮箱地址不能为空' });
        }
        
        const messages = await checkEmail(email);
        res.json(messages);
    } catch (error) {
        console.error('检查邮箱失败:', error);
        res.status(500).json({ error: '检查邮箱失败' });
    }
});

// 查看邮件内容
app.get('/view-email', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: '邮件ID不能为空' });
        }
        
        const content = await getEmailContent(id);
        res.json(content);
    } catch (error) {
        console.error('获取邮件内容失败:', error);
        res.status(500).json({ error: '获取邮件内容失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});

// 地址生成函数
function generateAddress(country) {
    // 这里使用本地数据生成地址
    // 请替换为实际的地址生成逻辑
    return {
        country,
        city: 'City',
        street: 'Street',
        postalCode: 'Postal Code'
    };
}

// 邮箱相关函数
async function checkEmail(email) {
    // 请替换为实际的邮箱检查逻辑
    return [];
}

async function getEmailContent(id) {
    // 请替换为实际的邮件内容获取逻辑
    return {};
}
