// Overview page - Shows all teams with their squads

// FIFA code to ISO 2-letter code mapping for flag images
const FLAG_CODE_MAP = {
    'ESP': 'es', 'FRA': 'fr', 'GER': 'de', 'ENG': 'gb-eng', 'BRA': 'br',
    'ARG': 'ar', 'POR': 'pt', 'ITA': 'it', 'NED': 'nl', 'BEL': 'be',
    'CRO': 'hr', 'URU': 'uy', 'COL': 'co', 'DEN': 'dk', 'USA': 'us',
    'MAR': 'ma', 'EGY': 'eg', 'SEN': 'sn', 'JPN': 'jp', 'QAT': 'qa',
    'MEX': 'mx', 'SUI': 'ch'
};

// All available countries
const COUNTRIES = [
    { code: 'spain', name: 'Spain', nameLocal: 'España', fifa: 'ESP' },
    { code: 'france', name: 'France', nameLocal: 'France', fifa: 'FRA' },
    { code: 'germany', name: 'Germany', nameLocal: 'Deutschland', fifa: 'GER' },
    { code: 'england', name: 'England', nameLocal: 'England', fifa: 'ENG' },
    { code: 'brazil', name: 'Brazil', nameLocal: 'Brasil', fifa: 'BRA' },
    { code: 'argentina', name: 'Argentina', nameLocal: 'Argentina', fifa: 'ARG' },
    { code: 'portugal', name: 'Portugal', nameLocal: 'Portugal', fifa: 'POR' },
    { code: 'italy', name: 'Italy', nameLocal: 'Italia', fifa: 'ITA' },
    { code: 'netherlands', name: 'Netherlands', nameLocal: 'Nederland', fifa: 'NED' },
    { code: 'belgium', name: 'Belgium', nameLocal: 'België', fifa: 'BEL' },
    { code: 'croatia', name: 'Croatia', nameLocal: 'Hrvatska', fifa: 'CRO' },
    { code: 'uruguay', name: 'Uruguay', nameLocal: 'Uruguay', fifa: 'URU' },
    { code: 'colombia', name: 'Colombia', nameLocal: 'Colombia', fifa: 'COL' },
    { code: 'denmark', name: 'Denmark', nameLocal: 'Danmark', fifa: 'DEN' },
    { code: 'usa', name: 'USA', nameLocal: 'United States', fifa: 'USA' },
    { code: 'morocco', name: 'Morocco', nameLocal: 'المغرب', fifa: 'MAR' },
    { code: 'egypt', name: 'Egypt', nameLocal: 'مصر', fifa: 'EGY' },
    { code: 'senegal', name: 'Senegal', nameLocal: 'Sénégal', fifa: 'SEN' },
    { code: 'japan', name: 'Japan', nameLocal: '日本', fifa: 'JPN' },
    { code: 'qatar', name: 'Qatar', nameLocal: 'قطر', fifa: 'QAT' },
    { code: 'mexico', name: 'Mexico', nameLocal: 'México', fifa: 'MEX' },
    { code: 'switzerland', name: 'Switzerland', nameLocal: 'Schweiz', fifa: 'SUI' }
];

