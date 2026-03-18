const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const SwitchLog = require('../models/switchLog');
const { generateCode, isValidUrl } = require('../utils/helpers');

/**
 * 获取所有活动列表
 */
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const activities = Activity.findAll(limit, offset);
        const total = Activity.count();

        res.json({
            success: true,
            data: {
                activities,
                total,
                limit,
                offset
            }
        });
    } catch (error) {
        console.error('获取活动列表失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 获取单个活动详情
 */
router.get('/:id', async (req, res) => {
    try {
        const activity = Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ success: false, message: '活动不存在' });
        }
        res.json({ success: true, data: activity });
    } catch (error) {
        console.error('获取活动详情失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 创建新活动
 */
router.post('/', async (req, res) => {
    try {
        const { name, main_link, backup_link_1, backup_link_2, backup_link_3, remark } = req.body;

        // 验证必填字段
        if (!name || !main_link) {
            return res.status(400).json({
                success: false,
                message: '活动名称和主链接为必填项'
            });
        }

        // 验证URL格式（必填字段）
        if (!isValidUrl(main_link)) {
            return res.status(400).json({ success: false, message: '主链接格式不正确' });
        }

        // 验证可选预备链接格式
        if (backup_link_1 && !isValidUrl(backup_link_1)) {
            return res.status(400).json({ success: false, message: '预备链接1格式不正确' });
        }
        if (backup_link_2 && !isValidUrl(backup_link_2)) {
            return res.status(400).json({ success: false, message: '预备链接2格式不正确' });
        }
        if (backup_link_3 && !isValidUrl(backup_link_3)) {
            return res.status(400).json({ success: false, message: '预备链接3格式不正确' });
        }

        // 生成唯一的6位随机码
        let code;
        let attempts = 0;
        do {
            code = generateCode();
            attempts++;
            if (attempts > 10) {
                return res.status(500).json({ success: false, message: '生成活码失败，请重试' });
            }
        } while (Activity.findByCode(code));

        // 创建活动
        const activity = Activity.create({
            code,
            name,
            main_link,
            backup_link_1: backup_link_1 || null,
            backup_link_2: backup_link_2 || null,
            backup_link_3: backup_link_3 || null,
            remark
        });

        res.json({ success: true, data: activity, message: '活动创建成功' });
    } catch (error) {
        console.error('创建活动失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 更新活动
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, main_link, backup_link_1, backup_link_2, backup_link_3, remark, status } = req.body;

        if (main_link && !isValidUrl(main_link)) {
            return res.status(400).json({ success: false, message: '主链接格式不正确' });
        }
        if (backup_link_1 && !isValidUrl(backup_link_1)) {
            return res.status(400).json({ success: false, message: '预备链接1格式不正确' });
        }
        if (backup_link_2 && !isValidUrl(backup_link_2)) {
            return res.status(400).json({ success: false, message: '预备链接2格式不正确' });
        }
        if (backup_link_3 && !isValidUrl(backup_link_3)) {
            return res.status(400).json({ success: false, message: '预备链接3格式不正确' });
        }

        const activity = Activity.update(req.params.id, {
            name,
            main_link,
            backup_link_1: backup_link_1 || null,
            backup_link_2: backup_link_2 || null,
            backup_link_3: backup_link_3 || null,
            remark,
            status
        });

        if (!activity) {
            return res.status(404).json({ success: false, message: '活动不存在' });
        }

        res.json({ success: true, data: activity, message: '活动更新成功' });
    } catch (error) {
        console.error('更新活动失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 手动切换主链接
 * body: { operator: string, target_slot: 'backup_link_1' | 'backup_link_2' | 'backup_link_3' }
 */
router.post('/:id/switch', async (req, res) => {
    try {
        const { operator, target_slot } = req.body;

        if (!operator || !operator.trim()) {
            return res.status(400).json({ success: false, message: '操作人为必填项' });
        }

        if (!target_slot) {
            return res.status(400).json({ success: false, message: '请指定要切换的目标链接槽位' });
        }

        // 执行切换
        const switchResult = Activity.setMainLink(req.params.id, target_slot);
        const activity = Activity.findById(req.params.id);

        // 记录切换日志
        SwitchLog.create({
            activity_id: req.params.id,
            operator: operator.trim(),
            old_main_link: switchResult.old.main_link,
            new_main_link: switchResult.new.main_link,
            switch_note: `手动切换：${target_slot} → main_link`
        });

        res.json({
            success: true,
            data: { activity },
            message: '切换成功，链接已立即生效'
        });
    } catch (error) {
        console.error('切换主链接失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
