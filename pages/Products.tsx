import React, { useState, useEffect } from 'react';
import { Filter, Search, Download, ChevronRight, X, Plus, Save, Trash2, Image as ImageIcon, Code, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../products_data';

const CATEGORIES = [
  'Todos',
  'Playgrounds Completos',
  'Little Play',
  'Brinquedos Avulsos',
  'Linha Pet',
  'Mobiliário Urbano e Jardim',
  'Pisos de Borracha',
  'Terceirização',
  'Rotomoldagem'
];

// Load all assets using Vite's glob import
const allAssets = import.meta.glob('../assets/**/*', { eager: true, as: 'url' });

// Helper to find images for a product
const findProductAssets = (productName: string) => {
  if (!productName || productName.length < 3) return { main: '', gallery: [] as string[] };

  const normalize = (s: string) => s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '');

  const normalizedName = normalize(productName);
  const matches: string[] = [];

  Object.entries(allAssets).forEach(([path, url]) => {
    const normalizedPath = normalize(path);

    // Check if path contains the normalized name
    if (normalizedPath.includes(normalizedName)) {
      matches.push(url as string);
    }

    // Special mapping for LINHA TEMÁTICA to thematic folder
    if (normalizedName === 'linhatematica' && normalizedPath.includes('tematica2025')) {
      matches.push(url as string);
    }
  });

  // Sort to prioritize main product image
  const sortedMatches = [...matches].sort((a, b) => {
    const aName = normalize(a.split('/').pop() || '');
    const bName = normalize(b.split('/').pop() || '');
    if (aName === normalizedName + '.jpg' || aName === normalizedName + '.png' || aName === normalizedName + '.webp') return -1;
    if (bName === normalizedName + '.jpg' || bName === normalizedName + '.png' || bName === normalizedName + '.webp') return 1;
    return 0;
  });

  return {
    main: sortedMatches.length > 0 ? sortedMatches[0] : '',
    gallery: sortedMatches
  };
};

// Helper to parse HTML input
const parseProductHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('.product_title')?.textContent?.trim() || '';
  const description = doc.querySelector('.product-next')?.textContent?.trim() ||
    doc.querySelector('.woocommerce-product-details__short-description')?.textContent?.trim() ||
    '';

  return { title, description };
};

