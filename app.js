// Player data loaded from JSON files
let playersData = {};

// App state
let currentCountry = 'spain';
let selectedPlayers = [];
let currentFilter = 'all';
let isLoading = false;

const MAX_SQUAD_SIZE = 26;
const MAX_GOALKEEPERS = 3;
const MAX_OUTFIELD_PLAYERS = 23; // DEF + MID + FWD

// DOM Elements
const availablePlayersContainer = document.getElementById('available-players');
const squadCountElement = document.getElementById('squad-count');
const gkCountElement = document.getElementById('gk-count');
const outfieldCountElement = document.getElementById('outfield-count');
const countrySelect = document.getElementById('country');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearSquadBtn = document.getElementById('clear-squad');
const saveSquadBtn = document.getElementById('save-squad');

// Available countries (add more as JSON files are created)
const availableCountries = ['spain'];

// Load country data from JSON file
async function loadCountryData(countryCode) {
    if (playersData[countryCode]) {
        return playersData[countryCode];
    }
    
    try {
        isLoading = true;
        showLoading(true);
        const response = await fetch(`./data/${countryCode}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load data for ${countryCode}`);
        }
        const data = await response.json();
        playersData[countryCode] = data;
        return data;
    } catch (error) {
        console.error('Error loading country data:', error);
        showToast(`Error loading player data for ${countryCode}`, true);
        return null;
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

// Show/hide loading state
function showLoading(show) {
    if (show) {
        availablePlayersContainer.innerHTML = '<div class="loading">Loading players...</div>';
    }
}

// Format market value
function formatMarketValue(value) {
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
        return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value}`;
}

// Initialize the app
async function init() {
    await loadCountryData(currentCountry);
    loadSavedSquad();
    renderAvailablePlayers();
    renderSquad();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Position filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.position;
            renderAvailablePlayers();
        });
    });

    // Country selector
    countrySelect.addEventListener('change', async (e) => {
        currentCountry = e.target.value;
        selectedPlayers = [];
        await loadCountryData(currentCountry);
        loadSavedSquad();
        renderAvailablePlayers();
        renderSquad();
    });

    // Clear squad button
    clearSquadBtn.addEventListener('click', () => {
        selectedPlayers = [];
        renderAvailablePlayers();
        renderSquad();
        showToast('Squad cleared!');
    });

    // Save squad button
    saveSquadBtn.addEventListener('click', saveSquad);
}

// Render available players
function renderAvailablePlayers() {
    const countryData = playersData[currentCountry];
    if (!countryData || !countryData.players) {
        availablePlayersContainer.innerHTML = '<div class="loading">No player data available</div>';
        return;
    }
    
    const players = countryData.players;
    const filteredPlayers = currentFilter === 'all' 
        ? players 
        : players.filter(p => p.position === currentFilter);

    availablePlayersContainer.innerHTML = filteredPlayers.map(player => {
        const isSelected = selectedPlayers.some(p => p.id === player.id);
        return `
            <div class="player-card ${isSelected ? 'selected' : ''}" 
                 data-id="${player.id}" 
                 onclick="togglePlayer(${player.id})">
                ${renderClubBadge(player.club)}
                <div class="player-main">
                    <span class="name">${player.name}</span>
                    <span class="club-name">${player.club}</span>
                </div>
                <div class="player-stats">
                    <span class="position">${player.position}</span>
                    <span class="age">${player.age} años</span>
                    <span class="market-value">${formatMarketValue(player.marketValue)}</span>
                    <span class="add-btn">${isSelected ? '✓' : '+'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle player selection
function togglePlayer(playerId) {
    const countryData = playersData[currentCountry];
    if (!countryData || !countryData.players) return;
    
    const player = countryData.players.find(p => p.id === playerId);
    const isSelected = selectedPlayers.some(p => p.id === playerId);

    if (isSelected) {
        // Remove player
        selectedPlayers = selectedPlayers.filter(p => p.id !== playerId);
    } else {
        // Add player - check limits
        const gkCount = selectedPlayers.filter(p => p.position === 'GK').length;
        const outfieldCount = selectedPlayers.filter(p => p.position !== 'GK').length;

        if (player.position === 'GK') {
            // Verificar límite de porteros (máx 3)
            if (gkCount >= MAX_GOALKEEPERS) {
                showToast(`Máximo ${MAX_GOALKEEPERS} porteros permitidos!`, true);
                return;
            }
        } else {
            // Verificar límite de jugadores de campo (máx 23)
            if (outfieldCount >= MAX_OUTFIELD_PLAYERS) {
                showToast(`Máximo ${MAX_OUTFIELD_PLAYERS} jugadores de campo permitidos!`, true);
                return;
            }
        }

        // Verificar que no se exceda el total
        if (selectedPlayers.length >= MAX_SQUAD_SIZE) {
            showToast('Plantilla completa (26 jugadores)', true);
            return;
        }

        selectedPlayers.push(player);
    }

    renderAvailablePlayers();
    renderSquad();
}

// Render the selected squad
function renderSquad() {
    // Update squad counts
    const gkCount = selectedPlayers.filter(p => p.position === 'GK').length;
    const outfieldCount = selectedPlayers.filter(p => p.position !== 'GK').length;
    
    squadCountElement.textContent = selectedPlayers.length;
    gkCountElement.textContent = gkCount;
    outfieldCountElement.textContent = outfieldCount;

    // Render each position group
    const positions = ['GK', 'DEF', 'MID', 'FWD'];
    positions.forEach(pos => {
        const container = document.getElementById(`squad-${pos.toLowerCase()}`);
        const positionPlayers = selectedPlayers.filter(p => p.position === pos);
        
        container.innerHTML = positionPlayers.map(player => `
            <div class="squad-player" onclick="togglePlayer(${player.id})">
                ${renderClubBadge(player.club)}
                <span>${player.name}</span>
                <span class="remove">×</span>
            </div>
        `).join('');
    });
}

// Save squad to localStorage
function saveSquad() {
    if (selectedPlayers.length === 0) {
        showToast('Please select at least one player!', true);
        return;
    }

    const squadData = {
        country: currentCountry,
        players: selectedPlayers,
        savedAt: new Date().toISOString()
    };

    localStorage.setItem(`wc2026_squad_${currentCountry}`, JSON.stringify(squadData));
    showToast(`Squad saved! (${selectedPlayers.length} players)`);
}

// Load saved squad from localStorage
function loadSavedSquad() {
    const saved = localStorage.getItem(`wc2026_squad_${currentCountry}`);
    if (saved) {
        const data = JSON.parse(saved);
        selectedPlayers = data.players || [];
    }
}

// Show toast notification
function showToast(message, isError = false) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
