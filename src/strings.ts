export const strings = {
  appName: 'Glowmory',
  tagline: "Good days don't go. They glow.",
  helper: 'Save a spark for the dark.',
  onboarding: {
    hello: 'Hello. This jar remembers your good days.',
    firstPrompt: 'Tell me one good thing.',
    shakeHint: 'Whenever you need it, shake me.',
    privacy: 'Everything stays on this device.',
  },
  write: { cta: 'Let it glow', emptyHint: 'Write one good thing first.' },
  sensePrompts: [
    'What did it smell like?',
    'What song was playing?',
    'Who was there?',
    'What did the light look like?',
    'What did you taste or hold?',
  ],
  low: {
    ask: 'What do you need right now?',
    surprise: 'Surprise me',
    enough: "That's plenty of light for now. I'll be here.",
    emptyJar: 'Nothing here yet. Want to put in the first good thing?',
    noneOfFeeling:
      "I don't have one for that yet. Want to try another feeling?",
    breathe: 'Breathe with it',
    another: 'Another one',
    done: "I'm done",
    notMe: "This one doesn't feel like me right now",
  },
  feelings: {
    proud: 'Proud of me',
    loved: 'Loved',
    peaceful: 'Peaceful',
    silly: 'Silly',
    brave: 'Brave',
    thankful: 'Thankful',
  },
  settings: {
    support:
      'If low days are lasting a while, talking to someone can really help.',
  },
} as const;
