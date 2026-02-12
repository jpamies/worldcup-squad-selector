import urllib.request
import re

# Try to find Uruguay's land_id by searching in Transfermarkt's country selector
url = 'https://www.transfermarkt.es/detailsuche/spielerdetail/suche'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
r = urllib.request.urlopen(req, timeout=30)
html = r.read().decode('utf-8')

# Save to file for inspection
with open('tm_search.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Try to find Uruguay in option tags
matches = re.findall(r'<option[^>]+value="(\d+)"[^>]*>([^<]*Uruguay[^<]*)</option>', html, re.IGNORECASE)
print('Found matches:', matches)

# Also search for any mention of Uruguay with a nearby number
matches2 = re.findall(r'(\d{2,3})[^\d]{0,20}Uruguay|Uruguay[^\d]{0,20}(\d{2,3})', html, re.IGNORECASE)
print('Pattern matches:', matches2[:10])
