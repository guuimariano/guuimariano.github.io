const DEFAULTS = {
    navSelector: '.nav',
    linkSelector: '.nav-link',
    sectionSelector: '.section',
    storageKey: 'spa:last-active-tab',
    defaultTab: 'dashboard',
    enableHashSync: true,
    onChange: null,
};

const state = {
    config: { ...DEFAULTS },
    links: [],
    linkMap: new Map(),
    sections: new Map(),
    activeId: null,
    listeners: [],
    hashHandler: null,
};

function sanitizeId(raw) {
    if (!raw) return '';
    const cleaned = raw.trim().replace(/^#/, '');
    return cleaned || '';
}

function safeStorageGet(key) {
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        console.warn('Unable to read from localStorage.', error);
        return null;
    }
}

function safeStorageSet(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        console.warn('Unable to persist tab selection.', error);
    }
}

function safeStorageRemove(key) {
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.warn('Unable to remove stored tab selection.', error);
    }
}

function getTabIdFromLink(link) {
    const href = link.getAttribute('href');
    if (!href) return null;
    const url = href.includes('#') ? href.split('#').pop() : href;
    return sanitizeId(url);
}

function toggleSection(panel, active) {
    panel.classList.toggle('active', active);
    panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    if (!active) {
        panel.setAttribute('hidden', '');
    } else {
        panel.removeAttribute('hidden');
    }
}

function toggleLink(link, active) {
    link.classList.toggle('active', active);
    link.setAttribute('aria-selected', active ? 'true' : 'false');
    link.setAttribute('tabindex', active ? '0' : '-1');
}

function updateHash(tabId) {
    if (!state.config.enableHashSync || !tabId) return;
    const newHash = `#${tabId}`;
    if (window.location.hash === newHash) return;
    if (history.replaceState) {
        history.replaceState(null, '', newHash);
    } else {
        window.location.hash = newHash;
    }
}

function persistActiveTab(tabId) {
    if (!state.config.storageKey) return;
    if (tabId) {
        safeStorageSet(state.config.storageKey, tabId);
    } else {
        safeStorageRemove(state.config.storageKey);
    }
}

function findInitialTab() {
    const { config, sections } = state;
    const sectionIds = Array.from(sections.keys());
    if (!sectionIds.length) return null;

    const hashId = config.enableHashSync ? sanitizeId(window.location.hash) : '';
    if (hashId && sections.has(hashId)) return hashId;

    const storedId = config.storageKey ? safeStorageGet(config.storageKey) : null;
    if (storedId && sections.has(storedId)) return storedId;

    if (config.defaultTab && sections.has(config.defaultTab)) return config.defaultTab;

    return sectionIds[0];
}

function focusAdjacent(currentId, direction) {
    if (!state.links.length) return;
    const index = state.links.findIndex(entry => entry.id === currentId);
    if (index === -1) return;
    const nextIndex = (index + direction + state.links.length) % state.links.length;
    const next = state.links[nextIndex];
    if (next?.link) {
        next.link.focus();
    }
}

export function setActiveTab(tabId, options = {}) {
    const targetId = sanitizeId(tabId);
    if (!state.linkMap.has(targetId) || !state.sections.has(targetId)) {
        return false;
    }

    if (state.activeId === targetId) {
        if (options.focus) {
            const currentLink = state.linkMap.get(targetId);
            currentLink?.focus();
        }
        return true;
    }

    state.linkMap.forEach((link, id) => toggleLink(link, id === targetId));
    state.sections.forEach((panel, id) => toggleSection(panel, id === targetId));

    state.activeId = targetId;
    if (options.save !== false) {
        persistActiveTab(targetId);
    }
    if (!options.fromHash) {
        updateHash(targetId);
    }

    if (options.focus) {
        const activeLink = state.linkMap.get(targetId);
        activeLink?.focus();
    }

    if (typeof state.config.onChange === 'function') {
        state.config.onChange(targetId);
    }

    return true;
}

function handleLinkActivation(event, targetId) {
    event.preventDefault();
    setActiveTab(targetId, { focus: true });
}

function registerLink(link, id) {
    link.setAttribute('role', 'tab');
    link.setAttribute('aria-selected', 'false');
    link.setAttribute('tabindex', '-1');
    link.setAttribute('data-tab-id', id);
    if (!link.id) {
        link.id = `tab-${id}`;
    }

    const clickHandler = (event) => handleLinkActivation(event, id);
    const keyHandler = (event) => {
        switch (event.key) {
            case ' ':
            case 'Enter':
                handleLinkActivation(event, id);
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                focusAdjacent(id, 1);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                focusAdjacent(id, -1);
                break;
            case 'Home':
                event.preventDefault();
                state.links[0]?.link?.focus();
                break;
            case 'End':
                event.preventDefault();
                state.links[state.links.length - 1]?.link?.focus();
                break;
            default:
                break;
        }
    };

    link.addEventListener('click', clickHandler);
    link.addEventListener('keydown', keyHandler);
    state.listeners.push(() => {
        link.removeEventListener('click', clickHandler);
        link.removeEventListener('keydown', keyHandler);
    });
}

function registerSection(panel, id) {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('hidden', '');
    const labelledBy = state.linkMap.get(id)?.id;
    if (labelledBy) {
        panel.setAttribute('aria-labelledby', labelledBy);
    }
}

function handleHashChange() {
    if (!state.config.enableHashSync) return;
    const hashId = sanitizeId(window.location.hash);
    if (hashId && state.sections.has(hashId)) {
        setActiveTab(hashId, { save: true, focus: true, fromHash: true });
    }
}

export function initTabs(options = {}) {
    disposeTabs();

    state.config = {
        ...DEFAULTS,
        ...options,
        onChange: typeof options.onChange === 'function' ? options.onChange : DEFAULTS.onChange,
    };

    const nav = document.querySelector(state.config.navSelector);
    const links = Array.from(document.querySelectorAll(state.config.linkSelector));
    const sections = Array.from(document.querySelectorAll(state.config.sectionSelector));

    if (!nav || !links.length || !sections.length) {
        return null;
    }

    nav.setAttribute('role', 'tablist');

    state.links = [];
    state.linkMap = new Map();
    state.sections = new Map();

    links.forEach((link) => {
        const tabId = getTabIdFromLink(link);
        if (!tabId) return;
        state.linkMap.set(tabId, link);
        state.links.push({ id: tabId, link });
        registerLink(link, tabId);
    });

    sections.forEach((panel) => {
        const id = sanitizeId(panel.id);
        if (!id) return;
        state.sections.set(id, panel);
        registerSection(panel, id);
    });

    const initialId = findInitialTab();
    if (initialId) {
        setActiveTab(initialId, { save: false, fromHash: true });
    }

    if (state.config.enableHashSync) {
        state.hashHandler = handleHashChange;
        window.addEventListener('hashchange', state.hashHandler);
        state.listeners.push(() => window.removeEventListener('hashchange', state.hashHandler));
    }

    return state.activeId;
}

export function getActiveTabId() {
    return state.activeId;
}

export function disposeTabs() {
    while (state.listeners.length) {
        const teardown = state.listeners.pop();
        try {
            teardown();
        } catch (error) {
            console.warn('Failed to dispose tab listener.', error);
        }
    }
    state.linkMap.clear();
    state.sections.clear();
    state.links = [];
    state.activeId = null;
}
