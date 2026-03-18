const express = require('express');
const router = express.Router();
const Config = require('../models/config');

// 获取配置
router.get('/', (req, res) => {
    try {
        const configs = Config.getAll();
        res.json({
            success: true,
            data: configs
        });
    } catch (error) {
        console.error('获取配置失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取单个配置
router.get('/:key', (req, res) => {
    try {
        const { key } = req.params;
        const value = Config.get(key);
        res.json({
            success: true,
            data: value
        });
    } catch (error) {
        console.error('获取配置失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 设置配置
router.put('/:key', (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        if (value === undefined) {
            return res.status(400).json({
                success: false,
                message: '缺少 value 参数'
            });
        }
        
        Config.set(key, value);
        res.json({
            success: true,
            message: '配置更新成功'
        });
    } catch (error) {
        console.error('设置配置失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

module.exports = router;
