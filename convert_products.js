import fs from 'fs';

let content = fs.readFileSync('products_data.ts', 'utf8');

// Strip the import and the const declaration
content = content.replace(/import.*?;/g, '');
content = content.replace(/export const INITIAL_PRODUCTS: Product\[\] =/g, '');
content = content.replace(/;/g, '');
content = content.trim();

// Now it should be just the array.
// If there are trailing commas, JSON.parse will fail.
// I'll use a regex to remove trailing commas within objects and arrays.
content = content.replace(/,(\s*[\]}])/g, '$1');

try {
    const products = JSON.parse(content);
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log('Successfully converted products_data.ts to products.json');
} catch (e) {
    console.error('Error parsing JSON:', e);
}
