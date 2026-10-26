// All timings are video seconds of anatomy.mp4; tune them with ?debug.
export const VIDEO = { width: 1920, height: 1080, fps: 24 };

export const SCROLL = {
  totalVh: 1060,
  holdVh: 100,
  transitionVh: 60,
};

export const HOLD_SCALE = 1.04;

// part: the callout target in video-frame px at the station time.
export const STATIONS = [
  { id: 'hero', time: 0, hold: [0, 1.2], holdVh: 70 },
  { id: 'case', time: 8.2, hold: [7.0, 9.3], part: [1088, 486] },
  { id: 'barrel', time: 16.3, hold: [15.75, 16.9], part: [1218, 568] },
  { id: 'train', time: 20.3, hold: [20.0, 21.0], part: [1394, 524] },
  { id: 'escapement', time: 26.7, hold: [26.4, 26.95], part: [624, 532] },
  { id: 'jewel', time: 34.0, hold: [33.6, 34.45], part: [552, 498] },
  { id: 'knolling', time: 42.5, hold: [41.6, 42.5], holdVh: 130 },
];

// Knolling hotspots in knolling-last.png px; label: where the leader line ends.
export const HOTSPOTS = [
  { id: 'screws', name: 'Screws', at: [258, 78], label: [300, 28], side: 'r' },
  { id: 'barrel', name: 'Barrel', at: [148, 396], label: [60, 470], side: 'r' },
  { id: 'hairspring', name: 'Hairspring', at: [1666, 402], label: [1600, 490], side: 'l' },
  { id: 'escape-wheel', name: 'Escape wheel', at: [1376, 546], label: [1440, 640], side: 'r' },
  { id: 'case', name: 'Case', at: [978, 676], label: [1060, 640], side: 'r' },
  { id: 'caseback', name: 'Caseback', at: [628, 856], label: [560, 1046], side: 'l' },
  { id: 'crystal', name: 'Crystal', at: [1310, 866], label: [1380, 1046], side: 'r' },
];
