// 全局变量
let currentStep = 1;
let formData = {};
let processSteps = ['analyze', 'transport', 'weather', 'attractions', 'plan'];
let currentProcessStep = 0;

// AI处理相关变量
let isReceivingAnswer = false;
let currentAnswerId = null;

// DOM元素
const form = document.getElementById('travel-form');
const steps = document.querySelectorAll('.step-section');
const backBtn = document.getElementById('back-to-form');
const downloadBtn = document.getElementById('download-guide');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeNumberInputs();
    initializeForm();
    initializeButtons();
    setDefaultDates();
});

// 设置默认日期
function setDefaultDates() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    document.getElementById('startDate').valueAsDate = nextWeek;
    document.getElementById('endDate').valueAsDate = nextMonth;
}

// 初始化数字输入控件
function initializeNumberInputs() {
    const numberInputs = document.querySelectorAll('.number-input');
    
    numberInputs.forEach(input => {
        const minusBtn = input.querySelector('.minus');
        const plusBtn = input.querySelector('.plus');
        const countSpan = input.querySelector('.count');
        
        minusBtn.addEventListener('click', function() {
            const target = this.dataset.target;
            const current = parseInt(countSpan.textContent);
            if (current > 0) {
                countSpan.textContent = current - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            const target = this.dataset.target;
            const current = parseInt(countSpan.textContent);
            countSpan.textContent = current + 1;
        });
    });
}

// 初始化表单
function initializeForm() {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        collectFormData();
        showStep(2);
        startAIProcess();
    });
}

// 初始化按钮
function initializeButtons() {
    backBtn.addEventListener('click', function() {
        showStep(1);
        resetProcess();
    });
    
    downloadBtn.addEventListener('click', function() {
        downloadGuide();
    });
}

// 收集表单数据
function collectFormData() {
    const formElement = document.getElementById('travel-form');
    const formDataObj = new FormData(formElement);
    
    formData = {
        departure: formDataObj.get('departure'),
        destination: formDataObj.get('destination'),
        startDate: formDataObj.get('startDate'),
        endDate: formDataObj.get('endDate'),
        adults: parseInt(document.getElementById('adults').textContent),
        children: parseInt(document.getElementById('children').textContent),
        budget: formDataObj.get('budget'),
        preferences: formDataObj.get('preferences') || ''
    };
    
    // 计算天数
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    formData.days = diffDays;
    
    console.log('收集的表单数据:', formData);
}

// 显示步骤
function showStep(step) {
    steps.forEach((s, index) => {
        s.classList.toggle('active', index + 1 === step);
    });
    currentStep = step;
}

// 开始AI处理过程
function startAIProcess() {
    currentProcessStep = 0;
    // 重置所有步骤状态
    resetAllSteps();
    // 调用真实大模型API
    callCozeAPI();
}

// 重置所有步骤状态
function resetAllSteps() {
    processSteps.forEach(stepId => {
        const stepElement = document.getElementById(`step-${stepId}`);
        stepElement.classList.remove('active', 'completed');
        stepElement.querySelector('.step-status').innerHTML = '<i class="fas fa-clock"></i>';
        // 重置步骤描述
        const messages = {
            analyze: '正在分析您的出行偏好和需求...',
            transport: '正在查询最优交通方案...',
            weather: '正在获取目的地天气预报...',
            attractions: '正在小红书搜索推荐景点和美食...',
            plan: '正在为您制定个性化旅行攻略...'
        };
        stepElement.querySelector('.step-content p').textContent = messages[stepId];
    });
}

