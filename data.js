// ═══════════════════════════════════════
// SEE — Data
// Noting · Anchor · Storm
// ═══════════════════════════════════════

const SENSE_DOORS = {
  en: ['Seeing','Hearing','Smell','Taste','Sensation','Thought'],
  es: ['Ver','Oír','Olfato','Sabor','Sensación','Pensamiento']
};

const VEDANA = {
  en: ['Pleasant','Unpleasant','Neutral'],
  es: ['Agradable','Desagradable','Neutral']
};

const EMOTIONS = {
  en: ['Fear','Grief','Anger','Joy','Love','Restlessness',
       'Dullness','Doubt','Craving','Aversion','Confusion',
       'Peace','Shame','Pride','Longing'],
  es: ['Miedo','Pena','Rabia','Alegría','Amor','Inquietud',
       'Sopor','Duda','Anhelo','Aversión','Confusión',
       'Paz','Vergüenza','Orgullo','Añoranza']
};

const STORM_CYCLE = [
  'Not mine','Passing','Just this',
  'No self here','Sensation only','Already gone',
  'Not me','Empty','Impermanent',
  'Just this','Passing','Not mine'
];

const STORM_CYCLE_ES = [
  'No es mío','Pasando','Solo esto',
  'Sin yo aquí','Solo sensación','Ya se fue',
  'No soy yo','Vacío','Impermanente',
  'Solo esto','Pasando','No es mío'
];

const RETURN_WORDS = {
  en: ['return','here','back','breath','return','here','just this'],
  es: ['vuelve','aquí','regresa','respira','vuelve','aquí','solo esto']
};

const NOTING_SYSTEM = `You are a meditation noting teacher. The student just noted a sense door, tone (vedana), and emotion. Respond with exactly 1-3 words — a dharma note or gentle pointer. Examples: "passing away", "just sensation", "not self", "already gone", "impermanent", "note it", "just seeing". Never more than 3 words. No punctuation except a period. Pure noting language.`;

const ANCHOR_SYSTEM = `You are a meditation anchor teacher. The student's mind wandered and they noted where it went. Offer a one-line gentle return invitation — 4-8 words. Warm, specific to what wandered, no jargon. Like a quiet hand on the shoulder. Examples: "the breath is still here", "come back to this moment", "sensation of breathing, right here". No exclamation marks.`;

const STORM_SYSTEM = `You are a vipassana teacher. The student just completed a storm noting session cycling through liberation notes. Offer one witnessing sentence — what the practice revealed. Max 12 words. Past tense. Field language. No praise, no analysis. Just quiet witness.`;

const VOICE_SYSTEM = `You are a meditation noting assistant. The student spoke a free-form observation during practice. Distil it to its essential noting form: sense door (if applicable) + vedana + core note. Max 5 words total. Pure noting language. Examples: "Thought. Unpleasant. Passing.", "Hearing. Neutral. Just sound.", "Sensation. Unpleasant. Not mine."`;
