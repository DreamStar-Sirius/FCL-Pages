// JS/config.js
(function() {
    // 检查是否有缓存且未过期（5分钟）
    const CACHE_KEY = 'fcl_profile_cache';
    const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟
    
    window.CONFIG = {
		SUPABASE_URL: 'https://sjapvrszxpxyvqoseodr.supabase.co',
		SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYXB2cnN6eHB4eXZxb3Nlb2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzE5OTcsImV4cCI6MjA5NDUwNzk5N30.j8aLK4XK2fzHW9wLnyRp0yBXACKa0noKkQUw2B7qcOk',
		APP_NAME: 'Furnace Craft Launcher',
		APP_SHORT: 'FCL',
		GITHUB_REPO: 'https://github.com/ShortYard941746/Furnace_Craft_Launcher',
		DOWNLOAD_URL: 'https://v6.gh-proxy.com/https://github.com/ShortYard941746/MFSDT-Update/releases/latest/download/Update.zip',
		LANZOUYUN_URL: 'https://wwi.lanzoup.com/xxx',  // 添加蓝奏云链接
		DONATE_URL: 'https://www.ifdian.net/a/ShortYard941746'  // 添加捐赠链接
	};
    
    // 缓存工具
    window.CacheUtil = {
        set: function(key, data) {
            const item = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(item));
        },
        get: function(key) {
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
                localStorage.removeItem(key);
                return null;
            }
            return parsed.data;
        },
        clear: function(key) {
            if (key) {
                localStorage.removeItem(key);
            } else {
                localStorage.clear();
            }
        }
    };
    
    window.dispatchEvent(new Event('configLoaded'));
})();