import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple .env reader
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(part => part.trim()))
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não encontradas no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadCatalog() {
  const filePath = path.resolve(__dirname, '../catalogo-krenke-2026_compressed.pdf');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);

  console.log('Iniciando upload do catálogo otimizado (7MB)...');
  
  const { data, error } = await supabase.storage
    .from('catalogo')
    .upload('catalogo-krenke-2026.pdf', fileBuffer, {
      contentType: 'application/pdf',
      cacheControl: '31536000',
      upsert: true
    });

  if (error) {
    console.error('Erro no upload:', error.message);
    process.exit(1);
  }

  console.log('Upload concluído com sucesso:', data.path);
  
  // Delete the redundant large file if it exists
  console.log('Removendo arquivo redundante pesado...');
  await supabase.storage.from('catalogo').remove(['Catalogo_Krenke_Marco_2026.pdf']);
  
  console.log('Operação finalizada.');
}

uploadCatalog();
