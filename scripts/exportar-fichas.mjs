// Exporta os mesmos SVGs do app. Uso: npm run exportar:fichas -- --destino <pasta>
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const i=process.argv.indexOf('--destino');
if(i<0||!process.argv[i+1])throw new Error('Informe --destino <pasta>');
const destino=resolve(process.argv[i+1]);
const raiz=fileURLToPath(new URL('../',import.meta.url));
const server=await createServer({root:raiz,configFile:false,resolve:{preserveSymlinks:true},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});
try {
  const {gerarCadernoAlfabeto}=await server.ssrLoadModule('/src/conteudo/alfabetos.ts');
  const indice=[];
  for(const id of ['alfabeto','alfabeto-grego']){
    const fichas=gerarCadernoAlfabeto(id);
    await mkdir(join(destino,'svg',id),{recursive:true});
    for(const [n,f] of fichas.entries()){
      await writeFile(join(destino,'svg',id,f.arquivo),f.svg);
      indice.push({caderno:id,pagina:n+1,id:f.id,arquivo:`svg/${id}/${f.arquivo}`,titulo:f.titulo,grupo:f.grupo});
    }
    console.log(`${id}: ${fichas.length} fichas A4`);
  }
  await writeFile(join(destino,'indice.json'),JSON.stringify(indice,null,2));
} finally { await server.close(); }