const DEPRECATED_INITIAL_PRODUCTS: Product[] = [
  {
    "id": "kmp-0101",
    "name": "KMP 0101",
    "category": "Playgrounds Completos",
    "description": "\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0101</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-next\">\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (<strong>NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.</div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">5m x 5m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">8,5 x 8m = 68m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">4,23m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">241,28 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0102",
    "name": "KMP 0102",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21)\u00a0de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0102</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (<strong>NBR 16.071/21)</strong>\u00a0de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.\n\n<div>\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">5m x 4,5m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">6 x 10m - 60m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">5,43m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">282,28 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0201",
    "name": "KMP 0201",
    "category": "Playgrounds Completos",
    "description": "Produto da categoria Playgrounds Completos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0201</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (<strong>NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.</div>\n\n<div>\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">6m x 6m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">9,5 x 8,5m = 81m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">8,08m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">428,52 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Semi Torre</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0202",
    "name": "KMP 0202",
    "category": "Playgrounds Completos",
    "description": "Produto da categoria Playgrounds Completos",
    "specs": "<div class=\"description woocommerce-product-details__short-description\"></div>\n\n<h2 class=\"product_title entry-title show-product-nav\">KMP 0202</h2>\n\n<div class=\"description woocommerce-product-details__short-description\"></div>\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (<strong>NBR 16.071/21)</strong>\u00a0de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">7m x 6m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">10 x 9m = 90m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">8,35m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">364,78 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0204",
    "name": "KMP 0204",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21)\u00a0de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0204</h2>\n\n<div class=\"product-nav\"></div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (<strong>NBR 16.071/21)</strong>\u00a0de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">8m x 6m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">11 x 10m = 110m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">13,68m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">584,37 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Torre para Coqueiro plataforma</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0205",
    "name": "KMP 0205",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/12)\u00a0de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0205</h2>\n\n<div class=\"product-nav\"></div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (<strong>NBR 16.071/12)</strong>\u00a0de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de \u00a003 a 12 anos.\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">10m x 6m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">13m x 8m - 104m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">7,52m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">418,48 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0208",
    "name": "KMP 0208",
    "category": "Playgrounds Completos",
    "description": "\u00c9 fabricado com materiais de alta qualidade, dentro das normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio, pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados, mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 6 anos.",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0208</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\u00c9 fabricado com materiais de alta qualidade, dentro das normas da ABNT (<strong>NBR 16.071/21</strong>) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio, pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados, mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 6 anos.</div>\n\n<div class=\"product_meta\"></div>\n\n<div>\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">10m x 6m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">13m x 8m - 104m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">7,52m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">418,48 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0209",
    "name": "KMP 0209",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0209</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">6m x 4m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">10m x 9m = 90m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">7,07 m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">436,95 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Torre para Coqueiro plataforma</th>\n\n<td style=\"text-align: left;\">1,20m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0301",
    "name": "KMP 0301",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0301</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">10m x 10m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">13m x 13m - 169m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">11,13m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">716,06 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0302",
    "name": "KMP 0302",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 02 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0302</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 02 a 12 anos.\n\n\n\n</div>\n\n<div class=\"product_meta\"></div>\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">7m x 10m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">11 x 10m = 110m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">15,91m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">729,33 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura Plataformas Torres</th>\n\n<td style=\"text-align: left;\">1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0303",
    "name": "KMP 0303",
    "category": "Playgrounds Completos",
    "description": "\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0303</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-next\">\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.</div>\n\n</div>\n\n<div class=\"product_meta\"></div>\n\n<div>\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">10m x 6m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">8 x 14m = 112m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">11,28m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">710,10 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura das Torres</th>\n\n<td style=\"text-align: left;\">1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0305",
    "name": "KMP 0305",
    "category": "Playgrounds Completos",
    "description": "\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 6 anos.",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0305</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-next\">\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 6 anos.</div>\n\n</div>\n\n<div class=\"product_meta\"></div>\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">11m x 5m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">13,5 x 9m = 112m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">10,82 m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">619,94 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura das Torres</th>\n\n<td style=\"text-align: left;\">1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0401",
    "name": "KMP 0401",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0401</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>11m x 6m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>14,5 x 8,5m = 123m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>20,95m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>943,98 KG</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0402",
    "name": "KMP 0402",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0402</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>8m x 5m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>10 x 9m = 90m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>10,6m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>582,52 KG</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>0,80m a 1,20m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0404",
    "name": "KMP 0404",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0404</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n\n\n</div>\n\n<table border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th style=\"text-align: left;\">Tamanho do Brinquedo</th>\n\n<td style=\"text-align: left;\">9m x 8m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td style=\"text-align: left;\">13,5 x 10,5m = 142m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Cubagem</th>\n\n<td style=\"text-align: left;\">16,06m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Peso</th>\n\n<td style=\"text-align: left;\">794,27 KG</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Altura da Torre</th>\n\n<td style=\"text-align: left;\">1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Norma</th>\n\n<td style=\"text-align: left;\">NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th style=\"text-align: left;\">Idade Recomendada</th>\n\n<td style=\"text-align: left;\">Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0502",
    "name": "KMP 0502",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 02 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0502</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT <strong>(NBR 16.071/21)</strong> de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 02 a 12 anos.\n\n\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>11m x 8m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>13 x 11m = 143m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>23,41m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>1.061,52 KG</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0601",
    "name": "KMP 0601",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/12) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0601</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/12) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>10m x 9m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>13,5 x 12,5m = 169m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>20,73m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>1.145,89 KG</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>0,80m \u00e0 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0603",
    "name": "KMP 0603",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0603</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>12m X 9m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>15,5 x 13m = 202m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>20m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>1.306,49 Kg</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0702",
    "name": "KMP 0702",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0702</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>13m x 12m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>16 x 12m = 192m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>28,76m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>1.359,26 Kg</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-0901",
    "name": "KMP 0901",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 0901</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>14m x 14m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>17 x 17m = 289m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>39,12m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>1.811,94 Kg</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "kmp-1101",
    "name": "KMP 1101",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KMP 1101</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>14m x 14m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>17 x 16m = 154m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>35,67m\u00b3</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>2.103,25 Kg</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "p-60-b",
    "name": "P-60-B",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-60-B</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Balan\u00e7o infantil.\n\n\n\n\u00c1rea necess\u00e1ria: 4m x 5m.\n\n\n\nIdade Recomendada: 3 a 12 anos\n\n\n\nDescri\u00e7\u00e3o: O Balan\u00e7o para Crian\u00e7as P-60 B da Krenke Brinquedos \u00e9 um balan\u00e7o composto por uma estrutura de alum\u00ednio e uma travessa de tubo de metal galvanizado com 2 balan\u00e7os de assento em pl\u00e1stico rotomoldado.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "p-63",
    "name": "P-63",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-63</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Carrossel infantil\n\n\n\n\u00c1rea Necess\u00e1ria: 3m de di\u00e2metro.\n\n\n\nIdade Recomendada: 3 a 12 anos\n\n\n\nO carrossel infantil da Krenke Brinquedos \u00e9 uma estrutura de brinquedo pr\u00f3pria para o lazer da crian\u00e7a, colorido e possui 8 lugares, este \u00e9 o produto ideal para escolas, condom\u00ednios, pra\u00e7as ou mesmo para ter em casas particulares.\n\n\n\nFeito em a\u00e7o e assentos em pl\u00e1stico rotomoldado \u00e9 totalmente seguro, resistente e colorido. O pl\u00e1stico rotomoldado n\u00e3o desbota dando mais cor e alegria ao brinquedo.\n\n\n\nA Krenke Brinquedos preza muito pela seguran\u00e7a de seus produtos, todos os brinquedos da empresa passam por um rigoroso controle de qualidade o que garante que o cliente receber\u00e1 um produto muito bem acabado e com excelente material empregado em sua fabrica\u00e7\u00e3o o que aumentar\u00e1 ainda mais o custo benef\u00edcio do carrossel infantil, pois isto prolongar\u00e1 a vida \u00fatil do brinquedo e manter\u00e1 o mesmo com o aspecto de novo por muito mais tempo.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "p-59-a",
    "name": "P-59-A",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-59-A</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Gangorra\n\n\n\nA gangorra da Krenke \u00e9 o produto ideal para o lazer das crian\u00e7as, um produto feito de alum\u00ednio com material de \u00f3tima qualidade e com perfeito acabamento o que garante maior durabilidade ao produto e, ainda ir\u00e1 manter a apar\u00eancia de um produto novo por mais tempo.\n\n\n\nIdade Recomendada: 3 a 12 anos\n\n\n\nEstrutura de alum\u00ednio e assentos em pl\u00e1stico rotomoldado.\n\n\n\nTamanho: 2,70m de comprimento.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "km-70",
    "name": "KM 70",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KM 70</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Cavalinho de Mola\n\n\n\nIdade Recomendada: 3 a 12 anos\n\n\n\nDescri\u00e7\u00e3o: Brinquedo infantil sobre mola em formato de cavalo com a seguinte descri\u00e7\u00e3o: pe\u00e7a de pl\u00e1stico polietileno rotomoldado, 690mm de largura total, 1200mm de comprimento (do bico a cauda) e 530mm de altura at\u00e9 o assento, em formato de cavalo; mola feita com a\u00e7o galvanizado a fogo com \u00d820mm de di\u00e2metro, revestido com pintura eletroest\u00e1tica, 400mm de altura e 200mm de largura; suporte \u00e2ncora feito com a\u00e7o galvanizado a fogo, para fixa\u00e7\u00e3o da mola no brinquedo e para fixa\u00e7\u00e3o da mola dentro ou sobre o concreto ou terra;\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "km-80",
    "name": "KM 80",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KM 80</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Moto de Mola\n\n\n\nIdade Recomendada: 3 a 12 anos\n\n\n\nDescri\u00e7\u00e3o: Brinquedo infantil sobre mola em formato de motocicleta com a seguinte descri\u00e7\u00e3o: pe\u00e7a de pl\u00e1stico polietileno rotomoldado na cor azul ou laranja, 320mm de largura total, 960mm de comprimento e 520mm de altura at\u00e9 o assento, em formato de motocicleta; mola feita com a\u00e7o galvanizado a fogo com \u00d820mm de di\u00e2metro, revestido com pintura eletroest\u00e1tica, 400mm de altura e 200mm de largura; suporte \u00e2ncora feito com a\u00e7o galvanizado a fogo, para fixa\u00e7\u00e3o da mola no brinquedo e para fixa\u00e7\u00e3o da mola dentro ou sobre o concreto ou terra;\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "p-60-c",
    "name": "P-60-C",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-60-C</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Balan\u00e7o Ninho\n\n\n\n\u00c1rea necess\u00e1ria: 2m x 1,85m.\n\n\n\nIdade Recomendada: 1 a 3 anos\n\n\n\nDescri\u00e7\u00e3o: O Balan\u00e7o ninho P-60 C da Krenke Brinquedos \u00e9 um balan\u00e7o composto por uma estrutura de alum\u00ednio e uma travessa de tubo de metal galvanizado com acento em forma de cesto em pl\u00e1stico rotomoldado.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "tobog\u00e3-especial",
    "name": "TOBOG\u00c3 ESPECIAL",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">TOBOG\u00c3 ESPECIAL</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nFabricado em pl\u00e1stico rotomoldado, podendo ser instalado em qualquer lugar e projetado na altura desejada conforme a escolha do cliente, com toda seguran\u00e7a e qualidade.\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "pir\u00e2mide-de-cordas",
    "name": "PIR\u00c2MIDE DE CORDAS",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">PIR\u00c2MIDE DE CORDAS</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nM\u00f3dulo escalada avulso, tipo teia de aranha formato c\u00f4nico. Cont\u00e9m: Estrutura em a\u00e7o estrutural com revestimento em zinco e pintura ep\u00f3xi eletrost\u00e1tica Cor verde; Cordas 100% poli\u00e9ster, cor verde oliva; uni\u00f5es cruzadas produzidas em polietileno cor laranja; Acabamento tipo coqueiro produzido em polietileno cor verde. Elemento de fixa\u00e7\u00e3o zincados. Altura 4 metros, di\u00e2metro 3, metros.\n\n\n\nIdade Recomendada: 4 a 12 anos\n\n\n\nImagem ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "scandere-domos",
    "name": "SCANDERE DOMOS",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">SCANDERE DOMOS</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com material de ferro tubular galvanizado e pintado com tinta a p\u00f3 sem materiais pesados medindo<strong>\u00a02,70</strong>\u00a0m de di\u00e2metro com altura\u00a0<strong>1,40 m.</strong>\n\n\n\nIdade Recomendada: 4 a 12 anos\n\n\n\nImagem ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "km-50",
    "name": "KM 50",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KM 50</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Golfinho de Mola\n\n\n\nIdade Recomendada: 3 a 12 anos\n\n\n\nDescri\u00e7\u00e3o: Brinquedo infantil sobre mola em formato de golfinho com a seguinte descri\u00e7\u00e3o: pe\u00e7a de pl\u00e1stico polietileno rotomoldado na cor azul, 320mm de largura total, 960mm de comprimento e 520mm de altura at\u00e9 o assento, em formato de motocicleta; mola feita com a\u00e7o galvanizado a fogo com \u00d820mm de di\u00e2metro, revestido com pintura eletroest\u00e1tica, 400mm de altura e 200mm de largura; suporte \u00e2ncora feito com a\u00e7o galvanizado a fogo, para fixa\u00e7\u00e3o da mola no brinquedo e para fixa\u00e7\u00e3o da mola dentro ou sobre o concreto ou terra;\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "p-60a",
    "name": "P-60A",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-60A</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Balan\u00e7o infantil.\n\n\n\n\u00c1rea necess\u00e1ria: 4m x 3m.\n\n\n\nIdade Recomendada: 3 a 12 anos\n\n\n\nDescri\u00e7\u00e3o: O Balan\u00e7o para Crian\u00e7as P-60 A da Krenke Brinquedos \u00e9 um balan\u00e7o composto por uma estrutura de ferro tubular e uma travessa de tubo de metal galvanizado com 1 assento em pl\u00e1stico rotomoldado outro cadeirinha beb\u00ea. (assentos da escolha do cliente)\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "piso-emborrachado-40mm",
    "name": "Piso Emborrachado 40mm",
    "category": "Pisos de Borracha",
    "description": "Produto da categoria Pisos de Borracha",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">Piso Emborrachado 40mm</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Piso Emborrachado 40mm [ Chapa de 1mx1m]\n\n\n\nCores VERDE E TERRA COTA\n\n\n\nDescri\u00e7\u00e3o: Piso Ecol\u00f3gico composto de gr\u00e2nulos de pneus de caminh\u00e3o reciclado, Aglomerado e prensado, 100% pigmentada. Piso Perme\u00e1vel (drenante 7.4L/h) em m\u00faltiplas dire\u00e7\u00f5es em toda sua dimens\u00e3o. Possui bolsas de amortecimento de quedas. N\u00e3o produz odor de borracha convencional. (Inodoro e at\u00f3xico). Placas de 1m x 1m com chanfros a cada 50 cm, Possui Certifica\u00e7\u00e3o Nacional e internacional de acordo com as especifica\u00e7\u00f5es da norma de seguran\u00e7a de Playgrounds NR 16071 para contemplar o \u00edndice cr\u00edtico de quedas (HIC) necess\u00e1rio nas placas emborrachadas aplicadas em playground e espa\u00e7os com equipamentos infantis. N\u00e3o existe desagrega\u00e7\u00e3o granular.\n\nF\u00e1cil instala\u00e7\u00e3o atrav\u00e9s de colagem lateral utilizando resina isocianato espec\u00edfica para instala\u00e7\u00e3o de piso de borracha em \u00e1rea externa com intemp\u00e9ries vari\u00e1veis, impossibilitando assim a canoagem e espa\u00e7amento entre placas provocadas pelo trabalho da borracha (dilata\u00e7\u00e3o e contra\u00e7\u00e3o) proveniente da resili\u00eancia de pisos de borracha em geral. Emulsionada, ambos com contens\u00e3o nas laterais ou acabamentos ao redor da \u00e1rea em n\u00edvel. N\u00e3o utiliza pinos, grampos ou qualquer material r\u00edgido que afete a seguran\u00e7a e coeficiente de amortecimento da placa emborrachada, para manuten\u00e7\u00e3o lavar com agua e sab\u00e3o neutro.\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/pisos-de-borracha/\" rel=\"tag\">PISOS DE BORRACHA</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/pisos-de-borracha/\" rel=\"tag\">PISOS DE BORRACHA</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "p-92",
    "name": "P-92",
    "category": "Mobili\u00e1rio Urbano e Jardim",
    "description": "Produto da categoria Mobili\u00e1rio Urbano e Jardim",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-92</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Banco de jardim P-92\n\n\n\nMedidas: 1,50m x 70cm.\n\n\n\nDescri\u00e7\u00e3o: O Banco de A\u00e7o para Jardins P-92 da Krenke \u00e9 composto por uma estrutura de tubo de metal galvanizado com ripas de madeira pl\u00e1stica na cor semelhante da madeira.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/mobiliario-urbano-e-jardim/\" rel=\"tag\">MOBILI\u00c1RIO URBANO E JARDIM</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/mobiliario-infantil/\" rel=\"tag\">MOBILI\u00c1RIO INFANTIL</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/mobiliario-urbano-e-jardim/\" rel=\"tag\">MOBILI\u00c1RIO URBANO E JARDIM</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "p-92-a-(colorido)",
    "name": "P-92-A (COLORIDO)",
    "category": "Mobili\u00e1rio Urbano e Jardim",
    "description": "Produto da categoria Mobili\u00e1rio Urbano e Jardim",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-92-A (COLORIDO)</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Banco de jardim P-92-A (MP)\n\n\n\nMedidas: 1,50m x 70cm.\n\n\n\nDescri\u00e7\u00e3o: O Banco de A\u00e7o para Jardins P-92-A da Krenke \u00e9 um banco composto por p\u00e9s com uma estrutura de tubo de metal galvanizado com ripas de madeira pl\u00e1stica COLORIDA.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/mobiliario-urbano-e-jardim/\" rel=\"tag\">MOBILI\u00c1RIO URBANO E JARDIM</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/mobiliario-infantil/\" rel=\"tag\">MOBILI\u00c1RIO INFANTIL</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/mobiliario-urbano-e-jardim/\" rel=\"tag\">MOBILI\u00c1RIO URBANO E JARDIM</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "b-102-(colorido)",
    "name": "B-102 (COLORIDO)",
    "category": "Mobili\u00e1rio Urbano e Jardim",
    "description": "Produto da categoria Mobili\u00e1rio Urbano e Jardim",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">B-102 (COLORIDO)</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Banco de jardim em madeira pl\u00e1stica\n\n\n\nMedidas: 1,50m x 70cm.\n\n\n\nDescri\u00e7\u00e3o: O Banco para Jardim B-102 \u00e9 composto por uma estrutura de polietileno com ripas de madeira pl\u00e1stica coloridas. Isto garante maior durabilidade e mant\u00e9m um aspecto de produto novo e bem conservado por mais tempo, melhorando assim o custo benef\u00edcio deste produto.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/mobiliario-urbano-e-jardim/\" rel=\"tag\">MOBILI\u00c1RIO URBANO E JARDIM</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/mobiliario-infantil/\" rel=\"tag\">MOBILI\u00c1RIO INFANTIL</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "b-102",
    "name": "B-102",
    "category": "Mobili\u00e1rio Urbano e Jardim",
    "description": "Produto da categoria Mobili\u00e1rio Urbano e Jardim",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">B- 102</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Banco de jardim em madeira pl\u00e1stica\n\n\n\n</div>\n\nMedidas: 1,50m x 70cm.\n\n\n\nDescri\u00e7\u00e3o:\n\nO Banco para Jardim B-102 \u00e9 composto por uma estrutura de polietileno com ripas de madeira pl\u00e1stica na cor natural. Isto garante maior durabilidade e mant\u00e9m um aspecto de produto novo e bem conservado por mais tempo, melhorando assim o custo benef\u00edcio deste produto.\n\n\n\nImagem meramente ilustrativa!\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n&nbsp;\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/pisos-de-borracha/\" rel=\"tag\">PISOS DE BORRACHA</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/pisos-de-borracha/\" rel=\"tag\">PISOS DE BORRACHA</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "jogo-de-xadrez-gigante",
    "name": "Jogo de Xadrez Gigante",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">Jogo de Xadrez Gigante</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nO Jogo de Xadrez Gigante da Krenke \u00e9 formado por um conjunto de 32 pe\u00e7as em escala gigante com a figura do REI medindo 75 cm de altura e 33 cm de di\u00e2metro na base (pe\u00e7a maior) e o PE\u00c3O medindo 45 cm de altura (pe\u00e7a menor).\n\n\n\nFabricado em pl\u00e1stico at\u00f3xico com tratamento UV que permite ser usado em \u00e1reas externas expostas ao tempo garantindo maior durabilidade.\n\n\n\nOp\u00e7\u00f5es de cores: Amarelo, Azul, Branco, Preto, Verde e Vermelho.\n\n\n\nO tabuleiro \u00e9 item opcional e as pe\u00e7as podem ser vendidas avulsas. Fornecemos pe\u00e7as\u00a0de\u00a0reposi\u00e7\u00e3o.\n\nRecomendado para crian\u00e7as de 02 a 12 anos.\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parques/\" rel=\"tag\">BRINQUEDOS PARA PARQUES</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/playground-infantil/\" rel=\"tag\">PLAYGROUND INFANTIL</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/playgrounds-completos/\" rel=\"tag\">PLAYGROUNDS COMPLETOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "t\u00fanel-pet-3-curvas-de-90\u00b0-circuito-agility-krenke-3,08-m",
    "name": "T\u00fanel Pet 3 Curvas de 90\u00b0 Circuito Agility Krenke 3,08 m",
    "category": "Linha Pet",
    "description": "Produto da categoria Linha Pet",
    "specs": "O T\u00fanel Pet com 3 Curvas do Circuito Agility Krenke \u00e9 fabricado com materiais de alta qualidade e seguran\u00e7a.\n\n\n\nIsto faz com que este produto apresente um excelente custo benef\u00edcio pois prioriza a integridade f\u00edsica do seu Pet.\n\n\n\n\u00c9 muito divertido para seu Pet brincar neste T\u00fanel.\n\n\n\nUm \u00f3timo produto para seu Pet brincar e ao mesmo tempo estimular a atividade f\u00edsica e a conviv\u00eancia social.\n\n\n\nEsse produto apresenta \u00f3tima resist\u00eancia aos intemp\u00e9ries clim\u00e1ticos, como os raios solares UV, evitando o desbotamento precoce das pe\u00e7as de polietileno coloridos por pigmenta\u00e7\u00e3o.\n\n\n\nAs principais pe\u00e7as de pl\u00e1stico s\u00e3o fabricadas com polietileno rotomoldado com cantos arredondados e \u00f3tima resist\u00eancia mec\u00e2nica (dependendo do molde na fabrica\u00e7\u00e3o a pe\u00e7a fica oca e consequentemente mais resistente).\n\n\n\nItens inclusos no produto:\n\n\n\n4 - Pilares de madeira pl\u00e1stica para altura da flange apoiada ao solo, com perfil de 11 cm X 11 cm com comprimento de 1,30 m, para 1,0 m acima do solo na cor marrom (fabricado com Madeira Pl\u00e1stica com um acabamento superficial para replicar madeira)\n\n\n\n4 - Acabamentos de ponta de coluna, na cor laranja ou verde pigmentado (fabricado com polietileno)\n\n\n\n2 - Flanges apoiadas ao solo, na cor amarela pigmentado (fabricado com polietileno)\n\n\n\n3 - Curva de 90\u00b0 na cor azul pigmentado (fabricado com polietileno)\n\n\n\n1 - Kit de parafusos para montar o conjunto de pe\u00e7as (com acabamento de parafuso para evitar ferrugem e melhorar a apar\u00eancia do produto )\n\n\n\nComposi\u00e7\u00e3o da mat\u00e9ria prima:\n\n\n\n1-O produto \u00e9 fabricado com materiais de alta qualidade at\u00f3xicos e recicl\u00e1veis\n\n\n\n2- Polietileno pigmentado (colorido), com aditivo UV que garante a colora\u00e7\u00e3o original por mais tempo mesmo que exposto ao clima.\n\n\n\n4-Madeira Pl\u00e1stica (MP) \u00e9 um material fabricado a partir da reciclagem de pl\u00e1sticos, que s\u00e3o processados, aglomerados e pigmentados.\n\n\n\nAo comprar a Madeira Pl\u00e1stica voc\u00ea tamb\u00e9m est\u00e1 ajudando a retirar o lixo da natureza de forma consciente e sustent\u00e1vel\n\n\n\nCaracter\u00edsticas e dimens\u00f5es:\n\n\n\nPeso aproximado: 115 kg (varia segundo a configura\u00e7\u00e3o)\n\n\n\nAltura: 1,02 m do ch\u00e3o at\u00e9 a parte superior da flange (\u00b1 1 cm dependendo da montagem)\n\n\n\nLargura: 3,08 m (\u00b1 3 cm dependendo da montagem)\n\n\n\nComprimento: 3,08 m (\u00b1 3 cm dependendo da montagem)\n\n\n\nIdade recomendada (anos): sem restri\u00e7\u00e3o\n\n\n\nCores dispon\u00edveis: Colorido (cores segundo a descri\u00e7\u00e3o e imagens) ou natural (cor predominante verde musgo segundo imagens)\n\n\n\n\u00c1rea necess\u00e1ria para o espa\u00e7o de instala\u00e7\u00e3o de aproximadamente 3,08 m x 3,08 m = 9,5 m\u00b2\n\n\n\nGarantia:\n\n\n\n1 ano contra defeitos de fabrica\u00e7\u00e3o\n\n\n\nOs produtos da Krenke s\u00e3o garantidos contra defeito de fabrica\u00e7\u00e3o pelo prazo de 1 ano.\n\n\n\nTodo e qualquer dano causado nos produtos em consequ\u00eancia de mau uso e manuseio inadequado, \u00e9 de responsabilidade\u00a0do\u00a0cliente.",
    "image": "",
    "images": []
  },
  {
    "id": "salto-pet-agility",
    "name": "Salto Pet Agility",
    "category": "Linha Pet",
    "description": "Produto da categoria Linha Pet",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">Salto Pet Agility</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Salto Pet\n\n\n\nDescri\u00e7\u00e3o: Feito em pl\u00e1stico rotomoldado e madeira pl\u00e1stica o salto agility \u00e9 utilizado para corrida e saltos\u00a0de\u00a0seu\u00a0pet.\n\n\n\nFormado por arcos para saltos, s\u00e3o confeccionados para impactos e resist\u00eancia ao uso de cachorros de m\u00e9dio e grande porte.\n\nO Salto Agility pode ser distribu\u00eddo com v\u00e1rios arcos formando um circuito.\n\n\n\nDispon\u00edvel em 3 alturas.\n\n\n\nEste produto \u00e9 indicado para ambientes internos e externos.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n&nbsp;",
    "image": "",
    "images": []
  },
  {
    "id": "play-pet-agility-krenke",
    "name": "Play Pet Agility Krenke",
    "category": "Linha Pet",
    "description": "Produto da categoria Linha Pet",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">Play Pet Agility Krenke</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Play Pet\n\n\n\nDescri\u00e7\u00e3o: Mini playground desenhado para pets em circuito agility.\n\nFeito em pl\u00e1stico rotomoldado, \u00e9 super resistente e totalmente desenvolvido para cachorros de pequeno, m\u00e9dio e grande porte brincarem.\n\n\n\nO produto v\u00eam com a configura\u00e7\u00e3o inicial de uma escada, plataforma e escorregador.\n\n\n\nEste produto \u00e9 indicado para ambientes internos e externos.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n&nbsp;",
    "image": "",
    "images": []
  },
  {
    "id": "p-93",
    "name": "P-93",
    "category": "Mobili\u00e1rio Urbano e Jardim",
    "description": "Produto da categoria Mobili\u00e1rio Urbano e Jardim",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">P-93</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\nNome: Banco de jardim P-93\n\n\n\nMedidas: 2m x 47cm x 72cm.\n\n\n\nDescri\u00e7\u00e3o: O Banco de A\u00e7o para Jardins P-93 da Krenke \u00e9 composto por uma estrutura de tubo de metal quadrado\u00a0 galvanizado com ripas de madeira pl\u00e1stica na cor semelhante da madeira.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/mobiliario-urbano-e-jardim/\" rel=\"tag\">MOBILI\u00c1RIO URBANO E JARDIM</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/mobiliario-infantil/\" rel=\"tag\">MOBILI\u00c1RIO INFANTIL</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/mobiliario-urbano-e-jardim/\" rel=\"tag\">MOBILI\u00c1RIO URBANO E JARDIM</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "balan\u00e7o-acess\u00edvel",
    "name": "Balan\u00e7o Acess\u00edvel",
    "category": "Brinquedos Avulsos",
    "description": "Produto da categoria Brinquedos Avulsos",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">Balan\u00e7o Acess\u00edvel</h2>\n\n<div class=\"product-nav\">\n\n<div class=\"product-prev\"></div>\n\n<div class=\"product-next\"></div>\n\n</div>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c1rea necess\u00e1ria: 2m x 1,95m.\n\n\n\nDescri\u00e7\u00e3o: O Balan\u00e7o acess\u00edvel da Krenke Brinquedos \u00e9 um balan\u00e7o composto por uma estrutura de alum\u00ednio e uma travessa de tubo de metal galvanizado com chapa de alum\u00ednio e acabamento com for em rotomoldado.\n\n\n\nImagem meramente ilustrativa!\n\n\n\n</div>\n\n<div class=\"product_meta\"><span class=\"posted_in\">CATEGORIA:\u00a0<a href=\"https://www.krenke.com.br/categoria-produto/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a></span><span class=\"tagged_as\">TAGS:\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-avulsos/\" rel=\"tag\">BRINQUEDOS AVULSOS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-escolas/\" rel=\"tag\">BRINQUEDOS PARA ESCOLAS</a>,\u00a0<a href=\"https://www.krenke.com.br/produto-tag/brinquedos-para-parquinhos/\" rel=\"tag\">BRINQUEDOS PARA PARQUINHOS</a></span></div>",
    "image": "",
    "images": []
  },
  {
    "id": "linha-tem\u00e1tica",
    "name": "LINHA TEM\u00c1TICA",
    "category": "Playgrounds Completos",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">LINHA TEM\u00c1TICA</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 12 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left; height: 573px;\" border=\"1\" width=\"549\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 12 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "klp-0101",
    "name": "KLP 0101",
    "category": "Little Play",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KLP 0101</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>3,17m x 1,98m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>4 x 7 m = 28 m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 7 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "klp-0102",
    "name": "KLP 0102",
    "category": "Little Play",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KLP 0102</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>2,45m x 2,28m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>4,28 x\u00a0 6,45m = 27,60 m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 7 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "klp-0201",
    "name": "KLP 0201",
    "category": "Little Play",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KLP 0201</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>3,97m x 3,36m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>5,97 x\u00a0 m 7,30 = 43,58m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 7 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "klp-0202",
    "name": "KLP 0202",
    "category": "Little Play",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KLP 0202</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>3,91m x 3,36m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>5,91 x\u00a0 m 7,30 = 43,14m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 7 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  },
  {
    "id": "klp-0204",
    "name": "KLP 0204",
    "category": "Little Play",
    "description": "\\n\n\\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\\n\n\\n",
    "specs": "<h2 class=\"product_title entry-title show-product-nav\">KLP 0204</h2>\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n\n\n\u00c9 fabricando com materiais de alta qualidade, dentro normas da ABNT (NBR 16.071/21) de qualidade e seguran\u00e7a. Isto faz com que este Playground Infantil seja um produto de excelente custo benef\u00edcio pois, al\u00e9m de dur\u00e1vel devido a \u00f3timos materiais empregados a ele, este mant\u00e9m a integridade f\u00edsica da crian\u00e7a por atender normas de seguran\u00e7a. Recomendado para crian\u00e7as de 03 a 7 anos.\n\n<div class=\"description woocommerce-product-details__short-description\">\n\n<table style=\"text-align: left;\" border=\"1\" cellpadding=\"10\">\n\n<tbody>\n\n<tr>\n\n<th>Tamanho do Brinquedo</th>\n\n<td>5,11m x 3,36m</td>\n\n</tr>\n\n<tr>\n\n<th>\u00c1rea Necess\u00e1ria C/ Circula\u00e7\u00e3o</th>\n\n<td>8,11 x\u00a0 m 7,30 = 59,20m\u00b2</td>\n\n</tr>\n\n<tr>\n\n<th>Cubagem</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Peso</th>\n\n<td>Consultar</td>\n\n</tr>\n\n<tr>\n\n<th>Altura da Torre</th>\n\n<td>1,20m / 1,40m</td>\n\n</tr>\n\n<tr>\n\n<th>Norma</th>\n\n<td>NBR 16.071/21</td>\n\n</tr>\n\n<tr>\n\n<th>Idade Recomendada</th>\n\n<td>Para maiores de 03 Anos at\u00e9 7 Anos</td>\n\n</tr>\n\n</tbody>\n\n</table>\n\n</div>\n\n</div>",
    "image": "",
    "images": []
  }
];

