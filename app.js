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
const countryInfoElement = document.getElementById('country-info');
const countrySelect = document.getElementById('country');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearSquadBtn = document.getElementById('clear-squad');
const saveSquadBtn = document.getElementById('save-squad');

// Available countries (from Transfermarkt)
const availableCountries = ['spain', 'france', 'germany', 'england', 'brazil', 'argentina', 'portugal', 'italy', 'netherlands', 'belgium'];

// Track if still loading more players
let isLoadingMore = false;

// Load country data from Transfermarkt (Progressive with infinite scroll)
async function loadCountryData(countryCode) {
    // If already have cached complete data, use it
    if (playersData[countryCode] && playersData[countryCode].isComplete) {
        return playersData[countryCode];
    }
    
    try {
        isLoading = true;
        isLoadingMore = true;
        showLoading(true, 'Connecting to Transfermarkt...');
        
        // Use Transfermarkt service with initial page loading
        const data = await window.TransfermarktService.loadInitialPages(
            countryCode,
            // Progress callback
            (current, total, message) => {
                updateLoadingIndicator(current, total, message);
            },
            // Players loaded callback - renders progressively
            (players, isComplete, currentPage, totalPages) => {
                // Update data progressively
                playersData[countryCode] = {
                    country: window.TransfermarktService.COUNTRY_IDS[countryCode],
                    players: players,
                    isComplete: isComplete,
                    currentPage: currentPage,
                    totalPages: totalPages
                };
                
                // Render immediately
                renderCountryInfo();
                renderAvailablePlayers();
                
                isLoadingMore = !isComplete;
                if (!isComplete) {
                    showScrollIndicator(currentPage, totalPages);
                } else {
                    hideLoadingIndicator();
                }
            }
        );
        
        playersData[countryCode] = data;
        return data;
    } catch (error) {
        console.error('Error loading country data from Transfermarkt:', error);
        showToast(`Error loading player data for ${countryCode}`, true);
        return null;
    } finally {
        isLoading = false;
        isLoadingMore = false;
    }
}

// Load more players on scroll
async function loadMorePlayers() {
    if (!window.TransfermarktService.hasMorePages(currentCountry)) {
        return;
    }
    
    if (window.TransfermarktService.isCurrentlyLoading(currentCountry)) {
        return;
    }
    
    showScrollIndicator();
    
    await window.TransfermarktService.loadNextPage(
        currentCountry,
        (players, isComplete, currentPage, totalPages) => {
            playersData[currentCountry].players = players;
            playersData[currentCountry].isComplete = isComplete;
            playersData[currentCountry].currentPage = currentPage;
            
            renderCountryInfo();
            renderAvailablePlayers();
            
            if (isComplete) {
                hideScrollIndicator();
            } else {
                showScrollIndicator(currentPage, totalPages);
            }
        }
    );
}

// Show scroll indicator at bottom
function showScrollIndicator(currentPage, totalPages) {
    let indicator = document.getElementById('scroll-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'scroll-indicator';
        indicator.className = 'scroll-indicator';
        availablePlayersContainer.parentElement.appendChild(indicator);
    }
    
    if (currentPage && totalPages) {
        indicator.innerHTML = `<span class="loading-spinner"></span> Scroll para cargar más (${currentPage}/${totalPages} páginas)`;
    } else {
        indicator.innerHTML = `<span class="loading-spinner"></span> Cargando más jugadores...`;
    }
    indicator.style.display = 'flex';
}

// Hide scroll indicator
function hideScrollIndicator() {
    const indicator = document.getElementById('scroll-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Setup infinite scroll
function setupInfiniteScroll() {
    const container = availablePlayersContainer;
    
    container.addEventListener('scroll', () => {
        // Check if near bottom (within 200px)
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            loadMorePlayers();
        }
    });
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
        <div class="country-flag">${country.flag || '🏳️'}</div>
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

// Initialize the app
async function init() {
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

    // Country selector
    countrySelect.addEventListener('change', async (e) => {
        currentCountry = e.target.value;
        selectedPlayers = [];
        await loadCountryData(currentCountry);
        renderCountryInfo();
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
        const photoHtml = player.photoUrl 
            ? `<img class="player-photo" src="${player.photoUrl}" alt="${player.name}" onerror="this.style.display='none'">`
            : '';
        return `
            <div class="player-card ${isSelected ? 'selected' : ''}" 
                 data-id="${player.id}" 
                 onclick="togglePlayer(${player.id})">
                ${photoHtml}
                ${renderClubBadge(player.club)}
                <div class="player-main">
                    <span class="name">${player.name}</span>
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
