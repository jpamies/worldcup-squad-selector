// Overview page - Shows all teams with their squads
// Uses ProfileManager for profile management

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

// Pending import data (stored when user needs to choose import method)
let pendingImportData = null;

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

// Get saved squad for a country (uses ProfileManager)
function getSavedSquad(countryCode) {
    return ProfileManager.getSquad(countryCode);
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

// ============ Profile Management UI ============

// Render profile dropdown
function renderProfileDropdown() {
    const profiles = ProfileManager.getProfiles();
    const currentId = ProfileManager.getCurrentProfileId();
    const select = document.getElementById('profile-select');
    
    select.innerHTML = Object.values(profiles).map(p => 
        `<option value="${p.id}" ${p.id === currentId ? 'selected' : ''}>${p.name}</option>`
    ).join('');
    
    // Disable delete button for default profile
    const deleteBtn = document.getElementById('delete-profile-btn');
    if (deleteBtn) {
        deleteBtn.disabled = currentId === ProfileManager.DEFAULT_PROFILE_ID;
        deleteBtn.style.opacity = currentId === ProfileManager.DEFAULT_PROFILE_ID ? '0.5' : '1';
    }
}

// Switch to a different profile
function switchProfile(profileId) {
    ProfileManager.setCurrentProfile(profileId);
    refreshPage();
    showToast(`Cambiado a: ${ProfileManager.getCurrentProfile().name}`);
}

// Refresh all page content
function refreshPage() {
    renderProfileDropdown();
    renderTeamCards();
    renderSummary();
    updateShareButtonState();
}

// Render all team cards
function renderTeamCards() {
    const grid = document.getElementById('teams-grid');
    grid.innerHTML = COUNTRIES.map(renderTeamCard).join('');
}

// Update share button state
function updateShareButtonState() {
    const shareBtn = document.getElementById('share-all-btn');
    const hasAnySquad = COUNTRIES.some(c => {
        const squad = getSavedSquad(c.code);
        return squad && squad.players && squad.players.length > 0;
    });
    shareBtn.disabled = !hasAnySquad;
}

// Modal helpers
function hideModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
}

function showCreateModal() {
    document.getElementById('new-profile-name').value = '';
    document.getElementById('create-modal').classList.remove('hidden');
    document.getElementById('new-profile-name').focus();
}

function showRenameModal() {
    const currentProfile = ProfileManager.getCurrentProfile();
    document.getElementById('rename-profile-name').value = currentProfile.name;
    document.getElementById('rename-modal').classList.remove('hidden');
    document.getElementById('rename-profile-name').focus();
}

function showDeleteModal() {
    if (ProfileManager.getCurrentProfileId() === ProfileManager.DEFAULT_PROFILE_ID) {
        showToast('No puedes eliminar el mundial por defecto', true);
        return;
    }
    document.getElementById('delete-modal').classList.remove('hidden');
}

function showImportModal() {
    document.getElementById('import-modal').classList.remove('hidden');
}

// Create new profile
function createNewProfile() {
    const name = document.getElementById('new-profile-name').value.trim();
    if (!name) {
        showToast('Introduce un nombre', true);
        return;
    }
    
    ProfileManager.createProfile(name, true);
    hideModals();
    refreshPage();
    showToast(`Creado: ${name}`);
}

// Rename current profile
function renameCurrentProfile() {
    const name = document.getElementById('rename-profile-name').value.trim();
    if (!name) {
        showToast('Introduce un nombre', true);
        return;
    }
    
    ProfileManager.renameProfile(ProfileManager.getCurrentProfileId(), name);
    hideModals();
    refreshPage();
    showToast(`Renombrado a: ${name}`);
}

// Delete current profile
function deleteCurrentProfile() {
    const currentProfile = ProfileManager.getCurrentProfile();
    if (ProfileManager.deleteProfile(ProfileManager.getCurrentProfileId())) {
        hideModals();
        refreshPage();
        showToast(`Eliminado: ${currentProfile.name}`);
    } else {
        showToast('No se pudo eliminar', true);
    }
}

// Duplicate current profile
function duplicateCurrentProfile() {
    const currentProfile = ProfileManager.getCurrentProfile();
    const newId = ProfileManager.duplicateProfile(
        ProfileManager.getCurrentProfileId(),
        `${currentProfile.name} (copia)`
    );
    
    if (newId) {
        ProfileManager.setCurrentProfile(newId);
        refreshPage();
        showToast(`Duplicado: ${currentProfile.name}`);
    } else {
        showToast('Error al duplicar', true);
    }
}

// ============ Sharing ============

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

// ============ Import ============

// Check for shared data in URL
function checkForSharedData() {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    
    if (!dataParam) return false;
    
    try {
        // Validate data
        const decoded = atob(dataParam);
        const parts = decoded.split('|');
        
        if (parts.length === 0) return false;
        
        // Store pending import data and show modal
        pendingImportData = { decoded, parts };
        showImportModal();
        return true;
    } catch (e) {
        console.error('Error parsing shared data:', e);
        return false;
    }
}

// Import as new profile
async function importAsNew() {
    if (!pendingImportData) {
        hideModals();
        return;
    }
    
    // Create new profile
    const newId = ProfileManager.createProfile('Mundial importado', true);
    
    // Import data
    await importDataToCurrentProfile();
    
    hideModals();
    refreshPage();
}

// Import to current profile (overwrite)
async function importToCurrentProfile() {
    if (!pendingImportData) {
        hideModals();
        return;
    }
    
    await importDataToCurrentProfile();
    
    hideModals();
    refreshPage();
}

// Actually import the data
async function importDataToCurrentProfile() {
    if (!pendingImportData) return;
    
    const { parts } = pendingImportData;
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
                
                ProfileManager.saveSquad(country.code, squadData);
                loadedCount++;
            }
        } catch (e) {
            console.error(`Error loading data for ${country.code}:`, e);
        }
    }
    
    // Clear URL parameter and pending data
    window.history.replaceState({}, '', window.location.pathname);
    pendingImportData = null;
    
    if (loadedCount > 0) {
        showToast(`¡${loadedCount} selecciones importadas!`);
    }
}

// ============ Initialize ============

async function init() {
    // Initialize profile system
    ProfileManager.initProfiles();
    
    // Render profile dropdown
    renderProfileDropdown();
    
    // Check for shared data in URL (shows modal if found)
    const hasSharedData = checkForSharedData();
    
    // Render page content
    renderTeamCards();
    renderSummary();
    updateShareButtonState();
    
    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideModals();
                // If we're closing import modal without action, clear URL
                if (overlay.id === 'import-modal' && pendingImportData) {
                    window.history.replaceState({}, '', window.location.pathname);
                    pendingImportData = null;
                }
            }
        });
    });
    
    // Handle Enter key in modals
    document.getElementById('new-profile-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createNewProfile();
    });
    document.getElementById('rename-profile-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renameCurrentProfile();
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);

// Expose functions to global scope for onclick handlers
window.hideModals = hideModals;
window.showCreateModal = showCreateModal;
window.showRenameModal = showRenameModal;
window.showDeleteModal = showDeleteModal;
window.createNewProfile = createNewProfile;
window.renameCurrentProfile = renameCurrentProfile;
window.deleteCurrentProfile = deleteCurrentProfile;
window.importAsNew = importAsNew;
window.importToCurrentProfile = importToCurrentProfile;
window.shareAllSquads = shareAllSquads;
