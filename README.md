# AI旅行规划助手

一个基于H5的智能旅行规划应用，集成真实大模型API，为用户生成个性化的旅行攻略。

## 🌟 主要特点

- 📋 **智能表单收集** - 详细的旅行需求表单
- 🤖 **真实AI规划** - 集成Coze API，调用真实大模型服务
- 🔄 **流式响应** - 实时显示AI工具调用过程
- ⌨️ **打字机效果** - 流式展示攻略生成过程
- 📱 **响应式设计** - 完美适配各种设备
- 🎨 **现代化UI** - 精美的界面设计和动画效果
- 📄 **攻略导出** - 支持导出美观的HTML攻略文件
- 🔧 **灵活配置** - 支持API配置和功能开关

## 应用流程

### Step 1: 用户信息收集
- 出发地和目的地
- 预计旅游日期
- 预计出行人数（成人/儿童）
- 预算范围选择
- 个性化需求描述

### Step 2: AI规划过程展示
模拟AI调用各种工具进行规划：
- 🔍 分析用户需求
- 🚆 查询交通信息
- 🌤️ 获取天气预报
- 📷 搜索热门景点
- 🗺️ 制定旅行计划

### Step 3: 旅行攻略展示
生成详细的旅行攻略，包含：
- 📅 每日行程安排
- 🚄 交通建议
- 🏨 住宿推荐
- 💰 预算明细表
- ⚠️ 重要提示

## 🚀 快速开始

### 1. API配置（重要！）
在使用真实AI功能前，请先配置您的API信息：

编辑 `config.js` 文件：
```javascript
const CONFIG = {
    COZE_API: {
        endpoint: 'https://api.coze.cn/v3/chat',
        token: 'YOUR_COZE_API_TOKEN',     // 替换为您的token
        bot_id: 'YOUR_BOT_ID'            // 替换为您的bot_id
    },
    APP: {
        enableRealAI: true,              // 设为false使用模拟模式
        typewriterSpeed: 30,             // 打字机效果速度
    }
};
```

### 2. 使用步骤
1. 在浏览器中打开 `index.html`
2. 填写详细的旅行需求表单
3. 点击"开始规划我的旅程"
4. 观看AI实时调用工具的过程
5. 查看流式生成的个性化攻略
6. 下载美观的HTML攻略文件

### 3. 功能模式
- **真实AI模式**：调用Coze API，获得个性化攻略
- **演示模式**：使用预设模板，展示应用功能

## 🔧 技术特点

### 前端技术
- **纯前端实现** - 无需后端服务器
- **流式API集成** - 支持Server-Sent Events
- **现代CSS3** - 渐变、动画、响应式布局
- **模块化设计** - 配置分离、功能解耦
- **打字机效果** - 实时流式内容展示

### API集成
- **Coze API支持** - 完整的流式响应处理
- **工具调用跟踪** - 实时显示AI工具执行过程
- **错误处理** - 自动降级到演示模式
- **Markdown渲染** - 支持丰富的内容格式
- **配置化管理** - 灵活的API配置

## 📁 文件结构

```
travel-planner/
├── 📄 index.html           # 主页面
├── 🎨 style.css            # 样式文件（含打字机效果）
├── ⚙️ script.js            # 核心JavaScript逻辑
├── 🔧 config.js            # API配置文件
├── 📖 README.md            # 项目说明
├── 📋 deploy-guide.md      # 详细部署指南
├── 🚀 DEPLOYMENT.md        # 部署总结
├── 🐳 Dockerfile           # Docker配置
├── 🔧 docker-compose.yml   # Docker编排
├── 🌐 nginx.conf           # Nginx配置
├── 📦 netlify.toml         # Netlify部署配置
├── 🛠️ deploy.sh            # Linux/Mac部署脚本
└── 🛠️ deploy.bat           # Windows部署脚本
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## ⚙️ 配置说明

### API配置
```javascript
// config.js
const CONFIG = {
    COZE_API: {
        endpoint: 'https://api.coze.cn/v3/chat',  // Coze API端点
        token: 'YOUR_TOKEN',                      // 您的API token
        bot_id: 'YOUR_BOT_ID'                    // 您的bot ID
    },
    APP: {
        enableRealAI: true,        // 是否启用真实AI（false=演示模式）
        typewriterSpeed: 30,       // 打字机效果速度（毫秒）
        maxRetries: 3,             // API错误重试次数
        mockStepDelay: 2000        // 模拟模式步骤延迟（毫秒）
    },
    DEBUG: {
        enableLogging: true,       // 是否启用控制台日志
        logApiResponse: false      // 是否记录API响应详情
    }
};
```

### 获取API密钥
1. 注册 [Coze](https://www.coze.cn/) 账户
2. 创建您的AI助手Bot
3. 获取API Token和Bot ID
4. 在 `config.js` 中配置相关信息

## ⚠️ 注意事项

- **API配置**：使用真实AI功能需要有效的Coze API密钥
- **浏览器兼容**：需要支持fetch API和ES6+的现代浏览器
- **CORS策略**：某些浏览器可能需要HTTPS环境访问API
- **隐私安全**：请勿在客户端暴露敏感的API密钥
- **费用控制**：注意API调用可能产生的费用

## 🚀 更新日志

### v2.0.0 - AI集成版本
- ✅ 集成Coze API真实大模型
- ✅ 流式响应处理
- ✅ 打字机效果展示
- ✅ 工具调用过程可视化
- ✅ Markdown内容渲染
- ✅ 配置文件管理
- ✅ 错误处理和降级机制

### v1.0.0 - 基础版本
- ✅ 表单信息收集
- ✅ 模拟AI处理过程
- ✅ 静态攻略生成
- ✅ 响应式设计
- ✅ 攻略导出功能

## 🔮 未来规划

- 🔄 **多AI模型支持** - 支持更多AI服务提供商
- 🌍 **多语言支持** - 国际化界面和内容
- 📊 **数据分析** - 用户行为和偏好分析
- 🔐 **用户系统** - 账户管理和历史记录
- 📱 **PWA支持** - 离线功能和原生体验
- 🎯 **个性化推荐** - 基于历史的智能推荐
- 📤 **社交分享** - 攻略分享和社区功能 