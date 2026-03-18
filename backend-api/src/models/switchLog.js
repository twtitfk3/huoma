const { getDb } = require('../config/database');

class SwitchLog {
    // 创建切换日志
    static create(data) {
        const db = getDb();
        const stmt = db.prepare(`
            INSERT INTO switch_logs (
                activity_id, operator, old_main_link, new_main_link, switch_note
            ) VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            data.activity_id,
            data.operator,
            data.old_main_link,
            data.new_main_link,
            data.switch_note || null
        );
        return { id: result.lastInsertRowid, ...data };
    }

    // 根据ID查询
    static findById(id) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM switch_logs WHERE id = ?');
        return stmt.get(id);
    }

    // 查询所有日志
    static findAll(limit = 100, offset = 0, filters = {}) {
        const db = getDb();
        let query = `
            SELECT sl.*, a.name as activity_name, a.code
            FROM switch_logs sl
            LEFT JOIN activities a ON sl.activity_id = a.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.activity_id) {
            query += ' AND sl.activity_id = ?';
            params.push(filters.activity_id);
        }

        if (filters.operator) {
            query += ' AND sl.operator LIKE ?';
            params.push(`%${filters.operator}%`);
        }

        if (filters.start_date) {
            query += ' AND DATE(sl.created_at) >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND DATE(sl.created_at) <= ?';
            params.push(filters.end_date);
        }

        query += ' ORDER BY sl.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    // 统计总数
    static count(filters = {}) {
        const db = getDb();
        let query = 'SELECT COUNT(*) as count FROM switch_logs WHERE 1=1';
        const params = [];

        if (filters.activity_id) {
            query += ' AND activity_id = ?';
            params.push(filters.activity_id);
        }

        if (filters.operator) {
            query += ' AND operator LIKE ?';
            params.push(`%${filters.operator}%`);
        }

        const stmt = db.prepare(query);
        return stmt.get(...params).count;
    }
}

module.exports = SwitchLog;
