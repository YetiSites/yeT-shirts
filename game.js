// Game State
let gameState = {
    score: 0,
    totalEarned: 0,
    lifeEarned: 0,
    totalClicks: 0,
    clickValue: 1,
    pps: 0, // Points Per Second
    feverMultiplier: 1,
    achievements: [],
    snowflakes: 0,
    upgrades: [
        { id: 'mini', name: 'ミニイエティ', baseCost: 15, pps: 0.5, count: 0, tier: 0, desc: '小さなイエティが手伝ってくれます' },
        { id: 'friend', name: 'イエティの友だち', baseCost: 100, pps: 3, count: 0, tier: 1, desc: '近所のイエティが遊びに来ました' },
        { id: 'penguin', name: '雪山のペンギン', baseCost: 800, pps: 8, count: 0, tier: 5, desc: '滑るのが得意なペンギン' },
        { id: 'elder', name: '長老イエティ', baseCost: 2500, pps: 25, count: 0, tier: 2, desc: '雪山の知恵を授かります' },
        { id: 'factory', name: 'イエティの家', baseCost: 15000, pps: 100, count: 0, tier: 3, desc: 'ぬくぬくの家で生産効率アップ' },
        { id: 'spirit', name: '吹雪の精霊', baseCost: 80000, pps: 450, count: 0, tier: 6, desc: '風とともに運んでくれます' },
        { id: 'sanctuary', name: 'イエティの聖域', baseCost: 800000, pps: 2800, count: 0, tier: 7, desc: '聖なる力で生産！' },
        { id: 'guardian', name: 'オーロラの守護者', baseCost: 10000000, pps: 25000, count: 0, tier: 8, desc: '極光を操りし精鋭' },
        { id: 'god', name: 'イエティ神', baseCost: 200000000, pps: 123456, count: 0, tier: 4, desc: '全知全能の輝き' }
    ],
    visuals: [],
    selectedTier: 0,
    disabledVisuals: []
};

const VISUAL_ITEMS = [
    { id: 'aurora-bg', name: 'オーロラの極光', cost: 10000000, desc: '背景がオーロラに包まれます', class: 'v-aurora' },
    { id: 'golden-yeti-look', name: '黄金の毛並み', cost: 50000000, desc: 'メインイエティが黄金に輝きます', class: 'v-gold' },
    { id: 'party-time', name: '雪山の賑わい', cost: 100000000, desc: 'パーティのようなキラキラエフェクト', class: 'v-party' }
];

const ACHIEVEMENTS = [
    { id: 'click-100', name: '新人探検家', desc: '100回クリックする', icon: '⛺', condition: (state) => state.totalClicks >= 100, bonus: 'クリック +1' },
    { id: 'click-500', name: '超速タップ', desc: '500回クリックする', icon: '⚡', condition: (state) => state.totalClicks >= 500, bonus: 'クリック +2' },
    { id: 'mini-10', name: 'イエティの守護者', desc: 'ミニイエティを10匹持つ', icon: '🛡️', condition: (state) => state.upgrades[0].count >= 10, bonus: 'PPS 1.1倍' },
    { id: 'ally-50', name: '雪山の村長', desc: '仲間を計50匹持つ', icon: '🏘️', condition: (state) => state.upgrades.reduce((s, u) => s + u.count, 0) >= 50, bonus: '購入コスト 5%OFF' },
    { id: 'rich-1m', name: '富豪イエティ', desc: '累計100万 pts 獲得', icon: '💎', condition: (state) => state.totalEarned >= 1000000, bonus: '全生産 +10%' },
    { id: 'hero-100m', name: '雪山の英雄', desc: '累計1億 pts 獲得', icon: '⛰️', condition: (state) => state.totalEarned >= 100000000, bonus: 'PPS 1.2倍' },
    { id: 'collector-100', name: '結晶コレクター', desc: '雪の結晶を100個持つ', icon: '❄️', condition: (state) => state.snowflakes >= 100, bonus: '全生産 +20%' },
    { id: 'lonely-10k', name: '孤独な情熱', desc: '今回のプレイで仲間0人で1万 pts 稼ぐ', icon: '🏔️', condition: (state) => (state.lifeEarned >= 10000 && state.upgrades.reduce((s, u) => s + u.count, 0) === 0), bonus: 'クリック +5' }
];

