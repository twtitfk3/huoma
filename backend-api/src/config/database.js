const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// 获取数据库路径 —— 优先读取环境变量（建议配置绝对路径）
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/huoma.db');

// 确保数据目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 数据库实例（异步初始化）
let db = null;
let SQL = null;

// 初始化数据库
async function initDatabase() {
    // 初始化SQL.js
    SQL = await initSqlJs();

    // 尝试加载已存在的数据库
    let data = null;
    if (fs.existsSync(dbPath)) {
        data = fs.readFileSync(dbPath);
    }

    // 创建数据库连接
    db = new SQL.Database(data);

    // 启用外键约束
    db.run('PRAGMA foreign_keys = ON');

    // 创建活动表（支持3个预备链接）
    db.run(`
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(6) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            main_link VARCHAR(500) NOT NULL,
            backup_link_1 VARCHAR(500),
            backup_link_2 VARCHAR(500),
            backup_link_3 VARCHAR(500),
            remark TEXT,
            status VARCHAR(20) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 兼容旧版本迁移：如果旧表有 backup_link 字段，迁移到 backup_link_1
    try {
        const cols = db.exec("PRAGMA table_info(activities)");
        if (cols.length > 0) {
            const colNames = cols[0].values.map(row => row[1]);
            // 如果存在旧的 backup_link 字段，迁移数据
            if (colNames.includes('backup_link') && !colNames.includes('backup_link_1')) {
                db.run('ALTER TABLE activities ADD COLUMN backup_link_1 VARCHAR(500)');
                db.run('ALTER TABLE activities ADD COLUMN backup_link_2 VARCHAR(500)');
                db.run('ALTER TABLE activities ADD COLUMN backup_link_3 VARCHAR(500)');
                db.run('UPDATE activities SET backup_link_1 = backup_link WHERE backup_link_1 IS NULL');
                console.log('数据库迁移完成：backup_link → backup_link_1');
            }
            // 如果新字段不存在，逐一添加
            if (!colNames.includes('backup_link_1')) {
                db.run('ALTER TABLE activities ADD COLUMN backup_link_1 VARCHAR(500)');
            }
            if (!colNames.includes('backup_link_2')) {
                db.run('ALTER TABLE activities ADD COLUMN backup_link_2 VARCHAR(500)');
            }
            if (!colNames.includes('backup_link_3')) {
                db.run('ALTER TABLE activities ADD COLUMN backup_link_3 VARCHAR(500)');
            }
        }
    } catch (e) {
        // 新建数据库，字段已在建表语句中，忽略
    }

    // 创建切换日志表
    db.run(`
        CREATE TABLE IF NOT EXISTS switch_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            operator VARCHAR(50) NOT NULL,
            old_main_link VARCHAR(500),
            new_main_link VARCHAR(500),
            switch_note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (activity_id) REFERENCES activities(id)
        )
    `);

    // 保存数据库到文件
    saveDatabase();

    console.log('数据库初始化完成，路径:', dbPath);
}

// 保存数据库到文件
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// 封装数据库操作，使其兼容 better-sqlite3 的 API 风格
class DatabaseWrapper {
    constructor(database) {
        this.db = database;
    }

    prepare(sql) {
        const db = this.db;
        return {
            run: (...params) => {
                db.run(sql, params);
                saveDatabase();
                return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] };
            },
            get: (...params) => {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                if (stmt.step()) {
                    const row = stmt.getAsObject();
                    stmt.free();
                    return row;
                }
                stmt.free();
                return undefined;
            },
            all: (...params) => {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            }
        };
    }

    exec(sql) {
        this.db.run(sql);
        saveDatabase();
    }
}

let dbWrapper = null;

// 同步初始化（在应用启动前完成）
async function init() {
    await initDatabase();
    dbWrapper = new DatabaseWrapper(db);
    return dbWrapper;
}

// 导出初始化函数和数据库访问接口
module.exports = {
    init,
    getDb: () => dbWrapper,
    saveDatabase
};
