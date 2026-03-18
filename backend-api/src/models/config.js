const Database = require('better-sqlite3');
const path = require('path');

// 获取数据库路径
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/huoma.db');

// 确保目录存在
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 打开数据库
const db = new Database(dbPath);

// 初始化配置表
db.exec(`
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// 初始化默认配置（如果不存在）
const defaultConfigs = {
    'help_faq': JSON.stringify([
        {
            id: 1,
            question: 'Q1：活码是什么？有什么用？',
            answer: '<p><strong>A：</strong>活码是一个可以动态配置跳转目标的短链接（6位随机码）。</p><p>使用活码的优势：</p><ul><li>链接简洁易记，如：<code>https://route.vtc365.cn/AbC123</code></li><li>可以随时切换主链接，无需通知观众</li><li>支持最多3个预备链接，灵活应对各种场景</li></ul>'
        },
        {
            id: 2,
            question: 'Q2：如何切换主链接？',
            answer: '<p><strong>A：</strong>在活动列表中，找到目标活动，点击"切换链接"按钮。</p><p>选择想要设为主链接的预备链接，点击确认即可。</p>'
        }
    ])
};

const insertStmt = db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultConfigs)) {
    insertStmt.run(key, value);
}

module.exports = {
    // 获取配置
    get: (key) => {
        const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key);
        if (row) {
            try {
                return JSON.parse(row.value);
            } catch {
                return row.value;
            }
        }
        return null;
    },
    
    // 设置配置
    set: (key, value) => {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
        db.prepare('INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(key, valueStr);
        return true;
    },
    
    // 获取所有配置
    getAll: () => {
        const rows = db.prepare('SELECT * FROM config').all();
        const configs = {};
        for (const row of rows) {
            try {
                configs[row.key] = JSON.parse(row.value);
            } catch {
                configs[row.key] = row.value;
            }
        }
        return configs;
    }
};
