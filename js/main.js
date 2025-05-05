/**
 * 主要JavaScript文件 - 处理网站功能
 */

// 当前页面信息
let currentPage = 1;
let currentSort = 'popular'; // 默认排序方式
let isLoading = false;
let hasMorePrompts = true;

// 每页显示的提示词数量
const PROMPTS_PER_PAGE = 12;

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Masonry布局
    initMasonry();
    
    // 加载提示词
    loadPrompts();
    
    // 设置排序选项事件监听
    setupSortOptions();
    
    // 设置加载更多按钮事件监听
    setupLoadMoreButton();
    
    // 设置搜索功能
    setupSearch();
    
    // 如果在分类页面，加载特定分类的提示词
    if (window.location.pathname.includes('category.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('cat');
        if (category) {
            loadCategoryPrompts(category);
        }
    }
    
    // 如果在提示词详情页面，加载提示词详情
    if (window.location.pathname.includes('prompt-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const promptId = urlParams.get('id');
        if (promptId) {
            loadPromptDetail(promptId);
        }
    }
    
    // 如果在用户资料页面，加载用户资料
    if (window.location.pathname.includes('profile.html')) {
        loadUserProfile();
    }
    
    // 如果在创建提示词页面，设置表单提交处理
    if (window.location.pathname.includes('create-prompt.html')) {
        setupCreatePromptForm();
    }
});

// 初始化Masonry布局
function initMasonry() {
    const grid = document.getElementById('promptsGrid');
    if (!grid) return;
    
    // 初始化Masonry
    const masonry = new Masonry(grid, {
        itemSelector: '.prompt-card-wrapper',
        columnWidth: '.prompt-card-sizer',
        percentPosition: true,
        gutter: 20
    });
    
    // 保存Masonry实例到window对象，以便后续使用
    window.masonryInstance = masonry;
}

// 加载提示词
function loadPrompts(append = false) {
    const promptsGrid = document.getElementById('promptsGrid');
    if (!promptsGrid) return;
    
    // 如果正在加载或没有更多提示词，则返回
    if (isLoading || (!append && !hasMorePrompts)) return;
    
    isLoading = true;
    
    // 显示加载状态
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 加载中...';
        loadMoreBtn.disabled = true;
    }
    
    // 获取提示词数据
    let prompts;
    switch (currentSort) {
        case 'newest':
            prompts = getNewestPrompts(100); // 获取足够多的提示词以支持分页
            break;
        case 'trending':
            prompts = getTrendingPrompts(100);
            break;
        case 'popular':
        default:
            prompts = getPopularPrompts(100);
            break;
    }
    
    // 计算分页
    const startIndex = (currentPage - 1) * PROMPTS_PER_PAGE;
    const endIndex = startIndex + PROMPTS_PER_PAGE;
    const pagePrompts = prompts.slice(startIndex, endIndex);
    
    // 检查是否还有更多提示词
    hasMorePrompts = endIndex < prompts.length;
    
    // 如果没有更多提示词，隐藏加载更多按钮
    if (!hasMorePrompts && loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
    
    // 如果是追加模式且没有提示词，则返回
    if (append && pagePrompts.length === 0) {
        isLoading = false;
        return;
    }
    
    // 如果不是追加模式，清空网格
    if (!append) {
        promptsGrid.innerHTML = '<div class="prompt-card-sizer col-md-6 col-lg-4"></div>';
    }
    
    // 添加提示词卡片
    pagePrompts.forEach(prompt => {
        const promptCard = createPromptCard(prompt);
        promptsGrid.appendChild(promptCard);
    });
    
    // 重新布局Masonry
    if (window.masonryInstance) {
        // 使用imagesLoaded确保图片加载完成后再布局
        imagesLoaded(promptsGrid, function() {
            window.masonryInstance.reloadItems();
            window.masonryInstance.layout();
            
            // 恢复加载状态
            isLoading = false;
            
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '加载更多';
                loadMoreBtn.disabled = false;
                
                // 如果没有更多提示词，隐藏按钮
                if (!hasMorePrompts) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'block';
                }
            }
        });
    } else {
        // 如果没有Masonry实例，直接恢复加载状态
        isLoading = false;
        
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '加载更多';
            loadMoreBtn.disabled = false;
            
            if (!hasMorePrompts) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }
    }
}

