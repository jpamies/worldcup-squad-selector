// Club country flags mapping - Emojis de banderas por club
// Mapea nombre del club a emoji de bandera del país

const CLUB_FLAGS = {
    // España 🇪🇸
    "FC Barcelona": "🇪🇸",
    "Real Madrid": "🇪🇸",
    "Atlético de Madrid": "🇪🇸",
    "Athletic Bilbao": "🇪🇸",
    "Real Sociedad": "🇪🇸",
    "Real Betis Balompié": "🇪🇸",
    "Villarreal CF": "🇪🇸",
    "Sevilla FC": "🇪🇸",
    "Valencia CF": "🇪🇸",
    "Celta de Vigo": "🇪🇸",
    "Girona FC": "🇪🇸",
    "RCD Mallorca": "🇪🇸",
    "RCD Espanyol Barcelona": "🇪🇸",
    "CA Osasuna": "🇪🇸",
    "Getafe CF": "🇪🇸",
    "Deportivo Alavés": "🇪🇸",
    "UD Las Palmas": "🇪🇸",
    "CD Leganés": "🇪🇸",
    "Rayo Vallecano": "🇪🇸",
    "Granada CF": "🇪🇸",
    "UD Almería": "🇪🇸",
    "Cádiz CF": "🇪🇸",
    "Deportivo de La Coruña": "🇪🇸",
    "Real Zaragoza": "🇪🇸",
    "Sporting Gijón": "🇪🇸",
    "SD Eibar": "🇪🇸",
    "Levante UD": "🇪🇸",
    "Real Oviedo": "🇪🇸",
    "Real Valladolid CF": "🇪🇸",
    "Elche CF": "🇪🇸",
    "Málaga CF": "🇪🇸",
    "Racing Santander": "🇪🇸",
    "Burgos CF": "🇪🇸",
    "SD Huesca": "🇪🇸",
    "Albacete Balompié": "🇪🇸",
    "CD Mirandés": "🇪🇸",
    "Córdoba CF": "🇪🇸",
    "Real Sociedad B": "🇪🇸",
    
    // Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿
    "Manchester City": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Arsenal FC": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Chelsea FC": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Tottenham Hotspur": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Aston Villa": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "AFC Bournemouth": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Crystal Palace": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Wolverhampton Wanderers": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Leicester City": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Leeds United": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Sunderland AFC": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Plymouth Argyle": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    
    // Alemania 🇩🇪
    "Bayer 04 Leverkusen": "🇩🇪",
    "Borussia Dortmund II": "🇩🇪",
    "Werder Bremen": "🇩🇪",
    "1.FC Nuremberg": "🇩🇪",
    "SV Darmstadt 98": "🇩🇪",
    
    // Italia 🇮🇹
    "SSC Napoli": "🇮🇹",
    "SS Lazio": "🇮🇹",
    "AS Roma": "🇮🇹",
    "ACF Fiorentina": "🇮🇹",
    "Bologna FC 1909": "🇮🇹",
    "Torino FC": "🇮🇹",
    "Parma Calcio 1913": "🇮🇹",
    "Udinese Calcio": "🇮🇹",
    "US Lecce": "🇮🇹",
    "Como 1907": "🇮🇹",
    "Cesena FC": "🇮🇹",
    
    // Francia 🇫🇷
    "Paris Saint-Germain": "🇫🇷",
    "LOSC Lille": "🇫🇷",
    "Olympique de Marseille": "🇫🇷",
    
    // Portugal 🇵🇹
    "FC Porto": "🇵🇹",
    "SC Braga": "🇵🇹",
    "Sporting CP": "🇵🇹",
    "Casa Pia AC": "🇵🇹",
    "Gil Vicente FC": "🇵🇹",
    "CS Marítimo": "🇵🇹",
    
    // Países Bajos 🇳🇱
    "PSV Eindhoven": "🇳🇱",
    
    // Bélgica 🇧🇪
    "KV Mechelen": "🇧🇪",
    
    // Bulgaria 🇧🇬
    "Ludogorets Razgrad": "🇧🇬",
    
    // Turquía 🇹🇷
    "Fenerbahce": "🇹🇷",
    "Gaziantep FK": "🇹🇷",
    
    // Grecia 🇬🇷
    "Aris Thessaloniki": "🇬🇷",
    "PAOK Thessaloniki": "🇬🇷",
    "Panathinaikos FC": "🇬🇷",
    
    // Polonia 🇵🇱
    "Jagiellonia Bialystok": "🇵🇱",
    "Lech Poznan": "🇵🇱",
    "Raków Częstochowa": "🇵🇱",
    "Widzew Lodz": "🇵🇱",
    "Wisla Kraków": "🇵🇱",
    "Cracovia": "🇵🇱",
    
    // Croacia 🇭🇷
    "HNK Hajduk Split": "🇭🇷",
    
    // USA 🇺🇸
    "Los Angeles Galaxy": "🇺🇸",
    "Orlando City SC": "🇺🇸",
    "Atlanta United FC": "🇺🇸",
    
    // México 🇲🇽
    "Atlas Guadalajara": "🇲🇽",
    "Club Tijuana": "🇲🇽",
    "Santos Laguna": "🇲🇽",
    
    // Arabia Saudí 🇸🇦
    "Al-Ahli SC": "🇸🇦",
    "Al-Arabi SC": "🇸🇦",
    "Al-Diraiyah FC": "🇸🇦",
    "Al-Qadsiah FC": "🇸🇦",
    "Al-Shabab FC": "🇸🇦",
    
    // Qatar 🇶🇦
    "Al-Gharafa SC": "🇶🇦",
    
    // China 🇨🇳
    "Shanghai Port": "🇨🇳",
    "Tianjin Jinmen Tiger": "🇨🇳",
    
    // Suiza 🇨🇭
    "FC Lausanne-Sport": "🇨🇭",
    
    // Kazajistán 🇰🇿
    "FC Aktobe": "🇰🇿",
    
    // Brasil 🇧🇷
    "Esporte Clube Vitória": "🇧🇷"
};

// Función para obtener la bandera del club
function getClubFlag(clubName) {
    return CLUB_FLAGS[clubName] || "⚽";
}

// Función para generar el HTML de la bandera
function renderClubBadge(clubName) {
    const flag = getClubFlag(clubName);
    return `<span class="club-flag">${flag}</span>`;
}
