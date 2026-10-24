/* ============================================================================
   CONTENT CONFIG — the single file the owner edits.
   Change your name, bio, projects, links, and journey tuning here.
   Nothing in components/ needs to be touched to re-skin the portfolio.
   ========================================================================== */

export const ASSET_BASE = import.meta.env.BASE_URL

/* ------------------------------------------------------------------ THEME */
/* Brand tokens shared by UI + 3D. Warm road-trip palette — dawn amber,
   ink, cream, muted teal/plum. Deliberately NOT generic purple-blue. */
export const THEME = {
  ink: '#1c1a17',
  paper: '#f4eee4',
  cream: '#fbf7f0',
  amber: '#c98a3d',
  amberSoft: '#e3b878',
  coral: '#d96c4a',
  teal: '#4a7a78',
  tealSoft: '#7aa9a6',
  steel: '#5d87ad',
  plum: '#7a5d8f',
  night: '#16131f',
  dusk: '#241d33',
  /* Car paint + accents */
  carBody: '#d96c4a',
  carAccent: '#f4eee4',
  driverShirt: '#4a7a78',
  driverPants: '#2c2a33',
  driverSkin: '#c9926b',
  driverHair: '#241d18',
}

/* ------------------------------------------------------------------ DRIVE */
/* Journey physics. One station ≈ stationSpacing / cruise seconds of driving. */
export const DRIVE = {
  stationSpacing: 210, // world units between billboards (~8–9 s at cruise)
  initialProgress: 0.16, // car's starting position before the first stop
  cruise: 24, // cruising speed (u/s)
  boost: 68, // fast-forward speed from the navbar
  approach: 11, // eased speed while a billboard is in view
  acceleration: 9.5,
  deceleration: 15,
  approachRange: 46, // how far out the "Wanna have a look?" beat starts
  approachDistance: 118, // distance at which the camera begins to glide wide
  stationPromptDistance: 70, // distance at which the speech prompt appears
  promptGrace: 12, // units a passed sign remains actionable
  finaleDistance: 168, // begin the final parking sequence this far out
  finaleLead: 18, // extra units past the last billboard to fully park
  askHold: 8, // seconds before an ignored billboard rolls on by
}