// 调用Coze API
async function callCozeAPI() {
    try {
        // 生成自然语言prompt
        const prompt = generatePrompt();
        
        console.log('🤖 开始AI处理流程...');
        console.log('📝 生成的prompt:', prompt);
        
        // 检查是否启用真实AI功能
        if (!CONFIG.APP.enableRealAI) {
            console.log('⚠️ 真实AI功能已禁用，使用演示模式');
            throw new Error('AI功能已禁用，使用模拟模式');
        }
        
        console.log('🔗 准备调用Coze API...');

        // 准备API请求
        const userId = generateUserId();
        const requestBody = {
            bot_id: CONFIG.COZE_API.bot_id,
            user_id: userId,
            stream: true,
            additional_messages: [
                {
                    content: prompt,
                    content_type: "text",
                    role: "user",
                    type: "question"
                }
            ],
            parameters: {}
        };

        console.log('📋 请求参数:', {
            endpoint: CONFIG.COZE_API.endpoint,
            bot_id: CONFIG.COZE_API.bot_id,
            user_id: userId,
            token_preview: CONFIG.COZE_API.token.substring(0, 20) + '...',
            prompt_length: prompt.length
        });

        // 添加请求超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('⏰ API请求超时');
        }, 30000); // 30秒超时

        let response;
        try {
            console.log('🚀 发起API请求...');
            
            // 发起流式请求
            response = await fetch(CONFIG.COZE_API.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.COZE_API.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            console.log('📡 收到响应:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API响应错误:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            // 处理流式响应
            console.log('📊 开始处理流式响应...');
            await handleStreamResponse(response);
            
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }

    } catch (error) {
        console.error('❌ 调用Coze API失败:', error);
        console.log('🔄 正在回退到演示模式...');
        
        // 显示错误并回退到模拟模式
        showError('AI服务暂时不可用，正在使用演示模式...');
        setTimeout(() => {
            console.log('📱 启动模拟AI处理流程...');
            fallbackToMockProcess();
        }, 2000);
    }
}

// 生成自然语言prompt
function generatePrompt() {
    const totalPeople = formData.adults + formData.children;
    const budgetText = getBudgetText(formData.budget);
    
    let prompt = `我准备从${formData.departure}出发去${formData.destination}旅游 ${formData.days} 天，`;
    prompt += `${formData.adults}个成人`;
    if (formData.children > 0) {
        prompt += `，${formData.children}个儿童`;
    }
    prompt += `，预算${budgetText}。`;
    
    if (formData.preferences) {
        prompt += `特殊需求：${formData.preferences}。`;
    }
    
    prompt += `请为我制定一份详细的旅行攻略，包含交通建议、住宿推荐、每日行程安排、预算明细等，`;
    prompt += `结果请用中文markdown格式呈现，要求格式美观、内容详实。`;
    
    return prompt;
}