// 创建提示词卡片
function createPromptCard(prompt) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'prompt-card-wrapper col-md-6 col-lg-4 mb-4';
    
    // 获取当前用户
    const currentUser = getCurrentUser();
    
    // 检查是否已收藏
    const isFavorited = currentUser ? currentUser.favorites.includes(prompt.id) : false;
    
    // 构建标签HTML
    const tagsHtml = prompt.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    // 构建卡片HTML
    cardWrapper.innerHTML = `
        <div class="card prompt-card h-100">
            <a href="prompt-detail.html?id=${prompt.id}" class="card-img-link">
                <img src="${prompt.imageUrl}" class="card-img-top" alt="${prompt.title}">
            </a>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="prompt-detail.html?id=${prompt.id}" class="text-decoration-none">${prompt.title}</a>
                </h5>
                <p class="card-text">${prompt.description}</p>
                <div class="tags mb-2">
                    ${tagsHtml}
                </div>
                <div class="d-flex align-items-center mt-3">
                    <img src="${prompt.author.avatar}" class="avatar-sm rounded-circle me-2" alt="${prompt.author.username}">
                    <small class="text-muted">${prompt.author.username}</small>
                </div>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center">
                <div>
                    <button class="action-btn like-btn" data-prompt-id="${prompt.id}">
                        <i class="far fa-thumbs-up"></i> ${prompt.likes}
                    </button>
                    <button class="action-btn favorite-btn ${isFavorited ? 'active' : ''}" data-prompt-id="${prompt.id}">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-bookmark"></i>
                    </button>
                </div>
                <div>
                    <button class="action-btn share-btn" data-prompt-id="${prompt.id}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 添加事件监听器
    const likeBtn = cardWrapper.querySelector('.like-btn');
    const favoriteBtn = cardWrapper.querySelector('.favorite-btn');
    const shareBtn = cardWrapper.querySelector('.share-btn');
    
    // 点赞按钮
    if (likeBtn) {
        likeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const promptId = this.getAttribute('data-prompt-id');
            handleLikePrompt(promptId, this);
        });
    }
    
    // 收藏按钮
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const promptId = this.getAttribute('data-prompt-id');
            handleFavoritePrompt(promptId, this);
        });
    }
    
    // 分享按钮
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const promptId = this.getAttribute('data-prompt-id');
            handleSharePrompt(promptId);
        });
    }
    
    return cardWrapper;
}

// 设置排序选项
function setupSortOptions() {
    const sortOptions = document.querySelectorAll('.sort-option');
    if (!sortOptions.length) return;
    
    sortOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取排序方式
            const sort = this.getAttribute('data-sort');
            if (sort === currentSort) return;
            
            // 更新当前排序方式
            currentSort = sort;
            
            // 更新排序按钮文本
            const sortDropdown = document.getElementById('sortDropdown');
            if (sortDropdown) {
                let sortText;
                switch (sort) {
                    case 'newest':
                        sortText = '最新发布';
                        break;
                    case 'trending':
                        sortText = '近期热门';
                        break;
                    case 'popular':
                    default:
                        sortText = '最受欢迎';
                        break;
                }
                sortDropdown.textContent = sortText;
            }
            
            // 重置分页
            currentPage = 1;
            hasMorePrompts = true;
            
            // 重新加载提示词
            loadPrompts();
        });
    });
}

// 设置加载更多按钮
function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        // 增加页码
        currentPage++;
        
        // 加载更多提示词
        loadPrompts(true);
    });
}

// 设置搜索功能
function setupSearch() {
    const searchForm = document.querySelector('form.d-flex');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchInput = this.querySelector('input[type="search"]');
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        if (!query) return;
        
        // 跳转到搜索结果页面
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    });
}

// 加载特定分类的提示词
function loadCategoryPrompts(categoryId) {
    // 获取分类信息
    const categories = getAllCategories();
    const category = categories.find(cat => cat.id === categoryId);
    
    if (!category) return;
    
    // 更新页面标题
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDescription = document.getElementById('categoryDescription');
    
    if (categoryTitle) {
        categoryTitle.textContent = category.name;
    }
    
    if (categoryDescription) {
        categoryDescription.textContent = category.description;
    }
    
    // 获取该分类的提示词
    const prompts = getPromptsByCategory(categoryId);
    
    // 显示提示词
    const promptsGrid = document.getElementById('promptsGrid');
    if (!promptsGrid) return;
    
    // 清空网格
    promptsGrid.innerHTML = '<div class="prompt-card-sizer col-md-6 col-lg-4"></div>';
    
    // 添加提示词卡片
    prompts.forEach(prompt => {
        const promptCard = createPromptCard(prompt);
        promptsGrid.appendChild(promptCard);
    });
    
    // 重新布局Masonry
    if (window.masonryInstance) {
        imagesLoaded(promptsGrid, function() {
            window.masonryInstance.reloadItems();
            window.masonryInstance.layout();
        });
    }
}

// 加载提示词详情
function loadPromptDetail(promptId) {
    // 获取提示词信息
    const prompt = getPromptById(promptId);
    if (!prompt) {
        // 提示词不存在，显示错误信息
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger mt-5" role="alert">
                    提示词不存在或已被删除。
                    <a href="index.html" class="alert-link">返回首页</a>
                </div>
            `;
        }
        return;
    }
    
    // 增加浏览量
    incrementPromptViews(promptId);
    
    // 更新页面标题
    document.title = `${prompt.title} - AI提示词宝库`;
    
    // 更新提示词详情
    const promptTitle = document.getElementById('promptTitle');
    const promptDescription = document.getElementById('promptDescription');
    const promptImage = document.getElementById('promptImage');
    const promptContent = document.getElementById('promptContent');
    const promptAuthor = document.getElementById('promptAuthor');
    const promptAuthorAvatar = document.getElementById('promptAuthorAvatar');
    const promptDate = document.getElementById('promptDate');
    const promptLikes = document.getElementById('promptLikes');
    const promptViews = document.getElementById('promptViews');
    const promptTags = document.getElementById('promptTags');
    const promptUsageExample = document.getElementById('promptUsageExample');
    const promptExampleImage = document.getElementById('promptExampleImage');
    
    if (promptTitle) promptTitle.textContent = prompt.title;
    if (promptDescription) promptDescription.textContent = prompt.description;
    if (promptImage) promptImage.src = prompt.imageUrl;
    if (promptContent) promptContent.textContent = prompt.content;
    if (promptAuthor) promptAuthor.textContent = prompt.author.username;
    if (promptAuthorAvatar) promptAuthorAvatar.src = prompt.author.avatar;
    
    // 格式化日期
    if (promptDate) {
        const date = new Date(prompt.createdAt);
        promptDate.textContent = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    if (promptLikes) promptLikes.textContent = prompt.likes;
    if (promptViews) promptViews.textContent = prompt.views;
    
    // 添加标签
    if (promptTags) {
        promptTags.innerHTML = '';
        prompt.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            promptTags.appendChild(tagElement);
        });
    }
    
    // 使用案例
    if (promptUsageExample) promptUsageExample.textContent = prompt.usageExample;
    if (promptExampleImage) promptExampleImage.src = prompt.exampleImage;
    
    // 设置按钮状态
    const currentUser = getCurrentUser();
    const likeBtn = document.getElementById('likeBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    // 检查是否已收藏
    const isFavorited = currentUser ? currentUser.favorites.includes(promptId) : false;
    
    if (favoriteBtn) {
        if (isFavorited) {
            favoriteBtn.classList.add('active');
            favoriteBtn.querySelector('i').classList.remove('far');
            favoriteBtn.querySelector('i').classList.add('fas');
        } else {
            favoriteBtn.classList.remove('active');
            favoriteBtn.querySelector('i').classList.remove('fas');
            favoriteBtn.querySelector('i').classList.add('far');
        }
        
        // 添加收藏事件监听
        favoriteBtn.addEventListener('click', function() {
            handleFavoritePrompt(promptId, this);
        });
    }
    
    // 添加点赞事件监听
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            handleLikePrompt(promptId, this);
        });
    }
    
    // 复制按钮
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const textToCopy = prompt.content;
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // 显示复制成功提示
                    this.textContent = '已复制!';
                    setTimeout(() => {
                        this.textContent = '复制提示词';
                    }, 2000);
                })
                .catch(err => {
                    console.error('复制失败: ', err);
                    alert('复制失败，请手动复制');
                });
        });
    }
    
    // 分享按钮
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            handleSharePrompt(promptId);
        });
    }
}

