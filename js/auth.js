/**
 * 认证相关功能
 */

// 用户数据存储在本地存储中
const USERS_STORAGE_KEY = 'ai_prompt_users';
const CURRENT_USER_KEY = 'ai_prompt_current_user';

// 初始化用户存储
function initUserStorage() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    }
}

// 获取所有用户
function getAllUsers() {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
}

// 保存用户数据
function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// 注册新用户
function registerUser(username, email, password) {
    const users = getAllUsers();
    
    // 检查用户名或邮箱是否已存在
    const userExists = users.some(user => 
        user.username === username || user.email === email
    );
    
    if (userExists) {
        throw new Error('用户名或邮箱已被注册');
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // 注意：实际应用中应该加密存储密码
        avatar: 'assets/images/avatar-placeholder.png',
        createdAt: new Date().toISOString(),
        favorites: [],
        published: []
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return newUser;
}

// 用户登录
function loginUser(usernameOrEmail, password, rememberMe = false) {
    const users = getAllUsers();
    
    // 查找匹配的用户
    const user = users.find(user => 
        (user.username === usernameOrEmail || user.email === usernameOrEmail) && 
        user.password === password
    );
    
    if (!user) {
        throw new Error('用户名/邮箱或密码不正确');
    }
    
    // 存储当前用户信息（不包含密码）
    const userInfo = { ...user };
    delete userInfo.password;
    
    // 设置登录状态
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo));
    
    // 如果选择"记住我"，设置一个较长的过期时间
    if (rememberMe) {
        // 这里可以设置一个cookie或其他方式实现"记住我"功能
        // 简单实现：设置一个标记
        localStorage.setItem('remember_login', 'true');
    }
    
    return userInfo;
}

// 获取当前登录用户
function getCurrentUser() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

// 退出登录
function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('remember_login');
}

// 更新用户信息
function updateUserProfile(userId, updateData) {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
        throw new Error('用户不存在');
    }
    
    // 更新用户数据
    users[userIndex] = { ...users[userIndex], ...updateData };
    saveUsers(users);
    
    // 如果是当前登录用户，也更新当前用户信息
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updateData };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
    
    return users[userIndex];
}

// 添加提示词到收藏
function addToFavorites(userId, promptId) {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
        throw new Error('用户不存在');
    }
    
    // 检查是否已收藏
    if (!users[userIndex].favorites.includes(promptId)) {
        users[userIndex].favorites.push(promptId);
        saveUsers(users);
        
        // 更新当前用户信息
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.favorites.push(promptId);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    }
}

// 从收藏中移除提示词
function removeFromFavorites(userId, promptId) {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
        throw new Error('用户不存在');
    }
    
    // 从收藏中移除
    users[userIndex].favorites = users[userIndex].favorites.filter(id => id !== promptId);
    saveUsers(users);
    
    // 更新当前用户信息
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        currentUser.favorites = currentUser.favorites.filter(id => id !== promptId);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
}

// 检查提示词是否已收藏
function isPromptFavorited(promptId) {
    const currentUser = getCurrentUser();
    return currentUser ? currentUser.favorites.includes(promptId) : false;
}

// 添加提示词到用户发布列表
function addToPublished(userId, promptId) {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
        throw new Error('用户不存在');
    }
    
    if (!users[userIndex].published.includes(promptId)) {
        users[userIndex].published.push(promptId);
        saveUsers(users);
        
        // 更新当前用户信息
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.published.push(promptId);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    }
}

// 从用户发布列表中移除提示词
function removeFromPublished(userId, promptId) {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
        throw new Error('用户不存在');
    }
    
    users[userIndex].published = users[userIndex].published.filter(id => id !== promptId);
    saveUsers(users);
    
    // 更新当前用户信息
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        currentUser.published = currentUser.published.filter(id => id !== promptId);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户存储
    initUserStorage();
    
    // 检查登录状态并更新UI
    updateAuthUI();
    
    // 处理登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 处理注册表单提交
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 处理退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 处理密码显示切换
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });
});

// 更新认证相关UI
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.querySelector('.user-profile');
    
    if (!authButtons || !userProfile) return;
    
    if (currentUser) {
        // 用户已登录
        authButtons.classList.add('d-none');
        userProfile.classList.remove('d-none');
        
        // 更新用户信息
        const usernameElement = userProfile.querySelector('.username');
        const avatarElement = userProfile.querySelector('img');
        
        if (usernameElement) usernameElement.textContent = currentUser.username;
        if (avatarElement) avatarElement.src = currentUser.avatar;
    } else {
        // 用户未登录
        authButtons.classList.remove('d-none');
        userProfile.classList.add('d-none');
    }
}

// 处理登录表单提交
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        loginUser(username, password, rememberMe);
        // 登录成功，跳转到首页
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
}

// 处理注册表单提交
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证密码
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    // 验证密码长度
    if (password.length < 8) {
        alert('密码至少需要8个字符');
        return;
    }
    
    try {
        registerUser(username, email, password);
        // 注册成功，自动登录并跳转到首页
        loginUser(username, password);
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
}

// 处理退出登录
function handleLogout(event) {
    event.preventDefault();
    
    logoutUser();
    // 更新UI或跳转到首页
    window.location.href = 'index.html';
}

// 切换密码可见性
function togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const passwordInput = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}
