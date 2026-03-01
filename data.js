// ═══════════════════════════════════════
// COLLAPSE↑ — DATA
// All content: states, steps, prompts, translations
// ═══════════════════════════════════════

const TRANSLATIONS = {
  en: {
    fieldLine: 'These versions of you exist right now.',
    fieldSub: 'All equally real. All waiting for observation.',
    cLabel: 'You just collapsed upward ↑',
    cSub: 'The observer has spoken. The field has responded.',
    ceqNote: 'your observation just made this real',
    imagLabel: 'before you breathe — find it in yourself',
    qlabel: 'carry this into the next hour',
    retBtn: 'observe again ↑',
    stillTxt: 'The field is full.\nPresence is enough.',
    stillBack: 'return to field',
    tapHint: 'tap to continue',
    tapHintLast: 'tap to begin',
    readyBtn: 'I am ready to observe',
    obsCount: n => n > 0 ? `You have consciously observed ${n} time${n!==1?'s':''}` : '',
    obsFirst: s => `You have observed <strong>${s}</strong> for the first time.\nThe wave function just found a new direction.`,
    obsMany: (s,n) => `You have observed <strong>${s}</strong> ${n} times.\nThis collapse is becoming familiar.\nAt some point — it will simply be you.`,
    closings: [
      'Go collapse something beautiful.',
      'The field remembers nothing. You remember everything.',
      'What you observed just became more real.',
      'The experiment continues whether you are watching or not.',
      'You were always this. Now you know.',
      'Collapse upward. Again. Always.'
    ],
    entanglements: [
      'The people around you are measuring you right now. Choose your field carefully.',
      'Every environment you inhabit is an observer. New spaces create new you.',
      'You are never collapsing alone. But you are always the primary observer of yourself.'
    ],
    breathInhale: 'Inhale into superposition',
    breathExhale: s => `Exhale into ${s}`,
    breathHold: 'Hold...',
    breathCycles: (n,t) => `${n} of ${t}`,
    breathEnd: s => `Your nervous system now knows the direction.\n<strong>${s}</strong> is encoded in you.\nKeep observing.`,
  },
  es: {
    fieldLine: 'Estas versiones tuyas existen ahora mismo.',
    fieldSub: 'Todas igualmente reales. Todas esperando observación.',
    cLabel: 'Acabas de colapsar hacia arriba ↑',
    cSub: 'El observador ha hablado. El campo ha respondido.',
    ceqNote: 'tu observación acaba de hacer esto real',
    imagLabel: 'antes de respirar — encuéntralo en ti',
    qlabel: 'lleva esto a la próxima hora',
    retBtn: 'observar de nuevo ↑',
    stillTxt: 'El campo está lleno.\nLa presencia es suficiente.',
    stillBack: 'volver al campo',
    tapHint: 'toca para continuar',
    tapHintLast: 'toca para comenzar',
    readyBtn: 'Estoy listo para observar',
    obsCount: n => n > 0 ? `Has observado conscientemente ${n} vez${n!==1?'es':''}` : '',
    obsFirst: s => `Has observado <strong>${s}</strong> por primera vez.\nLa función de onda encontró una nueva dirección.`,
    obsMany: (s,n) => `Has observado <strong>${s}</strong> ${n} veces.\nEste colapso se está volviendo familiar.\nEn algún momento — simplemente serás tú.`,
    closings: [
      'Ve a colapsar algo hermoso.',
      'El campo no recuerda nada. Tú recuerdas todo.',
      'Lo que observaste acaba de volverse más real.',
      'El experimento continúa si lo estás mirando o no.',
      'Siempre fuiste esto. Ahora lo sabes.',
      'Colapsa hacia arriba. De nuevo. Siempre.'
    ],
    entanglements: [
      'Las personas a tu alrededor te están midiendo ahora. Elige tu campo con cuidado.',
      'Cada entorno que habitas es un observador. Nuevos espacios crean nuevo tú.',
      'Nunca colapsas solo. Pero siempre eres el observador principal de ti mismo.'
    ],
    breathInhale: 'Inhala hacia la superposición',
    breathExhale: s => `Exhala hacia ${s}`,
    breathHold: 'Sostén...',
    breathCycles: (n,t) => `${n} de ${t}`,
    breathEnd: s => `Tu sistema nervioso ahora conoce la dirección.\n<strong>${s}</strong> está codificado en ti.\nSigue observando.`,
  }
};

