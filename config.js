// AI旅行规划助手配置文件
const CONFIG = {
    // Coze API 配置
    COZE_API: {
        endpoint: 'https://api.coze.cn/v3/chat',
        // 请将下面的token替换为您的实际token
        token: 'pat_571L1wQKVmNnLSx7NbZnFyO85nAxxk96Zn7L6FJjE29iOHniswPqQHOjkktSJLoB',
        // 请将下面的bot_id替换为您的实际bot_id
        bot_id: '7522887275014357033'
    },
    
    // 应用设置
    APP: {
        // 是否启用真实AI功能（如果为false，将使用模拟模式）
        enableRealAI: true,
        
        // 打字机效果速度（毫秒）
        typewriterSpeed: 30,
        
        // 错误重试次数
        maxRetries: 3,
        
        // 模拟模式下的步骤延迟时间（毫秒）
        mockStepDelay: 2000
    },
    
    // 调试设置
    DEBUG: {
        // 是否启用控制台日志
        enableLogging: true,
        
        // 是否显示详细的API响应
        logApiResponse: true
    }
};

// 导出配置（如果在模块环境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 