// Format market value
function formatMarketValue(value) {
    if (!value || value === 0) return '€0';
    if (value >= 1000000000) {
        return `€${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value}`;
}

// Get saved squad for a country
function getSavedSquad(countryCode) {
    const saved = localStorage.getItem(`wc2026_squad_${countryCode}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Calculate squad stats
function calculateStats(players) {
    if (!players || players.length === 0) {
        return { count: 0, value: 0, avgAge: 0 };
    }
    
    const totalValue = players.reduce((sum, p) => sum + (p.marketValue || 0), 0);
    const avgAge = players.reduce((sum, p) => sum + (p.age || 0), 0) / players.length;
    
    return {
        count: players.length,
        value: totalValue,
        avgAge: avgAge.toFixed(1)
    };
}

// Count players by position
function countByPosition(players) {
    const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    players.forEach(p => {
        if (counts[p.position] !== undefined) {
            counts[p.position]++;
        }
    });
    return counts;
}

// Render a team card
function renderTeamCard(country) {
    const squad = getSavedSquad(country.code);
    const players = squad ? squad.players : [];
    const stats = calculateStats(players);
    const positions = countByPosition(players);
    
    const hasSquad = players.length > 0;
    const isComplete = players.length === 26;
    
    const flagUrl = `https://flagcdn.com/w80/${FLAG_CODE_MAP[country.fifa]}.png`;
    
    let squadPreview = '';
    if (hasSquad) {
        const positionBadges = [];
        if (positions.GK > 0) positionBadges.push(`<span class="squad-position gk">${positions.GK} GK</span>`);
        if (positions.DEF > 0) positionBadges.push(`<span class="squad-position def">${positions.DEF} DEF</span>`);
        if (positions.MID > 0) positionBadges.push(`<span class="squad-position mid">${positions.MID} MID</span>`);
        if (positions.FWD > 0) positionBadges.push(`<span class="squad-position fwd">${positions.FWD} FWD</span>`);
        squadPreview = positionBadges.join('');
    } else {
        squadPreview = '<span class="no-squad">Sin plantilla seleccionada</span>';
    }
    
    return `
        <div class="team-card ${hasSquad ? 'has-squad' : ''} ${isComplete ? 'complete-squad' : ''}">
            <div class="team-header">
                <img class="team-flag" src="${flagUrl}" alt="${country.name}" onerror="this.style.display='none'">
                <span class="team-name">${country.nameLocal}</span>
            </div>
            
            <div class="team-stats">
                <span class="team-stat ${hasSquad ? 'highlight' : ''}">${stats.count}/26 jugadores</span>
                ${hasSquad ? `<span class="team-stat">💰 ${formatMarketValue(stats.value)}</span>` : ''}
                ${hasSquad ? `<span class="team-stat">📊 ${stats.avgAge} años</span>` : ''}
            </div>
            
            <div class="squad-preview">
                ${squadPreview}
            </div>
            
            <div class="team-actions">
                <a href="index.html?country=${country.code}" class="btn btn-primary">
                    ${hasSquad ? 'Editar plantilla' : 'Seleccionar plantilla'}
                </a>
            </div>
        </div>
    `;
}

// Render summary stats
function renderSummary() {
    let totalTeams = 0;
    let completeTeams = 0;
    let totalPlayers = 0;
    let totalValue = 0;
    
    COUNTRIES.forEach(country => {
        const squad = getSavedSquad(country.code);
        if (squad && squad.players && squad.players.length > 0) {
            totalTeams++;
            totalPlayers += squad.players.length;
            totalValue += squad.players.reduce((sum, p) => sum + (p.marketValue || 0), 0);
            if (squad.players.length === 26) {
                completeTeams++;
            }
        }
    });
    
    document.getElementById('summary').innerHTML = `
        <div class="summary-item">
            <div class="summary-value">${totalTeams}</div>
            <div class="summary-label">Selecciones con plantilla</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${completeTeams}</div>
            <div class="summary-label">Plantillas completas</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${totalPlayers}</div>
            <div class="summary-label">Jugadores totales</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${formatMarketValue(totalValue)}</div>
            <div class="summary-label">Valor total</div>
        </div>
    `;
}

// Show toast notification
function showToast(message, isError = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Generate compact share data for all squads
// Format: ESP:1,2,3|FRA:4,5,6|GER:7,8,9
function generateShareData() {
    const parts = [];
    
    COUNTRIES.forEach(country => {
        const squad = getSavedSquad(country.code);
        if (squad && squad.players && squad.players.length > 0) {
            const ids = squad.players.map(p => p.id).join(',');
            parts.push(`${country.fifa}:${ids}`);
        }
    });
    
    return parts.join('|');
}

// Share all squads
function shareAllSquads() {
    const shareData = generateShareData();
    
    if (!shareData) {
        showToast('No hay selecciones para compartir', true);
        return;
    }
    
    const encoded = btoa(shareData);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    
    // Check URL length
    if (url.length > 2000) {
        showToast(`URL muy larga (${url.length} chars). Algunos navegadores pueden no soportarla.`, true);
    }
    
    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showToast(`¡URL copiada! (${url.length} caracteres)`);
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('¡URL copiada!');
    } catch (e) {
        showToast('Error al copiar URL', true);
    }
    document.body.removeChild(textArea);
}

// Load squads from URL parameter (async - fetches player data from JSON files)
async function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    
    if (!dataParam) return false;
    
    try {
        const decoded = atob(dataParam);
        const parts = decoded.split('|');
        
        let loadedCount = 0;
        
        // Process each country
        for (const part of parts) {
            const [fifaCode, idsStr] = part.split(':');
            if (!fifaCode || !idsStr) continue;
            
            const country = COUNTRIES.find(c => c.fifa === fifaCode);
            if (!country) continue;
            
            const ids = idsStr.split(',').map(id => parseInt(id, 10));
            
            try {
                // Fetch the country's player data
                const response = await fetch(`data/${country.code}.json`);
                if (!response.ok) continue;
                
                const data = await response.json();
                
                // Find the actual players by ID
                const players = ids
                    .map(id => data.players.find(p => p.id === id))
                    .filter(p => p !== undefined);
                
                if (players.length > 0) {
                    const squadData = {
                        country: country.code,
                        players: players,
                        savedAt: new Date().toISOString()
                    };
                    
                    localStorage.setItem(`wc2026_squad_${country.code}`, JSON.stringify(squadData));
                    loadedCount++;
                }
            } catch (e) {
                console.error(`Error loading data for ${country.code}:`, e);
            }
        }
        
        // Clear URL parameter
        window.history.replaceState({}, '', window.location.pathname);
        
        if (loadedCount > 0) {
            showToast(`¡${loadedCount} selecciones cargadas!`);
        }
        return loadedCount > 0;
    } catch (e) {
        console.error('Error loading from URL:', e);
        showToast('Error al cargar datos compartidos', true);
        return false;
    }
}

// Initialize page
async function init() {
    // Check if loading from shared URL
    await loadFromURL();
    
    // Render all team cards
    const grid = document.getElementById('teams-grid');
    grid.innerHTML = COUNTRIES.map(renderTeamCard).join('');
    
    // Render summary
    renderSummary();
    
    // Update share button state
    const shareBtn = document.getElementById('share-all-btn');
    const hasAnySquad = COUNTRIES.some(c => {
        const squad = getSavedSquad(c.code);
        return squad && squad.players && squad.players.length > 0;
    });
    shareBtn.disabled = !hasAnySquad;
}

// Start
document.addEventListener('DOMContentLoaded', init);
