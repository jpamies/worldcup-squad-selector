// Club badges mapping - URLs de escudos de clubes
// Fuente: Wikipedia/Wikimedia Commons (dominio público o licencia libre)

const CLUB_BADGES = {
    // La Liga
    "FC Barcelona": "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/50px-FC_Barcelona_%28crest%29.svg.png",
    "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/50px-Real_Madrid_CF.svg.png",
    "Atlético de Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/50px-Atletico_Madrid_2017_logo.svg.png",
    "Athletic Bilbao": "https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Club_Athletic_Bilbao_logo.svg/50px-Club_Athletic_Bilbao_logo.svg.png",
    "Real Sociedad": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/50px-Real_Sociedad_logo.svg.png",
    "Real Betis Balompié": "https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_betis_logo.svg/50px-Real_betis_logo.svg.png",
    "Villarreal CF": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Villarreal_CF_logo.svg/50px-Villarreal_CF_logo.svg.png",
    "Sevilla FC": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/50px-Sevilla_FC_logo.svg.png",
    "Valencia CF": "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/50px-Valenciacf.svg.png",
    "Celta de Vigo": "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/RC_Celta_de_Vigo_logo.svg/50px-RC_Celta_de_Vigo_logo.svg.png",
    "Girona FC": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Girona_FC_new_logo.svg/50px-Girona_FC_new_logo.svg.png",
    "RCD Mallorca": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Rcd_mallorca.svg/50px-Rcd_mallorca.svg.png",
    "RCD Espanyol Barcelona": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/RCD_Espanyol_logo.svg/50px-RCD_Espanyol_logo.svg.png",
    "CA Osasuna": "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Osasuna_logo.svg/50px-Osasuna_logo.svg.png",
    "Getafe CF": "https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Getafe_logo.svg/50px-Getafe_logo.svg.png",
    "Deportivo Alavés": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Deportivo_Alaves_logo_%282020%29.svg/50px-Deportivo_Alaves_logo_%282020%29.svg.png",
    "UD Las Palmas": "https://upload.wikimedia.org/wikipedia/en/thumb/2/20/UD_Las_Palmas_logo.svg/50px-UD_Las_Palmas_logo.svg.png",
    "CD Leganés": "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/CD_Legan%C3%A9s_logo.svg/50px-CD_Legan%C3%A9s_logo.svg.png",
    "Rayo Vallecano": "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Rayo_Vallecano_logo.svg/50px-Rayo_Vallecano_logo.svg.png",
    "Granada CF": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Granada_CF_logo.svg/50px-Granada_CF_logo.svg.png",
    "UD Almería": "https://upload.wikimedia.org/wikipedia/en/thumb/7/79/UD_Almer%C3%ADa_logo.svg/50px-UD_Almer%C3%ADa_logo.svg.png",
    "Cádiz CF": "https://upload.wikimedia.org/wikipedia/en/thumb/5/58/C%C3%A1diz_CF_logo.svg/50px-C%C3%A1diz_CF_logo.svg.png",
    "Deportivo de La Coruña": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/RC_Deportivo_La_Coru%C3%B1a_logo.svg/50px-RC_Deportivo_La_Coru%C3%B1a_logo.svg.png",
    "Real Zaragoza": "https://upload.wikimedia.org/wikipedia/en/thumb/1/19/Real_Zaragoza_logo.svg/50px-Real_Zaragoza_logo.svg.png",
    "Sporting Gijón": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Real_Sporting_de_Gijon_logo.svg/50px-Real_Sporting_de_Gijon_logo.svg.png",
    "SD Eibar": "https://upload.wikimedia.org/wikipedia/en/thumb/9/94/SD_Eibar_logo.svg/50px-SD_Eibar_logo.svg.png",
    "Levante UD": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Levante_UD_logo.svg/50px-Levante_UD_logo.svg.png",
    "Real Oviedo": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Real_Oviedo_logo.svg/50px-Real_Oviedo_logo.svg.png",
    "Real Valladolid CF": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Real_Valladolid_Logo.svg/50px-Real_Valladolid_Logo.svg.png",
    "Elche CF": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Elche_CF_logo.svg/50px-Elche_CF_logo.svg.png",
    "Málaga CF": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/M%C3%A1laga_CF.svg/50px-M%C3%A1laga_CF.svg.png",
    "Racing Santander": "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Racing_de_Santander_logo.svg/50px-Racing_de_Santander_logo.svg.png",
    "Burgos CF": "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/Burgos_CF_escudo.svg/50px-Burgos_CF_escudo.svg.png",
    "SD Huesca": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/SD_Huesca_logo.svg/50px-SD_Huesca_logo.svg.png",
    "Albacete Balompié": "https://upload.wikimedia.org/wikipedia/en/thumb/3/34/Albacete_Balompi%C3%A9.svg/50px-Albacete_Balompi%C3%A9.svg.png",
    "CD Mirandés": "https://upload.wikimedia.org/wikipedia/en/thumb/0/08/CD_Mirandes_logo.svg/50px-CD_Mirandes_logo.svg.png",
    
    // Premier League
    "Manchester City": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/50px-Manchester_City_FC_badge.svg.png",
    "Arsenal FC": "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/50px-Arsenal_FC.svg.png",
    "Chelsea FC": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/50px-Chelsea_FC.svg.png",
    "Tottenham Hotspur": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/50px-Tottenham_Hotspur.svg.png",
    "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Aston_Villa_FC_new_crest.svg/50px-Aston_Villa_FC_new_crest.svg.png",
    "AFC Bournemouth": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/50px-AFC_Bournemouth_%282013%29.svg.png",
    "Crystal Palace": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Crystal_Palace_FC_logo_%282022%29.svg/50px-Crystal_Palace_FC_logo_%282022%29.svg.png",
    "Wolverhampton Wanderers": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers.svg/50px-Wolverhampton_Wanderers.svg.png",
    "Leicester City": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Leicester_City_crest.svg/50px-Leicester_City_crest.svg.png",
    "Leeds United": "https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Leeds_United_F.C._logo.svg/50px-Leeds_United_F.C._logo.svg.png",
    "Sunderland AFC": "https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Sunderland_AFC_logo.svg/50px-Sunderland_AFC_logo.svg.png",
    
    // Bundesliga
    "Bayer 04 Leverkusen": "https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/50px-Bayer_04_Leverkusen_logo.svg.png",
    "Borussia Dortmund II": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/50px-Borussia_Dortmund_logo.svg.png",
    "Werder Bremen": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SV-Werder-Bremen-Logo.svg/50px-SV-Werder-Bremen-Logo.svg.png",
    "1.FC Nuremberg": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/1._FC_N%C3%BCrnberg_logo.svg/50px-1._FC_N%C3%BCrnberg_logo.svg.png",
    "SV Darmstadt 98": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SV_Darmstadt_98.svg/50px-SV_Darmstadt_98.svg.png",
    
    // Serie A
    "SSC Napoli": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/SSC_Napoli_2024.svg/50px-SSC_Napoli_2024.svg.png",
    "SS Lazio": "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/S.S._Lazio_badge.svg/50px-S.S._Lazio_badge.svg.png",
    "AS Roma": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/50px-AS_Roma_logo_%282017%29.svg.png",
    "ACF Fiorentina": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/ACF_Fiorentina_-_logo_%282022%29.svg/50px-ACF_Fiorentina_-_logo_%282022%29.svg.png",
    "Bologna FC 1909": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Bologna_F.C._1909_logo.svg/50px-Bologna_F.C._1909_logo.svg.png",
    "Torino FC": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Torino_FC_Logo.svg/50px-Torino_FC_Logo.svg.png",
    "Parma Calcio 1913": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_Parma_Calcio_1913_%28adozione_2016%29.svg/50px-Logo_Parma_Calcio_1913_%28adozione_2016%29.svg.png",
    "Udinese Calcio": "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Udinese_Calcio_logo.svg/50px-Udinese_Calcio_logo.svg.png",
    "US Lecce": "https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/US_Lecce.svg/50px-US_Lecce.svg.png",
    "Como 1907": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Como_1907_logo.svg/50px-Como_1907_logo.svg.png",
    
    // Ligue 1
    "Paris Saint-Germain": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/50px-Paris_Saint-Germain_F.C..svg.png",
    "LOSC Lille": "https://upload.wikimedia.org/wikipedia/en/thumb/6/62/LOSC_Lille_logo.svg/50px-LOSC_Lille_logo.svg.png",
    "Olympique de Marseille": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/50px-Olympique_Marseille_logo.svg.png",
    
    // Portugal
    "FC Porto": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/FC_Porto.svg/50px-FC_Porto.svg.png",
    "SC Braga": "https://upload.wikimedia.org/wikipedia/en/thumb/7/79/S.C._Braga_logo.svg/50px-S.C._Braga_logo.svg.png",
    "Sporting CP": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg/50px-Sporting_Clube_de_Portugal_%28Logo%29.svg.png",
    
    // Otros
    "Los Angeles Galaxy": "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Los_Angeles_Galaxy_logo.svg/50px-Los_Angeles_Galaxy_logo.svg.png",
    "Fenerbahce": "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Fenerbah%C3%A7e_SK.svg/50px-Fenerbah%C3%A7e_SK.svg.png",
    "PSV Eindhoven": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/PSV_Eindhoven.svg/50px-PSV_Eindhoven.svg.png"
};

// Placeholder para clubes sin escudo
const PLACEHOLDER_BADGE = "🌍";

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
