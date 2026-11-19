// One place to retarget the four cabinets.
// Order from the entrance: front-left, back-left, back-right, front-right.
// Titles and themes come from the assigned Vimeo videos (oEmbed), not invented names.
//
// Vimeo: set each video to Unlisted or Embed only (not Private), allow embeds
// on https://portfolio-gules-rho-14.vercel.app (and any custom domain), and
// paste the Share → Embed `h=` value into `hash`.
// Without that, Vimeo shows "Sign in to watch this video".

export const ROOM = {
  width: 8.8,
  depth: 7.6,
  height: 3.4
};

export const PLAYER = {
  radius: 0.32,
  eye: 1.6,
  speed: 2.45
};

export const SCREEN = {
  width: 0.62,
  height: 0.42,
  pixelsPerMeter: 1000
};

export const START = {
  position: [0, PLAYER.eye, 3.22],
  lookAt: [0, 1.2, -1.1]
};

export const MACHINES = [
  {
    id: '1',
    title: 'HazardFactory',
    vimeoId: '1227963361',
    hash: '',
    theme: 'factory',
    neon: '#ffb020',
    neonAlt: '#ff6a00',
    body: '#1a1712',
    accent: '#2a2418',
    panel: '#242018',
    bezel: '#3a3428',
    buttons: [0xffb020, 0xff3b2f, 0xffe14a, 0x8a8a8a, 0xff6a00, 0xffffff],
    position: [-3.05, 0, 0.2],
    rotation: 0.68
  },
  {
    id: '2',
    title: 'Hazard Hunt',
    vimeoId: '1227963360',
    hash: '',
    theme: 'hunt',
    neon: '#3ad7ff',
    neonAlt: '#7dffd4',
    body: '#12161c',
    accent: '#1a2430',
    panel: '#182028',
    bezel: '#d8e4f0',
    buttons: [0x3ad7ff, 0xffffff, 0xff4a5a, 0x7dffd4, 0x4a7dff, 0xb8c4d0],
    position: [-1.85, 0, -1.45],
    rotation: 0.42
  },
  {
    id: '3',
    title: 'DrivingSim',
    vimeoId: '1227959277',
    hash: '',
    theme: 'drive',
    neon: '#ff7a2f',
    neonAlt: '#2ec8ff',
    body: '#101418',
    accent: '#182028',
    panel: '#151c24',
    bezel: '#1e2834',
    buttons: [0xff7a2f, 0x2ec8ff, 0xffffff, 0xffc83a, 0x3dde72, 0xff4a5a],
    position: [1.85, 0, -1.45],
    rotation: -0.42
  },
  {
    id: '4',
    title: 'fire fighting',
    vimeoId: '1227961050',
    hash: '',
    theme: 'fire',
    neon: '#ff3b2f',
    neonAlt: '#ff9a1a',
    body: '#1a1010',
    accent: '#281414',
    panel: '#221212',
    bezel: '#3a2020',
    buttons: [0xff3b2f, 0xff9a1a, 0xffe14a, 0xffffff, 0xff5a2a, 0x8a2020],
    position: [3.05, 0, 0.2],
    rotation: -0.68
  }
];

export function vimeoSrc(machine, autoplay) {
  const query = new URLSearchParams({
    title: '0',
    byline: '0',
    portrait: '0',
    autopause: '0',
    playsinline: '1',
    transparent: '0',
    autoplay: autoplay ? '1' : '0'
  });
  if (machine.hash) query.set('h', machine.hash);
  return 'https://player.vimeo.com/video/' + machine.vimeoId + '?' + query.toString();
}