/* --------------------------------------------------------------- IDENTITY */
export const IDENTITY = {
  name: 'Samrat Bhusal',
  monogram: 'SB',
  role: 'Front-end developer & creative technologist',
  tagline:
    'I build playful, useful web experiences — AI camera apps, real-time games, and this drivable 3D world.',
  intro:
    'Self-taught developer from Devdaha, Nepal. I learn by shipping: face-tracking apps, gesture-controlled remotes, and interfaces that feel alive.',
  location: 'Devdaha, Nepal · Working worldwide',
  email: 'bhusalmohan83@gmail.com',
  status: 'Open to collaborations, internships & freelance work',
  availability: 'Open to remote work · Replies within a day',
  socials: [
    { key: 'github', label: 'GitHub', href: 'https://github.com/Innovator123-sudo' },
    { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/samrat_kun/' },
    { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/samrat.bhusal.395' },
    { key: 'email', label: 'Email', href: 'mailto:bhusalmohan83@gmail.com' },
  ],
  resumeUrl: 'https://github.com/Innovator123-sudo',
  bookUrl: 'mailto:bhusalmohan83@gmail.com?subject=Project%20idea',
  portrait: `${ASSET_BASE}art/portrait-photo.jpg`,
  portraitAlt:
    'Samrat Bhusal smiling at the camera in a navy jacket, giving two thumbs up.',
}

/* ------------------------------------------------------------------ ABOUT */
const ABOUT = {
  eyebrow: 'The driver',
  title: 'Hey — I’m Samrat.',
  portrait: IDENTITY.portrait,
  portraitAlt: IDENTITY.portraitAlt,
  stats: [
    { value: '6', label: 'featured builds' },
    { value: '9', label: 'public repos' },
    { value: '5', label: 'live demos' },
  ],
  lede: 'I’m Samrat Bhusal — a self-taught developer from Devdaha, Nepal. I build playful web experiences that mix AI, real-time 3D and clean frontend craft.',
  body: [
    'I started web development in class 5, and the first thrill was simple: change a line of code, refresh the page, watch something new appear. That curiosity grew into a habit of shipping — face-tracking meme finders, pose-tracked fitness games, a gesture-controlled TV remote, and this drivable 3D portfolio.',
    'I care about interfaces that feel fast, honest and a little surprising. When I’m not coding, I’m playing football, practising karate, or sketching the next idea. My goal is to grow into a full-stack engineer and build tools that make a real impact.',
  ],
  funFacts: [
    'I started with HTML in class 5 and never really stopped.',
    'My first portfolio is still live — a time capsule I keep online.',
    'I built a TV remote that runs in a browser and understands hand gestures.',
    'I keep a notebook of interface ideas beside my football boots.',
  ],
  traits: [
    { label: 'Self-taught', note: 'Docs, source code, and a lot of trial and error' },
    { label: 'Ship to learn', note: 'Every project teaches the next one' },
    { label: 'Curious across the stack', note: 'Frontend, AI, realtime, and the glue between' },
    { label: 'Detail with purpose', note: 'Motion and polish only when they help' },
  ],
}

/* ----------------------------------------------------------------- SKILLS */
const SKILLS = {
  eyebrow: 'Under the hood',
  title: 'Skills & tooling',
  lede: 'A working toolkit built by shipping real projects — from the first HTML page to on-device AI.',
  focus: 'Frontend · AI · 3D',
  categories: [
    {
      name: 'Frontend engineering',
      note: 'Semantic markup, responsive layout, and the small details that make a page feel finished.',
      items: [
        { name: 'HTML / CSS', level: 92 },
        { name: 'JavaScript', level: 88 },
        { name: 'React / Vite', level: 86 },
        { name: 'TypeScript', level: 78 },
      ],
    },
    {
      name: 'AI & real-time',
      note: 'Browser-native vision, live media, and interfaces that respond in the moment.',
      items: [
        { name: 'MediaPipe / TensorFlow.js', level: 78 },
        { name: 'Face detection & pose tracking', level: 76 },
        { name: 'Three.js / React Three Fiber', level: 72 },
        { name: 'Canvas & Web Audio', level: 80 },
      ],
    },
    {
      name: 'Backend & tooling',
      note: 'The unglamorous parts that make a build dependable and easy to ship.',
      items: [
        { name: 'Node.js / Express', level: 76 },
        { name: 'Socket.io / WebRTC', level: 70 },
        { name: 'Git / GitHub', level: 88 },
        { name: 'REST APIs & deployment', level: 80 },
      ],
    },
    {
      name: 'Design & product',
      note: 'Systems thinking, prototyping, and motion that supports the content.',
      items: [
        { name: 'Responsive UI design', level: 90 },
        { name: 'Tailwind / design systems', level: 86 },
        { name: 'Figma & prototyping', level: 78 },
        { name: 'Motion / Framer Motion', level: 76 },
      ],
    },
  ],
}

/* --------------------------------------------------------------- PROJECTS */
const PROJECTS = {
  eyebrow: 'Selected work',
  title: 'Projects worth the detour',
  lede: 'Six builds that show how I think — each one shipped, each one taught me the next thing.',
  items: [
    {
      title: 'FaceMeme Finder',
      subtitle: 'Your face, matched to a meme',
      year: '2026',
      role: 'Solo build · AI + frontend',
      description:
        'A privacy-first web app that reads your expression on-device and recommends video memes that match your mood. Four independent face-AI voters fuse into one read, then a tag-matching engine picks the clips. Photos and camera frames never leave the browser.',
      stack: ['React', 'Vite', 'TensorFlow.js', 'face-api', 'ONNX'],
      image: `${ASSET_BASE}art/project-facememe.jpg`,
      imageAlt:
        'FaceMeme Finder interface with a live scan panel, face-reading instructions and a local clip library.',
      metric: '386 clips · 4-voter AI',
      note: 'Live on GitHub Pages · 100% on-device',
      links: [
        {
          label: 'Live app',
          href: 'https://innovator123-sudo.github.io/meme-face-detection/',
        },
        {
          label: 'Source',
          href: 'https://github.com/Innovator123-sudo/meme-face-detection',
        },
      ],
    },
    {
      title: 'Pushup Pro',
      subtitle: 'Real-time AI pushup battles',
      year: '2026',
      role: 'Full-stack · pose tracking',
      description:
        'A browser fitness arena with MediaPipe pose tracking and live WebRTC rooms. Camera frames stay local; only rep events travel. The bot re-paces itself from your rep speed, so every round stays close — no wearables, no tapping.',
      stack: ['React', 'TypeScript', 'MediaPipe', 'Socket.io', 'WebRTC'],
      image: `${ASSET_BASE}art/project-pushup.svg`,
      imageAlt:
        'Pushup Pro interface with a pose-tracked skeleton, rep counter and adaptive bot score.',
      metric: '0 wearables · 100% browser',
      note: 'Solo build · AI + realtime',
      links: [
        {
          label: 'Source',
          href: 'https://github.com/Innovator123-sudo/filecr-auto',
        },
      ],
    },
    {
      title: 'Online Remote',
      subtitle: 'Your hand is the remote',
      year: '2026',
      role: 'Solo build · browser + Android TV',
      description:
        'A phone-first remote for Android TV that pairs over your home Wi-Fi. Palm position steers the D-pad, thumbs-up confirms, and letters drawn in the air become search text — no extra app install.',
      stack: ['JavaScript', 'Android TV Protocol', 'WebRTC', 'PWA', 'Canvas'],
      image: `${ASSET_BASE}art/project-remote.jpg`,
      imageAlt:
        'Online Remote landing page with a dark interface and gesture instructions for a browser-based TV remote.',
      metric: 'Palm + gesture control',
      note: 'Live demo · PWA ready',
      links: [
        { label: 'Live demo', href: 'https://online-remote.vercel.app/' },
        {
          label: 'Source',
          href: 'https://github.com/Innovator123-sudo/Online-remote',
        },
      ],
    },
    {
      title: 'Naruto Ultimate',
      subtitle: 'Jutsu, tracked by your hands',
      year: '2026',
      role: 'Solo build · creative frontend',
      description:
        'An interactive jutsu playground where MediaPipe tracks hand signs in the browser. Chain the right sequence to trigger Rasengan, Chidori, shadow clones and Sharingan effects, complete with sound and full-screen animation.',
      stack: ['HTML', 'CSS', 'JavaScript', 'MediaPipe', 'Web Audio'],
      image: `${ASSET_BASE}art/project-naruto.jpg`,
      imageAlt:
        'Naruto Ultimate Jutsu Hub homepage with glowing jutsu cards and a hand-sign camera panel.',
      metric: '14 hand-sign sequences',
      note: 'Live site · built for fun',
      links: [
        { label: 'Live site', href: 'https://website-dfqwwq.vercel.app/' },
        {
          label: 'Source',
          href: 'https://github.com/Innovator123-sudo/naruto-ultimate',
        },
      ],
    },
    {
      title: 'Song Mood',
      subtitle: 'A soundtrack for the feeling',
      year: '2024',
      role: 'Solo build · API + UI',
      description:
        'A small music-discovery app that turns a mood — happy, heartbreak, motivation, calm — into a hand-picked song suggestion, with a lightweight interface that gets out of the way.',
      stack: ['HTML', 'CSS', 'JavaScript', 'REST API'],
      image: `${ASSET_BASE}art/project-songmood.jpg`,
      imageAlt:
        'Song Mood Suggestion page with a mood input, blue musical background and a Suggest Songs button.',
      metric: 'Mood → music',
      note: 'Live since 2024',
      links: [{ label: 'Live site', href: 'https://songmood.netlify.app/' }],
    },
    {
      title: 'Lumina',
      subtitle: 'A tiny wizard, a very big jungle',
      year: '2024',
      role: 'Game design & build',
      description:
        'A Godot platformer about a small wizard escaping an enchanted jungle. I built the levels, movement, spells and the hand-painted world as an early game-development experiment.',
      stack: ['Godot', 'GDScript', 'Pixel art'],
      image: `${ASSET_BASE}art/project-lumina.jpg`,
      imageAlt:
        'Lumina game art: a small dark wizard with glowing eyes floating above a green jungle horizon.',
      metric: 'Playable on itch.io',
      note: 'Game build · itch.io',
      links: [
        { label: 'Play on itch.io', href: 'https://samrat-bhusal.itch.io/lumina-12' },
      ],
    },
  ],
}

export const PROJECT_CTA = {
  label: 'Ask about this project',
  note: 'Happy to walk through the decisions, the trade-offs, or the parts that broke.',
}

/* ------------------------------------------------------------ EXPERIENCE */
const EXPERIENCE = {
  eyebrow: 'The route so far',
  title: 'Learning in public',
  lede: 'No agency résumé yet — just a public trail of projects, shipped one after another.',
  items: [
    {
      role: 'Independent builder',
      company: 'Self-directed',
      period: '2025 — Present',
      periodNote: 'AI, realtime & 3D',
      location: 'Remote',
      milestones: [
        'Shipped FaceMeme Finder, Pushup Pro, Online Remote and Naruto Ultimate in one year.',
        'Built four-voter on-device face AI, MediaPipe pose tracking and Android TV pairing.',
        'Rebuilt this portfolio as a drivable React Three Fiber world with a reading edition.',
      ],
    },
    {
      role: 'Open-source learner',
      company: 'GitHub',
      period: '2024 — 2025',
      periodNote: '9 public repositories',
      location: 'Remote',
      milestones: [
        'Turned tutorial knowledge into complete projects with READMEs, deploys and tests.',
        'Learned deployment on Vercel, Render, Netlify and GitHub Pages.',
        'Started reading source code instead of waiting for the perfect tutorial.',
      ],
    },
    {
      role: 'First lines of code',
      company: 'Self-taught',
      period: '2021 — 2024',
      periodNote: 'Class 5 onward',
      location: 'Devdaha, Nepal',
      milestones: [
        'Started with HTML and CSS, then JavaScript and React.',
        'Built my first portfolio, a mood-based song finder, and a small Godot game.',
        'Learned that finishing and sharing beats collecting unfinished ideas.',
      ],
    },
  ],
}

/* ---------------------------------------------------------------- CONTACT */
const CONTACT = {
  eyebrow: 'Last light',
  title: 'Let’s build something',
  lede: 'Have an idea, a collaboration, or a project that needs a builder? Tell me about it.',
  availability: 'Open to collaborations, internships & freelance work · Replies within a day',
  formLabels: { name: 'Your name', email: 'Email', message: 'Project details' },
  formPlaceholders: {
    name: 'Your name',
    email: 'you@example.com',
    message: 'What are you building, and when does it need to ship?',
  },
  formEndpoint: '', // Add a Formspree/Buttondown endpoint to POST. Empty = opens email.
  success:
    'Your email app should be opening with the message ready. If it did not, write to bhusalmohan83@gmail.com.',
  errorNetwork:
    'Couldn’t send that — the road was closed. Email me directly at bhusalmohan83@gmail.com instead.',
  channels: [
    {
      key: 'email',
      label: 'bhusalmohan83@gmail.com',
      href: 'mailto:bhusalmohan83@gmail.com',
    },
    { key: 'location', label: 'Devdaha, Nepal / UTC+5:45', href: '' },
    { key: 'availability', label: 'Open to remote work', href: '' },
  ],
}

/* ------------------------------------------------------- HIRE (FINALE) */
const HIRE = {
  eyebrow: 'The last stop',
  title: 'Let’s work together',
  lede: 'The drive ends here — but the next build doesn’t have to. Pick a lane:',
  note: 'Whether it’s a collaboration, an internship, or a focused freelance build, I’m easy to reach.',
  ctas: {
    emailLabel: 'Email me',
    resumeLabel: 'View GitHub',
    bookLabel: 'Send a project idea',
    emailHref:
      'mailto:bhusalmohan83@gmail.com?subject=Let%E2%80%99s%20work%20together',
    bookHref: 'mailto:bhusalmohan83@gmail.com?subject=Project%20idea',
    resumeHref: 'https://github.com/Innovator123-sudo',
  },
  response: 'Replies within a day. Open to remote work.',
}

/* ---------------------------------------------------------------- STATIONS */
/* The billboard order along the highway. `key` links a station to its card.
   The last station (index length-1) is the finale. */
export const STATIONS = [
  {
    key: 'about',
    label: 'About',
    accent: '#c98a3d',
    content: ABOUT,
    index: '01',
    boardKicker: 'The driver',
    boardTitle: 'Hello.',
    boardSub: 'A self-taught builder with the windows down.',
  },
  {
    key: 'skills',
    label: 'Skills',
    accent: '#4a7a78',
    content: SKILLS,
    index: '02',
    boardKicker: 'Under the hood',
    boardTitle: 'The toolkit.',
    boardSub: 'AI, realtime and interface craft.',
  },
  {
    key: 'projects',
    label: 'Projects',
    accent: '#d96c4a',
    content: PROJECTS,
    index: '03',
    boardKicker: 'Selected work',
    boardTitle: 'Proof of work.',
    boardSub: 'Six builds. Six different kinds of attention.',
  },
  {
    key: 'experience',
    label: 'Journey',
    accent: '#5d87ad',
    content: EXPERIENCE,
    index: '04',
    boardKicker: 'The route so far',
    boardTitle: 'Learning.',
    boardSub: 'Public projects, honest progress, one build at a time.',
  },
  {
    key: 'contact',
    label: 'Contact',
    accent: '#7a5d8f',
    content: CONTACT,
    index: '05',
    boardKicker: 'Open channel',
    boardTitle: 'Say hello.',
    boardSub: 'Tell me what you are building next.',
  },
  {
    key: 'hire',
    label: 'Hire Me',
    accent: '#e0a45d',
    content: HIRE,
    finale: true,
    index: '06',
    boardKicker: 'The last stop',
    boardTitle: 'Hire me.',
    boardSub: 'One seat left in the passenger side.',
  },
]

export const FINALE = HIRE

/* Convenience alias used by the 3D canvas and older imports. */
export const SITE = IDENTITY
