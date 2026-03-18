const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// 获取数据库路径（与backend-api共享，建议配置绝对路径的环境变量）
const dbPath = process.env.DATABASE_PATH || '/opt/huoma/backend-api/data/huoma.db';

// SQL.js 实例（只初始化一次）
let SQL = null;

// 初始化数据库（只加载SQL.js，不缓存db实例，每次查询从文件读取最新数据）
async function initDatabase() {
    SQL = await initSqlJs();
    console.log('路由页面服务 - SQL.js 初始化完成，数据库路径:', dbPath);
}

/**
 * 每次查询时从磁盘加载最新数据库，确保实时读取 backend-api 写入的数据
 */
function queryByCode(code) {
    if (!SQL) {
        throw new Error('SQL.js 尚未初始化');
    }
    if (!fs.existsSync(dbPath)) {
        throw new Error('数据库文件不存在: ' + dbPath);
    }

    const data = fs.readFileSync(dbPath);
    const db = new SQL.Database(data);

    try {
        const stmt = db.prepare('SELECT * FROM activities WHERE code = ? AND status = ?');
        stmt.bind([code, 'active']);
        let result = undefined;
        if (stmt.step()) {
            result = stmt.getAsObject();
        }
        stmt.free();
        return result;
    } finally {
        db.close();
    }
}

async function init() {
    await initDatabase();
}

module.exports = {
    init,
    queryByCode
};
