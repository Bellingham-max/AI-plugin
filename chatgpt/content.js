/**
 * ChatGPT Navigator - Content Script
 * Adapted from Gemini Navigator
 */

(function() {
    console.log('🚀 ChatGPT Navigator starting...');

    // 1. 创建 Shadow Host
    const host = document.createElement('div');
    host.id = 'chatgpt-nav-ext-host';
    document.body.appendChild(host);

    // 2. 创建 Shadow Root
    const shadow = host.attachShadow({ mode: 'open' });

    // 3. 定义 CSS 样式 (适配 ChatGPT 风格)
    const css = `
        :host {
            --sidebar-width: 380px;
            --primary-color: #10a37f; /* ChatGPT Green */
            --primary-hover: #1a7f64;
            
            --surface: rgba(255, 255, 255, 0.9);
            --on-surface: #353740;
            --on-surface-variant: #6e6e80;
            --outline-variant: rgba(0, 0, 0, 0.1);
            --transition-spring: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 999999;
            pointer-events: none;
            font-family: Söhne, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', sans-serif, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
            -webkit-font-smoothing: antialiased;
        }

        /* 悬浮按钮 */
        .toggle-btn {
            position: fixed;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #ffffff;
            border: 1px solid #dcdcdc;
            box-shadow: 
                0 2px 10px rgba(0,0,0,0.08),
                0 0 15px rgba(16, 163, 127, 0.1);
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
            from { box-shadow: 0 2px 10px rgba(0,0,0,0.08), 0 0 10px rgba(16, 163, 127, 0.1); }
            to { box-shadow: 0 2px 15px rgba(0,0,0,0.1), 0 0 25px rgba(16, 163, 127, 0.2), 0 0 45px rgba(16, 163, 127, 0.1); }
        }

        .toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 30px rgba(16, 163, 127, 0.3);
            border-color: #c0c0c0;
        }

        /* GPT Logo 动画 */
        .gpt-logo {
            width: 30px;
            height: 30px;
            color: var(--primary-color);
            transition: color 0.3s ease;
        }

        :host([open]) .toggle-btn {
            opacity: 0;
            pointer-events: none;
            transform: scale(0.8);
        }

        /* 侧边栏 */
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

        .count-badge {
            font-size: 13px;
            color: var(--on-surface-variant);
            font-weight: 400;
        }

        /* 搜索框 */
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
            border-color: var(--primary-color);
            box-shadow: 0 0 0 4px rgba(16, 163, 127, 0.1);
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
            background: rgba(16, 163, 127, 0.08);
        }

        .outline-item.active .title {
            color: var(--primary-color);
            font-weight: 500;
        }

        .outline-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 12px;
            bottom: 12px;
            width: 3px;
            background: var(--primary-color);
            border-radius: 0 4px 4px 0;
        }

        /* 暗黑模式适配 */
        @media (prefers-color-scheme: dark) {
            :host {
                --surface: rgba(43, 44, 52, 0.9);
                --on-surface: #ececf1;
                --on-surface-variant: #acacbe;
                --outline-variant: rgba(255, 255, 255, 0.1);
            }
            .toggle-btn {
                background: #343541;
                border-color: #4d4d4f;
            }
            .sidebar { border-left: 1px solid #4d4d4f; box-shadow: -10px 0 40px rgba(0,0,0,0.3); }
            .search-input { background: rgba(255, 255, 255, 0.05); }
            .search-input:focus { background: #202123; }
            .outline-item:hover { background: rgba(255, 255, 255, 0.05); }
            .outline-item.active { background: rgba(16, 163, 127, 0.15); }
            .outline-item.active .title { color: #10a37f; }
            .outline-item.active::before { background: #10a37f; }
            .sort-btn { background: rgba(255, 255, 255, 0.05); }
            .sort-btn:hover { background: rgba(255, 255, 255, 0.1); }
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
            <!-- ChatGPT 经典 Logo -->
            <svg class="gpt-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9066 6.0462 6.0462 0 0 0-3.947-3.1278 6.0277 6.0277 0 0 0-5.4385 1.2024 6.0536 6.0536 0 0 0-2.9443-1.1027 6.0714 6.0714 0 0 0-5.3209 2.3751 6.037 6.037 0 0 0-1.4951 5.3069 6.0536 6.0536 0 0 0-.5734 4.988 6.069 6.069 0 0 0 4.043 3.0348 6.0551 6.0551 0 0 0 5.4446-1.2035 6.0536 6.0536 0 0 0 2.9443 1.1027 6.0769 6.0769 0 0 0 5.3222-2.375 6.0357 6.0357 0 0 0 1.4805-5.3073 6.013 6.013 0 0 0 .5429-4.987zm-9.3771 12.08a4.4996 4.4996 0 0 1-2.2565-.6038l-.0466-.0267V15.247l4.4701-2.5807 4.4761 2.5902v5.0449a4.4685 4.4685 0 0 1-4.3924 2.2982 4.4751 4.4751 0 0 1-2.2507-.6985zM4.3931 19.1688a4.4685 4.4685 0 0 1-.5734-4.428l.0227-.0548 4.3474 2.5099v5.166l-4.4214-2.5654a4.5066 4.5066 0 0 1-1.7544-2.2146 4.4731 4.4731 0 0 1 .3791-2.4131zm0-10.3376a4.4996 4.4996 0 0 1 1.683-1.6533l.0512-.0293 4.3474 2.5099v5.166l-4.4214-2.5654a4.5066 4.5066 0 0 1-1.7544-2.2146 4.4731 4.4731 0 0 1 .3791-2.4131zm15.2138-1.6533l.0512.0293 4.3474 2.5099V14.883l-4.4214-2.5654a4.5066 4.5066 0 0 1-1.7544-2.2146 4.4731 4.4731 0 0 1 .3791-2.4131 4.4996 4.4996 0 0 1 1.683-1.6533zm-2.1009-4.7208l4.4701 2.5807v5.1812l-4.4761-2.5902V2.4571zm-9.5825 2.5807l4.4701 2.5807v5.1812l-4.4761-2.5902V5.0378z" fill="currentColor"/>
            </svg>
        </button>
        <div class="sidebar">
            <div class="header">
                <div class="header-top">
                    <div class="header-title-group">
                        <span class="header-title">ChatGPT Navigator</span>
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

    let isReversed = false;

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

    let isDragging = false;
    let startX, startY;
    let moved = false;

    toggleBtn.addEventListener('mousedown', (e) => {
        isDragging = true;
        moved = false;
        startX = e.clientX - toggleBtn.offsetLeft;
        startY = e.clientY - toggleBtn.offsetTop;
        toggleBtn.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        moved = true;
        
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;

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
        if (!moved) {
            toggleSidebar();
        }
    });

    closeBtn.addEventListener('click', toggleSidebar);

    searchInput.addEventListener('input', (e) => {
        lastPromptsHash = ''; 
        scanConversations();
    });

    sortToggle.addEventListener('click', () => {
        isReversed = !isReversed;
        sortText.textContent = isReversed ? '倒序' : '顺序';
        lastPromptsHash = ''; 
        scanConversations();
    });

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
    let lastPromptsHash = '';

    const getPromptsHash = (prompts) => {
        return prompts.length + '-' + (prompts.length > 0 ? prompts[prompts.length - 1].innerText.length : 0);
    };

    const getPromptTitle = (text) => {
        if (!text) return '未知对话';
        const firstLine = text.trim().split('\n')[0];
        return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine;
    };

    const createOutlineItem = (title, elementId, index) => {
        const li = document.createElement('li');
        li.className = 'outline-item';
        li.dataset.targetId = elementId;
        li.dataset.originalIndex = index;
        
        li.innerHTML = `
            <div class="index-box">${String(index + 1).padStart(2, '0')}</div>
            <div class="title-wrapper">
                <div class="title" title="${title}">${title}</div>
            </div>
        `;
        
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            let target = document.querySelector(`[data-gptnav-id="${elementId}"]`);
            
            if (!target) {
                // ChatGPT Fallback: User messages usually in article or div[data-message-author-role="user"]
                const allPrompts = document.querySelectorAll('[data-message-author-role="user"]');
                target = allPrompts[index];
            }

            if (target) {
                target.setAttribute('data-gptnav-id', elementId);
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                target.style.transition = 'background-color 0.5s';
                const originalBg = target.style.backgroundColor;
                target.style.backgroundColor = 'rgba(16, 163, 127, 0.1)';
                setTimeout(() => {
                    target.style.backgroundColor = originalBg;
                }, 1000);

                shadow.querySelectorAll('.outline-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
            } else {
                scanConversations();
            }
        });

        return li;
    };

    const scanConversations = () => {
        // ChatGPT selector: data-message-author-role="user"
        const prompts = Array.from(document.querySelectorAll('[data-message-author-role="user"]'));
        const currentSearchTerm = searchInput.value.toLowerCase().trim();
        
        const currentHash = getPromptsHash(prompts);
        if (currentHash === lastPromptsHash && !currentSearchTerm) {
            return;
        }
        lastPromptsHash = currentHash;
        
        if (navCount) navCount.textContent = prompts.length;
        outlineList.innerHTML = '';
        
        if (prompts.length === 0) {
            outlineList.innerHTML = '<li class="outline-item" style="color: #888; justify-content: center; cursor: default; background: transparent; border:none;">等待对话开始...</li>';
            return;
        }

        const displayPrompts = isReversed ? [...prompts].reverse() : prompts;

        displayPrompts.forEach((promptEl, displayIndex) => {
            const actualIndex = isReversed ? prompts.length - 1 - displayIndex : displayIndex;
            const text = promptEl.innerText;
            const title = getPromptTitle(text);
            
            if (currentSearchTerm && !title.toLowerCase().includes(currentSearchTerm) && !text.toLowerCase().includes(currentSearchTerm)) {
                return;
            }

            let elementId = promptEl.getAttribute('data-gptnav-id');
            if (!elementId) {
                elementId = 'gpt-nav-' + Date.now() + '-' + actualIndex;
                promptEl.setAttribute('data-gptnav-id', elementId);
            }

            const item = createOutlineItem(title, elementId, actualIndex);
            outlineList.appendChild(item);
        });
    };

    // 监听滚动以高亮当前位置
    const handleScroll = () => {
        if (!host.hasAttribute('open')) return;
        
        const prompts = document.querySelectorAll('[data-message-author-role="user"]');
        let currentActiveIndex = -1;
        
        prompts.forEach((prompt, index) => {
            const rect = prompt.getBoundingClientRect();
            if (rect.top < window.innerHeight / 3) {
                currentActiveIndex = index;
            }
        });

        if (currentActiveIndex !== -1) {
            shadow.querySelectorAll('.outline-item').forEach(item => {
                item.classList.toggle('active', parseInt(item.dataset.originalIndex) === currentActiveIndex);
            });
        }
    };

    // 自动扫描与监听
    setInterval(() => {
        if (host.hasAttribute('open')) {
            scanConversations();
        }
    }, 10000);

    // 监听 DOM 变化
    const observer = new MutationObserver(() => {
        if (host.hasAttribute('open')) {
            scanConversations();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 监听侧边栏展开
    const hostObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'open') {
                if (host.hasAttribute('open')) {
                    scanConversations();
                }
            }
        });
    });
    hostObserver.observe(host, { attributes: true });

})();