// 处理点赞提示词
function handleLikePrompt(promptId, button) {
    const currentUser = getCurrentUser();
    
    // 检查用户是否登录
    if (!currentUser) {
        alert('请先登录后再点赞');
        window.location.href = 'login.html';
        return;
    }
    
    // 点赞提示词
    const newLikes = togglePromptLike(promptId, currentUser.id);
    
    // 更新按钮显示
    const likesCountElement = button.querySelector('i').nextSibling;
    if (likesCountElement) {
        likesCountElement.textContent = ` ${newLikes}`;
    } else {
        button.innerHTML = `<i class="fas fa-thumbs-up"></i> ${newLikes}`;
    }
    
    // 添加已点赞样式
    button.classList.add('active');
    
    // 更新详情页的点赞数
    const promptLikes = document.getElementById('promptLikes');
    if (promptLikes) {
        promptLikes.textContent = newLikes;
    }
}

// 处理收藏提示词
function handleFavoritePrompt(promptId, button) {
    const currentUser = getCurrentUser();
    
    // 检查用户是否登录
    if (!currentUser) {
        alert('请先登录后再收藏');
        window.location.href = 'login.html';
        return;
    }
    
    // 检查是否已收藏
    const isFavorited = currentUser.favorites.includes(promptId);
    
    if (isFavorited) {
        // 取消收藏
        removeFromFavorites(currentUser.id, promptId);
        button.classList.remove('active');
        
        // 更新图标
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    } else {
        // 添加收藏
        addToFavorites(currentUser.id, promptId);
        button.classList.add('active');
        
        // 更新图标
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    }
}

