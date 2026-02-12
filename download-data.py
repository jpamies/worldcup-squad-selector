#!/usr/bin/env python3
"""
Script to download player data from Transfermarkt and save to JSON files.
Usage: python download-data.py [country] or python download-data.py --all
"""

import json
import os
import re
import sys
import time
import urllib.request
import html
from pathlib import Path

TRANSFERMARKT_BASE = 'https://www.transfermarkt.es'
MAX_PAGES = 20
DATA_DIR = Path(__file__).parent / 'data'

# Country configuration - Top 15 World Cup favorites
COUNTRIES = {
    'spain': {'id': 157, 'flag': '\U0001F1EA\U0001F1F8', 'name': 'Spain', 'nameLocal': 'España', 'code': 'ESP', 'confederation': 'UEFA'},
    'france': {'id': 50, 'flag': '\U0001F1EB\U0001F1F7', 'name': 'France', 'nameLocal': 'France', 'code': 'FRA', 'confederation': 'UEFA'},
    'germany': {'id': 40, 'flag': '\U0001F1E9\U0001F1EA', 'name': 'Germany', 'nameLocal': 'Deutschland', 'code': 'GER', 'confederation': 'UEFA'},
    'england': {'id': 189, 'flag': '\U0001F3F4\U000E0067\U000E0062\U000E0065\U000E006E\U000E0067\U000E007F', 'name': 'England', 'nameLocal': 'England', 'code': 'ENG', 'confederation': 'UEFA'},
    'brazil': {'id': 26, 'flag': '\U0001F1E7\U0001F1F7', 'name': 'Brazil', 'nameLocal': 'Brasil', 'code': 'BRA', 'confederation': 'CONMEBOL'},
    'argentina': {'id': 9, 'flag': '\U0001F1E6\U0001F1F7', 'name': 'Argentina', 'nameLocal': 'Argentina', 'code': 'ARG', 'confederation': 'CONMEBOL'},
    'portugal': {'id': 136, 'flag': '\U0001F1F5\U0001F1F9', 'name': 'Portugal', 'nameLocal': 'Portugal', 'code': 'POR', 'confederation': 'UEFA'},
    'italy': {'id': 75, 'flag': '\U0001F1EE\U0001F1F9', 'name': 'Italy', 'nameLocal': 'Italia', 'code': 'ITA', 'confederation': 'UEFA'},
    'netherlands': {'id': 122, 'flag': '\U0001F1F3\U0001F1F1', 'name': 'Netherlands', 'nameLocal': 'Nederland', 'code': 'NED', 'confederation': 'UEFA'},
    'belgium': {'id': 19, 'flag': '\U0001F1E7\U0001F1EA', 'name': 'Belgium', 'nameLocal': 'Belgie', 'code': 'BEL', 'confederation': 'UEFA'},
    'croatia': {'id': 56, 'flag': '\U0001F1ED\U0001F1F7', 'name': 'Croatia', 'nameLocal': 'Hrvatska', 'code': 'CRO', 'confederation': 'UEFA'},
    'uruguay': {'id': 179, 'flag': '\U0001F1FA\U0001F1FE', 'name': 'Uruguay', 'nameLocal': 'Uruguay', 'code': 'URU', 'confederation': 'CONMEBOL'},
    'colombia': {'id': 83, 'flag': '\U0001F1E8\U0001F1F4', 'name': 'Colombia', 'nameLocal': 'Colombia', 'code': 'COL', 'confederation': 'CONMEBOL'},
    'denmark': {'id': 39, 'flag': '\U0001F1E9\U0001F1F0', 'name': 'Denmark', 'nameLocal': 'Danmark', 'code': 'DEN', 'confederation': 'UEFA'},
    'usa': {'id': 184, 'flag': '\U0001F1FA\U0001F1F8', 'name': 'USA', 'nameLocal': 'United States', 'code': 'USA', 'confederation': 'CONCACAF'},
    # New countries
    'morocco': {'id': 107, 'flag': '\U0001F1F2\U0001F1E6', 'name': 'Morocco', 'nameLocal': 'المغرب', 'code': 'MAR', 'confederation': 'CAF'},
    'egypt': {'id': 2, 'flag': '\U0001F1EA\U0001F1EC', 'name': 'Egypt', 'nameLocal': 'مصر', 'code': 'EGY', 'confederation': 'CAF'},
    'senegal': {'id': 149, 'flag': '\U0001F1F8\U0001F1F3', 'name': 'Senegal', 'nameLocal': 'Sénégal', 'code': 'SEN', 'confederation': 'CAF'},
    'japan': {'id': 77, 'flag': '\U0001F1EF\U0001F1F5', 'name': 'Japan', 'nameLocal': '日本', 'code': 'JPN', 'confederation': 'AFC'},
    'qatar': {'id': 137, 'flag': '\U0001F1F6\U0001F1E6', 'name': 'Qatar', 'nameLocal': 'قطر', 'code': 'QAT', 'confederation': 'AFC'},
    'mexico': {'id': 110, 'flag': '\U0001F1F2\U0001F1FD', 'name': 'Mexico', 'nameLocal': 'México', 'code': 'MEX', 'confederation': 'CONCACAF'},
    'switzerland': {'id': 148, 'flag': '\U0001F1E8\U0001F1ED', 'name': 'Switzerland', 'nameLocal': 'Schweiz', 'code': 'SUI', 'confederation': 'UEFA'},
}