const ProductModal: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/70 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full animate-fade-in-up">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="bg-white/80 hover:bg-white text-gray-400 hover:text-gray-500 rounded-full p-2 focus:outline-none backdrop-blur-sm shadow-sm">
              <X size={24} />
            </button>
          </div>

          <div className="grid md:grid-cols-2">
            {/* Left: Image Gallery */}
            <div className="bg-gray-100 p-6 md:p-8 flex flex-col h-full">
              <div className="flex-grow flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-inner mb-4 border border-gray-200 aspect-square">
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-krenke-orange' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="p-6 md:p-10 flex flex-col h-full overflow-y-auto max-h-[80vh] md:max-h-[90vh]">
              <div className="mb-2">
                <span className="inline-block py-1 px-3 rounded-full bg-orange-50 text-krenke-orange text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">{product.name}</h2>

              {/* Custom Styles for Table */}
              <style>{`
                .product-specs-content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 1rem;
                  margin-bottom: 2rem;
                  font-size: 0.95rem;
                }
                .product-specs-content th, .product-specs-content td {
                  border: 1px solid #e2e8f0;
                  padding: 0.75rem 1rem;
                  text-align: left;
                }
                .product-specs-content th {
                  background-color: #f8fafc;
                  font-weight: 600;
                  color: #1f2937;
                  width: 40%;
                }
                .product-specs-content td {
                  color: #4b5563;
                }
                .product-specs-content tr:nth-child(even) {
                  background-color: #fcfcfc;
                }
                .product-specs-content tr:hover {
                  background-color: #f1f5f9;
                }
              `}</style>

              {product.specs ? (
                <div className="product-specs-content prose prose-slate max-w-none mb-8" dangerouslySetInnerHTML={{ __html: product.specs }} />
              ) : (
                <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>
              )}

              <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                  onClick={() => window.location.href = '/#/quote'}
                >
                  Solicitar Orçamento Deste Item
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  * Imagens meramente ilustrativas. Cores e detalhes podem variar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Management State
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Playgrounds Completos');
  const [newDesc, setNewDesc] = useState('');
  const [newSpecs, setNewSpecs] = useState('');

  // Load products
  useEffect(() => {
    // Initialize with INITIAL_PRODUCTS
    // Then check if we have better data in localStorage (optional, but good for persistence)
    // For now, let's merge or prefer localStorage if it exists, but since we are "hardcoding" from CSV,
    // we might want to ensure these exist.
    // A simple strategy: Use INITIAL_PRODUCTS as base.

    // Process INITIAL_PRODUCTS to attach images
    const processedInitial = INITIAL_PRODUCTS.map(p => {
      const assets = findProductAssets(p.name);
      return {
        ...p,
        image: assets.main || 'https://via.placeholder.com/400?text=Sem+Imagem',
        images: assets.gallery
      };
    });

    const saved = localStorage.getItem('krenke_products');
    if (saved) {
      const savedProducts = JSON.parse(saved);
      // We could merge here, but for simplicity let's just use saved if available,
      // OR if the user wants to reset, they can clear cache.
      // However, since I just added new hardcoded products, I should probably prioritize them or at least add them if missing.
      // Let's just set them as the state for now to ensure the user sees the CSV data.
      setProducts(processedInitial);
    } else {
      setProducts(processedInitial);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('krenke_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }

    if (params.get('edit') === 'true') {
      setIsEditMode(true);
    }
  }, [location]);

  // Auto-parse HTML when pasted
  useEffect(() => {
    if (newSpecs) {
      const { title, description } = parseProductHtml(newSpecs);
      if (title && !newName) setNewName(title);
      if (description && !newDesc) setNewDesc(description);
    }
  }, [newSpecs]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-discover assets
    const assets = findProductAssets(newName);

    const newProduct: Product = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      description: newDesc,
      specs: newSpecs || undefined,
      image: assets.main || 'https://via.placeholder.com/400?text=Sem+Imagem',
      images: assets.gallery
    };

    setProducts([...products, newProduct]);
    setNewName('');
    setNewDesc('');
    setNewSpecs('');
    setShowAddForm(false);
    alert('Produto adicionado! Imagens foram vinculadas automaticamente se encontradas na pasta assets.');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleRefreshImages = (product: Product) => {
    const assets = findProductAssets(product.name);
    const updatedProduct = {
      ...product,
      image: assets.main || product.image,
      images: assets.gallery
    };

    setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
    alert(`Imagens atualizadas! Encontradas: ${assets.gallery.length}`);
  };

  const handleExportCode = () => {
    const code = `// Copie este código e substitua a inicialização do estado 'products' em Products.tsx
const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};`;

    navigator.clipboard.writeText(code);
    alert('Código copiado para a área de transferência! Cole no chat ou no arquivo Products.tsx.');
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Header Banner */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Home</span>
              <ChevronRight size={14} />
              <span className="text-krenke-orange font-bold">Produtos</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">Catálogo 2026</h1>
            <p className="text-gray-600 mt-2">Qualidade e segurança em cada detalhe.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${isEditMode ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isEditMode ? 'Modo Edição Ativo' : 'Admin'}
            </button>

            <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-krenke-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200">
              <Download size={20} />
              Baixar Catálogo PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Management Area */}
        {isEditMode && (
          <div className="mb-12 bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Save className="text-purple-600" />
                Gerenciar Produtos
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCode}
                  className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all"
                  title="Copiar código para salvar permanentemente"
                >
                  <Code size={20} />
                  Exportar Código
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
                >
                  {showAddForm ? <X size={20} /> : <Plus size={20} />}
                  {showAddForm ? 'Cancelar' : 'Novo Produto'}
                </button>
              </div>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="col-span-full bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                    <FileText size={18} />
                    Importação Rápida via HTML
                  </h3>
                  <p className="text-sm text-blue-600 mb-2">
                    Cole o HTML do produto no campo "Especificações HTML" abaixo para preencher automaticamente o Nome e a Descrição.
                  </p>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especificações HTML (Cole aqui para auto-preencher)</label>
                  <textarea
                    value={newSpecs}
                    onChange={(e) => setNewSpecs(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                    placeholder="Cole o HTML aqui..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ex: KMP 0101"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    As imagens serão buscadas automaticamente em <code>assets/{newName || '...'}</code>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta (Extraída automaticamente)</label>
                  <textarea
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="col-span-full">
                  <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">
                    Salvar Produto
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter size={18} /> Categorias
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
                      ? 'bg-krenke-orange text-white shadow-md'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-krenke-orange'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Mobile Filters & Search */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="O que você procura?"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-krenke-orange focus:border-transparent shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Mobile Categories (Horizontal Scroll) */}
              <div className="lg:hidden flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all flex-shrink-0 ${activeCategory === cat
                      ? 'bg-krenke-orange text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div key={product.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">

                    {/* Edit Mode Actions */}
                    {isEditMode && (
                      <div className="absolute top-2 right-2 z-20 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRefreshImages(product); }}
                          className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
                          title="Recarregar Imagens"
                        >
                          <ImageIcon size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                          className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    <div className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Sem+Imagem';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-krenke-orange rounded-full shadow-sm border border-orange-100">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight group-hover:text-krenke-orange transition-colors">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-grow">
                        {(product.description || '').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()}
                      </p>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-full py-3 border-2 border-gray-100 text-gray-700 font-bold rounded-xl group-hover:border-krenke-orange group-hover:bg-krenke-orange group-hover:text-white transition-all duration-300"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                  <Filter size={48} className="mb-4 opacity-20" />
                  <h3 className="text-lg font-bold mb-1">Nenhum produto encontrado</h3>
                  <p>Tente mudar os filtros ou adicione novos produtos.</p>
                  {isEditMode && (
                    <button onClick={() => setShowAddForm(true)} className="mt-4 text-purple-600 font-bold hover:underline">
                      Adicionar Produto
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
