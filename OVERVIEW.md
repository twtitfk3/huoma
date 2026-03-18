# 活码管理系统 - 项目概述

## 项目简介

活码管理系统是一个完整的解决方案，用于管理活动照片直播链接的主/备切换，确保活动顺利进行。系统支持手动切换、日志记录等功能，并提供完整的后台管理界面和帮助文档。

## 核心功能

### 1. 活动管理
- ✅ 创建活动，生成唯一的6位随机活码
- ✅ 配置1个主链接 + 最多3个预备链接（均为可选）
- ✅ 编辑和更新活动信息
- ✅ 活动状态管理（启用/停用）
- ✅ 复制活码链接，方便分享

### 2. 链接切换
- ✅ 手动切换：选择任意一个预备链接设为主链接
- ✅ 立即生效，无需等待
- ✅ 操作记录和日志追溯

### 3. 路由页面服务
- ✅ 接收6位活码访问
- ✅ 立即跳转到当前主链接
- ✅ 优雅的错误提示页面

### 4. 日志管理
- ✅ 记录所有切换操作
- ✅ 按活动、操作人、时间范围筛选
- ✅ 查看详细的切换历史

### 5. 帮助中心
- ✅ 完整的使用说明文档
- ✅ 常见问题解答
- ✅ 问题搜索功能

