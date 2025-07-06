// 全局变量
let currentStep = 1;
let formData = {};
let processSteps = ['analyze', 'transport', 'weather', 'attractions', 'plan'];
let currentProcessStep = 0;

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
    processNextStep();
}

// 处理下一步
function processNextStep() {
    if (currentProcessStep < processSteps.length) {
        const stepId = processSteps[currentProcessStep];
        const stepElement = document.getElementById(`step-${stepId}`);
        
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
        }, 2000 + Math.random() * 1000); // 随机延迟2-3秒
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
}

// 生成旅行攻略
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
    const guideContent = document.getElementById('travel-guide').innerHTML;
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${formData.destination}旅行攻略</title>
            <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.6; margin: 40px; }
                h1 { color: #2d3748; text-align: center; background: #f0f4f8; padding: 20px; border-radius: 10px; }
                h2 { color: #4a5568; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                h3 { color: #2d3748; margin-top: 25px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                th { background: #f0f4f8; font-weight: bold; }
                .highlight { background: #f0f4f8; padding: 15px; margin: 15px 0; border-radius: 5px; }
                .warning { background: #fff5f5; border: 1px solid #fed7d7; padding: 15px; margin: 15px 0; border-radius: 5px; }
                .budget-total { background: #f0fff4; font-weight: bold; }
                a { color: #667eea; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            ${guideContent}
        </body>
        </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.destination}旅行攻略.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
} 