// JS/cookie.js - Cookie 管理工具
const CookieUtil = {
    // 设置 Cookie（有效期默认7天）
    set: function(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    },
    
    // 获取 Cookie
    get: function(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) {
            try {
                return JSON.parse(decodeURIComponent(match[2]));
            } catch (e) {
                return match[2];
            }
        }
        return null;
    },
    
    // 删除 Cookie
    remove: function(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    },
    
    // 保存用户信息到 Cookie
    saveUserInfo: function(userInfo) {
        if (userInfo) {
            this.set('fcl_user', userInfo);
        }
    },
    
    // 获取用户信息
    getUserInfo: function() {
        return this.get('fcl_user');
    },
    
    // 清除用户信息
    clearUserInfo: function() {
        this.remove('fcl_user');
    }
};

// 显式挂到 window，方便 Vue 组件通过 window.CookieUtil 访问
window.CookieUtil = CookieUtil;