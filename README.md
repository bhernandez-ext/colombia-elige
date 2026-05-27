# Colombia Elige

Juego de estrategia electoral ambientado en las presidenciales colombianas de 2026. Esta versión ya quedó separada en archivos estáticos, con portada visual, modo campaña 1 vs IA y flujo 1v1 en tiempo real listo para Supabase.

La campaña incluye sondeos de opinión, eventos aleatorios, coaliciones en segunda vuelta y la opción de crear un candidato personalizado.

## Estructura

- `index.html`: shell principal del juego.
- `styles.css`: interfaz y layout.
- `js/app.js`: reglas, UI, turnos IA y flujo multijugador.
- `js/data.js`: bancos de sondeos, eventos y preguntas del candidato personalizado.
- `js/config.js`: credenciales locales de Supabase.
- `assets/home-bg.jpg`: imagen del home.
- `assets/candidates.jpg`: collage de retratos usado para cortar portraits en runtime.
- `supabase/schema.sql`: tablas y políticas.
- `supabase/functions/resolve-turn/index.ts`: árbitro de turnos.

## Desarrollo local

Sirve el proyecto desde la raíz para evitar problemas con `fetch`, assets y CDN:

```bash
python3 -m http.server 4173
```

Luego abre:

```text
http://127.0.0.1:4173/
```

## Compartirlo con otra persona

`http://127.0.0.1:4173/` solo funciona en el computador que está ejecutando el servidor. Para pasárselo a otra persona:

1. Envíale la carpeta completa del proyecto, no solo `index.html`.
2. Si usa Windows, que haga doble clic en `start-local.bat`.
3. Si usa macOS, que haga doble clic en `start-local.command`.
4. Si prefiere terminal, puede entrar a la carpeta y correr `python3 -m http.server 4173`.

Archivos mínimos que debe conservar juntos:

- `index.html`
- `styles.css`
- carpeta `js`
- carpeta `assets`

Si `js/config.js` tiene credenciales válidas de Supabase, también podrá entrar al modo multijugador. Si no, el juego seguirá funcionando en modo campaña 1 vs IA.

## Activar Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL editor.
3. Crea la Edge Function `resolve-turn` con el contenido de `supabase/functions/resolve-turn/index.ts`.
4. Duplica `js/config.example.js` como `js/config.js` y completa:

```js
window.ColombiaEligeConfig = {
  supabaseUrl: "https://TU-PROYECTO.supabase.co",
  supabaseAnonKey: "TU_ANON_KEY",
};
```

## Ponerlo en producción con GitHub Pages

Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Colombia Elige v1"
gh repo create bhernandez-ext/colombia-elige --public --source=. --push
gh api repos/bhernandez-ext/colombia-elige/pages -X POST -f source='{"branch":"main","path":"/"}'
```

URL esperada:

```text
https://bhernandez-ext.github.io/colombia-elige/
```
