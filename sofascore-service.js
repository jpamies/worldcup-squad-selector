// SofaScore API Service
// Fetches player data directly from SofaScore API

const SOFASCORE_API = 'https://api.sofascore.com/api/v1';

// Team IDs for national teams in SofaScore
const TEAM_IDS = {
    spain: { id: 4698, flag: '🇪🇸', name: 'Spain', nameLocal: 'España' },
    france: { id: 4481, flag: '🇫🇷', name: 'France', nameLocal: 'France' },
    germany: { id: 4711, flag: '🇩🇪', name: 'Germany', nameLocal: 'Deutschland' },
    england: { id: 4713, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England', nameLocal: 'England' },
    brazil: { id: 4675, flag: '🇧🇷', name: 'Brazil', nameLocal: 'Brasil' },
    argentina: { id: 4819, flag: '🇦🇷', name: 'Argentina', nameLocal: 'Argentina' },
    portugal: { id: 4704, flag: '🇵🇹', name: 'Portugal', nameLocal: 'Portugal' },
    italy: { id: 4707, flag: '🇮🇹', name: 'Italy', nameLocal: 'Italia' },
    netherlands: { id: 4708, flag: '🇳🇱', name: 'Netherlands', nameLocal: 'Nederland' },
    belgium: { id: 4717, flag: '🇧🇪', name: 'Belgium', nameLocal: 'België' }
};

// Position mapping from SofaScore to app format
const POSITION_MAP = {
    'G': 'GK',
    'D': 'DEF',
    'M': 'MID',
    'F': 'FWD'
};

// Detailed position mapping
const DETAILED_POSITION_MAP = {
    'GK': 'Goalkeeper',
    'CB': 'Centre-Back',
    'LB': 'Left-Back',
    'RB': 'Right-Back',
    'LWB': 'Left Wing-Back',
    'RWB': 'Right Wing-Back',
    'DM': 'Defensive Midfield',
    'CDM': 'Defensive Midfield',
    'CM': 'Central Midfield',
    'CAM': 'Attacking Midfield',
    'AM': 'Attacking Midfield',
    'LM': 'Left Midfield',
    'RM': 'Right Midfield',
    'LW': 'Left Winger',
    'RW': 'Right Winger',
    'CF': 'Centre-Forward',
    'ST': 'Centre-Forward',
    'SS': 'Second Striker'
};

/**
 * Calculate age from timestamp
 */
function calculateAge(birthTimestamp) {
    if (!birthTimestamp) return null;
    const birthDate = new Date(birthTimestamp * 1000);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * Get detailed position string
 */
function getDetailedPosition(player) {
    if (player.positionsDetailed && player.positionsDetailed.length > 0) {
        const pos = player.positionsDetailed[0];
        return DETAILED_POSITION_MAP[pos] || pos;
    }
    return POSITION_MAP[player.position] || player.position;
}

/**
 * Fetch players from SofaScore API
 */
async function fetchSofaScorePlayers(countryCode) {
    const teamInfo = TEAM_IDS[countryCode];
    if (!teamInfo) {
        throw new Error(`Unknown country code: ${countryCode}`);
    }

    const response = await fetch(`${SOFASCORE_API}/team/${teamInfo.id}/players`);
    if (!response.ok) {
        throw new Error(`SofaScore API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Transform SofaScore data to app format
 */
function transformSofaScoreData(sofaScoreData, countryCode) {
    const teamInfo = TEAM_IDS[countryCode];
    const players = sofaScoreData.players || [];

    // Find team ranking from first player's nationalTeam data
    let fifaRanking = null;
    let coachName = 'Unknown';
    
    if (players.length > 0) {
        const firstPlayer = players[0];
        if (firstPlayer.player && firstPlayer.player.team) {
            // The ranking might be in the national team reference
        }
    }
    
    // Try to get ranking from the team data in any player's entry
    for (const p of players) {
        if (p.player?.nationalTeam?.ranking) {
            fifaRanking = p.player.nationalTeam.ranking;
            break;
        }
    }

    const transformedPlayers = players.map((entry, index) => {
        const player = entry.player;
        return {
            id: player.id || index + 1,
            name: player.name,
            position: POSITION_MAP[player.position] || player.position,
            detailedPosition: getDetailedPosition(player),
            club: player.team?.name || 'Unknown',
            age: calculateAge(player.dateOfBirthTimestamp),
            marketValue: player.proposedMarketValue || 0,
            // Additional SofaScore data
            jerseyNumber: player.shirtNumber || player.jerseyNumber,
            height: player.height,
            preferredFoot: player.preferredFoot,
            sofascoreId: player.id,
            photo: player.id ? `https://api.sofascore.app/api/v1/player/${player.id}/image` : null
        };
    });

    // Sort by market value descending
    transformedPlayers.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));

    return {
        country: {
            code: countryCode.toUpperCase().substring(0, 3),
            name: teamInfo.name,
            nameLocal: teamInfo.nameLocal,
            flag: teamInfo.flag,
            confederation: 'UEFA', // TODO: detect from API
            fifaRanking: fifaRanking || 'N/A',
            coachName: coachName,
            sofascoreTeamId: teamInfo.id
        },
        lastUpdated: new Date().toISOString().split('T')[0],
        source: 'SofaScore',
        players: transformedPlayers
    };
}

/**
 * Main function to load country data from SofaScore
 */
async function loadFromSofaScore(countryCode) {
    const sofaScoreData = await fetchSofaScorePlayers(countryCode);
    return transformSofaScoreData(sofaScoreData, countryCode);
}

// Export for use in app.js
window.SofaScoreService = {
    TEAM_IDS,
    loadFromSofaScore,
    fetchSofaScorePlayers,
    transformSofaScoreData
};
