import os

products_file = 'c:/Users/Gabriel/Downloads/krenke-nextgen-2026/pages/Products.tsx'
data_file = 'c:/Users/Gabriel/Downloads/krenke-nextgen-2026/products_data.ts'

try:
    with open(products_file, 'r', encoding='utf-8') as f:
        content = f.read()

    with open(data_file, 'r', encoding='utf-8') as f:
        new_data = f.read()

    # Find the start of INITIAL_PRODUCTS
    start_marker = 'const INITIAL_PRODUCTS: Product[] = ['
    start_idx = content.find(start_marker)
    
    if start_idx == -1:
        print("Could not find INITIAL_PRODUCTS start marker")
        exit(1)

    # Find the end of INITIAL_PRODUCTS
    # We look for the closing ]; before the next component definition
    # A safe bet is to look for the next component "const ProductModal" and find the last ]; before it
    next_component = 'const ProductModal'
    next_comp_idx = content.find(next_component, start_idx)
    
    if next_comp_idx == -1:
        print("Could not find next component marker")
        exit(1)
        
    # Search backwards from next_component for the closing ];
    end_marker = '];'
    end_idx = content.rfind(end_marker, start_idx, next_comp_idx)
    
    if end_idx == -1:
        print("Could not find INITIAL_PRODUCTS end marker")
        exit(1)

    # Construct new content
    # content[:start_idx] includes everything before the definition
    # new_data is the full definition
    # content[end_idx + len(end_marker):] includes everything after
    
    new_content = content[:start_idx] + new_data + content[end_idx + len(end_marker):]
    
    with open(products_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Successfully updated Products.tsx")

except Exception as e:
    print(f"Error: {e}")