// 生成用户ID
function generateUserId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 处理流式响应
async function handleStreamResponse(response) {
    console.log('📥 开始读取流式响应...');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = null;
    let currentAnswerId = null;
    let isReceivingAnswer = false;
    let messageCount = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log('🏁 流式响应读取完成');
            console.log(`📊 总共处理了 ${messageCount} 条消息`);
            console.log(`📝 接收到的内容长度: ${typewriterContent ? typewriterContent.length : 0} 字符`);
            break;
        }

        messageCount++;
        if (messageCount % 10 === 0) {
            console.log(`📈 已处理 ${messageCount} 条消息`);
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留最后一行，可能是不完整的

        for (const line of lines) {
            if (line.trim() === '') continue;
            console.log('🔍 处理行:', line);
            
            try {
                if (line.startsWith('event:')) {
                    currentEvent = line.substring(6).trim();
                    continue;
                }
                
                if (line.startsWith('data:')) {
                    const dataStr = line.substring(5).trim();
                    if (dataStr === '[DONE]') {
                        // 流结束，显示最终攻略
                        if (typewriterContent) {
                            await displayFinalGuide(typewriterContent);
                        }
                        return;
                    }
                    
                    const data = JSON.parse(dataStr);
                    
                    // 根据事件类型处理
                    switch (currentEvent) {
                        case 'conversation.chat.created':
                            if (CONFIG.DEBUG.enableLogging) {
                                console.log('对话创建:', data);
                            }
                            break;
                            
                        case 'conversation.chat.in_progress':
                            if (CONFIG.DEBUG.enableLogging) {
                                console.log('对话处理中:', data);
                            }
                            break;
                            
                        case 'conversation.message.delta':
                            // 增量消息，实时显示
                            if (data.type === 'answer' && data.content) {
                                if (!isReceivingAnswer) {
                                    // 第一次收到delta，初始化
                                    isReceivingAnswer = true;
                                    currentAnswerId = data.id;
                                    typewriterContent = '';
                                    completeAllSteps();
                                    showStep(3);
                                    initTypewriterEffect();
                                }
                                
                                if (data.id === currentAnswerId) {
                                    handleAnswerDelta(data.content);
                                }
                            }
                            break;
                            
                        case 'conversation.message.completed':
                            // 完整消息
                            await handleStreamEvent(data);
                            break;
                            
                        case 'conversation.chat.completed':
                            if (CONFIG.DEBUG.enableLogging) {
                                console.log('对话完成:', data);
                            }
                            // 确保显示最终攻略
                            if (typewriterContent && isReceivingAnswer) {
                                await displayFinalGuide(typewriterContent);
                            }
                            break;
                            
                        case 'conversation.chat.failed':
                            console.error('对话失败:', data);
                            showError('AI服务响应失败，正在使用演示模式...');
                            setTimeout(() => {
                                fallbackToMockProcess();
                            }, 2000);
                            break;
                            
                        case 'done':
                            // 流式响应结束
                            if (typewriterContent) {
                                await displayFinalGuide(typewriterContent);
                            }
                            return;
                            
                        default:
                            console.log('未处理的事件:', currentEvent, data);
                            break;
                    }
                }
            } catch (error) {
                console.error('解析流式数据失败:', error, line);
            }
        }
    }
}

// 处理流式事件
async function handleStreamEvent(data) {
    const { type, content, role, id } = data;
    
    if (role === 'assistant') {
        switch (type) {
            case 'knowledge':
                // 知识库召回 - 对应分析需求步骤
                updateStepProgress('analyze', '知识库检索完成，正在分析您的需求...');
                markStepCompleted(0); // 分析步骤完成
                break;
                
            case 'function_call':
                // 工具调用 - 根据工具类型更新不同步骤
                handleFunctionCall(content);
                break;
                
            case 'tool_response':
                // 工具输出 - 更新对应步骤完成状态
                handleToolOutput(content);
                break;
                
            case 'answer':
                // 最终回答处理
                if (!isReceivingAnswer) {
                    // 第一次收到answer，初始化
                    isReceivingAnswer = true;
                    currentAnswerId = id;
                    typewriterContent = ''; // 重置内容
                    // 完成所有步骤，准备显示攻略
                    completeAllSteps();
                    showStep(3);
                    // 开始打字机效果
                    initTypewriterEffect();
                }
                
                // 如果是同一个回答的增量内容
                if (id === currentAnswerId && content) {
                    handleAnswerDelta(content);
                }
                break;
                
            case 'verbose':
                // 处理verbose消息，可能包含状态信息
                try {
                    const verboseData = JSON.parse(content);
                    if (verboseData.msg_type === 'generate_answer_finish') {
                        // 回答生成完成
                        isReceivingAnswer = false;
                    }
                } catch (error) {
                    console.log('解析verbose消息失败:', error);
                }
                break;
        }
    }
}

// 处理函数调用
function handleFunctionCall(content) {
    try {
        const functionCall = JSON.parse(content);
        const functionName = functionCall.name;
        
        // 根据函数名更新对应步骤
        if (functionName.includes('transport') || functionName.includes('ticket')) {
            updateStepProgress('transport', '正在查询交通信息...');
        } else if (functionName.includes('weather')) {
            updateStepProgress('weather', '正在获取天气数据...');
        } else if (functionName.includes('search') || functionName.includes('xiaohongshu')) {
            updateStepProgress('attractions', '正在搜索热门景点和美食...');
        } else {
            updateStepProgress('plan', '正在整合信息制定攻略...');
        }
    } catch (error) {
        console.error('解析function_call失败:', error);
    }
}

