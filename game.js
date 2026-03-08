// Game State
let gameState = {
    score: 0,
    totalClicks: 0,
    clickValue: 1,
    pps: 0, // Points Per Second
    upgrades: [
        { id: 'mini', name: 'ミニイエティ', baseCost: 15, pps: 0.5, count: 0, tier: 0, desc: '小さなイエティが手伝ってくれます' },
        { id: 'friend', name: 'イエティの友だち', baseCost: 100, pps: 3, count: 0, tier: 1, desc: '近所のイエティが遊びに来ました' },
        { id: 'elder', name: '長老イエティ', baseCost: 1100, pps: 20, count: 0, tier: 2, desc: '雪山の知恵を授かります' },
        { id: 'factory', name: 'イエティの家', baseCost: 12000, pps: 80, count: 0, tier: 3, desc: 'ぬくぬくの家で生産効率アップ' },
        { id: 'god', name: 'イエティ神', baseCost: 130000, pps: 500, count: 0, tier: 4, desc: '神々しい輝きを放ちます' }
    ]
};

// DOM Elements
const scoreEl = document.getElementById('score');
const ppsEl = document.getElementById('pps');
const yetiClicker = document.getElementById('yeti-clicker');
const clickArea = document.getElementById('click-area');
const upgradeListEl = document.getElementById('upgrade-list');
const allyContainerEl = document.getElementById('ally-container');

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
            gameState.score += gameState.pps / 10;
            updateDisplay();
        }
    }, 100);

    // Save interval
    setInterval(saveGame, 5000);
}

// Click Handling
clickArea.addEventListener('click', (e) => {
    gameState.score += gameState.clickValue;
    gameState.totalClicks++;
    
    createFloatingText(e.clientX, e.clientY, `+${gameState.clickValue}`);
    updateDisplay();
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
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
}

function calculatePPS() {
    let maxTier = 0;
    gameState.pps = gameState.upgrades.reduce((total, up) => {
        if (up.count > 0 && up.tier > maxTier) {
            maxTier = up.tier;
        }
        return total + (up.pps * up.count);
    }, 0);

    // Update main yeti color based on max tier owned
    yetiClicker.className = `yeti-image tier-${maxTier}`;
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
                <div class="upgrade-cost">Price: ${Math.floor(cost)} pts</div>
            </div>
            <div class="upgrade-count">${up.count}</div>
        `;
        upgradeListEl.appendChild(card);
    });
}

function updateDisplay() {
    scoreEl.innerText = Math.floor(gameState.score).toLocaleString();
    ppsEl.innerText = gameState.pps.toLocaleString();
    
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
        gameState.totalClicks = parsed.totalClicks || 0;
        gameState.clickValue = parsed.clickValue || 1;
        
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

init();
