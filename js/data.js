// ============================================================
// js/data.js — Colombia Elige · Datos calibrados v2
// Perfiles basados en posiciones públicas documentadas 2024-2026
// Resultados electorales 2022 y encuestas mayo 2026
// ============================================================

// ─────────────────────────────────────────────────────────────
// CANDIDATOS
// Ejes: e=extractivismo, s=seguridad, c=campo, v=valores, t=estado
// Escala: -2 (izq/progresista) a +2 (der/conservador)
// ─────────────────────────────────────────────────────────────
const CANDS = {
  cepeda: {
    id: 'cepeda',
    n: 'Iván Cepeda',
    short: 'Cepeda',
    party: 'Pacto Histórico',
    color: '#C0392B',
    poll: 35,
    p: {
      e: -2,  // Opositor frontal a extractivismo, fracking, nuevos contratos
      s: -2,  // Paz total, negociación sin condiciones, crítico de la fuerza pública
      c: -2,  // Reforma agraria profunda, defensor de comunidades campesinas
      v: -2,  // Progresista en valores, DDHH, feminismo, agenda social plena
      t: -2,  // Estado fuerte, crítico del modelo neoliberal
    },
    // Bases territoriales fuertes: Bogotá sur/centro, Nariño, Cauca, Chocó, Putumayo
    // Bases medianas: Atlántico popular, Magdalena, Eje Cafetero sindical
  },
  abelardo: {
    id: 'abelardo',
    n: 'Abelardo De la Espriella',
    short: 'Abelardo',
    party: 'Defensores de la Patria',
    color: '#E67E22',
    poll: 24,
    p: {
      e:  1,  // Abierto a minería y petróleo pero con retórica de "soberanía"
      s:  2,  // Mano dura, crítico de la paz total de Petro
      c:  1,  // Pro-ganadero y agroindustria costeña, pero con discurso popular
      v:  1,  // Conservador en valores, base evangélica y católica costeña
      t:  0,  // Populista: ni estatista puro ni neoliberal; promesas distributivas
    },
    // Bases territoriales fuertes: Costa Caribe (Bolívar, Córdoba, Sucre, Magdalena)
    // Bases medianas: Antioquia interior, Eje Cafetero derecha
  },
  paloma: {
    id: 'paloma',
    n: 'Paloma Valencia',
    short: 'Paloma',
    party: 'Centro Democrático',
    color: '#1A5276',
    poll: 26,
    p: {
      e:  2,  // Pro-extractivismo, defiende sector minero-energético explícitamente
      s:  2,  // Mano dura total, crítica frontal de la paz total y las FARC
      c:  1,  // Defiende propiedad privada rural, opuesta a reforma agraria
      v:  2,  // Conservadora en valores, aliada de iglesias evangélicas y católica
      t:  2,  // Liberal en economía, privatizaciones, reducción del Estado
    },
    // Bases territoriales: Antioquia (42% enc.), Meta, Casanare, Boyacá, Cundinamarca
    // Coalición: CD + Conservadores + Partido de la U + MIRA
  },
  fajardo: {
    id: 'fajardo',
    n: 'Sergio Fajardo',
    short: 'Fajardo',
    party: 'Independiente',
    color: '#1E8449',
    poll: 3,
    p: {
      e: -1,  // Crítico del extractivismo sin oponerse radicalmente; transición gradual
      s:  0,  // Ni paz total ni mano dura; negociación con condiciones
      c: -1,  // Reforma agraria moderada, formalización de tierras
      v: -1,  // Liberal en valores pero sin activismo; derechos sin confrontación
      t:  0,  // Centro: regulación activa sin estatismo ni privatización
    },
    // Bases: clase media urbana profesional, Medellín, ciudades intermedias
    // Sin base territorial sólida; depende de voto de opinión
  },
  claudia: {
    id: 'claudia',
    n: 'Claudia López',
    short: 'Claudia',
    party: 'Alianza Verde',
    color: '#7D3C98',
    poll: 3,
    p: {
      e: -2,  // Ambientalista activa, opositora al extractivismo y fracking
      s: -1,  // Pro-negociación pero con condiciones de DDHH; no paz total pura
      c: -1,  // Apoya formalización rural pero no reforma agraria radical
      v: -2,  // Progresista en valores, defensora explícita LGBTQ+, feminista
      t: -1,  // Más Estado en servicios sociales, pero no estatismo productivo
    },
    // Bases: Bogotá norte/occidente, Medellín clase media, jóvenes urbanos profesionales
    // Muy debilitada post-alcaldía; base principalmente voto de opinión
  },
};