const STATES = {
  en: [
    { name:'Calm', question:"Where can this steadiness move through you in the next hour?", eq:'|ψ⟩ → |calm⟩ — stillness selected from infinite noise' },
    { name:'Courageous', question:"What does this version of you want to step toward right now?", eq:'|ψ⟩ → |courageous⟩ — strength collapsed from pure potential' },
    { name:'Clear', question:"What becomes obvious when you trust this clarity?", eq:'|ψ⟩ → |clear⟩ — signal sharpened from superposed fog' },
    { name:'Expansive', question:"What expands when you stop measuring yourself as small?", eq:'|ψ⟩ → |expansive⟩ — the field opening beyond its edges' },
    { name:'Grounded', question:"What becomes possible when you are this rooted?", eq:'|ψ⟩ → |grounded⟩ — presence collapsed into this exact moment' },
    { name:'Present', question:"What is actually here, right now, that you haven't fully seen?", eq:'|ψ⟩ → |present⟩ — all future states begin with this observation' },
    { name:'Luminous', question:"Where does this light want to land in your next conversation?", eq:'|ψ⟩ → |luminous⟩ — the highest available collapse selected' },
    { name:'Open', question:"What has been waiting for you to stop resisting it?", eq:'|ψ⟩ → |open⟩ — resistance dissolved, field restored' }
  ],
  es: [
    { name:'Sereno', question:"¿Dónde puede fluir esta tranquilidad a través de ti en la próxima hora?", eq:'|ψ⟩ → |sereno⟩ — quietud seleccionada del ruido infinito' },
    { name:'Valiente', question:"¿Hacia qué quiere avanzar esta versión tuya ahora mismo?", eq:'|ψ⟩ → |valiente⟩ — fuerza colapsada desde puro potencial' },
    { name:'Claro', question:"¿Qué se vuelve obvio cuando confías en esta claridad?", eq:'|ψ⟩ → |claro⟩ — señal afilada desde la niebla superpuesta' },
    { name:'Expansivo', question:"¿Qué se expande cuando dejas de medirte como pequeño?", eq:'|ψ⟩ → |expansivo⟩ — el campo abriéndose más allá de sus bordes' },
    { name:'Arraigado', question:"¿Qué se vuelve posible cuando estás tan enraizado?", eq:'|ψ⟩ → |arraigado⟩ — presencia colapsada en este momento exacto' },
    { name:'Presente', question:"¿Qué hay aquí, ahora mismo, que aún no has visto del todo?", eq:'|ψ⟩ → |presente⟩ — todos los estados futuros comienzan con esta observación' },
    { name:'Luminoso', question:"¿Dónde quiere aterrizar esta luz en tu próxima conversación?", eq:'|ψ⟩ → |luminoso⟩ — el colapso más alto disponible seleccionado' },
    { name:'Abierto', question:"¿Qué ha estado esperando que dejes de resistirlo?", eq:'|ψ⟩ → |abierto⟩ — resistencia disuelta, campo restaurado' }
  ]
};

