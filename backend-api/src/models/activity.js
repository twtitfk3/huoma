const { getDb } = require('../config/database');

class Activity {
    // 创建活动
    static create(data) {
        const db = getDb();
        const stmt = db.prepare(`
            INSERT INTO activities (code, name, main_link, backup_link_1, backup_link_2, backup_link_3, remark)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            data.code,
            data.name,
            data.main_link,
            data.backup_link_1 || null,
            data.backup_link_2 || null,
            data.backup_link_3 || null,
            data.remark || null
        );
        return { id: result.lastInsertRowid, ...data };
    }

    // 根据ID查询
    static findById(id) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM activities WHERE id = ?');
        return stmt.get(id);
    }

    // 根据code查询
    static findByCode(code) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM activities WHERE code = ?');
        return stmt.get(code);
    }

    // 查询所有活动
    static findAll(limit = 100, offset = 0) {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT * FROM activities
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `);
        return stmt.all(limit, offset);
    }

    // 统计总数
    static count() {
        const db = getDb();
        const stmt = db.prepare('SELECT COUNT(*) as count FROM activities');
        return stmt.get().count;
    }

    // 更新活动基本信息
    static update(id, data) {
        const db = getDb();
        const stmt = db.prepare(`
            UPDATE activities
            SET name = ?, main_link = ?, backup_link_1 = ?, backup_link_2 = ?, backup_link_3 = ?,
                remark = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(
            data.name,
            data.main_link,
            data.backup_link_1 || null,
            data.backup_link_2 || null,
            data.backup_link_3 || null,
            data.remark || null,
            data.status,
            id
        );
        return this.findById(id);
    }

    /**
     * 手动将某个预备链接设置为主链接
     * @param {number} id - 活动ID
     * @param {string} targetSlot - 要提升为主链接的槽位：'backup_link_1' | 'backup_link_2' | 'backup_link_3'
     * @returns {{ old: object, new: object }} 切换前后的链接状态
     */
    static setMainLink(id, targetSlot) {
        const db = getDb();
        const activity = this.findById(id);
        if (!activity) {
            throw new Error('活动不存在');
        }

        const validSlots = ['backup_link_1', 'backup_link_2', 'backup_link_3'];
        if (!validSlots.includes(targetSlot)) {
            throw new Error('无效的目标槽位，必须是 backup_link_1 / backup_link_2 / backup_link_3');
        }

        const newMainLink = activity[targetSlot];
        if (!newMainLink) {
            throw new Error(`${targetSlot} 未配置链接`);
        }

        // 记录切换前状态
        const oldState = {
            main_link: activity.main_link,
            backup_link_1: activity.backup_link_1,
            backup_link_2: activity.backup_link_2,
            backup_link_3: activity.backup_link_3
        };

        // 把当前主链接放到被腾出来的槽位，提升目标为主链接
        const stmt = db.prepare(`
            UPDATE activities
            SET main_link = ?,
                ${targetSlot} = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(newMainLink, activity.main_link, id);

        const updated = this.findById(id);
        return {
            old: oldState,
            new: {
                main_link: updated.main_link,
                backup_link_1: updated.backup_link_1,
                backup_link_2: updated.backup_link_2,
                backup_link_3: updated.backup_link_3
            }
        };
    }

    // 删除活动（不建议使用）
    static delete(id) {
        const db = getDb();
        const stmt = db.prepare('DELETE FROM activities WHERE id = ?');
        return stmt.run(id);
    }
}

module.exports = Activity;
