/**
 * API服务 - 提示词数据管理
 * 使用本地存储模拟后端API
 */

// 存储键
const PROMPTS_STORAGE_KEY = 'ai_prompt_data';
const CATEGORIES_STORAGE_KEY = 'ai_prompt_categories';

// 初始化数据
function initData() {
    // 初始化提示词数据
    if (!localStorage.getItem(PROMPTS_STORAGE_KEY)) {
        // 示例数据
        const samplePrompts = [
            {
                id: '1',
                title: '专业文案写作助手',
                description: '帮助你创建专业、有吸引力的营销文案',
                content: '我希望你作为一名专业文案撰写人，帮我创建引人注目的[产品类型]营销文案。文案应该突出以下特点：[列出产品特点]。目标受众是[描述目标受众]。请使用有说服力的语言，并包含明确的行动召唤。文案长度应该适合[指定平台，如社交媒体、电子邮件等]。',
                category: 'writing',
                tags: ['营销', '文案', '广告'],
                imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
                author: {
                    id: 'admin',
                    username: '系统管理员',
                    avatar: 'assets/images/avatar-placeholder.png'
                },
                createdAt: '2023-01-15T08:30:00.000Z',
                updatedAt: '2023-01-15T08:30:00.000Z',
                likes: 245,
                views: 1820,
                usageExample: '使用这个提示词，你可以快速生成针对特定产品的营销文案。例如，如果你想为一款新的智能手表创建广告文案，只需填入产品类型、特点和目标受众即可。',
                exampleImage: 'https://images.unsplash.com/photo-1542435503-956c469947f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
            },
            {
                id: '2',
                title: '逼真风景图像生成',
                description: '生成高质量、逼真的风景图像',
                content: '创建一张[时间]的[地点]的照片级逼真图像。场景应该包含[描述具体元素]。光线应该是[描述光线，如"黄金时段的温暖阳光"]。风格应该类似于[摄影师姓名]的作品。使用广角镜头，高分辨率，超高细节。',
                category: 'image',
                tags: ['风景', '图像生成', 'AI艺术'],
                imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                author: {
                    id: 'admin',
                    username: '系统管理员',
                    avatar: 'assets/images/avatar-placeholder.png'
                },
                createdAt: '2023-02-20T14:15:00.000Z',
                updatedAt: '2023-02-20T14:15:00.000Z',
                likes: 378,
                views: 2150,
                usageExample: '想象你需要为一篇文章配图，需要一张日落时分的山脉风景照。使用这个提示词，只需填入"日落"作为时间，"山脉"作为地点，然后描述你想要的具体元素，如"雪山顶峰、松树林和一条蜿蜒的小路"。',
                exampleImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1274&q=80'
            },
            {
                id: '3',
                title: 'Python代码优化助手',
                description: '帮助优化Python代码，提高性能和可读性',
                content: '请帮我优化以下Python代码，重点关注[性能/可读性/内存使用/等具体方面]。请解释你所做的更改以及为什么这些更改能够改进代码。\n\n```python\n[在此粘贴你的Python代码]\n```',
                category: 'coding',
                tags: ['Python', '代码优化', '编程'],
                imageUrl: 'https://images.unsplash.com/photo-1649180556628-9ba704115795?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1162&q=80',
                author: {
                    id: 'admin',
                    username: '系统管理员',
                    avatar: 'assets/images/avatar-placeholder.png'
                },
                createdAt: '2023-03-10T10:45:00.000Z',
                updatedAt: '2023-03-10T10:45:00.000Z',
                likes: 192,
                views: 1540,
                usageExample: '当你有一段运行缓慢的Python代码时，可以使用这个提示词。例如，你有一个处理大量数据的函数，但它执行得很慢。只需将代码粘贴到提示中，并指定你希望优化的方面（如"性能"）。',
                exampleImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1031&q=80'
            },
            {
                id: '4',
                title: '商业计划书生成器',
                description: '快速创建专业的商业计划书框架',
                content: '请为一个[行业类型]的[商业模式]创建一份详细的商业计划书大纲。目标客户是[描述目标客户]。计划书应包括：执行摘要、公司描述、市场分析、组织管理、服务或产品线、营销策略、资金需求和财务预测。请特别关注[特定方面，如"市场差异化策略"]。',
                category: 'business',
                tags: ['商业计划', '创业', '商业策略'],
                imageUrl: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                author: {
                    id: 'admin',
                    username: '系统管理员',
                    avatar: 'assets/images/avatar-placeholder.png'
                },
                createdAt: '2023-04-05T16:20:00.000Z',
                updatedAt: '2023-04-05T16:20:00.000Z',
                likes: 156,
                views: 980,
                usageExample: '如果你正在考虑创业或需要为现有业务制定计划，这个提示词可以帮助你快速生成一个结构化的商业计划书框架。例如，填入"健康科技"作为行业，"订阅式应用"作为商业模式，然后描述你的目标客户。',
                exampleImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
            },
            {
                id: '5',
                title: '个性化学习计划',
                description: '创建适合个人需求的学习路径和计划',
                content: '请为我创建一个为期[时间长度]的学习计划，帮助我学习[主题/技能]。我的当前水平是[初学者/中级/高级]，每周可以投入[小时数]小时。我的学习目标是[描述具体目标]。请包括推荐的学习资源（书籍、课程、视频等）、每周学习目标和进度跟踪方法。',
                category: 'education',
                tags: ['学习计划', '教育', '自我提升'],
                imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80',
                author: {
                    id: 'admin',
                    username: '系统管理员',
                    avatar: 'assets/images/avatar-placeholder.png'
                },
                createdAt: '2023-05-12T09:30:00.000Z',
                updatedAt: '2023-05-12T09:30:00.000Z',
                likes: 210,
                views: 1320,
                usageExample: '想要学习一项新技能但不知道从何开始？使用这个提示词，你可以获得一个结构化的学习计划。例如，如果你想学习西班牙语，可以指定"3个月"的时间长度，"西班牙语"作为主题，你的当前水平和每周可用时间。',
                exampleImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
            }
        ];
        
        localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(samplePrompts));
    }
    
    // 初始化分类数据
    if (!localStorage.getItem(CATEGORIES_STORAGE_KEY)) {
        const categories = [
            {
                id: 'writing',
                name: '文案写作',
                icon: 'fa-pen-fancy',
                description: '提升你的写作能力，创建引人入胜的内容'
            },
            {
                id: 'image',
                name: '图像生成',
                icon: 'fa-image',
                description: '创建令人惊叹的AI生成图像'
            },
            {
                id: 'coding',
                name: '编程助手',
                icon: 'fa-code',
                description: '提高编程效率，解决技术问题'
            },
            {
                id: 'business',
                name: '商业应用',
                icon: 'fa-briefcase',
                description: '优化业务流程，提升商业决策'
            },
            {
                id: 'education',
                name: '教育学习',
                icon: 'fa-graduation-cap',
                description: '促进学习和知识获取'
            }
        ];
        
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
}