// ─────────────────────────────────────────────────────────────
// GRUPOS DE INTERÉS — 23 grupos
// ─────────────────────────────────────────────────────────────
const GP = {
  clase_media: {
    n: 'Clase Media Urbana', i: '🏙️',
    p: { e: 0, s: 0, c: 0, v: 0, t: 0 },
    // Volátil, vota por percepción de seguridad y economía
  },
  jovenes: {
    n: 'Jóvenes Urbanos', i: '👥',
    p: { e: -1, s: -1, c: -1, v: -2, t: -1 },
    // Progresistas en valores, anti-establecimiento, baja fidelidad partidista
  },
  gremios: {
    n: 'Gremios Empresariales', i: '💼',
    p: { e: 1, s: 1, c: 0, v: 0, t: 2 },
    // ANDI, Fenalco, SAC: pro-mercado, anti-impuestos, seguridad jurídica
  },
  fecode: {
    n: 'Magisterio / FECODE', i: '📚',
    p: { e: -1, s: -2, c: -1, v: -1, t: -2 },
    // Sindicato docente: izquierda histórica, movilización territorial fuerte
  },
  sindicatos: {
    n: 'Sindicatos', i: '✊',
    p: { e: -1, s: -1, c: -1, v: -1, t: -2 },
    // CUT, CGT: izquierda laboral, pero más pragmáticos que FECODE
  },
  cafeteros: {
    n: 'Cafeteros', i: '☕',
    p: { e: 0, s: 1, c: 1, v: 1, t: 0 },
    // FNC: centro-derecha, pro-seguridad rural, propiedad privada, tradición
  },
  ganaderos: {
    n: 'Ganaderos / Fedegán', i: '🐄',
    p: { e: 1, s: 2, c: 2, v: 1, t: 1 },
    // Fedegán: derecha dura, oposición frontal a reforma agraria, mano dura
  },
  militares: {
    n: 'Fuerzas Militares', i: '⚔️',
    p: { e: 0, s: 2, c: 0, v: 1, t: 1 },
    // Activos y retirados: mano dura, anti-FARC, presupuesto defensa
  },


  indigenas: {
    n: 'Comunidades Indígenas', i: '🌿',
    p: { e: -2, s: -2, c: -2, v: 0, t: -2 },
    // ONIC, CRIC: anti-extractivismo total, autonomía territorial, paz
  },
  afros: {
    n: 'Comunidades Afro', i: '✊',
    p: { e: -1, s: -1, c: -1, v: -1, t: -1 },
    // PCN y organizaciones: centro-izquierda, derechos territoriales, paz
  },
  victimas: {
    n: 'Víctimas del Conflicto', i: '🕊️',
    p: { e: -1, s: -2, c: -1, v: 0, t: -1 },
    // UARIV, mesas de víctimas: paz, reparación, verdad, memoria
  },
  petroleros: {
    n: 'Sector Minero-Energético', i: '⛽',
    p: { e: 2, s: 1, c: 0, v: 0, t: 1 },
    // ACP, Ecopetrol workers: pro-extractivismo, seguridad jurídica
  },
  campesinos: {
    n: 'Campesinos', i: '🌾',
    p: { e: -1, s: -1, c: -2, v: 0, t: -2 },
    // ANUC, MIA: reforma agraria, economía campesina, anti-latifundio
  },
  adultos_mayores: {
    n: 'Adultos Mayores', i: '👴',
    p: { e: 0, s: 1, c: 0, v: 1, t: 0 },
    // Pensionados y mayores: seguridad, tradición, protección pensiones
  },
  p_liberal: {
    n: 'Partido Liberal', i: '🔴',
    p: { e: 0, s: 0, c: -1, v: -1, t: 0 },
    // Histórico centro-izquierda en valores y campo; oportunista en economía
    // Apoya a Cepeda por oposición al uribismo
  },
  p_conservador: {
    n: 'Partido Conservador', i: '🔵',
    p: { e: 1, s: 1, c: 1, v: 2, t: 0 },
    // Aliado de Paloma; fuerte en Eje Cafetero, Boyacá, Nariño, Antioquia
  },
  cambio_radical: {
    n: 'Cambio Radical', i: '🟡',
    p: { e: 1, s: 1, c: 0, v: 1, t: 1 },
    // Partido Char: Costa Caribe, centro-derecha, maquinaria regional
    // Disputado entre Paloma y Abelardo; tendencia a Paloma según encuestas
  },
  p_u: {
    n: 'Partido de la U', i: '🟢',
    p: { e: 0, s: 1, c: 0, v: 1, t: 0 },
    // Uribismo moderado; apoya a Paloma; fuerte en ciudades y territorios FARC
  },
  comunidades_religiosas: {
    n: 'Comunidades Religiosas', i: '🙏',
    p: { e: 0, s: 1, c: 0, v: 2, t: 0 },
    // Católicos, evangélicos, MIRA y otras confesiones. Conservador en valores.
    // Transversal al país pero más fuerte en Costa, Eje Cafetero, Llanos, islas.
  },
  lideres_sociales: {
    n: 'Líderes Sociales', i: '✊',
    p: { e: -2, s: -2, c: -2, v: 0, t: -1 },
    // JAC, defensores DDHH, líderes comunitarios rurales. >1.300 asesinados desde 2016.
    // Zonas de conflicto: Cauca, Nariño, Chocó, Córdoba, Urabá, Putumayo, Meta.
    // Pro-paz total, anti-extractivismo territorial, autonomía comunitaria.
  },
  sector_cultural: {
    n: 'Sector Cultural', i: '🎭',
    p: { e: -1, s: -1, c: 0, v: -2, t: -1 },
    // Artistas, academia, medios, gestores culturales. Urbano y progresista.
    // Bogotá, Medellín, Cali, Barranquilla, Cartagena, Manizales.
  },
  transportadores: {
    n: 'Transportadores', i: '🚛',
    p: { e: 1, s: 1, c: 0, v: 1, t: 0 },
    // Camioneros, taxistas, buseros. Pro-seguridad vial, anti-alza combustibles.
    // Pragmáticos: bloquean vías, tienen poder real. Nationwide pero más en corredores viales.
  },
  alianza_verde: {
    n: 'Alianza Verde', i: '💚',
    p: { e: -2, s: -1, c: -1, v: -1, t: -1 },
    // Claramente anti-extractivismo (e:-2); liberal en valores; apoya a Claudia
  },
  sector_financiero: {
    n: 'Sector Financiero', i: '🏦',
    p: { e: 1, s: 1, c: 0, v: 0, t: 2 },
    // Bancos, aseguradoras, bolsa: pro-mercado, estabilidad macroeconómica
  },
  voto_blanco: {
    n: 'Indecisos / Voto en Blanco', i: '⬜',
    p: { e: 0, s: 0, c: 0, v: 0, t: 0 },
    // Ciudadanos desconfiados de todos los candidatos.
    // ESPECIAL: no da votos al activarlo — los retira del pool de blanco,
    // reduciendo el peso perdido del departamento. Costo siempre 12 CP para todos.
    // No puede ser atacado ni reforzado. No tiene dueño ideológico.
    special: 'voto_blanco',
  },
  // ── Partidos con personería jurídica adicionales ──
  mira: {
    n: 'Partido MIRA', i: '🌟',
    p: { e: 0, s: 1, c: 0, v: 2, t: 0 },
    // Movimiento cristiano-evangélico urbano. Base en ciudades grandes.
    // Conservador en valores, neutro en economía. Apoya a Paloma.
  },
  up: {
    n: 'Unión Patriótica', i: '🌹',
    p: { e: -2, s: -2, c: -2, v: -1, t: -2 },
    // Izquierda histórica, base en territorios FARC y comunidades marginadas.
    // Apoya a Cepeda. Fuerte en Meta, Caquetá, Arauca, Urabá.
  },
  polo: {
    n: 'Polo Democrático', i: '🔷',
    p: { e: -1, s: -1, c: -1, v: -1, t: -2 },
    // Izquierda urbana, sindical, académica. Bogotá y ciudades universitarias.
    // Apoya a Cepeda. Base más intelectual que territorial.
  },
  mais: {
    n: 'MAIS', i: '🌿',
    p: { e: -2, s: -2, c: -2, v: 0, t: -2 },
    // Movimiento Alternativo Indígena y Social. Coincide casi totalmente con ONIC.
    // Presente en Nariño, Cauca, Chocó, La Guajira. Apoya a Cepeda.
  },
  comunes: {
    n: 'Comunes (FARC)', i: '🕊️',
    p: { e: -2, s: -2, c: -2, v: -1, t: -2 },
    // Partido político FARC. Base muy pequeña pero territorial.
    // Zonas de reincorporación: Caquetá, Meta, Putumayo, Tumaco.
  },
};

