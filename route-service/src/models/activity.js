const { queryByCode } = require('../config/database');

class Activity {
    /**
     * 根据活码查询活动（只查 active 状态，每次从磁盘读最新数据）
     */
    static findByCode(code) {
        return queryByCode(code);
    }
}

module.exports = Activity;
