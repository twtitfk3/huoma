#!/bin/bash

# 活码管理系统 - 用户权限部署脚本
# 此脚本不需要root权限，但需要手动配置Nginx

set -e

echo "========================================="
echo "  活码管理系统 - 开始部署（用户权限）"
echo "========================================="

# 配置变量
PROJECT_DIR="/opt/huoma"
BACKEND_DIR="$PROJECT_DIR/backend-api"
ROUTE_SERVICE_DIR="$PROJECT_DIR/route-service"
ADMIN_FRONTEND_DIR="$PROJECT_DIR/admin-frontend"
NGINX_DIR="$PROJECT_DIR/nginx"
DATA_DIR="$PROJECT_DIR/data"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js未安装，请先安装Node.js 18+"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js版本过低，需要18+，当前版本：$(node -v)"
        exit 1
    fi

    print_info "Node.js版本检查通过：$(node -v)"
}

# 检查PM2
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_info "PM2未安装，正在安装..."
        npm install -g pm2
        print_info "PM2安装完成"
    else
        print_info "PM2已安装：$(pm2 -v)"
    fi
}

# 检查环境变量
check_env() {
    print_info "检查环境变量..."

    # 检查backend-api的.env文件
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        print_error "未找到 $BACKEND_DIR/.env 文件"
        print_info "请执行：cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env"
        print_info "然后编辑 .env 文件，填入正确的配置信息"
        exit 1
    fi

    # 检查route-service的.env文件
    if [ ! -f "$ROUTE_SERVICE_DIR/.env" ]; then
        print_error "未找到 $ROUTE_SERVICE_DIR/.env 文件"
        print_info "请执行：cp $ROUTE_SERVICE_DIR/.env.example $ROUTE_SERVICE_DIR/.env"
        print_info "然后编辑 .env 文件，填入正确的配置信息"
        exit 1
    fi

    print_info "环境变量配置检查通过"
}

# 安装后端依赖
install_backend() {
    print_info "安装后端API服务依赖..."
    cd "$BACKEND_DIR"
    npm install --production
    print_info "后端API服务依赖安装完成"
}

# 安装路由服务依赖
install_route_service() {
    print_info "安装路由页面服务依赖..."
    cd "$ROUTE_SERVICE_DIR"
    npm install --production
    print_info "路由页面服务依赖安装完成"
}

# 构建前端
build_frontend() {
    print_info "构建后台管理系统前端..."
    cd "$ADMIN_FRONTEND_DIR"
    npm install
    npm run build
    print_info "后台管理系统前端构建完成"
}

# 启动服务
start_services() {
    print_info "启动服务..."

    # 停止旧服务
    pm2 stop backend-api 2>/dev/null || true
    pm2 stop route-service 2>/dev/null || true

    # 删除旧服务
    pm2 delete backend-api 2>/dev/null || true
    pm2 delete route-service 2>/dev/null || true

    # 启动后端API服务
    pm2 start "$BACKEND_DIR/src/app.js" --name backend-api

    # 启动路由页面服务
    pm2 start "$ROUTE_SERVICE_DIR/src/app.js" --name route-service

    # 保存PM2配置
    pm2 save

    print_info "服务启动完成"
}

# 设置PM2开机自启
setup_pm2_startup() {
    print_info "设置PM2开机自启..."

    # 生成启动命令
    pm2 startup

    print_info "PM2开机自启设置完成"
    print_warning "请执行PM2输出的命令以完成开机自启配置"
}

# 显示部署信息
show_info() {
    echo ""
    echo "========================================="
    echo "  用户权限部署完成！"
    echo "========================================="
    echo ""
    echo "服务地址："
    echo "  - 后台API: http://localhost:3001/api"
    echo "  - 路由页面: http://localhost:3000/{6位活码}"
    echo ""
    echo "常用命令："
    echo "  - 查看服务状态: pm2 status"
    echo "  - 查看日志: pm2 logs"
    echo "  - 重启服务: pm2 restart all"
    echo "  - 停止服务: pm2 stop all"
    echo ""
    echo "⚠️  还需要手动配置："
    echo "  1. Nginx配置（需要root权限）"
    echo "  2. 华为云CDN配置"
    echo ""
    echo "Nginx配置步骤："
    echo "  1. sudo cp $NGINX_DIR/huoma.conf /etc/nginx/sites-available/huoma"
    echo "  2. sudo nano /etc/nginx/sites-available/huoma"
    echo "  3. 修改server_name为你的域名"
    echo "  4. sudo ln -sf /etc/nginx/sites-available/huoma /etc/nginx/sites-enabled/huoma"
    echo "  5. sudo nginx -t"
    echo "  6. sudo systemctl restart nginx"
    echo ""
    echo "注意事项："
    echo "  1. 请确保已配置.env文件中的华为云CDN AK/SK"
    echo "  2. 请确保已配置.env文件中的域名"
    echo "  3. 建议配置HTTPS证书"
    echo ""
}

# 主函数
main() {
    check_node
    check_pm2
    check_env
    install_backend
    install_route_service
    build_frontend
    start_services
    setup_pm2_startup
    show_info
}

# 执行主函数
main