// DOM Elements
const scoreEl = document.getElementById('score');
const ppsEl = document.getElementById('pps');
const yetiClicker = document.getElementById('yeti-clicker');
const clickArea = document.getElementById('click-area');
const upgradeListEl = document.getElementById('upgrade-list');
const allyContainerEl = document.getElementById('ally-container');
const achievementBtn = document.getElementById('achievement-btn');
const achievementPanel = document.getElementById('achievement-panel');
const achievementListEl = document.getElementById('achievement-list');
const panelCloseBtn = document.getElementById('panel-close');
const notifyContainer = document.getElementById('notification-container');
const ppcEl = document.getElementById('ppc');
const snowflakeCountEl = document.getElementById('snowflake-count');
const snowflakeBonusEl = document.getElementById('snowflake-bonus');
const pendingSnowflakesEl = document.getElementById('pending-snowflakes');
const rebirthBtn = document.getElementById('rebirth-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const rebirthConfirmModal = document.getElementById('rebirth-confirm-modal');
const modalPendingSnowflakes = document.getElementById('modal-pending-snowflakes');
const rebirthConfirmBtn = document.getElementById('rebirth-confirm');
const rebirthCancelBtn = document.getElementById('rebirth-cancel');
const fullResetBtn = document.getElementById('full-reset-btn');
const helpBtn = document.getElementById('help-btn');
const visualListEl = document.getElementById('visual-list');
const mainTabBtns = document.querySelectorAll('.main-tab-btn');
const mainTabContents = document.querySelectorAll('.main-tab-content');
const skinListEl = document.getElementById('skin-list');

// Allies Limit (to avoid lag)
const MAX_VISIBLE_ALLIES_PER_TYPE = 20;

// Initialize
function init() {
    loadGame();
    renderUpgrades();
    renderAllies();
    updateDisplay();

    // Auto Click Interval
    setInterval(() => {
        if (gameState.pps > 0) {
            const added = (gameState.pps * getGlobalMultiplier() * gameState.feverMultiplier) / 10;
            gameState.score += added;
            gameState.totalEarned += added;
            gameState.lifeEarned += added;
            updateDisplay();
        }
    }, 100);

    // Achievement Check & Golden Yeti Chance
    setInterval(() => {
        checkAchievements();
        if (Math.random() < 0.05) spawnGoldenYeti(); // 5% chance every 3s
    }, 3000);

    // Save interval
    setInterval(saveGame, 5000);

    // UI Events
    achievementBtn.onclick = () => {
        switchTab('achievements');
        renderAchievementList();
        achievementPanel.setAttribute('aria-hidden', 'false');
    };
    helpBtn.onclick = () => {
        switchTab('guide');
        achievementPanel.setAttribute('aria-hidden', 'false');
    };
    panelCloseBtn.onclick = () => achievementPanel.setAttribute('aria-hidden', 'true');
    rebirthBtn.onclick = rebirth;

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            switchTab(btn.dataset.tab);
        };
    });

    // Rebirth Modal Events
    rebirthConfirmBtn.onclick = () => {
        executeRebirth();
        rebirthConfirmModal.setAttribute('aria-hidden', 'true');
    };
    rebirthCancelBtn.onclick = () => rebirthConfirmModal.setAttribute('aria-hidden', 'true');

    // Full Reset Event
    fullResetBtn.onclick = fullReset;

    // Main UI Tabs (Upgrades/Visuals)
    mainTabBtns.forEach(btn => {
        btn.onclick = () => {
            switchMainTab(btn.dataset.mainTab);
        };
    });
}

function switchMainTab(tabId) {
    mainTabBtns.forEach(b => {
        if (b.dataset.mainTab === tabId) b.classList.add('active');
        else b.classList.remove('active');
    });
    mainTabContents.forEach(c => {
        if (c.id === `${tabId}-main-content`) {
            c.classList.add('active');
            if (tabId === 'visuals_main') renderVisualList();
            if (tabId === 'visuals_selection') renderSkinList();
            if (tabId === 'upgrades') renderUpgrades();
        }
        else c.classList.remove('active');
    });
}

function switchTab(tabId) {
    tabBtns.forEach(b => {
        if (b.dataset.tab === tabId) b.classList.add('active');
        else b.classList.remove('active');
    });
    tabContents.forEach(c => {
        if (c.id === `${tabId}-content`) {
            c.classList.add('active');
        }
        else c.classList.remove('active');
    });
}

// Click Handling
clickArea.addEventListener('click', (e) => {
    const value = getClickValue() * gameState.feverMultiplier;
    gameState.score += value;
    gameState.totalEarned += value;
    gameState.lifeEarned += value;
    gameState.totalClicks++;

    createFloatingText(e.clientX, e.clientY, `+${Math.round(value).toLocaleString()}`);
    updateDisplay();
    checkAchievements();
    saveGame();
});

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 800);
}