// 获取所有提示词
function getAllPrompts() {
    return JSON.parse(localStorage.getItem(PROMPTS_STORAGE_KEY) || '[]');
}

// 保存提示词数据
function savePrompts(prompts) {
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
}

// 获取所有分类
function getAllCategories() {
    return JSON.parse(localStorage.getItem(CATEGORIES_STORAGE_KEY) || '[]');
}

// 根据ID获取提示词
function getPromptById(id) {
    const prompts = getAllPrompts();
    return prompts.find(prompt => prompt.id === id) || null;
}

// 根据分类获取提示词
function getPromptsByCategory(categoryId) {
    const prompts = getAllPrompts();
    return prompts.filter(prompt => prompt.category === categoryId);
}

// 根据标签获取提示词
function getPromptsByTag(tag) {
    const prompts = getAllPrompts();
    return prompts.filter(prompt => prompt.tags.includes(tag));
}

// 搜索提示词
function searchPrompts(query) {
    if (!query) return [];
    
    const prompts = getAllPrompts();
    const lowerQuery = query.toLowerCase();
    
    return prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(lowerQuery) ||
        prompt.description.toLowerCase().includes(lowerQuery) ||
        prompt.content.toLowerCase().includes(lowerQuery) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

// 获取热门提示词
function getPopularPrompts(limit = 10) {
    const prompts = getAllPrompts();
    // 按点赞数排序
    return [...prompts].sort((a, b) => b.likes - a.likes).slice(0, limit);
}

// 获取最新提示词
function getNewestPrompts(limit = 10) {
    const prompts = getAllPrompts();
    // 按创建时间排序
    return [...prompts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

// 获取趋势提示词（这里简化为点赞和浏览量的加权组合）
function getTrendingPrompts(limit = 10) {
    const prompts = getAllPrompts();
    // 计算趋势分数（示例：点赞数 * 0.7 + 浏览量 * 0.3）
    return [...prompts]
        .map(prompt => ({
            ...prompt,
            trendScore: prompt.likes * 0.7 + prompt.views * 0.3
        }))
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit);
}

// 获取用户发布的提示词
function getUserPrompts(userId) {
    const prompts = getAllPrompts();
    return prompts.filter(prompt => prompt.author.id === userId);
}

// 获取用户收藏的提示词
function getUserFavorites(favoriteIds) {
    if (!favoriteIds || !favoriteIds.length) return [];
    
    const prompts = getAllPrompts();
    return prompts.filter(prompt => favoriteIds.includes(prompt.id));
}

// 创建新提示词
function createPrompt(promptData, userId, username, avatar) {
    const prompts = getAllPrompts();
    
    const newPrompt = {
        id: Date.now().toString(),
        ...promptData,
        author: {
            id: userId,
            username: username,
            avatar: avatar
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        views: 0
    };
    
    prompts.push(newPrompt);
    savePrompts(prompts);
    
    return newPrompt;
}

// 更新提示词
function updatePrompt(id, updateData) {
    const prompts = getAllPrompts();
    const index = prompts.findIndex(prompt => prompt.id === id);
    
    if (index === -1) {
        throw new Error('提示词不存在');
    }
    
    prompts[index] = {
        ...prompts[index],
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    
    savePrompts(prompts);
    return prompts[index];
}

// 删除提示词
function deletePrompt(id) {
    const prompts = getAllPrompts();
    const newPrompts = prompts.filter(prompt => prompt.id !== id);
    
    if (newPrompts.length === prompts.length) {
        throw new Error('提示词不存在');
    }
    
    savePrompts(newPrompts);
}

// 增加提示词浏览量
function incrementPromptViews(id) {
    const prompts = getAllPrompts();
    const index = prompts.findIndex(prompt => prompt.id === id);
    
    if (index !== -1) {
        prompts[index].views = (prompts[index].views || 0) + 1;
        savePrompts(prompts);
    }
}

// 点赞/取消点赞提示词
function togglePromptLike(id, userId) {
    // 在实际应用中，应该有一个单独的存储来跟踪用户的点赞
    // 这里简化处理，直接增加点赞数
    const prompts = getAllPrompts();
    const index = prompts.findIndex(prompt => prompt.id === id);
    
    if (index !== -1) {
        // 这里简化处理，实际应用中应该检查用户是否已点赞
        prompts[index].likes = (prompts[index].likes || 0) + 1;
        savePrompts(prompts);
        return prompts[index].likes;
    }
    
    return 0;
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initData();
});
