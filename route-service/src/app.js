require('dotenv').config();
const express = require('express');
const path = require('path');

const routes = require('./routes/index');
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 路由
app.use('/', routes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: '服务正常运行',
        timestamp: new Date().toISOString()
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - 页面不存在</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                h1 { font-size: 48px; margin-bottom: 20px; }
                p { font-size: 18px; opacity: 0.9; }
            </style>
        </head>
        <body>
            <div>
                <h1>404</h1>
                <p>页面不存在</p>
            </div>
        </body>
        </html>
    `);
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).send('服务器内部错误');
});

// 初始化数据库并启动服务器
async function startServer() {
    try {
        // 初始化 SQL.js（只加载一次 WASM，不缓存数据库实例）
        await database.init();
        console.log('路由页面服务 - SQL.js 初始化成功');

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`
    ╔══════════════════════════════════════════╗
    ║   活码管理系统 - 路由页面服务          ║
    ╠══════════════════════════════════════════╣
    ║   服务地址: http://localhost:${PORT}      ║
    ║   健康检查: http://localhost:${PORT}/health ║
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
