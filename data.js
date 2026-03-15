// ═══════════════════════════════════════
// SEE — Data v3
// ═══════════════════════════════════════

// Six sense doors with SVG icons
const SENSE_DOORS = {
  en: ['Seeing','Hearing','Smell','Taste','Sensation','Thought'],
  es: ['Ver','Oír','Olfato','Sabor','Sensación','Pensamiento']
};

const SENSE_ICONS = {
  Seeing: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="20" cy="20" rx="16" ry="9"/><circle cx="20" cy="20" r="4"/><circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  Hearing: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16a6 6 0 1 1 12 0c0 4-3 5-3 9"/><path d="M17 31a2 2 0 0 0 4 0"/><path d="M23 25h-2a2 2 0 0 0-2 2v2"/></svg>`,
  Smell: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8 c0 4-4 4-4 8s4 4 4 8"/><path d="M26 10 c0 4-4 4-4 8s4 4 4 8"/><path d="M14 10 c0 4-4 4-4 8s4 4 4 8"/></svg>`,
  Taste: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10 c-8 0-12 6-10 12 1 3 4 5 4 9 0 2 1 3 3 3h6c2 0 3-1 3-3 0-4 3-6 4-9 2-6-2-12-10-12z"/><line x1="20" y1="10" x2="20" y2="22"/><line x1="16" y1="16" x2="24" y2="16"/></svg>`,
  Sensation: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="20" r="3"/><line x1="20" y1="8" x2="20" y2="13"/><line x1="20" y1="27" x2="20" y2="32"/><line x1="8" y1="20" x2="13" y2="20"/><line x1="27" y1="20" x2="32" y2="20"/><line x1="11.5" y1="11.5" x2="15" y2="15"/><line x1="25" y1="25" x2="28.5" y2="28.5"/><line x1="28.5" y1="11.5" x2="25" y2="15"/><line x1="15" y1="25" x2="11.5" y2="28.5"/></svg>`,
  Thought: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22 c-3-1-5-4-4-7 1-4 5-6 9-5 1-3 4-5 7-4 3 1 4 4 3 7 2 1 3 3 2 5-1 3-4 4-7 3"/><path d="M15 22 c0 4 2 8 5 10"/><path d="M25 21 c0 4-2 8-5 10"/><line x1="20" y1="32" x2="20" y2="34"/></svg>`
};

const SENSE_COLORS = {
  Seeing:    { h: '#F5A623', rgb: '245,166,35'  },
  Hearing:   { h: '#4AB8F5', rgb: '74,184,245'  },
  Smell:     { h: '#5EC97A', rgb: '94,201,122'  },
  Taste:     { h: '#F5785A', rgb: '245,120,90'  },
  Sensation: { h: '#E8456A', rgb: '232,69,106'  },
  Thought:   { h: '#9B6FE8', rgb: '155,111,232' },
};

const VEDANA = {
  en: ['Pleasant','Unpleasant','Neutral'],
  es: ['Agradable','Desagradable','Neutral']
};
const VEDANA_COLORS = {
  Pleasant:   { h: '#F5C842', rgb: '245,200,66'  },
  Unpleasant: { h: '#7B8FE8', rgb: '123,143,232' },
  Neutral:    { h: '#C8C8C8', rgb: '200,200,200' },
};

// 8 broad emotion groups
const EMOTIONS = {
  en: ['Agitation','Heaviness','Fear','Wanting','Resistance','Openness','Joy','Confusion'],
  es: ['Agitación','Pesadez','Miedo','Anhelo','Resistencia','Apertura','Alegría','Confusión']
};
const EMOTION_COLORS = {
  Agitation:  { h: '#FF6B35', rgb: '255,107,53'  },
  Heaviness:  { h: '#7B8FE8', rgb: '123,143,232' },
  Fear:       { h: '#9B6FE8', rgb: '155,111,232' },
  Wanting:    { h: '#F5A623', rgb: '245,166,35'  },
  Resistance: { h: '#E8456A', rgb: '232,69,106'  },
  Openness:   { h: '#5EC97A', rgb: '94,201,122'  },
  Joy:        { h: '#F5C842', rgb: '245,200,66'  },
  Confusion:  { h: '#C8C8C8', rgb: '200,200,200' },
};

const STORM_CYCLE = [
  'Not mine','Passing','Just this',
  'No self','Sensation','Already gone',
  'Not me','Empty','Impermanent',
  'Just this','Passing','Not mine'
];
const STORM_CYCLE_ES = [
  'No es mío','Pasando','Solo esto',
  'Sin yo','Sensación','Ya se fue',
  'No soy yo','Vacío','Impermanente',
  'Solo esto','Pasando','No es mío'
];

const RETURN_WORDS = {
  en: ['return','here','breath','back','just this','here'],
  es: ['vuelve','aquí','respira','regresa','solo esto','aquí']
};

// Guided noting prompts
const GUIDED_PROMPTS = {
  en: ['sense','tone','emotion'],
  es: ['sentido','tono','emoción']
};

// AI prompts
const NOTING_SYSTEM = `You are a meditation noting teacher. Respond with exactly 1-3 words — a dharma note. Examples: "passing away", "just sensation", "not self", "already gone". Never more than 3 words. Pure noting language only.`;
const ANCHOR_SYSTEM = `You are a meditation teacher. The student's mind wandered. Offer a warm 4-7 word return invitation. Gentle, no jargon. No exclamation marks.`;
const STORM_SYSTEM = `You are a vipassana teacher. One witnessing sentence — what the practice revealed. Max 10 words. Past tense. No praise.`;
const GUIDED_SYSTEM = `You are a vipassana noting teacher running a timed session. After reviewing the student's notes, offer a brief reflection (2-3 sentences max). Note any patterns. Offer one simple pointer. Warm, precise, field language.`;
const VERBAL_SYSTEM = `You are a vipassana noting teacher. The student just verbally noted their experience. Distil to essential noting form and offer a one-line reflection. Max 2 sentences. Field language.`;

