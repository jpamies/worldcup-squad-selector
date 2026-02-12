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

// FIFA code to ISO 2-letter code mapping for flag images
const FLAG_CODE_MAP = {
    'ESP': 'es', 'FRA': 'fr', 'GER': 'de', 'ENG': 'gb-eng', 'BRA': 'br',
    'ARG': 'ar', 'POR': 'pt', 'ITA': 'it', 'NED': 'nl', 'BEL': 'be',
    'CRO': 'hr', 'URU': 'uy', 'COL': 'co', 'DEN': 'dk', 'USA': 'us',
    'MAR': 'ma', 'EGY': 'eg', 'SEN': 'sn', 'JPN': 'jp', 'QAT': 'qa',
    'MEX': 'mx', 'SUI': 'ch'
};

// Get flag image HTML from country code
function getFlagHtml(countryCode, size = 20) {
    const iso2 = FLAG_CODE_MAP[countryCode] || countryCode.toLowerCase().substring(0, 2);
    return `<img class="player-flag" src="https://flagcdn.com/w${size}/${iso2}.png" alt="${countryCode}" onerror="this.style.display='none'">`;
}

// DOM Elements
const availablePlayersContainer = document.getElementById('available-players');
const squadCountElement = document.getElementById('squad-count');
const countryInfoElement = document.getElementById('country-info');
const countrySelect = document.getElementById('country');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearSquadBtn = document.getElementById('clear-squad');
const saveSquadBtn = document.getElementById('save-squad');

// Country list for dropdown
const COUNTRIES = [
    { code: 'spain', name: 'Spain', fifa: 'ESP' },
    { code: 'france', name: 'France', fifa: 'FRA' },
    { code: 'germany', name: 'Germany', fifa: 'GER' },
    { code: 'england', name: 'England', fifa: 'ENG' },
    { code: 'brazil', name: 'Brazil', fifa: 'BRA' },
    { code: 'argentina', name: 'Argentina', fifa: 'ARG' },
    { code: 'portugal', name: 'Portugal', fifa: 'POR' },
    { code: 'italy', name: 'Italy', fifa: 'ITA' },
    { code: 'netherlands', name: 'Netherlands', fifa: 'NED' },
    { code: 'belgium', name: 'Belgium', fifa: 'BEL' },
    { code: 'croatia', name: 'Croatia', fifa: 'CRO' },
    { code: 'uruguay', name: 'Uruguay', fifa: 'URU' },
    { code: 'colombia', name: 'Colombia', fifa: 'COL' },
    { code: 'denmark', name: 'Denmark', fifa: 'DEN' },
    { code: 'usa', name: 'USA', fifa: 'USA' },
    { code: 'morocco', name: 'Morocco', fifa: 'MAR' },
    { code: 'egypt', name: 'Egypt', fifa: 'EGY' },
    { code: 'senegal', name: 'Senegal', fifa: 'SEN' },
    { code: 'japan', name: 'Japan', fifa: 'JPN' },
    { code: 'qatar', name: 'Qatar', fifa: 'QAT' },
    { code: 'mexico', name: 'Mexico', fifa: 'MEX' },
    { code: 'switzerland', name: 'Switzerland', fifa: 'SUI' }
];

// Available countries (from Transfermarkt)
const availableCountries = ['spain', 'france', 'germany', 'england', 'brazil', 'argentina', 'portugal', 'italy', 'netherlands', 'belgium'];

// Initialize custom country dropdown
function initCountryDropdown() {
    const optionsContainer = document.getElementById('country-options');
    const selectedContainer = document.getElementById('country-selected');
    
    // Populate options
    optionsContainer.innerHTML = COUNTRIES.map(c => `
        <div data-value="${c.code}">
            <img class="select-flag" src="https://flagcdn.com/w20/${FLAG_CODE_MAP[c.fifa]}.png" alt="${c.name}">
            <span>${c.name}</span>
        </div>
    `).join('');
    
    // Update selected display for current country
    function updateSelected(code) {
        const country = COUNTRIES.find(c => c.code === code);
        if (country) {
            selectedContainer.innerHTML = `
                <img class="select-flag" src="https://flagcdn.com/w20/${FLAG_CODE_MAP[country.fifa]}.png" alt="${country.name}">
                <span>${country.name}</span>
            `;
        }
    }
    
    // Toggle dropdown
    selectedContainer.addEventListener('click', function(e) {
        e.stopPropagation();
        optionsContainer.classList.toggle('select-hide');
        this.classList.toggle('select-arrow-active');
    });
    
    // Handle option selection
    optionsContainer.addEventListener('click', async function(e) {
        const option = e.target.closest('[data-value]');
        if (option) {
            const value = option.dataset.value;
            countrySelect.value = value;
            currentCountry = value;
            updateSelected(value);
            optionsContainer.classList.add('select-hide');
            selectedContainer.classList.remove('select-arrow-active');
            
            await loadCountryData(currentCountry);
            loadSavedSquad();
            renderCountryInfo();
            renderAvailablePlayers();
            renderSquad();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        optionsContainer.classList.add('select-hide');
        selectedContainer.classList.remove('select-arrow-active');
    });
    
    updateSelected(currentCountry);
}

// Track if still loading more players
let isLoadingMore = false;

// Load country data from JSON file
async function loadCountryData(countryCode) {
    // If already have cached data, use it
    if (playersData[countryCode]) {
        return playersData[countryCode];
    }
    
    try {
        isLoading = true;
        showLoading(true, 'Loading player data...');
        
        // Load from JSON file
        const response = await fetch(`data/${countryCode}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load data for ${countryCode}`);
        }
        
        const data = await response.json();
        
        playersData[countryCode] = {
            country: data.country,
            players: data.players,
            isComplete: true,
            currentPage: 1,
            totalPages: 1
        };
        
        renderCountryInfo();
        renderAvailablePlayers();
        hideLoadingIndicator();
        
        return playersData[countryCode];
    } catch (error) {
        console.error('Error loading country data:', error);
        showToast(`Error loading player data for ${countryCode}`, true);
        return null;
    } finally {
        isLoading = false;
        isLoadingMore = false;
    }
}

