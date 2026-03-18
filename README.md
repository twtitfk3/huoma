# 活码管理系统

一个用于管理活动照片直播链接主/备切换的系统，确保活动顺利进行。

## 功能特性

- ✅ 创建活动，生成6位活码
- ✅ 配置1个主链接 + 最多3个预备链接（可选）
- ✅ 手动切换：选择任意一个预备链接设为主链接，立即生效
- ✅ 查看切换日志，追溯操作历史
- ✅ 完整的使用说明和常见问题

## 技术栈

### 后端
- **Node.js 18+**
- **Express** - Web框架
- **SQLite** - 数据库

### 前端
- **Vue 3** - 前端框架
- **Element Plus** - UI组件库
- **Vite** - 构建工具

### 基础设施
- **Nginx** - 反向代理
- **PM2** - 进程管理

## 项目结构

```
huoma/
├── backend-api/              # 后台API服务
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── utils/            # 工具函数
│   │   └── app.js            # 主应用
│   ├── .env.example          # 环境变量模板
│   └── package.json
│
├── route-service/            # 路由页面服务
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── views/            # 页面模板
│   │   └── app.js            # 主应用
│   ├── .env.example          # 环境变量模板
│   └── package.json
│
├── admin-frontend/           # 后台管理系统
│   ├── src/
│   │   ├── api/              # API请求
│   │   ├── router/           # 路由
│   │   ├── views/            # 页面组件
│   │   ├── App.vue           # 主应用
│   │   └── main.js           # 入口文件
│   ├── index.html            # HTML入口
│   ├── vite.config.js        # Vite配置
│   └── package.json
│
├── nginx/                    # Nginx配置
│   └── huoma.conf            # 配置文件
│
├── scripts/                  # 部署脚本
│   └── update.sh            # 更新脚本
│
├── README.md                 # 项目说明
└── .gitignore               # Git忽略文件
```

## 快速开始

### 环境要求

- Node.js 18+
- Nginx
- PM2（用于生产环境）

### 1. 安装依赖

```bash
# 安装后端API服务依赖
cd backend-api
npm install

# 安装路由页面服务依赖
cd ../route-service
npm install

# 安装后台管理系统依赖
cd ../admin-frontend
npm install
```

### 2. 配置环境变量

```bash
# 配置后端API服务
cd backend-api
cp .env.example .env
# 编辑.env文件，填入正确的配置信息

# 配置路由页面服务
cd ../route-service
cp .env.example .env
# 编辑.env文件，填入正确的配置信息
```

### 3. 启动开发服务

```bash
# 启动后端API服务（端口3001）
cd backend-api
npm run dev

# 启动路由页面服务（端口3000）
cd route-service
npm run dev

# 启动后台管理系统（端口5173）
cd admin-frontend
npm run dev
```

### 4. 访问系统

- 后台管理系统: http://localhost:5173
- 后台API: http://localhost:3001/api
- 路由页面: http://localhost:3000/{6位活码}

## 生产部署

### 使用部署脚本（推荐）

```bash
# 上传代码到服务器后，执行更新脚本
chmod +x scripts/update.sh
sudo ./scripts/update.sh
```

### 手动部署

详细部署步骤请参考 [部署文档](DEPLOYMENT.md)。

## 配置说明

### 后端API服务环境变量

```bash
# 数据库配置 —— 必须使用绝对路径
DATABASE_PATH=/opt/huoma/backend-api/data/huoma.db

# 服务配置
PORT=3001

# 域名配置（用于前端复制链接时拼接）
DOMAIN=https://example.com
```

### 路由页面服务环境变量

```bash
# 数据库配置（与backend-api共享，必须使用绝对路径）
DATABASE_PATH=/opt/huoma/backend-api/data/huoma.db

# 服务配置
PORT=3000
```

### Nginx配置

编辑 `nginx/huoma.conf` 文件，修改域名和路径配置。

## 使用说明

### 1. 创建活动

1. 登录后台管理系统
2. 点击"新建活动"
3. 填写活动名称、主链接、预备链接（可选，最多3个）
4. 点击"保存"，系统自动生成6位活码

### 2. 使用活码

1. 复制生成的活码（如：AbC123）
2. 拼接到域名：https://example.com/AbC123
3. 将链接分享给观众

### 3. 切换主链接

1. 在活动列表找到对应活动
2. 点击"切换链接"按钮
3. 选择要设为主链接的预备链接
4. 输入操作人，点击确认
5. 立即生效，观众访问时跳转到新主链接

### 4. 查看切换日志

1. 点击顶部菜单"切换日志"
2. 可以按活动、操作人、时间范围筛选
3. 查看详细的切换记录

## 安全建议

1. 🔒 不要将 `.env` 文件提交到Git仓库
2. 🔒 使用HTTPS协议访问系统
3. 🔒 定期更新依赖包
4. 🔒 配置防火墙规则

## 维护和监控

### 查看服务状态

```bash
pm2 status
```

### 查看日志

```bash
pm2 logs backend-api
pm2 logs route-service
```

### 重启服务

```bash
pm2 restart all
```

### 停止服务

```bash
pm2 stop all
```

### 重启Nginx

```bash
systemctl restart nginx
```

## 许可证

MIT License
