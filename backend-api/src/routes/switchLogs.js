const express = require('express');
const router = express.Router();
const SwitchLog = require('../models/switchLog');

/**
 * 获取切换日志列表
 */
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const filters = {};
        if (req.query.activity_id) filters.activity_id = parseInt(req.query.activity_id);
        if (req.query.operator) filters.operator = req.query.operator;
        if (req.query.start_date) filters.start_date = req.query.start_date;
        if (req.query.end_date) filters.end_date = req.query.end_date;

        const logs = SwitchLog.findAll(limit, offset, filters);
        const total = SwitchLog.count(filters);

        res.json({
            success: true,
            data: { logs, total, limit, offset }
        });
    } catch (error) {
        console.error('获取切换日志失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 获取单个日志详情
 */
router.get('/:id', async (req, res) => {
    try {
        const log = SwitchLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ success: false, message: '日志不存在' });
        }
        res.json({ success: true, data: log });
    } catch (error) {
        console.error('获取日志详情失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
