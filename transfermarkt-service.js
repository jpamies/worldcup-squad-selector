// Transfermarkt Scraper Service
// Fetches player data directly from Transfermarkt website

const TRANSFERMARKT_BASE = 'https://www.transfermarkt.es';
const CACHE_KEY_PREFIX = 'tm_players_';
const CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours
const INITIAL_PAGES = 20; // Load all pages at once
const MAX_TOTAL_PAGES = 20; // Maximum pages available

// Country IDs for Transfermarkt
const COUNTRY_IDS = {
    spain: { id: 157, flag: '🇪🇸', name: 'Spain', nameLocal: 'España' },
    france: { id: 50, flag: '🇫🇷', name: 'France', nameLocal: 'France' },
    germany: { id: 40, flag: '🇩🇪', name: 'Germany', nameLocal: 'Deutschland' },
    england: { id: 189, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England', nameLocal: 'England' },
    brazil: { id: 26, flag: '🇧🇷', name: 'Brazil', nameLocal: 'Brasil' },
    argentina: { id: 9, flag: '🇦🇷', name: 'Argentina', nameLocal: 'Argentina' },
    portugal: { id: 136, flag: '🇵🇹', name: 'Portugal', nameLocal: 'Portugal' },
    italy: { id: 75, flag: '🇮🇹', name: 'Italy', nameLocal: 'Italia' },
    netherlands: { id: 122, flag: '🇳🇱', name: 'Netherlands', nameLocal: 'Nederland' },
    belgium: { id: 19, flag: '🇧🇪', name: 'Belgium', nameLocal: 'België' }
};

// Position mapping from Transfermarkt Spanish to app format
const POSITION_MAP = {
    'Portero': 'GK',
    'Defensa central': 'DEF',
    'Lateral izquierdo': 'DEF',
    'Lateral derecho': 'DEF',
    'Lateral': 'DEF',
    'Libero': 'DEF',
    'Pivote': 'MID',
    'Mediocentro': 'MID',
    'Interior derecho': 'MID',
    'Interior izquierdo': 'MID',
    'Mediocentro ofensivo': 'MID',
    'Extremo izquierdo': 'FWD',
    'Extremo derecho': 'FWD',
    'Extremo': 'FWD',
    'Mediapunta': 'FWD',
    'Delantero centro': 'FWD'
};

/**
 * Parse market value string to number
 * Examples: "200,00 mill. €" -> 200000000, "500 mil €" -> 500000
 */
function parseMarketValue(valueStr) {
    if (!valueStr) return 0;
    
    // Remove € and whitespace
    let cleaned = valueStr.replace('€', '').trim();
    
    // Handle millions
    if (cleaned.includes('mill.')) {
        const num = parseFloat(cleaned.replace('mill.', '').replace(',', '.').trim());
        return num * 1000000;
    }
    
    // Handle thousands (mil)
    if (cleaned.includes('mil')) {
        const num = parseFloat(cleaned.replace('mil', '').replace(',', '.').trim());
        return num * 1000;
    }
    
    return parseFloat(cleaned.replace(',', '.')) || 0;
}

/**
 * Fetch a single page of players from Transfermarkt
 */
async function fetchTransfermarktPage(countryId, page = 1) {
    const url = `${TRANSFERMARKT_BASE}/spieler-statistik/wertvollstespieler/marktwertetop/plus/0/galerie/0?ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&land_id=${countryId}&kontinent_id=0&jahr=0&page=${page}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch page ${page}: ${response.status}`);
    }
    
    return response.text();
}

/**
 * Parse player data from HTML
 */
function parsePlayersFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const players = [];
    
    // Find player rows in the table
    const rows = doc.querySelectorAll('table.items tbody tr');
    
    rows.forEach((row, index) => {
        try {
            // Get player name and link from hauptlink cell
            const nameLink = row.querySelector('td.hauptlink a[href*="/spieler/"]');
            if (!nameLink) return;
            
            const name = nameLink.textContent.trim();
            const playerUrl = nameLink.getAttribute('href');
            const playerIdMatch = playerUrl ? playerUrl.match(/\/spieler\/(\d+)/) : null;
            const playerId = playerIdMatch ? parseInt(playerIdMatch[1]) : index + 1;
            
            // Get photo URL - from img.bilderrahmen-fixed
            const photoImg = row.querySelector('img.bilderrahmen-fixed');
            const photoUrl = photoImg ? (photoImg.getAttribute('src') || photoImg.getAttribute('data-src')) : null;
            
            // Get position - it's in the second <tr> inside inline-table
            const inlineTable = row.querySelector('table.inline-table');
            let positionText = '';
            if (inlineTable) {
                const positionRows = inlineTable.querySelectorAll('tr');
                if (positionRows.length > 1) {
                    const positionTd = positionRows[1].querySelector('td');
                    positionText = positionTd ? positionTd.textContent.trim() : '';
                }
            }
            
            // Get age - third <td> in the row (index 2)
            const allCells = row.querySelectorAll(':scope > td');
            const ageCell = allCells[2];
            const age = ageCell ? parseInt(ageCell.textContent.trim()) : null;
            
            // Get club - from td with club link/image (title attribute)
            const clubLink = row.querySelector('td.zentriert a[href*="/verein/"]');
            let club = 'Unknown';
            if (clubLink) {
                const clubImg = clubLink.querySelector('img');
                if (clubImg && clubImg.getAttribute('title')) {
                    club = clubImg.getAttribute('title');
                } else if (clubLink.getAttribute('title')) {
                    club = clubLink.getAttribute('title');
                }
            }
            
            // Get market value
            const valueCell = row.querySelector('td.rechts.hauptlink');
            const marketValueStr = valueCell ? valueCell.textContent.trim() : '0';
            const marketValue = parseMarketValue(marketValueStr);
            
            // Map position to standard format (GK, DEF, MID, FWD)
            const position = POSITION_MAP[positionText] || 'MID';
            
            players.push({
                id: playerId,
                name,
                position,
                detailedPosition: positionText,
                club,
                age,
                marketValue,
                photoUrl,
                transfermarktUrl: playerUrl ? `${TRANSFERMARKT_BASE}${playerUrl}` : null
            });
        } catch (e) {
            console.warn('Error parsing player row:', e);
        }
    });
    
    return players;
}

/**
 * Get total number of pages from HTML
 */
function getTotalPages(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find pagination links
    const pageLinks = doc.querySelectorAll('.tm-pagination__list-item a');
    let maxPage = 1;
    
    pageLinks.forEach(link => {
        const href = link.getAttribute('href');
        const pageMatch = href ? href.match(/page\/(\d+)/) : null;
        if (pageMatch) {
            const pageNum = parseInt(pageMatch[1]);
            if (pageNum > maxPage) maxPage = pageNum;
        }
    });
    
    return maxPage;
}

/**
 * Get cached data from localStorage
 */
function getCachedData(countryCode) {
    try {
        const cached = localStorage.getItem(CACHE_KEY_PREFIX + countryCode);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const cacheTime = new Date(data.cachedAt);
        const now = new Date();
        const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
        
        // Check if cache is expired
        if (hoursDiff > CACHE_EXPIRY_HOURS) {
            localStorage.removeItem(CACHE_KEY_PREFIX + countryCode);
            return null;
        }
        
        return data;
    } catch (e) {
        console.warn('Error reading cache:', e);
        return null;
    }
}

/**
 * Save data to localStorage cache
 */
function setCachedData(countryCode, data) {
    try {
        const cacheData = {
            ...data,
            cachedAt: new Date().toISOString()
        };
        localStorage.setItem(CACHE_KEY_PREFIX + countryCode, JSON.stringify(cacheData));
    } catch (e) {
        console.warn('Error saving to cache:', e);
    }
}

/**
 * Clear cache for a country or all countries
 */
function clearCache(countryCode = null) {
    if (countryCode) {
        localStorage.removeItem(CACHE_KEY_PREFIX + countryCode);
        delete loadingState[countryCode];
    } else {
        Object.keys(COUNTRY_IDS).forEach(code => {
            localStorage.removeItem(CACHE_KEY_PREFIX + code);
            delete loadingState[code];
        });
    }
}

// Track loading state per country
const loadingState = {};

/**
 * Get or initialize loading state for a country
 */
function getLoadingState(countryCode) {
    if (!loadingState[countryCode]) {
        loadingState[countryCode] = {
            currentPage: 0,
            totalPages: MAX_TOTAL_PAGES,
            players: [],
            isLoading: false,
            isComplete: false
        };
    }
    return loadingState[countryCode];
}

/**
 * Load initial pages for a country (used on first load)
 */
