#!/bin/bash

# 活码管理系统 - 部署脚本

set -e

echo "========================================="
echo "  活码管理系统 - 开始部署"
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

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用root用户或sudo运行此脚本"
        exit 1
    fi
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

# 检查Nginx
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx未安装，请先安装Nginx"
        exit 1
    fi

    print_info "Nginx检查通过：$(nginx -v 2>&1)"
}

# 创建目录
create_directories() {
    print_info "创建项目目录..."
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$DATA_DIR"
    print_info "目录创建完成"
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

# 配置环境变量
configure_env() {
    print_info "配置环境变量..."

    # 检查backend-api的.env文件
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        print_warning "未找到.env文件，请手动配置："
        print_warning "cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env"
        print_warning "然后编辑.env文件，填入正确的配置信息"
        exit 1
    fi

    # 检查route-service的.env文件
    if [ ! -f "$ROUTE_SERVICE_DIR/.env" ]; then
        print_warning "未找到.env文件，请手动配置："
        print_warning "cp $ROUTE_SERVICE_DIR/.env.example $ROUTE_SERVICE_DIR/.env"
        print_warning "然后编辑.env文件，填入正确的配置信息"
        exit 1
    fi

    print_info "环境变量配置检查通过"
}

# 配置Nginx
configure_nginx() {
    print_info "配置Nginx..."

    # 备份原配置
    if [ -f "/etc/nginx/sites-available/huoma" ]; then
        print_warning "备份原Nginx配置..."
        cp /etc/nginx/sites-available/huoma /etc/nginx/sites-available/huoma.bak
    fi

    # 复制配置文件
    cp "$NGINX_DIR/huoma.conf" /etc/nginx/sites-available/huoma

    # 创建软链接
    ln -sf /etc/nginx/sites-available/huoma /etc/nginx/sites-enabled/huoma

    # 测试Nginx配置
    nginx -t

    print_info "Nginx配置完成"
}

# 安装PM2
install_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_info "安装PM2..."
        npm install -g pm2
        print_info "PM2安装完成"
    else
        print_info "PM2已安装：$(pm2 -v)"
    fi
}

# 启动服务
start_services() {
    print_info "启动服务..."

    # 停止旧服务
    pm2 stop backend-api 2>/dev/null || true
    pm2 stop route-service 2>/dev/null || true

    # 启动后端API服务
    pm2 start "$BACKEND_DIR/src/app.js" --name backend-api

    # 启动路由页面服务
    pm2 start "$ROUTE_SERVICE_DIR/src/app.js" --name route-service

    # 保存PM2配置
    pm2 save

    print_info "服务启动完成"
}

# 重启Nginx
restart_nginx() {
    print_info "重启Nginx..."
    systemctl restart nginx
    print_info "Nginx重启完成"
}

# 设置开机自启
setup_autostart() {
    print_info "设置开机自启..."

    # PM2开机自启
    pm2 startup

    # Nginx开机自启
    systemctl enable nginx

    print_info "开机自启设置完成"
}

# 显示部署信息
show_info() {
    echo ""
    echo "========================================="
    echo "  部署完成！"
    echo "========================================="
    echo ""
    echo "服务地址："
    echo "  - 后台管理系统: http://admin.example.com"
    echo "  - 后台API: http://admin.example.com/api"
    echo "  - 路由页面: http://example.com/{6位活码}"
    echo ""
    echo "常用命令："
    echo "  - 查看服务状态: pm2 status"
    echo "  - 查看日志: pm2 logs"
    echo "  - 重启服务: pm2 restart all"
    echo "  - 停止服务: pm2 stop all"
    echo "  - 重启Nginx: systemctl restart nginx"
    echo ""
    echo "注意事项："
    echo "  1. 请确保已配置.env文件中的华为云CDN AK/SK"
    echo "  2. 请确保已配置Nginx中的域名"
    echo "  3. 建议配置HTTPS证书"
    echo "  4. 建议在华为云CDN中配置域名和源站"
    echo ""
}

# 主函数
main() {
    check_root
    check_node
    check_nginx
    create_directories
    install_backend
    install_route_service
    build_frontend
    configure_env
    configure_nginx
    install_pm2
    start_services
    restart_nginx
    setup_autostart
    show_info
}

# 执行主函数
main