// 处理分享提示词
function handleSharePrompt(promptId) {
    // 构建分享链接
    const shareUrl = `${window.location.origin}/prompt-detail.html?id=${promptId}`;
    
    // 检查是否支持Web Share API
    if (navigator.share) {
        navigator.share({
            title: '分享AI提示词',
            url: shareUrl
        }).catch(error => {
            console.log('分享失败:', error);
            // 回退到复制链接
            copyShareLink(shareUrl);
        });
    } else {
        // 不支持Web Share API，复制链接
        copyShareLink(shareUrl);
    }
}

// 复制分享链接
function copyShareLink(url) {
    navigator.clipboard.writeText(url)
        .then(() => {
            alert('链接已复制到剪贴板');
        })
        .catch(err => {
            console.error('复制失败: ', err);
            alert('复制失败，请手动复制链接');
        });
}

// 加载用户资料
function loadUserProfile() {
    const currentUser = getCurrentUser();
    
    // 检查用户是否登录
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // 更新用户资料
    const profileUsername = document.getElementById('profileUsername');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileJoinDate = document.getElementById('profileJoinDate');
    const profilePublishedCount = document.getElementById('profilePublishedCount');
    const profileFavoritesCount = document.getElementById('profileFavoritesCount');
    
    if (profileUsername) profileUsername.textContent = currentUser.username;
    if (profileAvatar) profileAvatar.src = currentUser.avatar;
    
    // 格式化加入日期
    if (profileJoinDate) {
        const date = new Date(currentUser.createdAt);
        profileJoinDate.textContent = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long'
        });
    }
    
    // 更新统计数据
    if (profilePublishedCount) profilePublishedCount.textContent = currentUser.published.length;
    if (profileFavoritesCount) profileFavoritesCount.textContent = currentUser.favorites.length;
    
    // 加载用户发布的提示词
    loadUserPublishedPrompts(currentUser.published);
    
    // 加载用户收藏的提示词
    loadUserFavoritePrompts(currentUser.favorites);
}

