# World Cup 2026 Squad Selector

A static web application to select your dream squad for the FIFA World Cup 2026.

## Features

- **Player Selection**: Browse and select players from a pool of candidates
- **Position Filtering**: Filter available players by position (GK, DEF, MID, FWD)
- **Squad Limits**: Maximum 3 goalkeepers, other positions are flexible
- **Maximum 26 Players**: Standard World Cup squad size
- **Local Storage**: Saves your squad selection automatically
- **Responsive Design**: Works on desktop and mobile devices

## Currently Supported Teams

- 🇪🇸 Spain

## How to Use

1. Open `index.html` in a web browser
2. Browse available players in the left panel
3. Click on a player card to add them to your squad
4. Use position filter buttons to narrow down the player list
5. Click on a selected player (in the right panel) to remove them
6. Click "Save Squad" to persist your selection
7. Click "Clear Squad" to start over

## Project Structure

```
world-cup-list/
├── index.html          # Main HTML page
├── styles.css          # Styling
├── app.js              # Application logic
├── download-data.py    # Script to download player data
├── README.md           # This file
└── data/
    └── spain.json      # Player data for Spain
```

## Downloading Player Data

Use the Python script to download player data from Transfermarkt:

```bash
# Download data for a specific country
python download-data.py spain

# Download data for all countries
python download-data.py --all

# Show help
python download-data.py --help
```

### Available Countries

- spain, france, germany, england, brazil, argentina, portugal, italy, netherlands, belgium

## Player Data Format

Player data is stored in JSON files under the `data/` folder. Each country has its own file:

```json
{
  "country": {
    "code": "ESP",
    "name": "Spain",
    "nameLocal": "España",
    "flag": "🇪🇸",
    "confederation": "UEFA",
    "fifaRanking": 3,
    "coachName": "Luis de la Fuente"
  },
  "players": [
    {
      "id": 1,
      "name": "Player Name",
      "position": "GK|DEF|MID|FWD",
      "club": "Club Name",
      "clubCountry": "Country",
      "dateOfBirth": "YYYY-MM-DD",
      "age": 25,
      "height": 185,
      "foot": "Right|Left",
      "marketValue": 50000000,
      "caps": 30,
      "goals": 5,
      "image": "url"
    }
  ]
}
```

## Adding More Countries

To add more countries:

1. Create a new JSON file in the `data/` folder (e.g., `data/germany.json`)
2. Follow the player data format above
3. Add the country to `availableCountries` array in `app.js`:
   ```javascript
   const availableCountries = ['spain', 'germany'];
   ```
4. Add an option to the country selector in `index.html`:

```html
<option value="germany">🇩🇪 Germany</option>
```

## Technologies

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Local Storage API

## License

Open source - feel free to use and modify!