# Position mapping
POSITION_MAP = {
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
    'Delantero centro': 'FWD',
}

# Detailed position mapping to English
DETAILED_POSITION_MAP = {
    'Portero': 'Goalkeeper',
    'Defensa central': 'Centre-Back',
    'Lateral izquierdo': 'Left-Back',
    'Lateral derecho': 'Right-Back',
    'Lateral': 'Full-Back',
    'Libero': 'Sweeper',
    'Pivote': 'Defensive Midfield',
    'Mediocentro': 'Central Midfield',
    'Interior derecho': 'Right Midfield',
    'Interior izquierdo': 'Left Midfield',
    'Mediocentro ofensivo': 'Attacking Midfield',
    'Extremo izquierdo': 'Left Winger',
    'Extremo derecho': 'Right Winger',
    'Extremo': 'Winger',
    'Mediapunta': 'Second Striker',
    'Delantero centro': 'Centre-Forward',
}


def parse_market_value(value_str):
    """Parse market value string to number."""
    if not value_str:
        return 0
    
    cleaned = value_str.replace('\u20ac', '').strip()
    
    if 'mill.' in cleaned:
        num_str = cleaned.replace('mill.', '').replace(',', '.').strip()
        try:
            return int(float(num_str) * 1000000)
        except ValueError:
            return 0
    
    if 'mil' in cleaned:
        num_str = cleaned.replace('mil', '').replace(',', '.').strip()
        try:
            return int(float(num_str) * 1000)
        except ValueError:
            return 0
    
    try:
        return int(float(cleaned.replace(',', '.')))
    except ValueError:
        return 0