// 处理工具输出
function handleToolOutput(content) {
    // 工具执行完成，标记对应步骤完成
    markStepCompleted(currentProcessStep);
    currentProcessStep++;
    
    // 如果还有下一步，激活它
    if (currentProcessStep < processSteps.length) {
        const nextStepId = processSteps[currentProcessStep];
        activateStep(nextStepId);
    }
}

// 更新步骤进度
function updateStepProgress(stepId, message) {
    const stepElement = document.getElementById(`step-${stepId}`);
    if (stepElement && !stepElement.classList.contains('completed')) {
        stepElement.classList.add('active');
        stepElement.querySelector('.step-content p').textContent = message;
    }
}

// 激活步骤
function activateStep(stepId) {
    const stepElement = document.getElementById(`step-${stepId}`);
    stepElement.classList.add('active');
    stepElement.querySelector('.step-status').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
}

// 标记步骤完成
function markStepCompleted(stepIndex) {
    if (stepIndex < processSteps.length) {
        const stepId = processSteps[stepIndex];
        const stepElement = document.getElementById(`step-${stepId}`);
        stepElement.classList.remove('active');
        stepElement.classList.add('completed');
        stepElement.querySelector('.step-status').innerHTML = '<i class="fas fa-check"></i>';
        
        // 更新完成消息
        const completedMessages = {
            analyze: `分析完成！识别到${formData.adults + formData.children}人从${formData.departure}前往${formData.destination}的${formData.days}天行程需求`,
            transport: `交通方案查询完成！已找到最优出行方案`,
            weather: `天气查询完成！${formData.destination}近期天气适宜出行`,
            attractions: `景点搜索完成！已为您筛选最佳推荐`,
            plan: `攻略制定完成！正在为您呈现详细内容`
        };
        
        stepElement.querySelector('.step-content p').textContent = completedMessages[stepId];
    }
}

// 完成所有步骤
function completeAllSteps() {
    processSteps.forEach((stepId, index) => {
        markStepCompleted(index);
    });
}

// 显示错误信息
function showError(message) {
    const currentStepElement = document.getElementById(`step-${processSteps[currentProcessStep]}`);
    if (currentStepElement) {
        currentStepElement.querySelector('.step-content p').textContent = message;
        currentStepElement.querySelector('.step-status').innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    }
}

// 回退到模拟模式
function fallbackToMockProcess() {
    console.log('🎭 启动模拟处理模式');
    currentProcessStep = 0; // 重置步骤计数器
    processNextStep();
}

// 处理下一步（模拟模式）
function processNextStep() {
    if (currentProcessStep < processSteps.length) {
        const stepId = processSteps[currentProcessStep];
        const stepElement = document.getElementById(`step-${stepId}`);
        
        console.log(`🔄 处理步骤 ${currentProcessStep + 1}: ${stepId}`);
        
        // 设置当前步骤为活跃状态
        stepElement.classList.add('active');
        
        // 模拟处理时间
        setTimeout(() => {
            // 完成当前步骤
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
            stepElement.querySelector('.step-status').innerHTML = '<i class="fas fa-check"></i>';
            
            // 更新步骤内容
            updateStepContent(stepId);
            
            currentProcessStep++;
            processNextStep();
        }, CONFIG.APP.mockStepDelay + Math.random() * 1000); // 使用配置的延迟时间
    } else {
        // 所有步骤完成，生成攻略
        setTimeout(() => {
            generateTravelGuide();
            showStep(3);
        }, 1000);
    }
}

