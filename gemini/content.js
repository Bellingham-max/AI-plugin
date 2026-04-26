/**
 * Gemini Navigator - Content Script
 * Phase 2: UI Injection (Shadow DOM)
 */

(function() {
    console.log('🚀 Gemini Navigator Phase 2: UI Injection starting...');

    // 1. 创建 Shadow Host
    const host = document.createElement('div');
    host.id = 'gemini-nav-ext-host';
    document.body.appendChild(host);

    // 2. 创建 Shadow Root
    const shadow = host.attachShadow({ mode: 'open' });

    // 3. 定义 CSS 样式 (V8.0 动态光晕 + 品牌色增强)
    const css = `
        :host {
            --sidebar-width: 380px;
            --primary-color: #1a73e8;
            --google-blue: #4285f4;
            --google-red: #ea4335;
            --google-yellow: #fbbc05;
            --google-green: #34a853;
            
            --surface: rgba(255, 255, 255, 0.85);
            --on-surface: #1f1f1f;
            --on-surface-variant: #5f6368;
            --outline-variant: rgba(0, 0, 0, 0.08);
            --transition-spring: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 999999;
            pointer-events: none;
            font-family: 'Google Sans', 'Inter', system-ui, -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        /* 悬浮按钮 - 增强光晕 Halo Effect */
        .toggle-btn {
            position: fixed;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #ffffff;
            border: 1px solid #dcdcdc;
            box-shadow: 
                0 2px 10px rgba(0,0,0,0.08),
                0 0 15px rgba(66, 133, 244, 0.15),
                0 0 30px rgba(155, 81, 224, 0.1);
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            z-index: 1000;
            user-select: none;
            touch-action: none;
            transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease;
            animation: halo-pulse 3s infinite alternate;
        }

        @keyframes halo-pulse {
            from { box-shadow: 0 2px 10px rgba(0,0,0,0.08), 0 0 10px rgba(66, 133, 244, 0.1); }
            to { box-shadow: 0 2px 15px rgba(0,0,0,0.1), 0 0 25px rgba(66, 133, 244, 0.25), 0 0 45px rgba(155, 81, 224, 0.15); }
        }

        .toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 30px rgba(66, 133, 244, 0.3);
            border-color: #c0c0c0;
        }

        /* 动态彩色渐变 Gemini 星标 */
        .gemini-star {
            width: 30px;
            height: 30px;
            animation: star-rotate 8s linear infinite;
        }

        @keyframes star-rotate {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }

        :host([open]) .toggle-btn {
            opacity: 0;
            pointer-events: none;
            transform: scale(0.8);
        }

        /* 极简专业侧边栏 */
        .sidebar {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: var(--sidebar-width);
            background: var(--surface);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            color: var(--on-surface);
            box-shadow: -10px 0 40px rgba(0,0,0,0.05);
            border-left: 1px solid var(--outline-variant);
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.05, 0.7, 0.1, 1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        :host([open]) .sidebar {
            transform: translateX(0);
        }

        .header {
            padding: 40px 32px 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-title-group {
            display: flex;
            align-items: baseline;
            gap: 8px;
        }

        .header-title {
            font-size: 24px;
            font-weight: 500;
            color: var(--on-surface);
            letter-spacing: -0.02em;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .sort-btn {
            background: rgba(0, 0, 0, 0.04);
            border: none;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 8px;
            color: var(--on-surface-variant);
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }

        .sort-btn:hover {
            background: rgba(0, 0, 0, 0.08);
            color: var(--on-surface);
        }

        @media (prefers-color-scheme: dark) {
            .sort-btn { background: rgba(255, 255, 255, 0.08); }
            .sort-btn:hover { background: rgba(255, 255, 255, 0.12); }
        }

        .count-badge {
            font-size: 13px;
            color: var(--on-surface-variant);
            font-weight: 400;
        }

        /* 搜索框 - 极简线条感 */
        .search-container {
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-input {
            width: 100%;
            padding: 12px 12px 12px 40px;
            border-radius: 12px;
            border: 1px solid transparent;
            background: rgba(0, 0, 0, 0.04);
            font-size: 15px;
            color: var(--on-surface);
            outline: none;
            transition: all 0.2s ease;
        }

        .search-input:focus {
            background: #ffffff;
            border-color: var(--google-blue);
            box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.1);
        }

        .search-icon {
            position: absolute;
            left: 14px;
            color: var(--on-surface-variant);
            opacity: 0.7;
            pointer-events: none;
        }

        .content {
            flex: 1;
            overflow-y: auto;
            padding: 0 16px 40px;
        }

        /* 隐藏滚动条但保留功能 */
        .content::-webkit-scrollbar {
            width: 4px;
        }
        .content::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.1);
            border-radius: 10px;
        }

        .outline-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .outline-item {
            padding: 14px 16px;
            margin-bottom: 2px;
            cursor: pointer;
            font-size: 14px;
            border-radius: 10px;
            transition: all 0.2s ease;
            display: flex;
            align-items: flex-start;
            gap: 16px;
            position: relative;
            animation: slide-in 0.4s ease forwards;
            opacity: 0;
        }

        @keyframes slide-in {
            from { transform: translateX(10px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .outline-item .index-box {
            font-size: 11px;
            font-weight: 500;
            color: var(--on-surface-variant);
            width: 20px;
            padding-top: 3px;
            flex-shrink: 0;
            font-variant-numeric: tabular-nums;
        }

        .outline-item .title-wrapper {
            flex: 1;
            min-width: 0;
        }

        .outline-item .title {
            color: var(--on-surface);
            font-weight: 400;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            word-break: break-word;
        }

        .outline-item:hover {
            background: rgba(0, 0, 0, 0.03);
        }

        .outline-item.active {
            background: rgba(66, 133, 244, 0.08);
        }

        .outline-item.active .title {
            color: var(--google-blue);
            font-weight: 500;
        }

        .outline-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 12px;
            bottom: 12px;
            width: 3px;
            background: var(--google-blue);
            border-radius: 0 4px 4px 0;
        }

        /* 暗黑模式适配 - 更加深邃专业 */
        @media (prefers-color-scheme: dark) {
            :host {
                --surface: rgba(30, 31, 32, 0.8);
                --on-surface: #e3e3e3;
                --on-surface-variant: #9aa0a6;
                --outline-variant: rgba(255, 255, 255, 0.08);
            }
            .toggle-btn {
                background: #202124;
                border-color: #3c4043;
            }
            .sidebar { border-left: 1px solid #3c4043; box-shadow: -10px 0 40px rgba(0,0,0,0.2); }
            .search-input { background: rgba(255, 255, 255, 0.06); }
            .search-input:focus { background: #1e1f20; }
            .outline-item:hover { background: rgba(255, 255, 255, 0.04); }
            .outline-item.active { background: rgba(138, 180, 248, 0.12); }
            .outline-item.active .title { color: #8ab4f8; }
            .outline-item.active::before { background: #8ab4f8; }
        }

        .close-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            color: var(--on-surface-variant);
            display: flex;
            transition: all 0.2s;
        }
        .close-btn:hover {
            background: rgba(0, 0, 0, 0.06);
            color: var(--on-surface);
        }
        @media (prefers-color-scheme: dark) {
            .close-btn:hover { background: rgba(255, 255, 255, 0.1); }
        }
    `;

    // 4. 构建 HTML 结构
    const template = `
        <style>${css}</style>
        <button class="toggle-btn" id="draggable-sphere" title="点击展开，拖拽移动">
            <!-- 彩色渐变 Gemini 星标 - 匹配用户图片 -->
            <svg class="gemini-star" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4285F4" />
                        <stop offset="33%" stop-color="#EA4335" />
                        <stop offset="66%" stop-color="#FBBC05" />
                        <stop offset="100%" stop-color="#34A853" />
                    </linearGradient>
                </defs>
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#gemini-gradient)"/>
            </svg>
        </button>
        <div class="sidebar">
            <div class="header">
                <div class="header-top">
                    <div class="header-title-group">
                        <span class="header-title">Gemini Navigator</span>
                        <span class="count-badge" id="nav-count">0</span>
                    </div>
                    <div class="header-actions">
                        <button class="sort-btn" id="sort-toggle" title="切换排序方向">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>
                            <span id="sort-text">顺序</span>
                        </button>
                        <button class="close-btn" title="收起">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
                <div class="search-container">
                    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" class="search-input" id="nav-search" placeholder="搜索对话...">
                </div>
            </div>
            <div class="content">
                <ul class="outline-list" id="outline-list">
                    <li class="outline-item" style="color: #888; justify-content: center; cursor: default; background: transparent; border:none;">扫描中...</li>
                </ul>
            </div>
        </div>
    `;

    shadow.innerHTML = template;

    // 5. 交互与拖拽逻辑
    const toggleBtn = shadow.querySelector('.toggle-btn');
    const closeBtn = shadow.querySelector('.close-btn');
    const searchInput = shadow.querySelector('#nav-search');
    const navCount = shadow.querySelector('#nav-count');
    const sortToggle = shadow.querySelector('#sort-toggle');
    const sortText = shadow.querySelector('#sort-text');

    let isReversed = false; // 默认顺序（最早在顶）

    // 初始位置
    let posX = window.innerWidth - 100;
    let posY = window.innerHeight - 100;
    toggleBtn.style.left = posX + 'px';
    toggleBtn.style.top = posY + 'px';

    const toggleSidebar = () => {
        const isOpen = host.hasAttribute('open');
        if (isOpen) {
            host.removeAttribute('open');
        } else {
            host.setAttribute('open', '');
        }
    };

    // 拖拽逻辑实现
    let isDragging = false;
    let startX, startY;
    let moved = false;

    toggleBtn.addEventListener('mousedown', (e) => {
        isDragging = true;
        moved = false;
        startX = e.clientX - toggleBtn.offsetLeft;
        startY = e.clientY - toggleBtn.offsetTop;
        toggleBtn.style.transition = 'none'; // 拖拽时禁用动画
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        moved = true;
        
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;

        // 边界限制
        newX = Math.max(10, Math.min(window.innerWidth - 62, newX));
        newY = Math.max(10, Math.min(window.innerHeight - 62, newY));

        toggleBtn.style.left = newX + 'px';
        toggleBtn.style.top = newY + 'px';
        
        posX = newX;
        posY = newY;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        toggleBtn.style.transition = 'transform 0.2s';
        
        // 如果移动距离极小，视为点击
        if (!moved) {
            toggleSidebar();
        }
    });

    closeBtn.addEventListener('click', toggleSidebar);

    // 搜索过滤逻辑
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        lastPromptsHash = ''; // 搜索时强制触发 scanConversations 以便应用过滤
        scanConversations();
    });

    // 排序切换逻辑
    sortToggle.addEventListener('click', () => {
        isReversed = !isReversed;
        sortText.textContent = isReversed ? '倒序' : '顺序';
        lastPromptsHash = ''; // 强制触发重绘
        scanConversations();
    });

    // 6. 点击外部自动关闭
    document.addEventListener('click', (e) => {
        if (host.hasAttribute('open')) {
            const path = e.composedPath();
            if (!path.includes(host)) {
                toggleSidebar();
            }
        }
    });

    // --- Phase 3: 核心逻辑 - DOM 遍历与监听 ---

    const outlineList = shadow.querySelector('#outline-list');
    let lastPromptsHash = ''; // 用于记录上次扫描的状态

    /**
     * 简单的哈希函数，用于判断对话列表是否发生实质性变化
     */
    const getPromptsHash = (prompts) => {
        return prompts.length + '-' + (prompts.length > 0 ? prompts[prompts.length - 1].innerText.length : 0);
    };

    /**
     * 提取 Prompt 标题：前 20 个字符，处理换行
     */
    const getPromptTitle = (text) => {
        if (!text) return '未知对话';
        const firstLine = text.trim().split('\n')[0];
        return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine;
    };

    /**
     * 创建大纲列表项
     */
    const createOutlineItem = (title, elementId, index) => {
        const li = document.createElement('li');
        li.className = 'outline-item';
        li.dataset.targetId = elementId;
        li.dataset.originalIndex = index; // 保存索引作为备份
        
        li.innerHTML = `
            <div class="index-box">${String(index + 1).padStart(2, '0')}</div>
            <div class="title-wrapper">
                <div class="title" title="${title}">${title}</div>
            </div>
        `;
        
        // 点击跳转逻辑
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 尝试通过 ID 查找
            let target = document.querySelector(`[data-gemnav-id="${elementId}"]`);
            
            // 备份方案：如果 ID 丢失（由于 Gemini DOM 刷新），尝试通过索引重新匹配
            if (!target) {
                console.warn('⚠️ Target ID not found, trying fallback index...');
                const allPrompts = document.querySelectorAll('.query-text-line');
                target = allPrompts[index];
            }

            if (target) {
                // 确保 ID 正确绑定（防止备份方案匹配后下次还找不到）
                target.setAttribute('data-gemnav-id', elementId);
                
                // 执行跳转
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // 视觉反馈：让目标元素闪烁一下
                target.style.transition = 'background-color 0.5s';
                const originalBg = target.style.backgroundColor;
                target.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
                setTimeout(() => {
                    target.style.backgroundColor = originalBg;
                }, 1000);

                // 侧边栏高亮逻辑
                shadow.querySelectorAll('.outline-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
            } else {
                console.error('❌ Could not find jump target even with fallback.');
                // 尝试重新扫描
                scanConversations();
            }
        });

        return li;
    };

    /**
     * 扫描并识别对话块
     */
    const scanConversations = () => {
        // 根据你提供的 HTML 结构，使用 .query-text-line 作为识别特征
        const prompts = Array.from(document.querySelectorAll('.query-text-line'));
        const currentSearchTerm = searchInput.value.toLowerCase().trim();
        
        // 性能优化：检查是否有实质性变化
        const currentHash = getPromptsHash(prompts);
        // 如果长度没变，且搜索框没有内容（因为搜索时必须重绘），且排序没变，则跳过
        if (currentHash === lastPromptsHash && !currentSearchTerm) {
            return;
        }
        lastPromptsHash = currentHash;
        
        // 更新计数
        if (navCount) navCount.textContent = prompts.length;
        
        // 清空当前列表（除了初始提示）
        outlineList.innerHTML = '';
        
        if (prompts.length === 0) {
            outlineList.innerHTML = '<li class="outline-item" style="color: #888; justify-content: center; cursor: default; background: transparent; border:none;">扫描中...</li>';
            return;
        }

        // 预处理列表：如果是倒序，则翻转数组
        const displayPrompts = isReversed ? [...prompts].reverse() : prompts;

        displayPrompts.forEach((promptEl, displayIndex) => {
            // 获取在原始 DOM 中的实际索引
            const originalIndex = prompts.indexOf(promptEl);
            const msgId = `msg-${originalIndex}`;
            
            // 强制重新绑定 ID，确保跳转始终有效
            // 之前的 if (!promptEl.hasAttribute) 逻辑在 Gemini 动态更新 DOM 时会导致 ID 错位
            promptEl.setAttribute('data-gemnav-id', msgId);
            
            const title = getPromptTitle(promptEl.innerText);
            const item = createOutlineItem(title, msgId, originalIndex);
            
            // 逐个入场动画延迟
            item.style.animationDelay = `${displayIndex * 0.05}s`;
            
            // 应用当前搜索过滤
            if (currentSearchTerm && !title.toLowerCase().includes(currentSearchTerm)) {
                item.style.display = 'none';
            }
            
            outlineList.appendChild(item);
        });
    };

    /**
     * 监听 DOM 变化
     */
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                // 检查是否有新的 .query-text-line 加入
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList.contains('query-text-line') || node.querySelector('.query-text-line')) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                }
            }
            if (shouldUpdate) break;
        }

        if (shouldUpdate) {
            console.log('🔄 Detected new conversation, updating outline...');
            scanConversations();
        }
    });

    // 开始监听整个 body，Gemini 是单页应用，对话容器可能会被动态销毁或创建
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初始扫描
    setTimeout(scanConversations, 2000);
    
    // 每隔 10 秒兜底扫描一次，且只有在页面静止时尝试，避免频繁重绘
    setInterval(() => {
        if (!isDragging && !host.hasAttribute('open')) {
            // 侧边栏关闭时可以在后台更新数据
            scanConversations();
        }
    }, 10000);

    // --- Phase 4: 双向联动 (Jump & Scroll Sync) ---

    /**
     * 更新侧边栏高亮状态
     */
    const updateActiveHighlight = () => {
        const prompts = document.querySelectorAll('.query-text-line');
        let currentActiveId = null;

        // 寻找当前视口中最靠上的对话块
        // 增加容错：如果滚动到了最顶部，直接激活第一个
        if (window.scrollY < 50) {
            const firstPrompt = document.querySelector('.query-text-line');
            if (firstPrompt) currentActiveId = firstPrompt.getAttribute('data-gemnav-id');
        } else {
            for (const prompt of prompts) {
                const rect = prompt.getBoundingClientRect();
                // 优化识别逻辑：增加偏移量判断
                if (rect.top < window.innerHeight * 0.4 && rect.bottom > 0) {
                    currentActiveId = prompt.getAttribute('data-gemnav-id');
                }
            }
        }

        if (currentActiveId) {
            const items = shadow.querySelectorAll('.outline-item');
            items.forEach(item => {
                if (item.dataset.targetId === currentActiveId) {
                    item.classList.add('active');
                    // 自动滚动侧边栏以确保高亮项可见
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    item.classList.remove('active');
                }
            });
        }
    };

    // 监听滚动事件，使用节流（Throttle）优化性能
    let isScrolling;
    const scrollHandler = () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            updateActiveHighlight();
        }, 100);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    /**
     * 自动寻找并监听 Gemini 内部的滚动容器
     */
    const observeScrollContainer = () => {
        // Gemini 的主要滚动区域通常在消息列表容器上
        // 尝试匹配常见的聊天记录容器特征
        const possibleContainers = [
            'main',
            '.chat-history',
            '.messages-container',
            '[role="main"]',
            '.discussion-container'
        ];

        let found = false;
        for (const selector of possibleContainers) {
            const container = document.querySelector(selector);
            if (container && (container.scrollHeight > container.clientHeight)) {
                container.addEventListener('scroll', scrollHandler, { passive: true });
                console.log(`📍 Found scroll container: ${selector}`);
                found = true;
                break;
            }
        }

        // 如果没找到明确的，就监听所有具有 overflow-y: auto/scroll 的 div
        if (!found) {
            const allDivs = document.querySelectorAll('div');
            for (const div of allDivs) {
                const style = window.getComputedStyle(div);
                if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && div.scrollHeight > div.clientHeight) {
                    div.addEventListener('scroll', scrollHandler, { passive: true });
                    console.log('📍 Found an overflow div to listen');
                    break;
                }
            }
        }
    };

    // 延迟执行以等待页面加载
    setTimeout(observeScrollContainer, 3000);
    // 兜底再次检查，因为 Gemini 是 SPA
    setInterval(observeScrollContainer, 10000);

    // 初始高亮检查
    setTimeout(updateActiveHighlight, 3000);

    console.log('✅ Phase 4: Bi-directional sync active.');
})();

