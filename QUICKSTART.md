# 活码管理系统 - 快速开始指南

本文档帮助您快速上手活码管理系统。

## 前置准备

在开始之前，请确保您已经：

1. 准备好一台Linux服务器（Ubuntu 20.04+ 或 CentOS 7+）
2. 有一个域名（用于后台管理和活码访问）
3. 了解基本的Linux命令行操作

## 快速部署（5分钟）

### 第1步：上传代码到服务器

```bash
# 在本地打包代码
tar -czf huoma.tar.gz huoma/

# 上传到服务器
scp huoma.tar.gz user@your-server:/tmp/

# SSH登录服务器
ssh user@your-server

# 解压代码
cd /opt
sudo tar -xzf /tmp/huoma.tar.gz
sudo chown -R $USER:$USER /opt/huoma
```

### 第2步：配置环境变量

```bash
# 配置后端API服务
cd /opt/huoma/backend-api
cp .env.example .env
nano .env
```

**必须修改以下配置：**

```bash
# 数据库配置 —— 必须使用绝对路径
DATABASE_PATH=/opt/huoma/backend-api/data/huoma.db

# 域名配置（必填）
DOMAIN=https://your-domain.com
```

```bash
# 配置路由页面服务
cd /opt/huoma/route-service
cp .env.example .env
nano .env
```

**配置：**

```bash
# 数据库配置（与backend-api共享，必须使用绝对路径）
DATABASE_PATH=/opt/huoma/backend-api/data/huoma.db
```

### 第3步：运行部署脚本

```bash
cd /opt/huoma
chmod +x scripts/update.sh
sudo ./scripts/update.sh
```

部署脚本会自动完成以下操作：
- ✅ 检查数据目录
- ✅ 检查并修正环境变量配置
- ✅ 安装所有依赖
- ✅ 启动服务
- ✅ 设置开机自启

### 第4步：验证部署

```bash
# 查看服务状态
pm2 status
```

应该看到两个服务都处于 `online` 状态。

## 使用指南

### 创建第一个活动

1. 访问后台管理系统：http://admin.your-domain.com
2. 点击"新建活动"
3. 填写信息：
   - 活动名称：我的第一个活动
   - 主链接：https://www.example.com/main
   - 预备链接1：https://www.example.com/backup（可选）
4. 点击"保存"
5. 复制生成的6位活码（如：AbC123）

### 测试活码

1. 访问：http://your-domain.com/AbC123
2. 应该能正常跳转到主链接

### 手动切换主链接

1. 在活动列表找到对应活动
2. 点击"切换链接"按钮
3. 选择要设为主链接的预备链接
4. 输入操作人
5. 点击确认
6. 立即生效，观众访问自动跳转到新主链接

### 查看切换日志

1. 点击顶部菜单"切换日志"
2. 可以看到所有切换记录

## 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 重启Nginx
sudo systemctl restart nginx

# 测试Nginx配置
sudo nginx -t
```

## 常见问题

### 1. PM2服务无法启动

```bash
# 检查Node.js版本
node -v  # 应该是 v18+

# 检查端口占用
sudo netstat -tlnp | grep 3000
sudo netstat -tlnp | grep 3001

# 查看错误日志
pm2 logs backend-api
```

### 2. 无法访问后台管理系统

```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查域名DNS解析
nslookup admin.your-domain.com

# 检查防火墙
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS
```

### 3. 切换后不生效

```bash
# 检查route-service是否正常运行
pm2 status

# 查看route-service日志
pm2 logs route-service
```

## 更多文档

- [README.md](README.md) - 项目完整说明
- [DEPLOYMENT.md](DEPLOYMENT.md) - 详细部署文档
- [OVERVIEW.md](OVERVIEW.md) - 项目架构概述

## 获取帮助

- 查看后台管理系统的"使用说明"页面
- 查看后台管理系统的"常见问题"页面

---

**祝您使用愉快！**
