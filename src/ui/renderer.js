const path = require('path');
const tabsContainer = document.getElementById('tabs-container');
const webviewContainer = document.getElementById('webview-container');
const urlInput = document.getElementById('url-input');
const newTabBtn = document.getElementById('new-tab-btn');

let tabs = [];
let activeTabId = null;

class TabInstance {
    constructor(id, url = 'home.html') {
        this.id = id;
        this.isLocal = !url.startsWith('http://') && !url.startsWith('https://');
        
        this.tabElement = document.createElement('div');
        this.tabElement.className = 'tab';
        this.tabElement.innerHTML = `<span class="tab-title">Загрузка...</span><span class="close-tab">&times;</span>`;
        
        this.webview = document.createElement('webview');
        this.webview.setAttribute('preload', '');
        
        if (this.isLocal) {
            this.webview.src = path.join(__dirname, url);
        } else {
            this.webview.src = url;
        }

        this.tabElement.addEventListener('click', (e) => {
            if (e.target.className === 'close-tab') {
                closeTab(this.id);
            } else {
                switchTab(this.id);
            }
        });

        this.webview.addEventListener('page-title-updated', (e) => {
            this.tabElement.querySelector('.tab-title').innerText = e.title;
        });

        this.webview.addEventListener('did-navigate', (e) => {
            if (activeTabId === this.id) urlInput.value = e.url;
        });

        tabsContainer.appendChild(this.tabElement);
        webviewContainer.appendChild(this.webview);
    }

    activate() {
        this.tabElement.classList.add('active');
        this.webview.classList.add('active');
        urlInput.value = this.webview.getURL().startsWith('file://') ? '' : this.webview.getURL();
    }

    deactivate() {
        this.tabElement.classList.remove('active');
        this.webview.classList.remove('active');
    }

    destroy() {
        this.tabElement.remove();
        this.webview.remove();
    }
}

function createNewTab(url) {
    const id = Date.now().toString();
    const newTab = new TabInstance(id, url);
    tabs.push(newTab);
    switchTab(id);
}

function switchTab(id) {
    tabs.forEach(tab => {
        if (tab.id === id) {
            tab.activate();
            activeTabId = id;
        } else {
            tab.deactivate();
        }
    });
}

function closeTab(id) {
    const index = tabs.findIndex(tab => tab.id === id);
    if (index === -1) return;
    tabs[index].destroy();
    tabs.splice(index, 1);
    if (tabs.length === 0) {
        createNewTab('home.html');
    } else if (activeTabId === id) {
        switchTab(tabs[Math.max(0, index - 1)].id);
    }
}

document.getElementById('back-btn').addEventListener('click', () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.webview.canGoBack()) activeTab.webview.goBack();
});
document.getElementById('forward-btn').addEventListener('click', () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.webview.canGoForward()) activeTab.webview.goForward();
});
document.getElementById('reload-btn').addEventListener('click', () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab) activeTab.webview.reload();
});
document.getElementById('settings-btn').addEventListener('click', () => createNewTab('settings.html'));
newTabBtn.addEventListener('click', () => createNewTab('home.html'));

urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        let url = urlInput.value.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = (url.includes('.') && !url.includes(' ')) ? 'https://' + url : 'https://www.google.com/search?q=' + encodeURIComponent(url);
        }
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab) activeTab.webview.src = url;
    }
});

createNewTab('home.html');