// 加载用户发布的提示词
function loadUserPublishedPrompts(publishedIds) {
    const publishedGrid = document.getElementById('publishedGrid');
    if (!publishedGrid) return;
    
    // 清空网格
    publishedGrid.innerHTML = '';
    
    if (!publishedIds.length) {
        publishedGrid.innerHTML = '<div class="col-12"><p class="text-center text-muted">您还没有发布任何提示词</p></div>';
        return;
    }
    
    // 获取用户发布的提示词
    const prompts = getAllPrompts().filter(prompt => publishedIds.includes(prompt.id));
    
    // 添加提示词卡片
    prompts.forEach(prompt => {
        const promptCard = createPromptCard(prompt);
        publishedGrid.appendChild(promptCard);
    });
}

// 加载用户收藏的提示词
function loadUserFavoritePrompts(favoriteIds) {
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;
    
    // 清空网格
    favoritesGrid.innerHTML = '';
    
    if (!favoriteIds.length) {
        favoritesGrid.innerHTML = '<div class="col-12"><p class="text-center text-muted">您还没有收藏任何提示词</p></div>';
        return;
    }
    
    // 获取用户收藏的提示词
    const prompts = getUserFavorites(favoriteIds);
    
    // 添加提示词卡片
    prompts.forEach(prompt => {
        const promptCard = createPromptCard(prompt);
        favoritesGrid.appendChild(promptCard);
    });
}

// 设置创建提示词表单
function setupCreatePromptForm() {
    const createPromptForm = document.getElementById('createPromptForm');
    if (!createPromptForm) return;
    
    // 获取当前用户
    const currentUser = getCurrentUser();
    
    // 检查用户是否登录
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // 加载分类选项
    loadCategoryOptions();
    
    // 处理表单提交
    createPromptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const title = document.getElementById('promptTitle').value;
        const description = document.getElementById('promptDescription').value;
        const content = document.getElementById('promptContent').value;
        const category = document.getElementById('promptCategory').value;
        const tagsInput = document.getElementById('promptTags').value;
        const imageUrl = document.getElementById('promptImageUrl').value;
        const usageExample = document.getElementById('promptUsageExample').value;
        const exampleImageUrl = document.getElementById('promptExampleImageUrl').value;
        
        // 处理标签
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // 创建提示词数据
        const promptData = {
            title,
            description,
            content,
            category,
            tags,
            imageUrl,
            usageExample,
            exampleImage: exampleImageUrl
        };
        
        // 创建新提示词
        try {
            const newPrompt = createPrompt(
                promptData,
                currentUser.id,
                currentUser.username,
                currentUser.avatar
            );
            
            // 添加到用户发布列表
            addToPublished(currentUser.id, newPrompt.id);
            
            // 跳转到提示词详情页
            window.location.href = `prompt-detail.html?id=${newPrompt.id}`;
        } catch (error) {
            alert('创建提示词失败: ' + error.message);
        }
    });
}

// 加载分类选项
function loadCategoryOptions() {
    const categorySelect = document.getElementById('promptCategory');
    if (!categorySelect) return;
    
    // 获取所有分类
    const categories = getAllCategories();
    
    // 添加分类选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}
