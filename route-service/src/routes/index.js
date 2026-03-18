const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const path = require('path');

/**
 * 路由页面处理
 * 匹配6位随机码（大小写字母+数字）
 */
router.get('/:code([A-Za-z0-9]{6})', async (req, res) => {
    try {
        const code = req.params.code;

        // 查询活动
        const activity = Activity.findByCode(code);

        if (!activity) {
            // 活动不存在，返回404页面
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>活动不存在</title>
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
                        <p>活动不存在或已失效</p>
                        <p style="margin-top: 10px;">请检查链接是否正确</p>
                    </div>
                </body>
                </html>
            `);
        }

        // 如果有主链接，直接302重定向（无中间页面）
        if (activity.main_link) {
            return res.redirect(activity.main_link);
        }

        // 没有主链接，返回选择页面
        const filePath = path.join(__dirname, '../views/route.html');
        let html = '';

        // 简单的模板替换（为了简单，不使用模板引擎）
        html = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
                <meta http-equiv="Pragma" content="no-cache">
                <meta http-equiv="Expires" content="0">
                <title>正在跳转...</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .container {
                        text-align: center;
                        color: white;
                        padding: 20px;
                    }

                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    .message {
                        font-size: 18px;
                        margin-bottom: 10px;
                    }

                    .sub-message {
                        font-size: 14px;
                        opacity: 0.8;
                    }

                    .error {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 20px;
                        border-radius: 10px;
                        margin-top: 20px;
                    }

                    .error h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                    }

                    .error p {
                        font-size: 14px;
                        margin-bottom: 10px;
                    }

                    .error .link {
                        color: white;
                        text-decoration: underline;
                        cursor: pointer;
                    }

                    .error .link:hover {
                        opacity: 0.8;
                    }
                </style>
            </head>
            <body>
                <div class="container" id="container">
                    <div class="spinner"></div>
                    <div class="message">正在跳转到照片直播页面...</div>
                    <div class="sub-message" id="status">检测主链接状态...</div>
                </div>

                <script>
                    const activity = ${JSON.stringify(activity)};
                    const mainLink = activity.main_link;
                    const backupLink = activity.backup_link;
                    const activityName = activity.name;

                    // 健康检测超时时间（毫秒）
                    const HEALTH_CHECK_TIMEOUT = 3000;

                    // 检测链接健康状态
                    async function checkHealth(url) {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

                        try {
                            const response = await fetch(url, {
                                method: 'HEAD',
                                mode: 'no-cors',
                                signal: controller.signal,
                                cache: 'no-cache'
                            });
                            clearTimeout(timeoutId);
                            return { success: true };
                        } catch (error) {
                            clearTimeout(timeoutId);
                            return { success: false, error: error.message };
                        }
                    }

                    // 跳转到指定链接
                    function redirectTo(url) {
                        console.log('跳转到:', url);
                        window.location.href = url;
                    }

                    // 显示错误信息
                    function showError(mainError, backupError) {
                        document.getElementById('container').innerHTML = \`
                            <div class="error">
                                <h2>⚠️ 无法访问照片直播页面</h2>
                                <p>活动：\${activityName}</p>
                                <p>主链接：\${mainLink}</p>
                                <p>备用链接：\${backupLink}</p>
                                <p style="margin-top: 15px;">\${mainError || '主链接无法访问'}</p>
                                \${backupError ? \`<p>\${backupError}</p>\` : ''}
                                <p style="margin-top: 15px;">您可以尝试：</p>
                                <p><span class="link" onclick="redirectTo('\${mainLink}')">点击访问主链接</span></p>
                                <p><span class="link" onclick="redirectTo('\${backupLink}')">点击访问备用链接</span></p>
                            </div>
                        \`;
                    }

                    // 主逻辑 - 直接跳转，不做健康检测
                    function main() {
                        document.getElementById('status').textContent = '正在跳转...';
                        setTimeout(() => redirectTo(mainLink), 500);
                    }

                    // 启动
                    main();
                </script>
            </body>
            </html>
        `;

        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.send(html);
    } catch (error) {
        console.error('路由页面处理失败:', error);
        res.status(500).send('服务器错误');
    }
});

module.exports = router;