async function loadInitialPages(countryCode, onProgress = null, onPlayersLoaded = null, forceRefresh = false) {
    const countryInfo = COUNTRY_IDS[countryCode];
    if (!countryInfo) {
        throw new Error(`Unknown country code: ${countryCode}`);
    }
    
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
        const cached = getCachedData(countryCode);
        if (cached && cached.players && cached.players.length > 0) {
            // Restore loading state from cache
            const state = getLoadingState(countryCode);
            state.players = cached.players;
            state.currentPage = cached.loadedPages || INITIAL_PAGES;
            state.isComplete = cached.isComplete || false;
            
            if (onProgress) onProgress(1, 1, 'Loaded from cache!');
            if (onPlayersLoaded) onPlayersLoaded(cached.players, state.isComplete, state.currentPage, MAX_TOTAL_PAGES);
            console.log(`Loaded ${countryCode} from cache (${cached.players.length} players, page ${state.currentPage})`);
            return cached;
        }
    }
    
    const state = getLoadingState(countryCode);
    state.isLoading = true;
    state.players = [];
    state.currentPage = 0;
    
    // Load initial pages
    for (let page = 1; page <= INITIAL_PAGES; page++) {
        if (onProgress) onProgress(page, INITIAL_PAGES, `Loading page ${page}/${INITIAL_PAGES}...`);
        
        const html = await fetchTransfermarktPage(countryInfo.id, page);
        
        if (page === 1) {
            state.totalPages = Math.min(getTotalPages(html), MAX_TOTAL_PAGES);
        }
        
        const players = parsePlayersFromHTML(html);
        state.players.push(...players);
        state.currentPage = page;
        
        // Sort and assign IDs
        state.players.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
        state.players.forEach((player, index) => player.id = index + 1);
        
        // Notify with current players
        if (onPlayersLoaded) {
            onPlayersLoaded([...state.players], false, state.currentPage, state.totalPages);
        }
        
        if (page < INITIAL_PAGES) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    state.isLoading = false;
    state.isComplete = state.currentPage >= state.totalPages;
    
    if (onProgress) onProgress(INITIAL_PAGES, INITIAL_PAGES, 'Ready!');
    
    // Save to cache
    saveToCacheIncremental(countryCode, state);
    
    return buildResult(countryCode, state);
}

/**
 * Load next page for infinite scroll
 */
async function loadNextPage(countryCode, onPlayersLoaded = null) {
    const countryInfo = COUNTRY_IDS[countryCode];
    if (!countryInfo) return null;
    
    const state = getLoadingState(countryCode);
    
    // Check if already loading or complete
    if (state.isLoading || state.isComplete) {
        return null;
    }
    
    const nextPage = state.currentPage + 1;
    if (nextPage > state.totalPages) {
        state.isComplete = true;
        return null;
    }
    
    state.isLoading = true;
    console.log(`Loading page ${nextPage}/${state.totalPages} for ${countryCode}...`);
    
    try {
        const html = await fetchTransfermarktPage(countryInfo.id, nextPage);
        const players = parsePlayersFromHTML(html);
        state.players.push(...players);
        state.currentPage = nextPage;
        
        // Sort and assign IDs
        state.players.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
        state.players.forEach((player, index) => player.id = index + 1);
        
        state.isComplete = state.currentPage >= state.totalPages;
        
        // Notify with updated players
        if (onPlayersLoaded) {
            onPlayersLoaded([...state.players], state.isComplete, state.currentPage, state.totalPages);
        }
        
        // Save to cache incrementally
        saveToCacheIncremental(countryCode, state);
        
        console.log(`Loaded page ${nextPage}, total players: ${state.players.length}`);
        
        return state.players;
    } finally {
        state.isLoading = false;
    }
}

/**
 * Check if more pages are available
 */
function hasMorePages(countryCode) {
    const state = loadingState[countryCode];
    if (!state) return true; // Not loaded yet
    return !state.isComplete && state.currentPage < state.totalPages;
}

/**
 * Check if currently loading
 */
function isCurrentlyLoading(countryCode) {
    const state = loadingState[countryCode];
    return state ? state.isLoading : false;
}

/**
 * Save to cache incrementally
 */
function saveToCacheIncremental(countryCode, state) {
    const result = buildResult(countryCode, state);
    result.loadedPages = state.currentPage;
    setCachedData(countryCode, result);
}

/**
 * Build result object
 */
function buildResult(countryCode, state) {
    const countryInfo = COUNTRY_IDS[countryCode];
    return {
        country: {
            code: countryCode.toUpperCase().substring(0, 3),
            name: countryInfo.name,
            nameLocal: countryInfo.nameLocal,
            flag: countryInfo.flag,
            confederation: 'UEFA',
            fifaRanking: 'N/A',
            coachName: 'N/A'
        },
        lastUpdated: new Date().toISOString().split('T')[0],
        source: 'Transfermarkt',
        players: state.players,
        isComplete: state.isComplete,
        currentPage: state.currentPage,
        totalPages: state.totalPages
    };
}

// Keep old function for backwards compatibility
async function loadFromTransfermarkt(countryCode, maxPages = 5, onProgress = null, onPlayersLoaded = null, forceRefresh = false) {
    return loadInitialPages(countryCode, onProgress, onPlayersLoaded, forceRefresh);
}

// Export for use in app.js
window.TransfermarktService = {
    COUNTRY_IDS,
    loadFromTransfermarkt,
    loadInitialPages,
    loadNextPage,
    hasMorePages,
    isCurrentlyLoading,
    fetchTransfermarktPage,
    parsePlayersFromHTML,
    clearCache,
    getCachedData,
    getLoadingState,
    INITIAL_PAGES,
    MAX_TOTAL_PAGES
};
