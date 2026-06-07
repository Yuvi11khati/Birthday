import { useState, useRef, useEffect } from 'react';
import type { BabyImage } from '../../types';

type Mode = 'cover' | 'contain' | 'natural';

interface Props {
  image: BabyImage;
  /** cover = fill a fixed frame (focal-point aware, face kept), contain = never crop, natural = intrinsic ratio */
  mode?: Mode;
  className?: string;
  imgClassName?: string;
  /** aspect ratio for cover/contain frames, e.g. '4 / 5'. Ignored for natural. */
  ratio?: string;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Smart, never-distorting image.
 * - cover: fills the frame using the per-image focal point so the face is never cut off.
 * - contain: guarantees the whole photo is visible on a soft tinted backdrop.
 * - natural: renders at the photo's true aspect ratio (used by the masonry gallery).
 */
export default function SmartImage({
  image,
  mode = 'cover',
  className = '',
  imgClassName = '',
  ratio,
  rounded = 'rounded-3xl',
  priority = false,
  sizes,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If the image has already loaded/cached by the time the component mounts, set loaded state immediately
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      // Force Framer Motion and browser intersection observers to recalculate heights
      window.dispatchEvent(new Event('resize'));
    }
  }, [loaded]);

  const frameStyle =
    mode === 'natural'
      ? { aspectRatio: `${image.w} / ${image.h}` }
      : ratio
        ? { aspectRatio: ratio }
        : { aspectRatio: image.orientation === 'landscape' ? '4 / 3' : '4 / 5' };

  const fit =
    mode === 'contain'
      ? 'object-contain'
      : mode === 'natural'
        ? 'object-cover'
        : 'object-cover';

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={frameStyle}
    >
      {/* soft tinted backdrop so 'contain' letterboxing looks intentional & premium */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(183,148,244,0.14), rgba(165,180,252,0.14))',
        }}
      />
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-lavender/20 via-white/30 to-babyblue/20" />
      )}
      <img
        ref={imgRef}
        src={image.url}
        alt={image.caption ?? 'A precious memory of our little prince'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        style={{ objectPosition: image.objectPosition }}
        className={`absolute inset-0 h-full w-full ${fit} transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-103 opacity-0 blur-sm'
        } ${imgClassName}`}
      />
    </div>
  );
}
