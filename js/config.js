// One place to retarget the four cabinets.
// Order from the entrance: front-left, back-left, back-right, front-right.
// Set `title` to show a label while that machine's video plays.
// Leave it blank rather than guessing a project name.

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
  width: 0.6,
  height: 0.4,
  pixelsPerMeter: 1000
};

export const START = {
  position: [0, PLAYER.eye, 3.22],
  lookAt: [0, 1.2, -1.1]
};

const cyan = '#3ad7ff';
const pink = '#ff3ec8';

export const MACHINES = [
  {
    id: '1',
    title: '',
    vimeoId: '1227963361',
    neon: cyan,
    position: [-3.05, 0, 0.2],
    rotation: 0.68
  },
  {
    id: '2',
    title: '',
    vimeoId: '1227963360',
    neon: cyan,
    position: [-1.85, 0, -1.45],
    rotation: 0.42
  },
  {
    id: '3',
    title: '',
    vimeoId: '1227959277',
    neon: pink,
    position: [1.85, 0, -1.45],
    rotation: -0.42
  },
  {
    id: '4',
    title: '',
    vimeoId: '1227961050',
    neon: pink,
    position: [3.05, 0, 0.2],
    rotation: -0.68
  }
];

export function vimeoSrc(vimeoId, autoplay) {
  const query = new URLSearchParams({
    title: '0',
    byline: '0',
    portrait: '0',
    dnt: '1',
    autopause: '0',
    playsinline: '1',
    autoplay: autoplay ? '1' : '0'
  });
  return 'https://player.vimeo.com/video/' + vimeoId + '?' + query.toString();
}
