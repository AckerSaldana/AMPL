import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Script para verificar que los estilos de dark mode no se eliminaron en el build
console.log('🔍 Verificando build para dark mode...');

const distPath = path.join(__dirname, '..', 'dist');
const assetsPath = path.join(distPath, 'assets');

if (!fs.existsSync(distPath)) {
  console.error('❌ No se encontró la carpeta dist. Ejecuta npm run build primero.');
  process.exit(1);
}

// Buscar archivos JS en el build
const jsFiles = fs.readdirSync(assetsPath)
  .filter(file => file.endsWith('.js'));

let darkModeFound = false;
let darkModeStyles = 0;

jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(assetsPath, file), 'utf8');
  
  // Buscar referencias a dark mode
  if (content.includes('darkMode')) {
    darkModeFound = true;
  }
  
  // Contar estilos condicionales de dark mode
  const darkModeMatches = content.match(/darkMode\s*\?/g);
  if (darkModeMatches) {
    darkModeStyles += darkModeMatches.length;
  }
});

if (darkModeFound) {
  console.log('✅ Dark mode encontrado en el build');
  console.log(`📊 ${darkModeStyles} estilos condicionales de dark mode encontrados`);
  
  if (darkModeStyles < 50) {
    console.warn('⚠️  Advertencia: Menos estilos de dark mode de lo esperado');
    console.warn('   Esto podría indicar que algunos estilos fueron eliminados durante la optimización');
  }
} else {
  console.error('❌ No se encontraron referencias a dark mode en el build');
  console.error('   Los estilos de dark mode podrían haber sido eliminados');
}

console.log('\n💡 Sugerencias si hay problemas:');
console.log('1. Verifica que useDarkMode se esté importando correctamente');
console.log('2. Asegúrate de que los componentes usen el hook en lugar de condicionales inline');
console.log('3. Revisa la configuración de Vite para mantener el código condicional');