// Upgrade Handling
function buyUpgrade(index) {
    const upgrade = gameState.upgrades[index];
    const cost = getCost(upgrade);

    if (gameState.score >= cost) {
        gameState.score -= cost;
        upgrade.count++;
        calculatePPS();
        renderUpgrades();
        renderAllies();
        updateDisplay();
        saveGame();
    }
}

function renderAllies() {
    allyContainerEl.innerHTML = '';
    gameState.upgrades.forEach(up => {
        const countToShow = Math.min(up.count, MAX_VISIBLE_ALLIES_PER_TYPE);
        for (let i = 0; i < countToShow; i++) {
            const img = document.createElement('img');
            img.src = './img/for_game_yeti.png';
            img.className = `ally-unit tier-${up.tier}`;
            img.style.animationDelay = `${Math.random() * 2}s`;
            allyContainerEl.appendChild(img);
        }
    });
}

function getCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count) * getCostMultiplier());
}

function calculatePPS() {
    gameState.pps = gameState.upgrades.reduce((total, up) => {
        return total + (up.pps * up.count);
    }, 0);

    // Update main yeti color based on selected skin
    yetiClicker.className = `yeti-image tier-${gameState.selectedTier}`;

    // Reset body classes and re-apply only active visuals
    const classesToRemove = VISUAL_ITEMS.map(vi => vi.class);
    document.body.classList.remove(...classesToRemove);

    gameState.visuals.forEach(vId => {
        if (!gameState.disabledVisuals.includes(vId)) {
            const item = VISUAL_ITEMS.find(vi => vi.id === vId);
            if (item) document.body.classList.add(item.class);
        }
    });

    updateDisplay();
}

function getSnowflakeMultiplier() {
    return 1 + (gameState.snowflakes * 0.2);
}

// Achievement & Bonus Logic
function getClickValue() {
    let val = 1;
    if (gameState.achievements.includes('click-100')) val += 1;
    if (gameState.achievements.includes('click-500')) val += 2;
    if (gameState.achievements.includes('lonely-10k')) val += 5;
    return val * getSnowflakeMultiplier() * getGlobalMultiplier();
}

function getGlobalMultiplier() {
    let mult = 1.0;
    if (gameState.achievements.includes('mini-10')) mult *= 1.1;
    if (gameState.achievements.includes('rich-1m')) mult *= 1.1;
    return mult;
}

function getCostMultiplier() {
    return gameState.achievements.includes('ally-50') ? 0.95 : 1.0;
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (!gameState.achievements.includes(ach.id) && ach.condition(gameState)) {
            gameState.achievements.push(ach.id);
            notifyAchievement(ach);
            calculatePPS(); // Recalc bonuses
        }
    });
}