// Show scroll indicator at bottom (no longer used with JSON data)
function showScrollIndicator(currentPage, totalPages) {
    // Not needed with JSON data
}

// Hide scroll indicator
function hideScrollIndicator() {
    const indicator = document.getElementById('scroll-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Setup infinite scroll (disabled with JSON data)
function setupInfiniteScroll() {
    // Not needed with JSON data - all players loaded at once
}

// Update loading indicator (shows progress while data is visible)
function updateLoadingIndicator(current, total, message) {
    let indicator = document.getElementById('loading-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.className = 'loading-indicator';
        document.querySelector('.player-pool').appendChild(indicator);
    }
    indicator.innerHTML = `<span class="loading-spinner"></span> ${message}`;
    indicator.style.display = 'flex';
}

// Hide loading indicator
function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Show/hide loading state (only when no players yet)
function showLoading(show, message = 'Loading players...') {
    if (show && (!playersData[currentCountry] || !playersData[currentCountry].players || playersData[currentCountry].players.length === 0)) {
        availablePlayersContainer.innerHTML = `<div class="loading">${message}</div>`;
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

// Render country info section
function renderCountryInfo() {
    const countryData = playersData[currentCountry];
    if (!countryData) {
        countryInfoElement.innerHTML = '';
        return;
    }
    
    const country = countryData.country || {};
    const totalPlayers = countryData.players ? countryData.players.length : 0;
    const currentPage = countryData.currentPage || 0;
    const totalPages = countryData.totalPages || 20;
    const pagesInfo = countryData.isComplete ? '' : ` (página ${currentPage}/${totalPages})`;
    
    countryInfoElement.innerHTML = `
        <div class="country-flag">${getFlagHtml(country.code, 80)}</div>
        <div class="country-details">
            <h2>${country.nameLocal || country.name || currentCountry}</h2>
            <div class="country-meta">
                ${country.fifaRanking ? `<span>🏆 FIFA Ranking: #${country.fifaRanking}</span>` : ''}
                ${country.coachName && country.coachName !== 'N/A' ? `<span>👔 Seleccionador: ${country.coachName}</span>` : ''}
                <span>⚽ ${totalPlayers} jugadores${pagesInfo}</span>
            </div>
        </div>
    `;
}

// Update profile indicator in UI
function updateProfileIndicator() {
    const nameEl = document.getElementById('current-profile-name');
    if (nameEl) {
        const profiles = ProfileManager.getProfiles();
        const currentId = ProfileManager.getCurrentProfileId();
        const profile = profiles[currentId];
        nameEl.textContent = profile ? profile.name : 'Mi Mundial';
    }
}

// Initialize the app
async function init() {
    // Initialize profile system
    ProfileManager.initProfiles();
    updateProfileIndicator();
    
    // Click on profile indicator goes to overview
    const indicator = document.getElementById('profile-indicator');
    if (indicator) {
        indicator.addEventListener('click', () => {
            window.location.href = 'overview.html';
        });
    }
    
    // Check URL for country parameter
    const urlParams = new URLSearchParams(window.location.search);
    const countryParam = urlParams.get('country');
    if (countryParam && COUNTRIES.find(c => c.code === countryParam)) {
        currentCountry = countryParam;
        countrySelect.value = countryParam;
    }
    
    // Initialize custom country dropdown
    initCountryDropdown();
    
    // Esperar a que se carguen los badges
    await waitForBadges();
    
    // Setup infinite scroll
    setupInfiniteScroll();
    
    // Check if loading from shared URL
    const loadedFromURL = await loadFromURL();
    
    if (!loadedFromURL) {
        await loadCountryData(currentCountry);
        loadSavedSquad();
    }
    
    renderCountryInfo();
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

    // Country selector (fallback for hidden input)
    countrySelect.addEventListener('change', async (e) => {
        currentCountry = e.target.value;
        await loadCountryData(currentCountry);
        loadSavedSquad();
        renderCountryInfo();
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

    // Share squad button
    document.getElementById('share-squad').addEventListener('click', shareSquad);

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
        const photoHtml = player.photo 
            ? `<img class="player-photo" src="${player.photo}" alt="${player.name}" onerror="this.style.display='none'">`
            : '';
        const clubLogoHtml = player.clubLogo
            ? `<img class="club-logo" src="${player.clubLogo}" alt="${player.club}" onerror="this.style.display='none'">`
            : '';
        return `
            <div class="player-card ${isSelected ? 'selected' : ''}" 
                 data-id="${player.id}" 
                 onclick="togglePlayer(${player.id})">
                ${photoHtml}
                ${clubLogoHtml}
                <div class="player-main">
                    <span class="name">${getFlagHtml(countryData.country.code)} ${player.name}</span>
                    <span class="club-name">${player.club}</span>
                    <span class="detailed-position">${player.detailedPosition || ''}</span>
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
    // Update squad count
    squadCountElement.textContent = selectedPlayers.length;

    // Update squad stats (value and average age)
    const totalValue = selectedPlayers.reduce((sum, p) => sum + (p.marketValue || 0), 0);
    const avgAge = selectedPlayers.length > 0 
        ? (selectedPlayers.reduce((sum, p) => sum + (p.age || 0), 0) / selectedPlayers.length).toFixed(1)
        : '-';
    
    document.getElementById('squad-value').textContent = `💰 ${formatMarketValue(totalValue)}`;
    document.getElementById('squad-avg-age').textContent = `📊 Edad media: ${avgAge}`;

    // Render each position group
    const positions = ['GK', 'DEF', 'MID', 'FWD'];
    positions.forEach(pos => {
        const container = document.getElementById(`squad-${pos.toLowerCase()}`);
        const countElement = document.getElementById(`count-${pos.toLowerCase()}`);
        const positionPlayers = selectedPlayers.filter(p => p.position === pos);
        
        // Update counter
        if (pos === 'GK') {
            countElement.textContent = `(${positionPlayers.length}/${MAX_GOALKEEPERS})`;
        } else {
            countElement.textContent = `(${positionPlayers.length})`;
        }
        
        container.innerHTML = positionPlayers.map(player => {
            const clubLogoHtml = player.clubLogo
                ? `<img class="club-logo-small" src="${player.clubLogo}" alt="${player.club}" onerror="this.style.display='none'">`
                : '';
            return `
            <div class="squad-player" onclick="togglePlayer(${player.id})">
                ${clubLogoHtml}
                <span>${player.name}</span>
                <span class="remove">×</span>
            </div>
        `;
        }).join('');
    });
}

// Save squad to localStorage (uses ProfileManager)
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

    ProfileManager.saveSquad(currentCountry, squadData);
    showToast(`Squad saved! (${selectedPlayers.length} players)`);
}

// Load saved squad from localStorage (uses ProfileManager)
function loadSavedSquad() {
    const saved = ProfileManager.getSquad(currentCountry);
    if (saved) {
        selectedPlayers = saved.players || [];
    } else {
        selectedPlayers = [];
    }
}

// Generate shareable URL with squad encoded in base64
function generateShareURL() {
    if (selectedPlayers.length === 0) {
        showToast('Selecciona jugadores primero', true);
        return null;
    }
    
    // Compact format: country code + player IDs only
    const shareData = {
        c: currentCountry,
        p: selectedPlayers.map(p => p.id)
    };
    
    const encoded = btoa(JSON.stringify(shareData));
    const url = `${window.location.origin}${window.location.pathname}?squad=${encoded}`;
    return url;
}

// Share squad - copy URL to clipboard
async function shareSquad() {
    const url = generateShareURL();
    if (!url) return;
    
    try {
        await navigator.clipboard.writeText(url);
        showToast(`¡URL copiada! (${selectedPlayers.length} jugadores)`);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(`¡URL copiada! (${selectedPlayers.length} jugadores)`);
    }
}

// Load squad from URL parameter
async function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const squadParam = params.get('squad');
    
    if (!squadParam) return false;
    
    try {
        const decoded = JSON.parse(atob(squadParam));
        const country = decoded.c;
        const playerIds = decoded.p;
        
        if (!country || !playerIds || !Array.isArray(playerIds)) {
            throw new Error('Invalid squad data');
        }
        
        // Set country and load data
        currentCountry = country;
        document.getElementById('country').value = country;
        await loadCountryData(country);
        
        // Find players by ID
        const countryData = playersData[country];
        if (countryData && countryData.players) {
            selectedPlayers = countryData.players.filter(p => playerIds.includes(p.id));
        }
        
        // Clear URL parameter to avoid reload issues
        window.history.replaceState({}, '', window.location.pathname);
        
        showToast(`¡Selección cargada! (${selectedPlayers.length} jugadores)`);
        return true;
    } catch (error) {
        console.error('Error loading squad from URL:', error);
        showToast('Error al cargar selección compartida', true);
        return false;
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