## 技术架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户访问                              │
├─────────────────────────────────────────────────────────────┤
│                    Nginx反向代理                              │
├─────────────────────────────────────────────────────────────┤
│  /admin/*         → 后台管理系统（静态文件）                 │
│  /api/*           → 后台API服务（端口3001）                   │
│  /{6位ID}         → 路由页面服务（端口3000）                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   应用服务器                                  │
├─────────────────────────────────────────────────────────────┤
│  backend-api/        后台API服务                            │
│    - 活动管理API                                              │
│    - 切换链接API                                              │
│    - 日志查询API                                              │
│                                                              │
│  route-service/      路由页面服务                            │
│    - 6位活码路由                                              │
│    - 跳转处理                                                  │
│                                                              │
│  admin-frontend/     后台管理系统（Vue3）                    │
│    - 活动管理界面                                            │
│    - 切换日志查看                                            │
│    - 帮助中心文档                                            │
│                                                              │
│  数据库             SQLite（共享）                          │
│    - activities表     活动配置（含3个预备链接）               │
│    - switch_logs表    切换日志                              │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

#### 后端
- **Node.js 18+** - 运行环境
- **Express** - Web框架
- **SQLite** - 轻量级数据库
- **sql.js** - SQLite JavaScript实现

#### 前端
- **Vue 3** - 前端框架
- **Element Plus** - UI组件库
- **Vite** - 构建工具
- **Vue Router** - 路由管理

#### 基础设施
- **Nginx** - 反向代理和静态文件服务
- **PM2** - Node.js进程管理

## 数据库设计

### activities 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| code | VARCHAR(6) | 6位随机活码，唯一 |
| name | VARCHAR(100) | 活动名称 |
| main_link | VARCHAR(500) | 当前生效的主链接 |
| backup_link_1 | VARCHAR(500) | 预备链接1（可选） |
| backup_link_2 | VARCHAR(500) | 预备链接2（可选） |
| backup_link_3 | VARCHAR(500) | 预备链接3（可选） |
| remark | TEXT | 备注说明 |
| status | VARCHAR(20) | 状态（active/inactive） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### switch_logs 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| activity_id | INTEGER | 活动ID，外键 |
| operator | VARCHAR(50) | 操作人 |
| old_main_link | VARCHAR(500) | 切换前主链接 |
| new_main_link | VARCHAR(500) | 切换后主链接 |
| switch_note | TEXT | 切换备注 |
| created_at | DATETIME | 创建时间 |

## API接口

### 活动管理
- `GET /api/activities` - 获取活动列表
- `GET /api/activities/:id` - 获取活动详情
- `POST /api/activities` - 创建活动
- `PUT /api/activities/:id` - 更新活动
- `POST /api/activities/:id/switch` - 手动切换主链接

### 切换日志
- `GET /api/switch-logs` - 获取日志列表
- `GET /api/switch-logs/:id` - 获取日志详情

### 健康检查
- `GET /api/health` - API服务健康检查

## 部署流程

### 快速部署

```bash
# 1. 上传代码到服务器
scp -r huoma/ user@server:/opt/

# 2. 配置环境变量
cd /opt/huoma/backend-api
cp .env.example .env
nano .env  # 填写数据库路径和域名

# 3. 运行部署脚本
cd /opt/huoma
chmod +x scripts/update.sh
sudo ./scripts/update.sh
```

### 手动部署

详见 [DEPLOYMENT.md](DEPLOYMENT.md) 文档。

## 使用场景

### 场景1：活动直播
1. 创建活动，配置主链接（主要直播平台）和预备链接（备用直播平台）
2. 生成6位活码，分享给观众
3. 观众访问活码，自动跳转到主链接
4. 如需切换，手动选择预备链接设为主链接

### 场景2：应急切换
1. 主链接出现故障
2. 运维人员登录后台，点击"切换链接"
3. 选择预备链接，点击确认
4. 新观众访问活码，自动跳转到新主链接（立即生效）

### 场景3：多平台支持
1. 配置主链接为平台A，预留多个备用链接
2. 根据需要，随时切换到任意一个预备链接
3. 无需通知观众，透明切换

## 安全设计

### 1. 密钥管理
- `.env` 文件不提交到Git仓库
- 文件权限设置为600

### 2. 访问控制
- 后台管理系统建议仅限内部访问
- 建议配置防火墙规则
- 建议使用HTTPS

### 3. 日志审计
- 记录所有切换操作
- 包含操作人、时间、切换内容
- 便于追溯和审计

## 性能优化

### 1. 数据库优化
- 使用SQLite轻量级数据库
- 共享数据库，减少连接数
- 合理的索引设计

### 2. 缓存策略
- 前端静态资源长期缓存
- API响应合理缓存

## 监控和维护

### 服务监控
- PM2进程管理
- 自动重启机制
- 日志轮转

### 健康检查
- API健康检查接口

### 备份策略
- 定期备份数据库
- 备份配置文件

## 扩展性

### 1. 横向扩展
- 路由服务可部署多实例
- 通过Nginx负载均衡
- 数据库可升级为MySQL/PostgreSQL

### 2. 功能扩展
- 支持更多预备链接
- 支持访问统计分析
- 支持权限管理

## 项目文件结构

```
huoma/
├── backend-api/              # 后台API服务
│   ├── src/
│   │   ├── config/database.js
│   │   ├── models/
│   │   │   ├── activity.js
│   │   │   └── switchLog.js
│   │   ├── routes/
│   │   │   ├── activities.js
│   │   │   └── switchLogs.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── route-service/            # 路由页面服务
│   ├── src/
│   │   ├── config/database.js
│   │   ├── models/
│   │   │   └── activity.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── admin-frontend/           # 后台管理系统
│   ├── src/
│   │   ├── api/index.js
│   │   ├── router/index.js
│   │   ├── views/
│   │   │   ├── ActivityList.vue
│   │   │   ├── ActivityEdit.vue
│   │   │   ├── SwitchLog.vue
│   │   │   ├── HelpGuide.vue
│   │   │   └── HelpFAQ.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── nginx/                    # Nginx配置
│   └── huoma.conf
│
├── scripts/                  # 部署脚本
│   └── update.sh
│
├── README.md                 # 项目说明
├── DEPLOYMENT.md             # 部署文档
├── OVERVIEW.md               # 项目概述
└── .gitignore               # Git忽略文件
```

## 总结

活码管理系统是一个功能完整、设计合理、易于部署的解决方案。系统采用前后端分离架构，支持手动立即切换，具有良好的用户体验和可维护性。

### 核心优势
1. ✅ 功能完整：覆盖活动管理、链接切换、日志记录等全部需求
2. ✅ 技术先进：使用Vue3、Node.js等现代技术栈
3. ✅ 性能优异：直接跳转，无CDN缓存延迟
4. ✅ 易于部署：提供自动化部署脚本，快速上线
5. ✅ 文档完善：README、部署文档、帮助中心一应俱全
6. ✅ 安全可靠：访问控制、日志审计

### 适用场景
- 活动照片直播
- 多平台切换
- 应急备份
- 高可用服务

项目已全部开发完成，可以直接部署使用！