// 更新步骤内容
function updateStepContent(stepId) {
    const stepElement = document.getElementById(`step-${stepId}`);
    const contentElement = stepElement.querySelector('.step-content p');
    
    const messages = {
        analyze: `分析完成！识别到${formData.adults + formData.children}人从${formData.departure}前往${formData.destination}的${formData.days}天行程需求`,
        transport: `已找到最佳交通方案！推荐高铁出行，预计交通费用约${calculateTransportCost()}元`,
        weather: `天气查询完成！${formData.destination}近期天气良好，适合出行`,
        attractions: `发现${formData.destination}热门景点15个，特色美食8种，已筛选最适合您的推荐`,
        plan: `个性化攻略制定完成！已为您规划详细的${formData.days}天行程安排`
    };
    
    contentElement.textContent = messages[stepId];
}

// 计算交通费用
function calculateTransportCost() {
    const baseCost = 500;
    const people = formData.adults + formData.children;
    return baseCost * people * 2; // 往返
}

// 重置处理过程
function resetProcess() {
    processSteps.forEach(stepId => {
        const stepElement = document.getElementById(`step-${stepId}`);
        stepElement.classList.remove('active', 'completed');
        stepElement.querySelector('.step-status').innerHTML = '<i class="fas fa-clock"></i>';
    });
    currentProcessStep = 0;
    
    // 重置AI处理相关变量
    isReceivingAnswer = false;
    currentAnswerId = null;
    typewriterContent = '';
    typewriterIndex = 0;
    isTypewriterActive = false;
}

// 全局变量：打字机效果相关
let typewriterContent = '';
let typewriterIndex = 0;
let typewriterSpeed = CONFIG?.APP?.typewriterSpeed || 30; // 打字速度（毫秒）
let isTypewriterActive = false;

// 初始化打字机效果
function initTypewriterEffect() {
    const guideContainer = document.getElementById('travel-guide');
    guideContainer.innerHTML = `
        <div class="typewriter-container">
            <div class="typewriter-header">
                <h2><i class="fas fa-magic"></i> AI正在为您生成个性化旅行攻略...</h2>
                <div class="typing-indicator">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
            <div id="typewriter-content" class="typewriter-content"></div>
            <div class="typewriter-cursor">|</div>
        </div>
    `;
    
    isTypewriterActive = true;
}

// 处理流式回答增量
function handleAnswerDelta(content) {
    if (!isTypewriterActive) return;
    
    typewriterContent += content;
    // 实时显示增量内容
    displayTypewriterContent();
}

// 显示打字机内容
function displayTypewriterContent() {
    const contentDiv = document.getElementById('typewriter-content');
    if (!contentDiv || !isTypewriterActive) return;
    
    // 渲染markdown内容
    const renderedContent = renderMarkdown(typewriterContent);
    contentDiv.innerHTML = renderedContent;
    
    // 滚动到底部
    contentDiv.scrollTop = contentDiv.scrollHeight;
}

