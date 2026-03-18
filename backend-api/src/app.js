require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const activitiesRouter = require('./routes/activities');
const switchLogsRouter = require('./routes/switchLogs');
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// API路由
app.use('/api/activities', activitiesRouter);
app.use('/api/switch-logs', switchLogsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务正常运行',
        timestamp: new Date().toISOString()
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: err.message || '服务器内部错误'
    });
});

// 初始化数据库并启动服务器
async function startServer() {
    try {
        // 初始化数据库
        await database.init();
        console.log('数据库初始化成功');

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`
    ╔══════════════════════════════════════════╗
    ║   活码管理系统 - 后台API服务            ║
    ╠══════════════════════════════════════════╣
    ║   服务地址: http://localhost:${PORT}     ║
    ║   健康检查: http://localhost:${PORT}/api/health ║
    ╚══════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