function notifyAchievement(ach) {
    const el = document.createElement('div');
    el.className = 'notification';
    el.innerHTML = `<span class="badge-icon">${ach.icon}</span> <div><strong>実績解除!</strong><br>${ach.name}</div>`;
    notifyContainer.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function renderAchievementList() {
    achievementListEl.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = gameState.achievements.includes(ach.id);
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <div class="badge-icon">${isUnlocked ? ach.icon : '?'}</div>
            <div class="badge-info">
                <h3>${isUnlocked ? ach.name : '???'}</h3>
                <p>${ach.desc}</p>
                ${isUnlocked ? `<p style="color:#2b6cb0; font-weight:bold;">Bonus: ${ach.bonus}</p>` : ''}
            </div>
        `;
        achievementListEl.appendChild(item);
    });
}

// Golden Yeti & Fever Mode
let feverTimeout;
function spawnGoldenYeti() {
    if (document.querySelector('.golden-yeti')) return;

    const img = document.createElement('img');
    img.src = './img/for_game_yeti.png';
    img.className = 'golden-yeti';
    img.style.top = `${Math.random() * 60 + 20}%`;
    img.style.left = `${Math.random() * 80 + 10}%`;

    img.onclick = (e) => {
        e.stopPropagation();
        startFever();
        img.remove();
    };

    document.body.appendChild(img);
    setTimeout(() => img.remove(), 4000);
}

function startFever() {
    const r = Math.random();
    let multiplier = 3;
    let label = 'FEVER';

    if (r < 0.05) { // 5% chance
        multiplier = 77;
        label = 'GOD FEVER';
    } else if (r < 0.40) { // 35% chance (0.05 + 0.35 = 0.40)
        multiplier = 7;
        label = 'SUPER FEVER';
    } else { // 60% chance
        multiplier = 3;
        label = 'FEVER';
    }

    gameState.feverMultiplier = multiplier;
    document.body.classList.add('fever-active');

    if (feverTimeout) clearTimeout(feverTimeout);

    let timeLeft = 7;
    updateFeverTimer(timeLeft, label, multiplier);

    const interval = setInterval(() => {
        timeLeft--;
        updateFeverTimer(timeLeft, label, multiplier);
        if (timeLeft <= 0) {
            clearInterval(interval);
            endFever();
        }
    }, 1000);
}

function updateFeverTimer(time, label, mult) {
    let timerEl = document.getElementById('fever-timer');
    if (!timerEl) {
        timerEl = document.createElement('div');
        timerEl.id = 'fever-timer';
        timerEl.className = 'fever-timer';
        document.body.appendChild(timerEl);
    }
    timerEl.innerText = `${label}! x${mult} (残り ${time}秒)`;
}

function endFever() {
    gameState.feverMultiplier = 1;
    document.body.classList.remove('fever-active');
}

// Rendering
function renderUpgrades() {
    upgradeListEl.innerHTML = '';
    gameState.upgrades.forEach((up, index) => {
        const cost = getCost(up);
        const canAfford = gameState.score >= cost;

        const card = document.createElement('div');
        card.className = `upgrade-card tier-${up.tier} ${canAfford ? '' : 'locked'}`;
        card.onclick = () => buyUpgrade(index);

        card.innerHTML = `
            <div class="upgrade-icon-wrap">
                <img src="./img/for_game_yeti.png" class="upgrade-icon" alt="${up.name}">
            </div>
            <div class="upgrade-info">
                <div class="upgrade-name">${up.name}</div>
                <div class="upgrade-cost">Price: ${Math.floor(cost).toLocaleString()} pts</div>
            </div>
            <div class="upgrade-count">${up.count}</div>
        `;
        upgradeListEl.appendChild(card);
    });
}

function updateDisplay() {
    const scoreStr = Math.round(gameState.score).toLocaleString();
    scoreEl.innerText = scoreStr;

    // Dynamic Font Size
    if (scoreStr.length > 13) scoreEl.style.fontSize = '2.0rem';
    else if (scoreStr.length > 11) scoreEl.style.fontSize = '2.5rem';
    else if (scoreStr.length > 9) scoreEl.style.fontSize = '3.0rem';
    else scoreEl.style.fontSize = '3.5rem';

    const currentPPS = gameState.pps * getGlobalMultiplier() * getSnowflakeMultiplier() * gameState.feverMultiplier;
    ppsEl.innerText = Math.round(currentPPS).toLocaleString();

    const currentClick = getClickValue() * gameState.feverMultiplier;
    ppcEl.innerText = Math.round(currentClick).toLocaleString();

    // Rebirth Info (Based on current life points, non-linear)
    const actualPending = Math.floor(Math.pow(gameState.lifeEarned / 100000, 0.33));

    snowflakeCountEl.innerText = gameState.snowflakes.toLocaleString();
    snowflakeBonusEl.innerText = (gameState.snowflakes * 20).toLocaleString();
    pendingSnowflakesEl.innerText = actualPending.toLocaleString();
    rebirthBtn.disabled = actualPending <= 0;

    // Periodically refresh upgrade cards to update locked/unlocked state
    const cards = document.querySelectorAll('.upgrade-card');
    gameState.upgrades.forEach((up, i) => {
        const cost = getCost(up);
        if (gameState.score >= cost) {
            cards[i]?.classList.remove('locked');
        } else {
            cards[i]?.classList.add('locked');
        }
    });
}

function rebirth() {
    const actualPending = Math.floor(Math.pow(gameState.lifeEarned / 100000, 0.33));

    if (actualPending <= 0) return;

    modalPendingSnowflakes.innerText = actualPending.toLocaleString();
    rebirthConfirmModal.setAttribute('aria-hidden', 'false');
}

function executeRebirth() {
    const actualPending = Math.floor(Math.pow(gameState.lifeEarned / 100000, 0.33));

    gameState.snowflakes += actualPending;
    gameState.score = 0;
    gameState.lifeEarned = 0;
    gameState.upgrades.forEach(up => up.count = 0);
    calculatePPS();
    renderUpgrades();
    renderAllies();
    saveGame();
    achievementPanel.setAttribute('aria-hidden', 'true');
    notifyAchievement({ icon: '❄️', name: '転生完了!', bonus: '雪の結晶を獲得しました' });
}

function fullReset() {
    if (confirm("【警告】本当にすべてのデータを削除しますか？\nこの操作は取り消せません。\n(実績、雪の結晶もすべて消え、最初からになります)")) {
        if (confirm("本当の本当によろしいですか？\n(二度と復元できません)")) {
            localStorage.removeItem('yetiClickerState');
            location.reload();
        }
    }
}

// Storage
function saveGame() {
    localStorage.setItem('yetiClickerState', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('yetiClickerState');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle potential updates to upgrade definitions
        gameState.score = parsed.score || 0;
        gameState.totalEarned = parsed.totalEarned || 0;
        gameState.lifeEarned = parsed.lifeEarned || 0;
        gameState.totalClicks = parsed.totalClicks || 0;
        gameState.clickValue = parsed.clickValue || 1;
        gameState.achievements = parsed.achievements || [];
        gameState.snowflakes = parsed.snowflakes || 0;
        gameState.visuals = parsed.visuals || [];
        gameState.selectedTier = parsed.selectedTier || 0;
        gameState.disabledVisuals = parsed.disabledVisuals || [];

        if (parsed.upgrades) {
            parsed.upgrades.forEach((savedUp, i) => {
                if (gameState.upgrades[i]) {
                    gameState.upgrades[i].count = savedUp.count || 0;
                }
            });
        }
        calculatePPS();
    }
}

function renderVisualList() {
    visualListEl.innerHTML = '';
    VISUAL_ITEMS.forEach(item => {
        const isOwned = gameState.visuals.includes(item.id);
        const canAfford = gameState.score >= item.cost;
        const isDisabled = gameState.disabledVisuals.includes(item.id);

        const card = document.createElement('div');
        card.className = `upgrade-card ${isOwned ? 'owned' : (canAfford ? '' : 'locked')}`;

        let statusText = `Price: ${item.cost.toLocaleString()} pts`;
        if (isOwned) {
            statusText = isDisabled ? '<span style="color:#e53e3e;">解除中</span>' : '<span style="color:#38a169;">装備中</span>';
            card.onclick = () => toggleVisual(item.id);
        } else if (canAfford) {
            card.onclick = () => buyVisual(item.id);
        }

        card.innerHTML = `
            <div class="upgrade-icon-wrap">
                <span style="font-size:1.5rem;">✨</span>
            </div>
            <div class="upgrade-info">
                <div class="upgrade-name">${item.name}</div>
                <div class="upgrade-cost">${statusText}</div>
            </div>
            ${isOwned ? `<button class="btn btn-sm ${isDisabled ? 'btn-primary' : 'btn-ghost'}">${isDisabled ? '装備' : '解除'}</button>` : ''}
        `;
        visualListEl.appendChild(card);
    });
}

function toggleVisual(id) {
    if (gameState.disabledVisuals.includes(id)) {
        gameState.disabledVisuals = gameState.disabledVisuals.filter(v => v !== id);
    } else {
        gameState.disabledVisuals.push(id);
    }
    calculatePPS();
    renderVisualList();
    saveGame();
}

function renderSkinList() {
    skinListEl.innerHTML = '';

    // Get unique tiers owned with names
    const availableSkins = [{ tier: 0, name: 'ミニイエティ' }];
    gameState.upgrades.forEach(up => {
        if (up.count > 0 && !availableSkins.find(s => s.tier === up.tier)) {
            availableSkins.push({ tier: up.tier, name: up.name });
        }
    });

    availableSkins.forEach(skin => {
        const card = document.createElement('div');
        const isSelected = gameState.selectedTier === skin.tier;
        card.className = `upgrade-card tier-${skin.tier} ${isSelected ? 'owned' : ''}`;
        card.onclick = () => selectSkin(skin.tier);

        card.innerHTML = `
            <div class="upgrade-icon-wrap">
                <img src="./img/for_game_yeti.png" class="upgrade-icon" alt="${skin.name}">
            </div>
            <div class="upgrade-info">
                <div class="upgrade-name">${skin.name}</div>
                <div class="upgrade-cost">${isSelected ? '<span style="color:#38a169;">選択中</span>' : 'クリックして変更'}</div>
            </div>
        `;
        skinListEl.appendChild(card);
    });
}

function selectSkin(tier) {
    gameState.selectedTier = tier;
    calculatePPS();
    renderSkinList();
    saveGame();
}

function buyVisual(id) {
    const item = VISUAL_ITEMS.find(vi => vi.id === id);
    if (!item || gameState.visuals.includes(id)) return;

    if (gameState.score >= item.cost) {
        gameState.score -= item.cost;
        gameState.visuals.push(id);
        // Ensure it's not in disabled list when bought
        gameState.disabledVisuals = gameState.disabledVisuals.filter(v => v !== id);
        calculatePPS();
        renderVisualList();
        updateDisplay();
        saveGame();
    }
}

init();
