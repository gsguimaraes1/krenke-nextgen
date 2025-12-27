import csv
import json
import re

csv_file = 'c:/Users/Gabriel/Downloads/krenke-nextgen-2026/Produto Krenke - Página1.csv'
output_file = 'c:/Users/Gabriel/Downloads/krenke-nextgen-2026/products_data.ts'

products = []

def clean_html(html):
    if not html: return ""
    return html.replace('\\n', '').replace('\n', '')

def extract_short_desc(html):
    match = re.search(r'<div class="product-next">(.*?)</div>', html, re.DOTALL)
    if match:
        return re.sub(r'<[^>]+>', '', match.group(1)).strip()
    
    match = re.search(r'<div class="description woocommerce-product-details__short-description">(.*?)</div>', html, re.DOTALL)
    if match:
        content = match.group(1)
        if '<table' in content:
            content = content.split('<table')[0]
        return re.sub(r'<[^>]+>', '', content).strip()
    
    return ""

try:
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader) # Skip header
        
        for row in reader:
            if len(row) < 3: continue
            
            title = row[0].strip()
            description_html = row[1]
            category = row[2].strip()
            
            if not category: category = "Outros"
            
            short_desc = extract_short_desc(description_html)
            if not short_desc:
                short_desc = f"Produto da categoria {category}"
            
            specs = description_html.replace('\\n', '\n')
            
            products.append({
                "id": title.lower().replace(' ', '-').replace('/', '-'),
                "name": title,
                "category": category,
                "description": short_desc,
                "specs": specs,
                "image": "",
                "images": []
            })

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("const INITIAL_PRODUCTS: Product[] = " + json.dumps(products, indent=2) + ";")
    
    print(f"Successfully wrote {len(products)} products to {output_file}")

except Exception as e:
    print(f"Error: {e}")
