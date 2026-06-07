import type { BabyImage, Orientation } from '../types';

/**
 * Auto-detects and loads every photo in the project's /Images folder
 * (../../../Images relative to this file). No manual wiring needed —
 * drop in 24.jpg and it appears automatically.
 */
const modules = import.meta.glob('../../../Images/*.{jpg,jpeg,JPG,JPEG,png,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Known natural dimensions (read from disk) so masonry reserves exact space → zero layout shift. */
const DIMS: Record<number, [number, number]> = {
  1: [4080, 3060],
  2: [1080, 1441],
  3: [4080, 3060],
  4: [960, 1280],
  5: [868, 1160],
  6: [1069, 2220],
  7: [520, 1152],
  8: [3072, 4096],
  9: [1130, 1600],
  10: [4080, 3060],
  11: [3072, 4096],
  12: [3072, 4096],
  13: [3072, 4096],
  14: [3456, 4608],
  15: [3072, 4096],
  16: [1152, 2048],
  17: [1080, 1835],
  18: [724, 1600],
  19: [722, 1599],
  20: [3072, 4096],
  21: [3072, 4096],
  22: [1200, 1600],
  23: [1200, 1600],
};

/** Fine-tuned focal points so faces are always kept in view in fixed-ratio frames. */
const FOCUS: Record<number, string> = {
  1: 'center 25%',
  2: 'center 55%',
  3: 'center 55%',
  8: 'center 30%',
  10: 'center 50%',
  11: 'center 45%',
  12: 'center 30%',
  13: 'center 30%',
  15: 'center 28%',
  20: 'center 30%',
  21: 'center 32%',
};

function orientationOf(w: number, h: number): Orientation {
  const r = w / h;
  if (r > 1.05) return 'landscape';
  if (r < 0.95) return 'portrait';
  return 'square';
}

function numberFromPath(path: string): number {
  const match = path.match(/(\d+)\.(jpe?g|png)$/i);
  return match ? parseInt(match[1], 10) : 9999;
}

export const ALL_IMAGES: BabyImage[] = Object.entries(modules)
  .map(([path, url]) => {
    const id = numberFromPath(path);
    const [w, h] = DIMS[id] ?? [4, 3];
    const orientation = orientationOf(w, h);
    return {
      id,
      url,
      w,
      h,
      ratio: w / h,
      orientation,
      objectPosition:
        FOCUS[id] ?? (orientation === 'portrait' ? 'center 35%' : 'center'),
    } as BabyImage;
  })
  .sort((a, b) => a.id - b.id);

const byId = (id: number) => ALL_IMAGES.find((img) => img.id === id);

function pick(ids: number[], captions?: string[]): BabyImage[] {
  return ids
    .map((id, i) => {
      const img = byId(id);
      if (!img) return undefined;
      return captions ? { ...img, caption: captions[i] } : img;
    })
    .filter((x): x is BabyImage => Boolean(x));
}

/** Best smiling, face-forward portrait for the hero. */
export const HERO_IMAGE: BabyImage = byId(15) ?? ALL_IMAGES[0];

/** Section 4 — alternating featured memories (mix of tender & joyful). */
export const FEATURED_IMAGES = pick(
  [15, 11, 2, 21],
  [
    'A Smile That Lights Up Everything',
    'Curious Little Eyes',
    'The Day You Arrived',
    'Wrapped in So Much Love',
  ]
);

/** Section 3 — scrapbook polaroids. */
export const LITTLE_MOMENTS = pick(
  [8, 9, 4, 5, 20, 16],
  ['Sweet Smiles', 'Happy Moments', 'Tiny Adventures', 'Little Joys', 'Precious Memories', 'Pure Wonder']
);

/** Section 5 — full-width cinematic banners (favour landscape shots). */
export const PHOTO_HIGHLIGHTS = pick(
  [3, 11, 1, 13],
  ['Cradled in Love', 'Eyes Full of Wonder', 'Dreaming Sweetly', 'Our Whole World']
);

/** Section 7 — video-style cinematic moments. */
export const VIDEO_MOMENTS = pick(
  [15, 11, 20, 21, 8],
  ['First Giggles', 'Peek-a-Boo', 'Playtime Joy', 'Cuddle Time', 'Sleepy Smiles']
);

/** Section 6 — the full memory gallery (everything, true to ratio, never cropped). */
export const GALLERY_IMAGES = ALL_IMAGES;
