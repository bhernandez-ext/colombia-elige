import { readFile, writeFile } from "node:fs/promises";

const appPath = new URL("../js/app.js", import.meta.url);
let source = await readFile(appPath, "utf8");

const intro = `const APP_CONFIG = window.ColombiaEligeConfig || {};
const MULTI_READY = Boolean(window.supabase && APP_CONFIG.supabaseUrl && APP_CONFIG.supabaseAnonKey);
const GEOJSON_URL = 'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json';
const sb = MULTI_READY ? window.supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseAnonKey) : null;
const PORTRAITS = {};

async function loadPortraits() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const names = ['cepeda', 'abelardo', 'paloma', 'fajardo', 'claudia'];
      const pw = img.width / names.length;
      names.forEach((name, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, index * pw, 0, pw, img.height, 0, 0, 240, 300);
        PORTRAITS[name] = canvas.toDataURL('image/jpeg', 0.85);
      });
      resolve();
    };
    img.onerror = () => resolve();
    img.src = './assets/candidates.jpg';
  });
}

`;

source = source.replace(/const PORTRAITS = \{[\s\S]*?\};\n\n\n/, intro);
await writeFile(appPath, source);