// 简单的markdown渲染器
function renderMarkdown(text) {
    // 处理标题
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // 处理粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 处理代码块
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 处理行内代码
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // 处理链接
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 处理列表
    text = text.replace(/^[\s]*[-*+] (.+)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // 处理数字列表
    text = text.replace(/^\d+\. (.+)/gm, '<li>$1</li>');
    
    // 处理表格（简单版本）
    const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
    text = text.replace(tableRegex, (match, header, rows) => {
        const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
        const headerHTML = '<tr>' + headerCells.map(cell => `<th>${cell}</th>`).join('') + '</tr>';
        
        const rowsHTML = rows.trim().split('\n').map(row => {
            const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
            return '<tr>' + cells.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
        }).join('');
        
        return `<table class="markdown-table"><thead>${headerHTML}</thead><tbody>${rowsHTML}</tbody></table>`;
    });
    
    // 处理换行
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');
    text = '<p>' + text + '</p>';
    
    // 清理空段落
    text = text.replace(/<p><\/p>/g, '');
    text = text.replace(/<p><br><\/p>/g, '');
    
    return text;
}

// 显示最终攻略
async function displayFinalGuide(content) {
    isTypewriterActive = false;
    
    const guideContainer = document.getElementById('travel-guide');
    
    // 显示完成状态
    guideContainer.innerHTML = `
        <div class="guide-complete">
            <div class="success-header">
                <i class="fas fa-check-circle"></i>
                <h2>您的专属旅行攻略已生成完成！</h2>
            </div>
            <div class="final-content">
                ${renderMarkdown(content)}
            </div>
        </div>
    `;
    
    // 添加一些特效
    setTimeout(() => {
        const successHeader = guideContainer.querySelector('.success-header');
        if (successHeader) {
            successHeader.classList.add('animate-success');
        }
    }, 500);
}

// 生成旅行攻略（模拟模式回退）
function generateTravelGuide() {
    const guideContainer = document.getElementById('travel-guide');
    const totalPeople = formData.adults + formData.children;
    const budgetText = getBudgetText(formData.budget);
    
    const guideHTML = `
        <h1>🌟 ${formData.destination}${formData.days}天${formData.days - 1}晚深度游攻略</h1>
        <div class="highlight">
            <strong>总预算：约${calculateTotalBudget()}元（${totalPeople}人）</strong><br>
            <strong>出行日期：${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}</strong><br>
            <strong>出行人数：${formData.adults}大${formData.children}小</strong>
        </div>

        <h2>🚅 往返交通建议</h2>
        <div class="highlight">
            <strong>去程推荐：G1234次高铁</strong><br>
            🕒 08:00${formData.departure} → 14:30${formData.destination}（6小时30分）<br>
            💰 二等座${Math.floor(calculateTransportCost() / totalPeople / 2)}元/人×${totalPeople}=${calculateTransportCost() / 2}元<br>
            ✅ 优势：上午出发下午抵达，余票充足<br>
            🔗 购票：<a href="https://www.12306.cn" target="_blank">12306官网购票</a>
        </div>

        <div class="highlight">
            <strong>返程推荐：G5678次高铁</strong><br>
            🕒 09:00${formData.destination} → 15:30${formData.departure}（6小时30分）<br>
            💰 二等座${Math.floor(calculateTransportCost() / totalPeople / 2)}元/人×${totalPeople}=${calculateTransportCost() / 2}元<br>
            ❗ 建议提前15天购票
        </div>

        <h2>🏨 住宿建议</h2>
        <div class="highlight">
            <strong>市中心商圈推荐</strong><br>
            推荐：精选商务酒店<br>
            💰 约${Math.floor(calculateAccommodationCost() / (formData.days - 1))}元/晚×${formData.days - 1}=${calculateAccommodationCost()}元<br>
            ✅ 优势：交通便利，周边配套齐全
        </div>

        <h2>📆 每日行程安排</h2>
        ${generateDailyItinerary()}

        <h2>💰 预算明细</h2>
        <table>
            <thead>
                <tr>
                    <th>项目</th>
                    <th>金额</th>
                    <th>备注</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>交通（往返）</td>
                    <td>${calculateTransportCost()}元</td>
                    <td>高铁二等座</td>
                </tr>
                <tr>
                    <td>住宿</td>
                    <td>${calculateAccommodationCost()}元</td>
                    <td>${formData.days - 1}晚舒适型酒店</td>
                </tr>
                <tr>
                    <td>景点门票</td>
                    <td>${calculateAttractionsCost()}元</td>
                    <td>含主要景点门票</td>
                </tr>
                <tr>
                    <td>餐饮</td>
                    <td>${calculateFoodCost()}元</td>
                    <td>日均${Math.floor(calculateFoodCost() / formData.days)}元</td>
                </tr>
                <tr>
                    <td>市内交通</td>
                    <td>${calculateLocalTransportCost()}元</td>
                    <td>地铁+打车+公交</td>
                </tr>
                <tr>
                    <td>其他</td>
                    <td>${calculateOtherCost()}元</td>
                    <td>纪念品+应急费用</td>
                </tr>
                <tr class="budget-total">
                    <td><strong>总计</strong></td>
                    <td><strong>${calculateTotalBudget()}元</strong></td>
                    <td><strong>实际可控制在预算范围内</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="warning">
            <h4>⚠️ 重要提示</h4>
            <ul>
                <li>出行前请关注目的地天气变化，适时调整行程</li>
                <li>热门景点建议提前预约门票，避免排队等待</li>
                <li>建议购买旅游保险，保障出行安全</li>
                <li>携带充电宝、常用药品等必需品</li>
                <li>关注当地交通限行政策，合理规划出行时间</li>
                ${formData.preferences ? `<li>特别提醒：${formData.preferences}</li>` : ''}
            </ul>
        </div>

        <div class="highlight">
            <p style="text-align: center; font-size: 1.2em; color: #667eea;">
                <strong>祝您旅途愉快！🎉</strong><br>
                如需调整行程细节，请重新填写需求表单 (๑•̀ㅂ•́)و✧
            </p>
        </div>
    `;
    
    guideContainer.innerHTML = guideHTML;
}

// 生成每日行程
function generateDailyItinerary() {
    let itinerary = '';
    
    for (let i = 0; i < formData.days; i++) {
        const day = i + 1;
        const date = new Date(formData.startDate);
        date.setDate(date.getDate() + i);
        
        if (day === 1) {
            itinerary += `
                <h3>Day${day}（${formatDate(date)}）抵达${formData.destination}</h3>
                <ul>
                    <li>14:30 抵达${formData.destination}</li>
                    <li>15:30 酒店入住休整</li>
                    <li>17:00-19:00 ${formData.destination}市中心初探</li>
                    <li>19:30-21:00 品尝当地特色美食</li>
                    <li>21:30 返回酒店休息</li>
                </ul>
            `;
        } else if (day === formData.days) {
            itinerary += `
                <h3>Day${day}（${formatDate(date)}）返程日</h3>
                <ul>
                    <li>09:00 酒店退房</li>
                    <li>10:00-11:30 自由活动/购买纪念品</li>
                    <li>12:00 前往车站</li>
                    <li>15:30 抵达${formData.departure}</li>
                </ul>
            `;
        } else {
            const attractions = getAttractions(day);
            itinerary += `
                <h3>Day${day}（${formatDate(date)}）${attractions.theme}</h3>
                <ul>
                    <li>08:30 酒店早餐</li>
                    <li>09:30-12:00 ${attractions.morning}</li>
                    <li>12:30-14:00 ${attractions.lunch}</li>
                    <li>14:30-17:30 ${attractions.afternoon}</li>
                    <li>18:00-20:00 ${attractions.dinner}</li>
                    <li>20:30 返回酒店</li>
                </ul>
            `;
        }
    }
    
    return itinerary;
}

// 获取景点信息
function getAttractions(day) {
    const attractions = {
        2: {
            theme: '历史文化之旅',
            morning: '历史博物馆参观（💰60元/人）',
            lunch: '传统小吃街品尝美食',
            afternoon: '古城墙漫步（💰40元/人）',
            dinner: '当地特色餐厅'
        },
        3: {
            theme: '自然风光之旅',
            morning: '风景名胜区游览（💰80元/人）',
            lunch: '景区内用餐',
            afternoon: '湖边公园休闲',
            dinner: '湖景餐厅'
        },
        4: {
            theme: '文化体验之旅',
            morning: '传统工艺体验馆（💰50元/人）',
            lunch: '文化街区用餐',
            afternoon: '艺术馆参观',
            dinner: '民俗表演+晚餐'
        }
    };
    
    return attractions[day] || attractions[2];
}

// 预算计算函数
function calculateTotalBudget() {
    return calculateTransportCost() + calculateAccommodationCost() + 
           calculateAttractionsCost() + calculateFoodCost() + 
           calculateLocalTransportCost() + calculateOtherCost();
}

function calculateAccommodationCost() {
    const basePrice = 400;
    const people = formData.adults + formData.children;
    const rooms = Math.ceil(people / 2);
    return basePrice * rooms * (formData.days - 1);
}

function calculateAttractionsCost() {
    const baseCost = 50;
    const people = formData.adults + formData.children;
    const days = formData.days - 1; // 减去第一天和最后一天
    return baseCost * people * days;
}

function calculateFoodCost() {
    const baseCost = 150;
    const people = formData.adults + formData.children;
    return baseCost * people * formData.days;
}

function calculateLocalTransportCost() {
    const baseCost = 50;
    const people = formData.adults + formData.children;
    return baseCost * people * formData.days;
}

function calculateOtherCost() {
    const people = formData.adults + formData.children;
    return 200 * people;
}

// 辅助函数
function getBudgetText(budget) {
    const budgetMap = {
        '500': '¥500以下',
        '1000': '¥500-1000',
        '5000': '¥1000-5000',
        '10000': '¥5000-10000',
        'unlimited': '¥10000以上'
    };
    return budgetMap[budget] || '未选择';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

// 下载攻略
function downloadGuide() {
    let guideContent = '';
    
    // 检查是否是AI生成的内容
    const finalContent = document.querySelector('.final-content');
    if (finalContent) {
        guideContent = finalContent.innerHTML;
    } else {
        // 回退到原始内容
        guideContent = document.getElementById('travel-guide').innerHTML;
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${formData.destination}旅行攻略</title>
            <style>
                body { 
                    font-family: 'Microsoft YaHei', Arial, sans-serif; 
                    line-height: 1.6; 
                    margin: 40px; 
                    color: #333;
                }
                h1 { 
                    color: #2d3748; 
                    font-size: 1.8rem;
                    margin: 20px 0 15px 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                    text-align: center;
                }
                h2 { 
                    color: #4a5568; 
                    font-size: 1.4rem;
                    margin: 25px 0 10px 0;
                    padding: 10px 0 10px 15px;
                    border-left: 4px solid #667eea;
                    background: #f8fafc;
                }
                h3 { 
                    color: #2d3748; 
                    font-size: 1.2rem;
                    margin: 20px 0 8px 0;
                }
                .markdown-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .markdown-table th { 
                    background: #667eea;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                .markdown-table td { 
                    padding: 10px 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .markdown-table tr:nth-child(even) td { 
                    background: #f8fafc;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0; 
                }
                th, td { 
                    border: 1px solid #e2e8f0; 
                    padding: 10px; 
                    text-align: left; 
                }
                th { 
                    background: #667eea; 
                    color: white;
                    font-weight: bold; 
                }
                ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 5px;
                    color: #4a5568;
                }
                strong {
                    color: #2d3748;
                    font-weight: 600;
                }
                em {
                    color: #667eea;
                    font-style: italic;
                }
                code {
                    background: #f1f5f9;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                    color: #e53e3e;
                }
                pre {
                    background: #1a202c;
                    color: #f7fafc;
                    padding: 15px;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 15px 0;
                }
                .highlight { 
                    background: #ebf8ff; 
                    padding: 15px; 
                    margin: 15px 0; 
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }
                .warning { 
                    background: #fff5f5; 
                    border: 1px solid #fed7d7; 
                    padding: 15px; 
                    margin: 15px 0; 
                    border-radius: 8px; 
                }
                .budget-total { 
                    background: #f0fff4; 
                    font-weight: bold; 
                }
                a { 
                    color: #667eea; 
                    text-decoration: none; 
                }
                a:hover { 
                    text-decoration: underline; 
                }
                @media print {
                    body { margin: 20px; }
                    h1 { break-after: avoid; }
                    h2, h3 { break-after: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="travel-guide-content">
                ${guideContent}
            </div>
            <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096;">
                <p>本攻略由AI旅行规划助手生成 | 生成时间: ${new Date().toLocaleString('zh-CN')}</p>
            </footer>
        </body>
        </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.destination}旅行攻略_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
} 