const STEPS = {
  en: [
    { label:'Quantum Superposition', big:'This particle has no definite state\nuntil it is <em>observed.</em>', small:'It exists everywhere at once —\na blur of pure potential.', ps:'sp' },
    { label:'The Wave Function', eq:'|ψ⟩ = α|calm⟩ + β|courageous⟩ + γ|clear⟩ + …', eqSub:'The wave function of your available self', small:'Every possible state exists simultaneously.\nNone are real until one is measured.', ps:'sp' },
    { label:'The Observer Effect', big:'Observation does not reveal\nwhat is there.\nIt <em>creates</em> what is there.', ps:'sp' },
    { label:'Your Self Follows the Same Physics', big:'Observed as <em>anxious</em> for a lifetime —\nit solidifies.', small:'The other versions never disappeared.\nThey were simply <em>unmeasured.</em>', ps:'stab' },
    { label:'The Mechanism', big:'The first time you observe courage —\nit flickers.\nThe hundredth time —\nit is simply <em>who you are.</em>', note:'<span>Verified:</span> Neuroplasticity confirms repeated observation patterns rebuild neural architecture. Identity forms through accumulated attention.', ps:'stab' },
    { label:'The Quantum Rut', big:'The same observation, repeated,\ncreates a groove so deep\nit feels like <em>physics.</em>', small:'It is not fixed.\nThe superposition still contains\n<em>everything you have ever hoped to be.</em>', ps:'stab' },
    { label:'This Space', big:'This app will never rush you.\nNothing moves\nuntil you move it.', ps:'stab' },
    { label:'The Experiment', big:'You are about to run\nthis experiment on yourself.', small:'<em>Consciously.</em>', ps:'done', isLast:true }
  ],
  es: [
    { label:'Superposición Cuántica', big:'Esta partícula no tiene estado definido\nhasta que es <em>observada.</em>', small:'Existe en todas partes a la vez —\nuna niebla de puro potencial.', ps:'sp' },
    { label:'La Función de Onda', eq:'|ψ⟩ = α|sereno⟩ + β|valiente⟩ + γ|claro⟩ + …', eqSub:'La función de onda de tu yo disponible', small:'Todos los estados posibles existen simultáneamente.\nNinguno es real hasta que uno es medido.', ps:'sp' },
    { label:'El Efecto Observador', big:'La observación no revela\nlo que está ahí.\nLo <em>crea.</em>', ps:'sp' },
    { label:'Tu Yo Sigue la Misma Física', big:'Observado como <em>ansioso</em> toda una vida —\nse solidifica.', small:'Las otras versiones nunca desaparecieron.\nSimplemente no fueron <em>medidas.</em>', ps:'stab' },
    { label:'El Mecanismo', big:'La primera vez que observas valentía —\ntitila.\nLa centésima vez —\nsimplemente es <em>quien eres.</em>', note:'<span>Verificado:</span> La neuroplasticidad confirma que los patrones de observación repetida reconstruyen la arquitectura neural.', ps:'stab' },
    { label:'El Surco Cuántico', big:'La misma observación, repetida,\ncrea un surco tan profundo\nque se siente como <em>física.</em>', small:'No está fijo.\nLa superposición aún contiene\n<em>todo lo que has esperado ser.</em>', ps:'stab' },
    { label:'Este Espacio', big:'Esta app nunca te apresurará.\nNada se mueve\nhasta que tú te muevas.', ps:'stab' },
    { label:'El Experimento', big:'Estás a punto de ejecutar\neste experimento en ti mismo.', small:'<em>Conscientemente.</em>', ps:'done', isLast:true }
  ]
};

