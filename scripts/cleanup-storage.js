import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(part => part.trim()))
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('Iniciando limpeza do storage...');

  // 1. Limpar pasta temp em 'products'
  const { data: tempFiles, error: listError } = await supabase.storage
    .from('products')
    .list('temp');

  if (listError) {
    console.error('Erro ao listar temp:', listError.message);
  } else if (tempFiles && tempFiles.length > 0) {
    const pathsToDelete = tempFiles.map(f => `temp/${f.name}`);
    console.log(`Deletando ${pathsToDelete.length} arquivos da pasta temp...`);
    const { error: delError } = await supabase.storage.from('products').remove(pathsToDelete);
    if (delError) console.error('Erro ao deletar temp:', delError.message);
    else console.log('Pasta temp limpa.');
  }

  // 2. Limpar avatares pesados específicos (vistos no log anterior)
  const avatarsToDelete = [
    'avatars/a76fa4c2-b463-4b80-9c23-754f20305719-0.3071509279159784.png',
    'avatars/a76fa4c2-b463-4b80-9c23-754f20305719-0.773399575068375.png'
  ];
  
  console.log('Limpando avatares pesados detectados...');
  const { error: avatarError } = await supabase.storage.from('public').remove(avatarsToDelete);
  if (avatarError) console.error('Erro ao deletar avatares:', avatarError.message);
  else console.log('Avatares pesados removidos.');

  console.log('Limpeza concluída.');
}

cleanup();
