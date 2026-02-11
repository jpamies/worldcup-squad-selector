// Club badges - Carga desde JSON
let CLUB_BADGES = {};

// Placeholder para clubes sin escudo
const PLACEHOLDER_BADGE = "🌍";

// Promesa de carga de badges
let badgesLoadedPromise = null;

// Cargar badges desde JSON
async function loadBadges() {
    try {
        const response = await fetch('./data/badges.json');
        if (response.ok) {
            const data = await response.json();
            CLUB_BADGES = data.badges || {};
            console.log(`Loaded ${Object.keys(CLUB_BADGES).length} club badges`);
        }
    } catch (error) {
        console.warn('Could not load badges.json:', error);
    }
}

// Función para esperar carga de badges
function waitForBadges() {
    return badgesLoadedPromise;
}

// Función para obtener el escudo de un club
function getClubBadge(clubName) {
    return CLUB_BADGES[clubName] || null;
}

// Función para generar el HTML del escudo
function renderClubBadge(clubName) {
    const badge = getClubBadge(clubName);
    if (badge) {
        return `<img src="${badge}" alt="${clubName}" class="club-badge" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="badge-placeholder" style="display:none">${PLACEHOLDER_BADGE}</span>`;
    }
    return `<span class="badge-placeholder">${PLACEHOLDER_BADGE}</span>`;
}

// Cargar badges al iniciar
badgesLoadedPromise = loadBadges();
