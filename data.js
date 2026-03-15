// ═══════════════════════════════════════
// SEE — Data v2
// ═══════════════════════════════════════

// Six sense doors — each with its own colour
const SENSE_DOORS = {
  en: ['Seeing','Hearing','Smell','Taste','Sensation','Thought'],
  es: ['Ver','Oír','Olfato','Sabor','Sensación','Pensamiento']
};

// Sense colours — bold, vivid
const SENSE_COLORS = {
  Seeing:    { h: '#F5A623', rgb: '245,166,35',   ripple: 'amber'  },
  Hearing:   { h: '#4AB8F5', rgb: '74,184,245',   ripple: 'sky'    },
  Smell:     { h: '#5EC97A', rgb: '94,201,122',   ripple: 'sage'   },
  Taste:     { h: '#F5785A', rgb: '245,120,90',   ripple: 'coral'  },
  Sensation: { h: '#E8456A', rgb: '232,69,106',   ripple: 'rose'   },
  Thought:   { h: '#9B6FE8', rgb: '155,111,232',  ripple: 'violet' },
};

// Vedana — three tones
const VEDANA = {
  en: ['Pleasant','Unpleasant','Neutral'],
  es: ['Agradable','Desagradable','Neutral']
};
const VEDANA_COLORS = {
  Pleasant:   { h: '#F5C842', rgb: '245,200,66'  },
  Unpleasant: { h: '#7B8FE8', rgb: '123,143,232' },
  Neutral:    { h: '#C8C8C8', rgb: '200,200,200' },
};

// Eight broad emotion groups
const EMOTIONS = {
  en: ['Agitation','Heaviness','Fear','Wanting','Resistance','Openness','Joy','Confusion'],
  es: ['Agitación','Pesadez','Miedo','Anhelo','Resistencia','Apertura','Alegría','Confusión']
};
const EMOTION_COLORS = {
  Agitation:  { h: '#FF6B35', rgb: '255,107,53'  }, // warm orange-red
  Heaviness:  { h: '#7B8FE8', rgb: '123,143,232' }, // cool blue
  Fear:       { h: '#9B6FE8', rgb: '155,111,232' }, // violet
  Wanting:    { h: '#F5A623', rgb: '245,166,35'  }, // amber
  Resistance: { h: '#E8456A', rgb: '232,69,106'  }, // rose-red
  Openness:   { h: '#5EC97A', rgb: '94,201,122'  }, // sage green
  Joy:        { h: '#F5C842', rgb: '245,200,66'  }, // gold
  Confusion:  { h: '#C8C8C8', rgb: '200,200,200' }, // neutral
};

// Storm liberation notes
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

// Return words for anchor
const RETURN_WORDS = {
  en: ['return','here','breath','back','just this','here'],
  es: ['vuelve','aquí','respira','regresa','solo esto','aquí']
};

// AI system prompts
const NOTING_SYSTEM = `You are a meditation noting teacher. Respond with exactly 1-3 words — a dharma note. Examples: "passing away", "just sensation", "not self", "already gone", "impermanent". Never more than 3 words. Pure noting language only.`;
const ANCHOR_SYSTEM = `You are a meditation teacher. The student's mind wandered. Offer a warm 4-7 word return invitation. Gentle, specific, no jargon. No exclamation marks.`;
const STORM_SYSTEM = `You are a vipassana teacher. One witnessing sentence — what the practice revealed. Max 10 words. Past tense. No praise.`;
const VOICE_SYSTEM = `You are a noting assistant. Distil the student's free-form observation to its essential noting form. Max 5 words. Pure noting language. Example: "Thought. Unpleasant. Passing."`;