const IMAGINATION = {
  en: {
    Calm: [
      "Remember a moment the world went quiet around you. Find that silence again now.",
      "Imagine still water. Not moving. Just reflecting. Let your mind become that.",
      "Think of the most unhurried you have ever felt. What did your breathing sound like there?",
      "Visualise a colour that feels peaceful to you. Let it fill the space behind your eyes.",
      "Remember being somewhere in nature where nothing needed your attention. Return there for a moment.",
      "Feel the weight of your hands right now. Let that weight spread slowly through your whole body.",
      "Think of someone whose presence always made you feel safe. Let their energy settle around you.",
      "Imagine the space between your thoughts. There is always a gap. Rest in that gap.",
      "Remember a moment after something difficult finally ended. That exhale. Find it again.",
      "Visualise yourself an hour from now, moving slowly and without resistance through your day."
    ],
    Courageous: [
      "Remember a moment you moved toward something that frightened you. Feel where that lived in your body.",
      "Think of a time you spoke the truth when silence would have been easier. Locate that feeling.",
      "Visualise yourself walking through a door you have been standing outside of. Feel your hand on the handle.",
      "Remember someone who believed in you before you believed in yourself. Stand in their seeing of you.",
      "Think of the version of you that has already done the hard thing. They are not far away.",
      "Imagine your fear as weather — passing through, not permanent. Feel what remains underneath it.",
      "Remember a moment you surprised yourself. That capacity is still here. It never left.",
      "Visualise your spine lengthening. Your chest opening. Your feet finding the ground. This is what courage feels like in a body.",
      "Think of something you would do if you knew it would work. Now feel what it would be like to move anyway.",
      "Remember the last time you felt proud of yourself. That person is who you are collapsing into right now."
    ],
    Clear: [
      "Think of a moment everything suddenly made sense. Notice how your mind felt in that instant.",
      "Imagine fog slowly lifting from a landscape you know well. Watch what becomes visible.",
      "Remember a decision you made that felt completely right. Not logical — right. Find that knowing.",
      "Visualise your thoughts as clouds moving through a wide open sky. The sky itself is always clear.",
      "Think of a moment you gave someone else perfect advice. That clarity belongs to you too.",
      "Imagine looking at your current situation from five years in the future. What is obvious from there?",
      "Remember a time your instincts were exactly right. That signal is still transmitting.",
      "Visualise a lens coming into focus. The image was always there. It is simply sharpening now.",
      "Think of what you already know but have been pretending not to. Let it surface gently.",
      "Imagine your mind as a deep lake after the sediment has settled. Still. Transparent. Clear to the bottom."
    ],
    Expansive: [
      "Visualise yourself from above — no walls, no ceiling, no edges. Let the feeling of that arrive.",
      "Remember a moment you felt genuinely free. Not free from something — free. What did that feel like?",
      "Think of the largest space you have ever stood in. Let your body remember how it felt to be that small within something that vast.",
      "Imagine your awareness extending outward in every direction simultaneously. No boundary. Just open field.",
      "Remember a conversation that left you feeling larger than when it began. Who were you in that moment?",
      "Visualise the night sky on a clear night far from any city. You are not separate from that. You are made of it.",
      "Think of a version of your life where the ceiling you have accepted simply does not exist.",
      "Imagine breathing in space itself — not air, but actual openness. Let it fill somewhere that has been contracted.",
      "Remember a moment a piece of music or art made the world feel bigger than you thought it was.",
      "Visualise your sense of what is possible doubling. Then doubling again. Feel what shifts in your chest."
    ],
    Grounded: [
      "Feel the weight of your body right now. Imagine roots moving downward from where you sit.",
      "Remember a moment you felt completely solid in yourself. Nothing could move you. Find that ground.",
      "Think of the oldest tree you have ever seen. Imagine having that relationship with the earth beneath you.",
      "Visualise a mountain. Not climbing it — being it. Immovable. Present. Untroubled by weather.",
      "Feel your feet. Really feel them. The pressure of the floor. This is the present moment. You are in it.",
      "Remember a time you stayed steady while everything around you was uncertain. That steadiness is structural — it is who you are.",
      "Think of something that has always been true about you, no matter what circumstances surrounded it.",
      "Imagine a deep underground river — constant, unhurried, unaffected by what happens on the surface.",
      "Remember someone who embodied absolute groundedness in your life. Feel what it was like to be near them.",
      "Visualise your breath moving all the way down to the base of your spine. Anchor yourself there."
    ],
    Present: [
      "Look at one thing near you as if you have never seen it before. Really look.",
      "Notice three sounds you can hear right now that you were not noticing a moment ago.",
      "Feel the temperature of the air on your skin. This sensation is only available right now.",
      "Think of this exact moment as the only moment that has ever existed. Everything else is memory or imagination.",
      "Visualise a camera pulling back until all of time is visible — and then zooming in to land precisely here, now, on you.",
      "Notice what your body is doing right now without trying to change it. Just observe it from inside.",
      "Remember a moment you were so absorbed in something that time disappeared. Find the quality of attention that made that possible.",
      "Imagine that the person you are about to speak to next deserves your complete, undivided presence. Feel what that would actually feel like.",
      "Think of this breath as the most important thing happening on earth right now. Because for you, it is.",
      "Visualise a spotlight narrowing until it illuminates only this: here, this room, this body, this moment."
    ],
    Luminous: [
      "Remember a moment someone's face changed because of something you did or said. Hold that.",
      "Think of a time your presence in a room quietly shifted something. You may not have noticed — someone else did.",
      "Visualise light emanating from the centre of your chest. Not performed. Just existing. Just radiating.",
      "Remember a moment you felt genuinely, completely yourself — and it was enough. More than enough.",
      "Think of someone whose mere presence makes things better. You have been that for someone. More than once.",
      "Imagine the version of you that has stopped dimming yourself for the comfort of others. Feel how they move through a room.",
      "Remember a moment of genuine joy — unguarded, unselfconscious. The light you were in that moment is still in you.",
      "Visualise yourself in your next conversation choosing to be fully present and fully generous. Feel what becomes possible.",
      "Think of what you carry that others need — not as a burden, but as a gift you have not fully offered yet.",
      "Imagine that the quality of your inner state is already affecting everyone near you. It is. It always has been."
    ],
    Open: [
      "Think of something you have been holding tightly. Imagine your hands releasing it.",
      "Remember a moment a completely unexpected idea or person changed your direction for the better.",
      "Visualise a door you have kept closed. You do not have to walk through it yet. Just imagine it unlocked.",
      "Think of a belief you have held for a long time that might not be serving you. What would it feel like to simply set it down?",
      "Remember a time you said yes to something uncertain and it became one of the best things that happened to you.",
      "Imagine your resistance to something as a physical tension in your body. Now imagine that tension dissolving slowly, without force.",
      "Think of someone whose perspective you have dismissed. Imagine genuinely trying to see through their eyes for one moment.",
      "Visualise yourself in a conversation you have been avoiding — but this time open, curious, without armour.",
      "Remember what it felt like to be a beginner at something you now love. Locate that openness again.",
      "Imagine life responding generously to a version of you that is no longer braced against it."
    ]
  },
  es: {
    Sereno: [
      "Recuerda un momento en que el mundo a tu alrededor se quedó en silencio. Encuentra ese silencio ahora.",
      "Imagina agua quieta. Sin movimiento. Solo reflejando. Deja que tu mente se vuelva así.",
      "Piensa en el momento más tranquilo que hayas vivido. ¿Cómo sonaba tu respiración ahí?",
      "Visualiza un color que te transmita paz. Deja que llene el espacio detrás de tus ojos.",
      "Recuerda estar en algún lugar de la naturaleza donde nada requería tu atención. Vuelve ahí por un momento.",
      "Siente el peso de tus manos ahora mismo. Deja que ese peso se extienda lentamente por todo tu cuerpo.",
      "Piensa en alguien cuya presencia siempre te hizo sentir seguro. Deja que esa energía se asiente a tu alrededor.",
      "Imagina el espacio entre tus pensamientos. Siempre hay una pausa. Descansa en esa pausa.",
      "Recuerda el momento después de que algo difícil por fin terminó. Ese suspiro de alivio. Encuéntralo de nuevo.",
      "Visualízate una hora más tarde, moviéndote despacio y sin resistencia a través de tu día."
    ],
    Valiente: [
      "Recuerda un momento en que avanzaste hacia algo que te daba miedo. Siente dónde vivió eso en tu cuerpo.",
      "Piensa en una vez que dijiste la verdad cuando el silencio hubiera sido más fácil. Ubica ese sentimiento.",
      "Visualízate cruzando una puerta frente a la que has estado parado. Siente tu mano en el picaporte.",
      "Recuerda a alguien que creyó en ti antes de que tú creyeras en ti mismo. Párate en cómo te veían.",
      "Piensa en la versión de ti que ya hizo lo difícil. No está lejos. Nunca lo estuvo.",
      "Imagina tu miedo como el clima — pasajero, no permanente. Siente lo que queda debajo de él.",
      "Recuerda un momento en que te sorprendiste a ti mismo. Esa capacidad sigue aquí. Nunca se fue.",
      "Visualiza tu columna alargándose. Tu pecho abriéndose. Tus pies encontrando el suelo. Así se siente el valor en el cuerpo.",
      "Piensa en algo que harías si supieras que va a resultar. Ahora siente cómo sería moverte de todas formas.",
      "Recuerda la última vez que te sentiste orgulloso de ti mismo. Esa persona es en quien estás colapsando ahora."
    ],
    Claro: [
      "Piensa en un momento en que todo de repente tuvo sentido. Nota cómo se sentía tu mente en ese instante.",
      "Imagina una neblina levantándose lentamente de un paisaje que conoces bien. Observa lo que se vuelve visible.",
      "Recuerda una decisión que se sintió completamente correcta. No lógica — correcta. Encuentra ese saber.",
      "Visualiza tus pensamientos como nubes moviéndose por un cielo abierto y amplio. El cielo en sí siempre está despejado.",
      "Piensa en un momento en que le diste a alguien el consejo perfecto. Esa claridad también te pertenece a ti.",
      "Imagina mirar tu situación actual desde cinco años en el futuro. ¿Qué es obvio desde allá?",
      "Recuerda una vez en que tus instintos estuvieron exactamente en lo correcto. Esa señal sigue transmitiendo.",
      "Visualiza un lente enfocándose. La imagen siempre estuvo ahí. Simplemente se está aclarando ahora.",
      "Piensa en lo que ya sabes pero has estado fingiendo no saber. Deja que emerja suavemente.",
      "Imagina tu mente como un lago profundo después de que el sedimento se ha asentado. Quieto. Transparente. Claro hasta el fondo."
    ],
    Expansivo: [
      "Visualízate desde arriba — sin muros, sin techo, sin bordes. Deja que llegue esa sensación.",
      "Recuerda un momento en que te sentiste genuinamente libre. No libre de algo — libre. ¿Cómo se sintió?",
      "Piensa en el espacio más grande en que hayas estado. Deja que tu cuerpo recuerde cómo se sintió ser pequeño dentro de algo tan vasto.",
      "Imagina tu conciencia expandiéndose en todas las direcciones a la vez. Sin límite. Solo campo abierto.",
      "Recuerda una conversación que te dejó sintiéndote más grande que cuando comenzó. ¿Quién eras en ese momento?",
      "Visualiza el cielo nocturno en una noche despejada lejos de la ciudad. No eres separado de eso. Estás hecho de ello.",
      "Piensa en una versión de tu vida donde el techo que has aceptado simplemente no existe.",
      "Imagina respirar el espacio mismo — no aire, sino apertura real. Deja que llene algún lugar que ha estado contraído.",
      "Recuerda un momento en que una música o una obra de arte hizo que el mundo se sintiera más grande de lo que creías.",
      "Visualiza tu sentido de lo posible duplicándose. Luego duplicándose de nuevo. Siente qué cambia en tu pecho."
    ],
    Arraigado: [
      "Siente el peso de tu cuerpo ahora mismo. Imagina raíces moviéndose hacia abajo desde donde estás sentado.",
      "Recuerda un momento en que te sentiste completamente sólido en ti mismo. Nada podía moverte. Encuentra ese suelo.",
      "Piensa en el árbol más antiguo que hayas visto. Imagina tener esa relación con la tierra bajo tus pies.",
      "Visualiza una montaña. No escalándola — siendo ella. Inamovible. Presente. Sin que el clima la perturbe.",
      "Siente tus pies. De verdad siéntelos. La presión del suelo. Este es el momento presente. Estás en él.",
      "Recuerda una vez en que te mantuviste firme mientras todo a tu alrededor era incierto. Esa firmeza es estructural — es quien eres.",
      "Piensa en algo que siempre ha sido verdad sobre ti, sin importar las circunstancias que te rodeaban.",
      "Imagina un río subterráneo profundo — constante, sin apuro, sin que le afecte lo que pasa en la superficie.",
      "Recuerda a alguien que encarnó un arraigo absoluto en tu vida. Siente cómo era estar cerca de esa persona.",
      "Visualiza tu respiración moviéndose hasta la base de tu columna. Ancíate ahí."
    ],
    Presente: [
      "Mira algo cercano como si nunca lo hubieras visto antes. Míralo de verdad.",
      "Nota tres sonidos que puedes escuchar ahora mismo que no estabas notando hace un momento.",
      "Siente la temperatura del aire en tu piel. Esta sensación solo está disponible ahora mismo.",
      "Piensa en este momento exacto como el único momento que ha existido jamás. Todo lo demás es memoria o imaginación.",
      "Visualiza una cámara alejándose hasta que todo el tiempo es visible — y luego acercándose hasta aterrizar precisamente aquí, ahora, en ti.",
      "Nota lo que tu cuerpo está haciendo ahora mismo sin intentar cambiarlo. Solo obsérvalo desde adentro.",
      "Recuerda un momento en que estabas tan absorto en algo que el tiempo desapareció. Encuentra la calidad de atención que hizo eso posible.",
      "Imagina que la próxima persona con quien vas a hablar merece tu presencia completa e indivisa. Siente cómo se sentiría eso de verdad.",
      "Piensa en esta respiración como lo más importante que está pasando en la tierra ahora mismo. Porque para ti, lo es.",
      "Visualiza un foco de luz que se va estrechando hasta iluminar solo esto: aquí, este espacio, este cuerpo, este momento."
    ],
    Luminoso: [
      "Recuerda un momento en que el rostro de alguien cambió por algo que hiciste o dijiste. Quédate ahí.",
      "Piensa en una vez en que tu presencia en un lugar cambió algo sutilmente. Puede que no lo hayas notado — alguien más sí.",
      "Visualiza luz emanando desde el centro de tu pecho. No actuada. Solo existiendo. Solo irradiando.",
      "Recuerda un momento en que te sentiste genuina y completamente tú mismo — y fue suficiente. Más que suficiente.",
      "Piensa en alguien cuya sola presencia hace que las cosas mejoren. Tú has sido eso para alguien. Más de una vez.",
      "Imagina la versión de ti que ha dejado de apagarse para que otros se sientan cómodos. Siente cómo se mueve esa persona por el mundo.",
      "Recuerda un momento de alegría genuina — sin guardia, sin autoconciencia. La luz que eras en ese momento sigue en ti.",
      "Visualízate en tu próxima conversación eligiendo estar completamente presente y completamente generoso. Siente lo que se vuelve posible.",
      "Piensa en lo que cargas que otros necesitan — no como una carga, sino como un regalo que aún no has ofrecido del todo.",
      "Imagina que la calidad de tu estado interior ya está afectando a todos los que tienes cerca. Lo está. Siempre lo ha hecho."
    ],
    Abierto: [
      "Piensa en algo que has estado sosteniendo con fuerza. Imagina tus manos soltándolo.",
      "Recuerda un momento en que una idea o persona completamente inesperada cambió tu rumbo para mejor.",
      "Visualiza una puerta que has mantenido cerrada. No tienes que cruzarla todavía. Solo imagínala desbloqueada.",
      "Piensa en una creencia que has tenido por mucho tiempo que quizás no te está sirviendo. ¿Cómo se sentiría simplemente dejarla ir?",
      "Recuerda una vez que le dijiste sí a algo incierto y se convirtió en una de las mejores cosas que te pasaron.",
      "Imagina tu resistencia a algo como una tensión física en tu cuerpo. Ahora imagina que esa tensión se disuelve lentamente, sin fuerza.",
      "Piensa en alguien cuya perspectiva has descartado. Imagina genuinamente intentar ver a través de sus ojos por un momento.",
      "Visualízate en una conversación que has estado evitando — pero esta vez abierto, curioso, sin armadura.",
      "Recuerda cómo se sentía ser principiante en algo que ahora amas. Encuentra esa apertura de nuevo.",
      "Imagina a la vida respondiendo con generosidad a una versión de ti que ya no está en guardia contra ella."
    ]
  }
};

// Helper: get random imagination prompt for a state
function getImagination(lang, stateName) {
  const pool = IMAGINATION[lang][stateName];
  if (!pool) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}