def fetch_page(url, retries=3):
    """Fetch HTML from URL with retries."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    }
    
    req = urllib.request.Request(url, headers=headers)
    
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2)  # Wait before retry
                continue
            raise Exception(f"Failed after {retries} attempts: {e}")


def parse_players_from_html(html_content):
    """Parse players from HTML using regex."""
    players = []
    
    # Find row positions by looking for <tr class="odd"> or <tr class="even">
    row_starts = list(re.finditer(r'<tr class="(?:odd|even)">', html_content, re.IGNORECASE))
    
    for i, match in enumerate(row_starts):
        start = match.start()
        # End is the start of the next row or 2000 chars after (enough for one row)
        end = row_starts[i + 1].start() if i + 1 < len(row_starts) else start + 2000
        row_html = html_content[start:end]
        
        try:
            # Get player name and ID from hauptlink
            name_pattern = r'<td\s+class="hauptlink">\s*<a\s+title="([^"]+)"\s+href="[^"]*spieler/(\d+)"'
            name_match = re.search(name_pattern, row_html, re.IGNORECASE)
            
            if not name_match:
                continue
            
            name = html.unescape(name_match.group(1).strip())
            player_id = int(name_match.group(2))
            
            # Get player photo URL from bilderrahmen-fixed img
            photo_url = None
            photo_pattern = r'<img\s+src="([^"]+)"[^>]*class="bilderrahmen-fixed"'
            photo_match = re.search(photo_pattern, row_html, re.IGNORECASE)
            if photo_match:
                photo_url = photo_match.group(1)
            
            # Get position from inline-table second row
            position_text = ''
            position_pattern = r'</tr><tr><td>([^<]+)</td></tr></table>'
            position_match = re.search(position_pattern, row_html, re.IGNORECASE)
            
            if position_match:
                position_text = html.unescape(position_match.group(1).strip())
            
            # Get age - after inline-table closes
            age = None
            age_pattern = r'</table></td><td\s+class="zentriert">(\d{1,2})</td>'
            age_match = re.search(age_pattern, row_html, re.IGNORECASE)
            
            if age_match:
                age = int(age_match.group(1))
            
            # Get club from verein link - look for the img title and src inside
            club = 'Unknown'
            club_logo_url = None
            club_pattern = r'startseite/verein/\d+"[^>]*>\s*<img\s+src="([^"]+)"[^>]*title="([^"]+)"'
            club_match = re.search(club_pattern, row_html, re.IGNORECASE)
            
            if club_match:
                club_logo_url = club_match.group(1)
                club = html.unescape(club_match.group(2).strip())
            
            # Get market value - look for rechts hauptlink cell with link
            market_value = 0
            value_pattern = r'<td\s+class="rechts hauptlink">\s*<a[^>]*>([^<]+)</a>'
            value_match = re.search(value_pattern, row_html, re.IGNORECASE)
            
            if value_match:
                market_value = parse_market_value(value_match.group(1))
            
            # Map positions
            position = POSITION_MAP.get(position_text, 'MID')
            detailed_position = DETAILED_POSITION_MAP.get(position_text, position_text)
            
            players.append({
                'id': player_id,
                'name': name,
                'position': position,
                'detailedPosition': detailed_position,
                'club': club,
                'clubLogo': club_logo_url,
                'age': age,
                'marketValue': market_value,
                'photo': photo_url,
            })
        except Exception as e:
            # Skip invalid rows
            pass
    
    return players


def download_country_data(country_key):
    """Download all player data for a country."""
    country_info = COUNTRIES.get(country_key)
    if not country_info:
        raise ValueError(f"Unknown country: {country_key}")
    
    print(f"\n\U0001F4E5 Downloading data for {country_info['flag']} {country_info['name']}...")
    
    all_players = []
    seen_ids = set()
    
    for page in range(1, MAX_PAGES + 1):
        url = f"{TRANSFERMARKT_BASE}/spieler-statistik/wertvollstespieler/marktwertetop/plus/0/galerie/0?ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&land_id={country_info['id']}&kontinent_id=0&jahr=0&page={page}"
        
        print(f"  Page {page}/{MAX_PAGES}...", end='', flush=True)
        
        try:
            html_content = fetch_page(url)
            players = parse_players_from_html(html_content)
            
            new_count = 0
            for player in players:
                if player['id'] not in seen_ids:
                    seen_ids.add(player['id'])
                    player['id'] = len(all_players) + 1
                    all_players.append(player)
                    new_count += 1
            
            print(f" {len(players)} players ({new_count} new)")
            
            # Small delay to be nice to the server
            time.sleep(1)
            
        except KeyboardInterrupt:
            print("\n\u26A0\uFE0F Download interrupted by user")
            break
        except Exception as e:
            print(f" Error: {e}")
            time.sleep(2)  # Wait longer after error
    
    # Create the JSON structure
    from datetime import date
    data = {
        'country': {
            'code': country_info['code'],
            'name': country_info['name'],
            'nameLocal': country_info['nameLocal'],
            'flag': country_info['flag'],
            'confederation': country_info['confederation'],
        },
        'lastUpdated': date.today().isoformat(),
        'source': 'Transfermarkt',
        'players': all_players,
    }
    
    # Ensure data directory exists
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Write to file
    file_path = DATA_DIR / f"{country_key}.json"
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\u2705 Saved {len(all_players)} players to {file_path}")
    
    return data


def show_help():
    """Show help message."""
    print("\n\U0001F3C6 World Cup Squad Builder - Data Downloader")
    print("=" * 45)
    print("\nUsage:")
    print("  python download-data.py <country>    Download data for a specific country")
    print("  python download-data.py --all        Download data for all countries")
    print("\nAvailable countries:")
    for key, c in sorted(COUNTRIES.items()):
        print(f"  {key:<12} {c['flag']} {c['name']}")


def main():
    """Main entry point."""
    args = sys.argv[1:]
    
    print("\U0001F3C6 World Cup Squad Builder - Data Downloader")
    print("=" * 45)
    
    if not args or args[0] in ('--help', '-h'):
        show_help()
        return
    
    start_time = time.time()
    
    if args[0] == '--all':
        print("\nDownloading data for all countries...")
        for country_key in sorted(COUNTRIES.keys()):
            try:
                download_country_data(country_key)
            except Exception as e:
                print(f"\u274C Error downloading {country_key}: {e}")
    else:
        country_key = args[0].lower()
        if country_key not in COUNTRIES:
            print(f"\u274C Unknown country: {args[0]}")
            print(f"Available countries: {', '.join(sorted(COUNTRIES.keys()))}")
            sys.exit(1)
        download_country_data(country_key)
    
    elapsed = time.time() - start_time
    print(f"\n\u2728 Done in {elapsed:.1f}s")


if __name__ == '__main__':
    main()