// ─────────────────────────────────────────────────────────────
// DEPARTAMENTOS — 33 territorios
// peso = % del electorado nacional (suman 100%)
// g = grupos asignados con peso local (suman 100 por depto)
// Calibrado contra resultados 2022 y estructura poblacional
// ─────────────────────────────────────────────────────────────
const DRAW = [
  {
    id: 'bogota', n: 'Bogotá D.C.', w: 18.0,
    // Mayor electorado. Sur popular (Cepeda), norte clase media (Paloma/Fajardo)
    g: [
      { id: 'clase_media', w: 13 },
      { id: 'jovenes', w: 11 },
      { id: 'gremios', w: 9 },
      { id: 'fecode', w: 9 },
      { id: 'sector_cultural', w: 9 },
      { id: 'sector_financiero', w: 9 },
      { id: 'transportadores', w: 7 },
      { id: 'alianza_verde', w: 9 },
      { id: 'mira', w: 7 },
      { id: 'sindicatos', w: 9 },
      { id: 'voto_blanco', w: 8 },
    ]
  },
  {
    id: 'antioquia', n: 'Antioquia', w: 13.0,
    // Uribismo histórico. Paloma ~42% enc. Medellín: jóvenes, gremios, líderes Urabá
    g: [
      { id: 'gremios', w: 15 },
      { id: 'cafeteros', w: 13 },
      { id: 'militares', w: 11 },
      { id: 'clase_media', w: 11 },
      { id: 'jovenes', w: 9 },
      { id: 'p_conservador', w: 9 },
      { id: 'sector_financiero', w: 9 },
      { id: 'lideres_sociales', w: 8 },
      { id: 'sector_cultural', w: 9 },
      { id: 'voto_blanco', w: 6 },
    ]
  },
  {
    id: 'valle', n: 'Valle del Cauca', w: 9.0,
    // Cali diversa. Jóvenes activos (paro 2021). Afros Buenaventura. Cultura salsa
    g: [
      { id: 'gremios', w: 13 },
      { id: 'sindicatos', w: 11 },
      { id: 'afros', w: 13 },
      { id: 'clase_media', w: 11 },
      { id: 'jovenes', w: 11 },
      { id: 'sector_cultural', w: 9 },
      { id: 'fecode', w: 9 },
      { id: 'alianza_verde', w: 8 },
      { id: 'polo', w: 9 },
      { id: 'voto_blanco', w: 6 },
    ]
  },
  {
    id: 'cundinamarca', n: 'Cundinamarca', w: 6.0,
    // Campesino y conservador. Municipios dormitorio. Corredores viales clave
    g: [
      { id: 'campesinos', w: 23 },
      { id: 'cafeteros', w: 19 },
      { id: 'p_conservador', w: 17 },
      { id: 'clase_media', w: 15 },
      { id: 'transportadores', w: 11 },
      { id: 'p_u', w: 10 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'atlantico', n: 'Atlántico', w: 5.0,
    // Barranquilla: gremios, Char, jóvenes universitarios, carnaval y cultura
    g: [
      { id: 'gremios', w: 17 },
      { id: 'clase_media', w: 15 },
      { id: 'cambio_radical', w: 15 },
      { id: 'jovenes', w: 15 },
      { id: 'sector_cultural', w: 11 },
      { id: 'comunidades_religiosas', w: 11 },
      { id: 'transportadores', w: 10 },
      { id: 'voto_blanco', w: 6 },
    ]
  },
  {
    id: 'bolivar', n: 'Bolívar', w: 4.5,
    // Cartagena: turismo, clase media, afros, cultura patrimonio. Interior ganadero
    g: [
      { id: 'ganaderos', w: 19 },
      { id: 'afros', w: 19 },
      { id: 'cambio_radical', w: 15 },
      { id: 'clase_media', w: 13 },
      { id: 'sector_cultural', w: 10 },
      { id: 'comunidades_religiosas', w: 10 },
      { id: 'p_liberal', w: 9 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'santander', n: 'Santander', w: 4.0,
    // Bucaramanga: industrial, petrolero, jóvenes. Corredor vial nacional
    g: [
      { id: 'gremios', w: 17 },
      { id: 'clase_media', w: 15 },
      { id: 'jovenes', w: 13 },
      { id: 'petroleros', w: 13 },
      { id: 'transportadores', w: 11 },
      { id: 'cambio_radical', w: 13 },
      { id: 'comunidades_religiosas', w: 12 },
      { id: 'voto_blanco', w: 6 },
    ]
  },
  {
    id: 'cordoba', n: 'Córdoba', w: 3.5,
    // Base Abelardo. Ganaderos, afros, líderes sociales asesinados. Evangelismo
    g: [
      { id: 'ganaderos', w: 27 },
      { id: 'afros', w: 21 },
      { id: 'comunidades_religiosas', w: 17 },
      { id: 'lideres_sociales', w: 15 },
      { id: 'p_liberal', w: 16 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'narino', n: 'Nariño', w: 3.5,
    // Petro ~45% en 2022. MAIS fuerte. Líderes sociales. Pasto conservador y cultural
    g: [
      { id: 'indigenas', w: 19 },
      { id: 'mais', w: 13 },
      { id: 'campesinos', w: 13 },
      { id: 'lideres_sociales', w: 15 },
      { id: 'jovenes', w: 11 },
      { id: 'fecode', w: 11 },
      { id: 'comunidades_religiosas', w: 13 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'nortesder', n: 'Norte de Santander', w: 3.0,
    // Cúcuta frontera. Líderes sociales en zona de conflicto. Corredor vial
    g: [
      { id: 'petroleros', w: 19 },
      { id: 'victimas', w: 17 },
      { id: 'campesinos', w: 15 },
      { id: 'clase_media', w: 13 },
      { id: 'jovenes', w: 11 },
      { id: 'lideres_sociales', w: 10 },
      { id: 'transportadores', w: 10 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'tolima', n: 'Tolima', w: 3.0,
    // Ibagué: cafetero, liberal. FECODE fuerte. Corredor vial central. Jóvenes
    g: [
      { id: 'cafeteros', w: 19 },
      { id: 'campesinos', w: 19 },
      { id: 'fecode', w: 13 },
      { id: 'victimas', w: 13 },
      { id: 'clase_media', w: 11 },
      { id: 'transportadores', w: 11 },
      { id: 'p_liberal', w: 9 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'boyaca', n: 'Boyacá', w: 3.0,
    // Conservador histórico muy fuerte. Minería carbón. Población envejecida
    g: [
      { id: 'p_conservador', w: 27 },
      { id: 'campesinos', w: 23 },
      { id: 'adultos_mayores', w: 19 },
      { id: 'comunidades_religiosas', w: 15 },
      { id: 'transportadores', w: 12 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'cauca', n: 'Cauca', w: 2.5,
    // Petro >45% en 2022. CRIC muy fuerte. Popayán cultural. Líderes asesinados
    g: [
      { id: 'indigenas', w: 21 },
      { id: 'mais', w: 13 },
      { id: 'victimas', w: 15 },
      { id: 'afros', w: 13 },
      { id: 'lideres_sociales', w: 15 },
      { id: 'jovenes', w: 10 },
      { id: 'sector_cultural', w: 8 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'huila', n: 'Huila', w: 2.5,
    // Neiva: cafetero, campesino. FECODE. Corredor vial. Líderes sociales
    g: [
      { id: 'cafeteros', w: 21 },
      { id: 'campesinos', w: 21 },
      { id: 'fecode', w: 13 },
      { id: 'clase_media', w: 11 },
      { id: 'lideres_sociales', w: 11 },
      { id: 'transportadores', w: 10 },
      { id: 'p_liberal', w: 8 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'meta', n: 'Meta', w: 2.5,
    // Villavicencio: ganadero, petrolero, clase media. Líderes sociales en periferia
    g: [
      { id: 'ganaderos', w: 21 },
      { id: 'petroleros', w: 17 },
      { id: 'militares', w: 15 },
      { id: 'clase_media', w: 11 },
      { id: 'transportadores', w: 10 },
      { id: 'lideres_sociales', w: 10 },
      { id: 'p_u', w: 6 },
      { id: 'up', w: 5 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'magdalena', n: 'Magdalena', w: 2.5,
    // Santa Marta: turismo, clase media, afros. Costa: ganadero y religioso
    g: [
      { id: 'ganaderos', w: 23 },
      { id: 'afros', w: 21 },
      { id: 'clase_media', w: 17 },
      { id: 'comunidades_religiosas', w: 15 },
      { id: 'p_liberal', w: 20 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'risaralda', n: 'Risaralda', w: 2.0,
    // Pereira: eje cafetero, comercio, clase media, conservadurismo
    g: [
      { id: 'cafeteros', w: 30 },
      { id: 'clase_media', w: 25 },
      { id: 'p_conservador', w: 19 },
      { id: 'comunidades_religiosas', w: 11 },
      { id: 'gremios', w: 10 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'cesar', n: 'Cesar', w: 2.0,
    // Valledupar: ganadero, carbón, Char, comunidades religiosas, jóvenes urbanos
    g: [
      { id: 'ganaderos', w: 23 },
      { id: 'cambio_radical', w: 21 },
      { id: 'comunidades_religiosas', w: 21 },
      { id: 'p_liberal', w: 17 },
      { id: 'jovenes', w: 14 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'caldas', n: 'Caldas', w: 2.0,
    // Manizales: cafetero, conservador, adultos mayores, cultura teatro
    g: [
      { id: 'cafeteros', w: 32 },
      { id: 'p_conservador', w: 21 },
      { id: 'adultos_mayores', w: 17 },
      { id: 'comunidades_religiosas', w: 13 },
      { id: 'sector_cultural', w: 12 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'sucre', n: 'Sucre', w: 1.5,
    // Sincelejo: ganadero, afro, liberal. Base Abelardo en Costa
    g: [
      { id: 'ganaderos', w: 33 },
      { id: 'afros', w: 27 },
      { id: 'comunidades_religiosas', w: 19 },
      { id: 'p_liberal', w: 17 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'guajira', n: 'La Guajira', w: 1.5,
    // Riohacha: Wayuu 44% pop. Cerrejón vs comunidades. Tensión extractiva real
    g: [
      { id: 'indigenas', w: 42 },
      { id: 'afros', w: 21 },
      { id: 'ganaderos', w: 17 },
      { id: 'petroleros', w: 16 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'quindio', n: 'Quindío', w: 1.5,
    // Armenia: cafetero concentrado, adultos mayores, clase media turismo
    g: [
      { id: 'cafeteros', w: 40 },
      { id: 'adultos_mayores', w: 27 },
      { id: 'clase_media', w: 19 },
      { id: 'comunidades_religiosas', w: 9 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'choco', n: 'Chocó', w: 1.0,
    // Quibdó: afro 83%, indígena 12%. Líderes sociales. Pobreza. Cepeda ~58%
    g: [
      { id: 'afros', w: 42 },
      { id: 'indigenas', w: 21 },
      { id: 'fecode', w: 17 },
      { id: 'lideres_sociales', w: 16 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'putumayo', n: 'Putumayo', w: 0.8,
    // Mocoa: indígena, coca, víctimas, líderes asesinados. FARC. Cepeda ~52%
    g: [
      { id: 'indigenas', w: 27 },
      { id: 'victimas', w: 23 },
      { id: 'campesinos', w: 21 },
      { id: 'lideres_sociales', w: 13 },
      { id: 'comunes', w: 12 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'caqueta', n: 'Caquetá', w: 0.8,
    // Florencia: reincorporación FARC. Campesino. Víctimas. Líderes rurales
    g: [
      { id: 'victimas', w: 27 },
      { id: 'campesinos', w: 25 },
      { id: 'comunes', w: 19 },
      { id: 'lideres_sociales', w: 13 },
      { id: 'up', w: 8 },
      { id: 'ganaderos', w: 4 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'casanare', n: 'Casanare', w: 0.8,
    // Yopal: petróleo, ganadería, militares. Corredor Bogotá-Llanos
    g: [
      { id: 'petroleros', w: 38 },
      { id: 'ganaderos', w: 27 },
      { id: 'militares', w: 19 },
      { id: 'transportadores', w: 12 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'arauca', n: 'Arauca', w: 0.5,
    // Petróleo y guerrilla histórica. ELN. Víctimas. Líderes. UP tradicional
    g: [
      { id: 'victimas', w: 25 },
      { id: 'petroleros', w: 23 },
      { id: 'up', w: 19 },
      { id: 'lideres_sociales', w: 15 },
      { id: 'indigenas', w: 14 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'sanandres', n: 'San Andrés', w: 0.3,
    // Insular caribeño. Comunidades religiosas muy fuertes. MIRA. Cultura raizal
    g: [
      { id: 'comunidades_religiosas', w: 32 },
      { id: 'mira', w: 21 },
      { id: 'clase_media', w: 21 },
      { id: 'sector_cultural', w: 11 },
      { id: 'adultos_mayores', w: 10 },
      { id: 'voto_blanco', w: 5 },
    ]
  },
  {
    id: 'amazonas', n: 'Amazonas', w: 0.2,
    g: [
      { id: 'indigenas', w: 60 },
      { id: 'campesinos', w: 36 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'guainia', n: 'Guainía', w: 0.15,
    g: [
      { id: 'indigenas', w: 65 },
      { id: 'campesinos', w: 31 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'vaupes', n: 'Vaupés', w: 0.1,
    g: [
      { id: 'indigenas', w: 72 },
      { id: 'campesinos', w: 24 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'vichada', n: 'Vichada', w: 0.1,
    g: [
      { id: 'ganaderos', w: 50 },
      { id: 'indigenas', w: 46 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
  {
    id: 'guaviare', n: 'Guaviare', w: 0.2,
    // San José: campesinos, víctimas, líderes rurales. Ganadería y coca histórica
    g: [
      { id: 'victimas', w: 33 },
      { id: 'campesinos', w: 31 },
      { id: 'lideres_sociales', w: 17 },
      { id: 'ganaderos', w: 15 },
      { id: 'voto_blanco', w: 4 },
    ]
  },
];

// ─────────────────────────────────────────────────────────────
// SONDEOS DE OPINIÓN
// Se activan en turnos 3, 6, 9 (primera vuelta) y turno 2 (segunda vuelta)
// ─────────────────────────────────────────────────────────────
const SONDEOS = [
  {
    id: 'extractivismo',
    pregunta: '¿Cuál debe ser la política energética de Colombia?',
    eje: 'e',
    opciones: [
      { texto: 'Acelerar la transición, frenar nuevos contratos petroleros', valor: -2 },
      { texto: 'Mantener la producción actual con estándares ambientales', valor: 0 },
      { texto: 'Expandir exploración para financiar gasto social', valor: 2 },
    ]
  },
  {
    id: 'seguridad',
    pregunta: '¿Cómo debe Colombia enfrentar el crimen organizado?',
    eje: 's',
    opciones: [
      { texto: 'Diálogo y sometimiento a la justicia transicional', valor: -2 },
      { texto: 'Combinación de fuerza y política social', valor: 0 },
      { texto: 'Ofensiva militar total sin negociación', valor: 2 },
    ]
  },
  {
    id: 'campo',
    pregunta: '¿Qué hacer con las tierras improductivas en Colombia?',
    eje: 'c',
    opciones: [
      { texto: 'Reforma agraria redistributiva con expropiación', valor: -2 },
      { texto: 'Fondo de tierras voluntario con subsidios', valor: 0 },
      { texto: 'Seguridad jurídica al propietario actual', valor: 2 },
    ]
  },
  {
    id: 'valores',
    pregunta: '¿Cuál es tu postura frente al matrimonio igualitario?',
    eje: 'v',
    opciones: [
      { texto: 'Derecho fundamental, debe estar en la Constitución', valor: -2 },
      { texto: 'Respeto a las decisiones judiciales vigentes', valor: 0 },
      { texto: 'Institución entre hombre y mujer', valor: 2 },
    ]
  },
  {
    id: 'estado',
    pregunta: '¿Qué rol debe tener el Estado en la economía?',
    eje: 't',
    opciones: [
      { texto: 'Empresas estratégicas nacionalizadas, control de precios', valor: -2 },
      { texto: 'Regulador activo con economía mixta', valor: 0 },
      { texto: 'Reducir Estado, privatizar servicios no esenciales', valor: 2 },
    ]
  },
  {
    id: 'paz',
    pregunta: '¿Cómo avanzar en la implementación del Acuerdo de Paz?',
    eje: 's',
    opciones: [
      { texto: 'Implementación total con reformas estructurales', valor: -2 },
      { texto: 'Implementación gradual con ajustes técnicos', valor: 0 },
      { texto: 'Renegociar puntos que afectan la seguridad', valor: 2 },
    ]
  },
  {
    id: 'salud',
    pregunta: '¿Cómo reformar el sistema de salud colombiano?',
    eje: 't',
    opciones: [
      { texto: 'Salud pública estatal, eliminar EPS privadas', valor: -2 },
      { texto: 'Fortalecer control y competencia entre aseguradoras', valor: 0 },
      { texto: 'Libre mercado con subsidio a población vulnerable', valor: 2 },
    ]
  },
  {
    id: 'drogas',
    pregunta: '¿Cuál debe ser la política antidrogas de Colombia?',
    eje: 'e',
    opciones: [
      { texto: 'Legalización regulada y sustitución voluntaria de cultivos', valor: -2 },
      { texto: 'Reducción de daños con enfoque en salud pública', valor: 0 },
      { texto: 'Erradicación forzosa y extradición sin límites', valor: 2 },
    ]
  },
  {
    id: 'educacion',
    pregunta: '¿Cómo debe financiarse la educación superior en Colombia?',
    eje: 't',
    opciones: [
      { texto: 'Gratuidad universal financiada con reforma tributaria', valor: -2 },
      { texto: 'Gratuidad para estratos 1-3, créditos blandos para el resto', valor: 0 },
      { texto: 'Subsidios focalizados y mayor participación privada', valor: 2 },
    ]
  },
  {
    id: 'migracion',
    pregunta: '¿Qué hacer con la migración venezolana en Colombia?',
    eje: 'c',
    opciones: [
      { texto: 'Regularización masiva y acceso pleno a servicios públicos', valor: -2 },
      { texto: 'Regularización gradual con criterios de integración laboral', valor: 0 },
      { texto: 'Control estricto de fronteras y deportación de ilegales', valor: 2 },
    ]
  },
];

// ─────────────────────────────────────────────────────────────
// EVENTOS DE CAMPAÑA
// 40% de probabilidad por turno. Duran un solo turno.
// ─────────────────────────────────────────────────────────────
const EVENTOS = [
  {
    id: 'escandalo_corrupcion',
    titulo: 'Escándalo de corrupción',
    desc: 'Filtraciones comprometen a funcionarios cercanos al establecimiento.',
    efecto: 'Gremios Empresariales pueden ser capturados por cualquier candidato este turno.',
    tipo: 'liberar_grupo',
    color: 'naranja',
    icono: '💥',
    grupos: ['gremios'],
  },
  {
    id: 'paro_nacional',
    titulo: 'Paro Nacional',
    desc: 'Sindicatos y campesinos convocan cese de actividades.',
    efecto: 'Activar Campesinos o Sindicatos cuesta la mitad de CP este turno.',
    tipo: 'descuento',
    color: 'naranja',
    icono: '✊',
    grupos: ['campesinos', 'sindicatos'],
    factor: 0.5,
  },
  {
    id: 'visita_papal',
    titulo: 'Visita pastoral del Papa',
    desc: 'El Vaticano anuncia visita a Colombia.',
    efecto: 'Iglesia Católica e Iglesias Evangélicas cuestan solo 2 CP este turno.',
    tipo: 'descuento_fijo',
    color: 'azul',
    icono: '✝️',
    grupos: ['iglesia_cat', 'iglesia_ev'],
    costoFijo: 2,
  },
  {
    id: 'masacre_rural',
    titulo: 'Masacre en zona rural',
    desc: 'Violencia en el suroccidente genera indignación nacional.',
    efecto: 'Víctimas del Conflicto se activan a mitad de precio este turno.',
    tipo: 'descuento',
    color: 'naranja',
    icono: '🕊️',
    grupos: ['victimas'],
    factor: 0.5,
  },
  {
    id: 'boom_petroleo',
    titulo: 'Alza en precio del petróleo',
    desc: 'WTI sube 15% por tensiones en el Golfo.',
    efecto: 'Sector Minero-Energético vale el doble en votos este turno.',
    tipo: 'valor_doble',
    color: 'azul',
    icono: '⛽',
    grupos: ['petroleros'],
  },
  {
    id: 'crisis_universitaria',
    titulo: 'Crisis universitaria',
    desc: 'Paro estudiantil en las principales universidades del país.',
    efecto: 'Jóvenes Urbanos se desbloquean en todos los departamentos este turno.',
    tipo: 'liberar_grupo',
    color: 'naranja',
    icono: '🎓',
    grupos: ['jovenes'],
  },
  {
    id: 'debate_televisivo',
    titulo: 'Debate presidencial en televisión',
    desc: 'Todos los candidatos exponen sus propuestas ante millones.',
    efecto: 'Clase Media en Bogotá, Antioquia y Valle cuesta 3 CP para todos este turno.',
    tipo: 'descuento_fijo_depts',
    color: 'azul',
    icono: '📺',
    grupos: ['clase_media'],
    depts: ['bogota', 'antioquia', 'valle'],
    costoFijo: 3,
  },
  {
    id: 'reforma_pensional',
    titulo: 'Debate reforma pensional',
    desc: 'El Congreso retoma el proyecto de reforma pensional.',
    efecto: 'Adultos Mayores cuestan 3 CP. Sindicatos cuestan 10 CP.',
    tipo: 'costo_mixto',
    color: 'amarillo',
    icono: '👴',
    efectoMixto: { descuento: ['adultos_mayores'], encarece: ['sindicatos'] },
  },
  {
    id: 'elecciones_locales',
    titulo: 'Resultado de elecciones locales',
    desc: 'Las alcaldías se definen y revelan el mapa real del poder regional.',
    efecto: '+5 CP al candidato dominante en Antioquia. +5 CP al dominante en la Costa.',
    tipo: 'bonus_territorio',
    color: 'azul',
    icono: '🗳️',
    deptsBonus: [
      { depts: ['antioquia'], cp: 5 },
      { depts: ['atlantico', 'bolivar', 'cordoba', 'cesar', 'magdalena', 'sucre', 'guajira'], cp: 5 },
    ],
  },
  {
    id: 'acuerdo_paz_avance',
    titulo: 'Avance en negociaciones de paz',
    desc: 'Gobierno anuncia acuerdo parcial con grupos armados.',
    efecto: 'Víctimas del Conflicto y Campesinos tienen +30% de peso en votos este turno.',
    tipo: 'valor_boost',
    color: 'azul',
    icono: '🤝',
    grupos: ['victimas', 'campesinos'],
    boostFactor: 1.3,
  },
];

// ─────────────────────────────────────────────────────────────
// PERFIL IDEOLÓGICO — Candidato personalizado
// ─────────────────────────────────────────────────────────────
const PREGUNTAS_PERFIL = [
  {
    eje: 'e', peso: 1,
    q: '¿Colombia debe expandir su producción petrolera?',
    opts: [
      { t: 'No, apostar ya por la transición energética', v: -2 },
      { t: 'Mantener la actual con regulación ambiental', v: 0 },
      { t: 'Sí, es necesaria para el desarrollo del país', v: 2 },
    ]
  },
  {
    eje: 'e', peso: 0.8,
    q: '¿Las comunidades deben poder vetar proyectos mineros en su territorio?',
    opts: [
      { t: 'Sí, consulta previa vinculante siempre', v: -2 },
      { t: 'Sí, pero con balance frente al interés nacional', v: 0 },
      { t: 'No, el Estado define el interés general', v: 2 },
    ]
  },
  {
    eje: 's', peso: 1,
    q: '¿Cómo debe el Estado responder a las disidencias armadas?',
    opts: [
      { t: 'Negociación y paz total sin condiciones', v: -2 },
      { t: 'Negociación con presión militar simultánea', v: 0 },
      { t: 'Ofensiva sin negociación posible', v: 2 },
    ]
  },
  {
    eje: 's', peso: 0.8,
    q: '¿Debe Colombia fortalecer sus Fuerzas Militares?',
    opts: [
      { t: 'No, priorizar gasto social sobre defensa', v: -2 },
      { t: 'Mantener presupuesto con mayor profesionalización', v: 0 },
      { t: 'Sí, aumentar presupuesto y capacidad ofensiva', v: 2 },
    ]
  },
  {
    eje: 'c', peso: 1,
    q: '¿Cuál es la reforma agraria que necesita Colombia?',
    opts: [
      { t: 'Redistribución amplia con expropiación de latifundios', v: -2 },
      { t: 'Formalización y acceso a crédito para campesinos', v: 0 },
      { t: 'Proteger la propiedad privada y atraer agroinversión', v: 2 },
    ]
  },
  {
    eje: 'v', peso: 1,
    q: '¿Qué opinas sobre la adopción homoparental en Colombia?',
    opts: [
      { t: 'Derecho fundamental de todas las familias', v: -2 },
      { t: 'Debe evaluarse caso a caso con criterio técnico', v: 0 },
      { t: 'La familia tradicional es el núcleo de la sociedad', v: 2 },
    ]
  },
  {
    eje: 'v', peso: 0.8,
    q: '¿Debe el Estado financiar la educación sexual en colegios públicos?',
    opts: [
      { t: 'Sí, con enfoque de género e identidad', v: -2 },
      { t: 'Sí, con enfoque científico y neutral', v: 0 },
      { t: 'Es decisión de los padres y las familias', v: 2 },
    ]
  },
  {
    eje: 't', peso: 1,
    q: '¿Cuál debe ser el tamaño del Estado colombiano?',
    opts: [
      { t: 'Más grande, con mayor capacidad redistributiva', v: -2 },
      { t: 'Eficiente y focalizado en servicios esenciales', v: 0 },
      { t: 'Más pequeño, con mayor espacio para el sector privado', v: 2 },
    ]
  },
  {
    eje: 't', peso: 0.8,
    q: '¿Debe Colombia tener una renta básica universal?',
    opts: [
      { t: 'Sí, financiada con reforma tributaria progresiva', v: -2 },
      { t: 'Solo focalizada a la población en pobreza extrema', v: 0 },
      { t: 'No, genera dependencia y desincentiva el trabajo', v: 2 },
    ]
  },
  {
    eje: 'mixed', peso: 0.5,
    q: '¿Cuál es la mayor amenaza para Colombia hoy?',
    opts: [
      { t: 'La desigualdad y la pobreza estructural', v: 'left' },
      { t: 'La corrupción y la captura del Estado', v: 'center' },
      { t: 'La inseguridad y el narcotráfico', v: 'right' },
    ]
  },
];
