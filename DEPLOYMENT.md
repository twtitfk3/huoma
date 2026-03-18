# 活码管理系统 - 部署文档

本文档详细介绍活码管理系统的部署流程和配置说明。

## 目录

- [环境准备](#环境准备)
- [安装依赖](#安装依赖)
- [配置环境变量](#配置环境变量)
- [部署后端服务](#部署后端服务)
- [部署前端服务](#部署前端服务)
- [配置Nginx](#配置nginx)
- [启动服务](#启动服务)
- [验证部署](#验证部署)
- [常见问题](#常见问题)

## 环境准备

### 系统要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+ 或 CentOS 7+)
- **Node.js**: 18.0 或更高版本
- **Nginx**: 1.18 或更高版本
- **内存**: 至少 2GB
- **磁盘**: 至少 10GB 可用空间

### 检查环境

```bash
# 检查Node.js版本
node -v

# 检查Nginx版本
nginx -v

# 检查系统版本
cat /etc/os-release
```

## 安装依赖

### 安装Node.js 18+

**Ubuntu/Debian:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL:**

```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 安装Nginx

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

**CentOS/RHEL:**

```bash
sudo yum install -y nginx
```

### 安装PM2

```bash
sudo npm install -g pm2
```

## 配置环境变量

### 1. 配置后端API服务

```bash
cd /opt/huoma/backend-api
cp .env.example .env
nano .env
```

编辑 `.env` 文件：

```bash
# 数据库配置 —— 必须使用绝对路径
DATABASE_PATH=/opt/huoma/backend-api/data/huoma.db

# 服务配置
PORT=3001

# 域名配置（用于前端复制链接时拼接）
DOMAIN=https://example.com
```

### 2. 配置路由页面服务

```bash
cd /opt/huoma/route-service
cp .env.example .env
nano .env
```

编辑 `.env` 文件：

```bash
# 数据库配置（与backend-api共享，必须使用绝对路径）
DATABASE_PATH=/opt/huoma/backend-api/data/huoma.db

# 服务配置
PORT=3000
```

## 部署后端服务

### 1. 上传代码到服务器

```bash
# 创建项目目录
sudo mkdir -p /opt/huoma
sudo chown -R $USER:$USER /opt/huoma

# 上传代码（使用scp或rsync）
# scp -r huoma/ user@server:/opt/
```

### 2. 安装后端API服务依赖

```bash
cd /opt/huoma/backend-api
npm install --production
```

### 3. 安装路由页面服务依赖

```bash
cd /opt/huoma/route-service
npm install --production
```

## 部署前端服务

### 1. 安装依赖

```bash
cd /opt/huoma/admin-frontend
npm install
```

### 2. 构建前端项目

```bash
npm run build
```

构建完成后，静态文件会生成在 `dist/` 目录中。

## 配置Nginx

### 1. 复制Nginx配置文件

```bash
sudo cp /opt/huoma/nginx/huoma.conf /etc/nginx/sites-available/huoma
```

### 2. 编辑配置文件

```bash
sudo nano /etc/nginx/sites-available/huoma
```

修改以下配置：

```nginx
# 后台管理系统域名
server_name admin.example.com;  # 替换为你的域名

# 路由页面服务域名
server_name example.com;  # 替换为你的域名

# 路径配置
location / {
    alias /opt/huoma/admin-frontend/dist;  # 确认路径正确
}

location ~ ^/([A-Za-z0-9]{6})$ {
    proxy_pass http://localhost:3000/$1;  # 确保端口正确
}
```

### 3. 启用配置

```bash
sudo ln -sf /etc/nginx/sites-available/huoma /etc/nginx/sites-enabled/huoma
```

### 4. 测试Nginx配置

```bash
sudo nginx -t
```

如果显示 "syntax is okay" 和 "test is successful"，则配置正确。

### 5. 重启Nginx

```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 启动服务

### 1. 启动后端API服务

```bash
cd /opt/huoma/backend-api
pm2 start src/app.js --name backend-api
```

### 2. 启动路由页面服务

```bash
cd /opt/huoma/route-service
pm2 start src/app.js --name route-service
```

### 3. 保存PM2配置

```bash
pm2 save
pm2 startup
```

### 4. 检查服务状态

```bash
pm2 status
```

应该看到两个服务都处于 `online` 状态。

### 5. 查看日志

```bash
# 查看所有服务日志
pm2 logs

# 查看后端API服务日志
pm2 logs backend-api

# 查看路由页面服务日志
pm2 logs route-service
```

## 验证部署

### 1. 访问后台管理系统

打开浏览器，访问: http://admin.example.com

应该能看到后台管理系统的登录页面。

### 2. 创建测试活动

1. 点击"新建活动"
2. 填写测试数据：
   - 活动名称：测试活动
   - 主链接：https://www.baidu.com
   - 预备链接1：https://www.google.com（可选）
3. 点击"保存"

### 3. 测试活码

复制生成的活码（如：AbC123），访问: http://example.com/AbC123

应该能正常跳转到主链接。

### 4. 测试手动切换

1. 在活动列表中，点击"切换链接"
2. 选择一个预备链接
3. 输入操作人，点击确认
4. 验证立即生效（观众访问自动跳转到新主链接）

## 常见问题

### 1. PM2服务无法启动

**问题**：`pm2 start` 命令失败

**解决**：
```bash
# 检查Node.js版本
node -v

# 检查端口占用
sudo netstat -tlnp | grep 3000
sudo netstat -tlnp | grep 3001

# 如果端口被占用，修改.env文件中的PORT配置
```

### 2. Nginx配置错误

**问题**：`nginx -t` 失败

**解决**：
```bash
# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查配置文件语法
sudo nano /etc/nginx/sites-available/huoma
```

### 3. 数据库文件权限问题

**问题**：无法写入数据库

**解决**：
```bash
# 修改数据库文件权限
sudo chown -R $USER:$USER /opt/huoma
sudo chmod 755 /opt/huoma
```

### 4. 前端构建失败

**问题**：`npm run build` 失败

**解决**：
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules
npm install

# 再次构建
npm run build
```

### 5. 无法访问后台管理系统

**问题**：访问 `http://admin.example.com` 失败

**解决**：
1. 检查Nginx是否启动：`sudo systemctl status nginx`
2. 检查域名DNS解析是否正确
3. 检查防火墙规则
4. 检查Nginx配置：`sudo nginx -t`

### 6. 切换链接后不生效

**问题**：切换主链接后，观众访问的还是旧链接

**解决**：
1. 检查 route-service 是否正常运行：`pm2 status`
2. 检查数据库路径是否正确
3. 查看 route-service 日志：`pm2 logs route-service`

## 维护和监控

### 日志轮转

配置PM2日志轮转：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 备份数据库

定期备份数据库：

```bash
# 创建备份脚本
cat > /opt/huoma/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/huoma/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /opt/huoma/backend-api/data/huoma.db $BACKUP_DIR/huoma_$DATE.db
find $BACKUP_DIR -name "huoma_*.db" -mtime +7 -delete
EOF

chmod +x /opt/huoma/scripts/backup.sh

# 设置定时任务（每天凌晨2点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/huoma/scripts/backup.sh") | crontab -
```

### 监控服务

使用PM2监控：

```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show backend-api
pm2 show route-service
```

## 安全建议

1. **使用HTTPS**：在Nginx中配置SSL证书
2. **定期更新**：定期更新Node.js、Nginx和依赖包
3. **限制访问**：使用防火墙限制不必要的端口访问
4. **备份数据**：定期备份数据库和配置文件
5. **监控日志**：定期检查服务日志，及时发现异常
