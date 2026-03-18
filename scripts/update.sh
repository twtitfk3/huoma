#!/bin/bash
# ============================================================
# 活码管理系统 - 更新部署脚本（v2：支持3个预备链接 + 手动切换）
# 用途：将本地改好的文件上传后，在服务器上执行此脚本完成更新
# ============================================================

set -e

APP_DIR="/opt/huoma"
DB_PATH="/opt/huoma/backend-api/data/huoma.db"

echo "========================================"
echo "  活码管理系统 - 更新部署"
echo "========================================"

# 1. 确保数据目录存在
echo "[1/5] 检查数据目录..."
mkdir -p "$APP_DIR/backend-api/data"
echo "    数据目录: $APP_DIR/backend-api/data"

# 2. 检查 .env 文件
echo "[2/5] 检查环境变量配置..."
if [ ! -f "$APP_DIR/backend-api/.env" ]; then
    echo "    未找到 .env，从模板创建..."
    cp "$APP_DIR/backend-api/.env.example" "$APP_DIR/backend-api/.env"
    # 自动写入绝对数据库路径
    sed -i "s|DATABASE_PATH=.*|DATABASE_PATH=$DB_PATH|g" "$APP_DIR/backend-api/.env"
    echo "    ⚠ 请编辑 $APP_DIR/backend-api/.env 填写实际配置"
else
    # 确保数据库路径是绝对路径
    current_path=$(grep "DATABASE_PATH" "$APP_DIR/backend-api/.env" | cut -d= -f2)
    if [[ "$current_path" != /* ]]; then
        echo "    ⚠ 检测到相对路径，自动修正为绝对路径..."
        sed -i "s|DATABASE_PATH=.*|DATABASE_PATH=$DB_PATH|g" "$APP_DIR/backend-api/.env"
    fi
    echo "    .env 已存在，DATABASE_PATH: $(grep DATABASE_PATH $APP_DIR/backend-api/.env)"
fi

if [ ! -f "$APP_DIR/route-service/.env" ]; then
    cp "$APP_DIR/route-service/.env.example" "$APP_DIR/route-service/.env"
    sed -i "s|DATABASE_PATH=.*|DATABASE_PATH=$DB_PATH|g" "$APP_DIR/route-service/.env"
fi

# 3. 安装依赖
echo "[3/5] 安装/更新依赖..."
cd "$APP_DIR/backend-api" && npm install --production
cd "$APP_DIR/route-service" && npm install --production
echo "    依赖安装完成"

# 4. 拷贝前端构建产物
echo "[4/5] 更新前端静态文件..."
# 注意：前端 dist 目录应已随代码一起上传
if [ -d "$APP_DIR/admin-frontend/dist" ]; then
    echo "    前端 dist 目录已就绪"
else
    echo "    ⚠ 未找到 dist 目录，请先在本地执行 npm run build 后重新上传"
fi

# 5. 重启服务
echo "[5/5] 重启服务..."
pm2 restart backend-api route-service 2>/dev/null || {
    echo "    PM2 重启失败，尝试启动新进程..."
    cd "$APP_DIR/backend-api" && pm2 start src/app.js --name backend-api --cwd "$APP_DIR/backend-api"
    cd "$APP_DIR/route-service" && pm2 start src/app.js --name route-service --cwd "$APP_DIR/route-service"
}
pm2 save

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "  后台管理：http://你的域名/admin/"
echo "  活码访问：http://你的域名/XXXXXX"
echo ""
echo "  查看日志：pm2 logs backend-api"
echo "            pm2 logs route-service"
echo "========================================"
