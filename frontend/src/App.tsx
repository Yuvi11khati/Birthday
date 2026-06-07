import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoProvider, PhotoView } from 'react-photo-view';

import {
  FIRST_BIRTHDAY,
  HERO_HEADING,
  HERO_SUBHEADING,
} from './config';
import {
  HERO_IMAGE,
  FEATURED_IMAGES,
  LITTLE_MOMENTS,
  PHOTO_HIGHLIGHTS,
  GALLERY_IMAGES,
} from './data/images';
import {
  getMessages,
  postMessage,
  getWishes,
  postWish,
  deleteMessage,
  deleteWish,
} from './lib/api';
import type { Message, Wish } from './types';

// Components
import SmartImage from './components/ui/SmartImage';
import SectionTitle from './components/ui/SectionTitle';
import Reveal from './components/ui/Reveal';
import MouseGlow from './components/effects/MouseGlow';
import MagicCanvas from './components/effects/MagicCanvas';
import CloudBackground from './components/effects/CloudBackground';
import Butterflies from './components/effects/Butterflies';
import { useCountdown } from './hooks/useCountdown';

export default function App() {
  const countdown = useCountdown(FIRST_BIRTHDAY);

  // States for API data
  const [messages, setMessages] = useState<Message[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  
  // Form input states
  const [msgName, setMsgName] = useState('');
  const [msgText, setMsgText] = useState('');
  const [wishName, setWishName] = useState('');
  const [wishText, setWishText] = useState('');

  // UI state
  const [isSubmittingMsg, setIsSubmittingMsg] = useState(false);
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);
  // Magical Balloon Popping Game States
  const [balloons, setBalloons] = useState<any[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [activeSurprise, setActiveSurprise] = useState<any | null>(null);
  const [formFeedback, setFormFeedback] = useState<{ type: 'msg' | 'wish'; text: string } | null>(null);

  // Web Audio API Birthday Music Synth States & Refs
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const stopMusic = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        console.error(e);
      }
      audioCtxRef.current = null;
    }
    setIsMusicPlaying(false);
  };

  const playMusic = () => {
    stopMusic();

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    setIsMusicPlaying(true);

    const melody = [
      [261.63, 0.45], [261.63, 0.45], [293.66, 0.8], [261.63, 0.8], [349.23, 0.8], [329.63, 1.3],
      [261.63, 0.45], [261.63, 0.45], [293.66, 0.8], [261.63, 0.8], [392.00, 0.8], [349.23, 1.3],
      [261.63, 0.45], [261.63, 0.45], [523.25, 0.8], [440.00, 0.8], [349.23, 0.8], [329.63, 0.8], [293.66, 1.3],
      [466.16, 0.45], [466.16, 0.45], [440.00, 0.8], [349.23, 0.8], [392.00, 0.8], [349.23, 1.8]
    ];

    let time = ctx.currentTime + 0.15;
    const timeouts: number[] = [];

    melody.forEach((note) => {
      const [freq, duration] = note;
      
      const playNote = (nFreq: number, startTime: number, dur: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(nFreq, startTime);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(nFreq * 2, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.04, startTime + dur * 0.35);
        gainNode.gain.setValueAtTime(0.04, startTime + dur * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + dur + 0.5);
        
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.value = 5.5;
        vibratoGain.gain.value = 3.0;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc1.frequency);
        vibratoGain.connect(osc2.frequency);
        vibrato.start(startTime);
        vibrato.stop(startTime + dur + 0.55);
        
        const delay = ctx.createDelay();
        const delayGain = ctx.createGain();
        delay.delayTime.value = 0.25;
        delayGain.gain.value = 0.22;
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        
        gainNode.connect(ctx.destination);
        gainNode.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(delay);
        delayGain.connect(ctx.destination);
        
        osc1.start(startTime);
        osc1.stop(startTime + dur + 0.55);
        
        osc2.start(startTime);
        osc2.stop(startTime + dur + 0.55);
      };

      playNote(freq, time, duration);
      time += duration + 0.06;
    });

    const totalDurationMs = (time - ctx.currentTime) * 1000;
    const endTimeout = window.setTimeout(() => {
      setIsMusicPlaying(false);
    }, totalDurationMs);
    
    timeouts.push(endTimeout);
    timeoutsRef.current = timeouts;
  };

  const handleMusicToggle = () => {
    if (isMusicPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Load backend data
  useEffect(() => {
    getMessages().then(setMessages);
    getWishes().then(setWishes);
  }, []);

  // Sync scroll reveals on mount as images populate
  useEffect(() => {
    const intervals = [100, 300, 600, 1000, 2000, 4000];
    const timers = intervals.map((delay) =>
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Spawner & physics for Balloon Popping Game
  useEffect(() => {
    const colors = [
      { bg: 'from-purple-400 to-purple-600', knot: 'text-purple-500', border: 'border-purple-300' },
      { bg: 'from-blue-400 to-blue-600', knot: 'text-blue-500', border: 'border-blue-300' },
      { bg: 'from-amber-400 to-amber-600', knot: 'text-amber-500', border: 'border-amber-300' },
      { bg: 'from-rose-400 to-rose-600', knot: 'text-rose-500', border: 'border-rose-300' },
      { bg: 'from-emerald-400 to-emerald-600', knot: 'text-emerald-500', border: 'border-emerald-300' },
    ];
    
    const getSurpriseImage = (index: number) => {
      if (GALLERY_IMAGES && GALLERY_IMAGES.length > 0) {
        return GALLERY_IMAGES[index % GALLERY_IMAGES.length];
      }
      return HERO_IMAGE;
    };

    const surprises = [
      { type: 'text', text: 'May your childhood be full of play, joy, and wonderful stories! 📚✨' },
      { type: 'image', image: getSurpriseImage(2), text: 'A smile that melts hearts! 👶💖' },
      { type: 'text', text: 'Wishing you a lifetime of health, happiness, and beautiful dreams! 🌈🧸' },
      { type: 'image', image: getSurpriseImage(8), text: 'Giggly playtime moments! 😄🎉' },
      { type: 'text', text: 'May you grow up to be curious, kind, and always reach for the stars! 🌌⭐' },
      { type: 'image', image: getSurpriseImage(4), text: 'Tiny feet, giant steps! 👣' },
      { type: 'text', text: 'May your life be as sweet and magical as your very first birthday! 🎂🎈' },
      { type: 'image', image: getSurpriseImage(20), text: 'Pure wonder and joy! 👀✨' }
    ];

    let balloonId = 0;
    
    // Spawn initial balloons
    const initialBalloons = Array.from({ length: 4 }).map((_, idx) => {
      const styleIdx = Math.floor(Math.random() * colors.length);
      return {
        id: ++balloonId,
        x: 10 + Math.random() * 80,
        style: colors[styleIdx],
        speed: 9 + Math.random() * 6,
        size: 55 + Math.random() * 20,
        sway: 3 + Math.random() * 5,
        surprise: surprises[idx % surprises.length],
        popped: false
      };
    });
    setBalloons(initialBalloons);

    const interval = setInterval(() => {
      setBalloons((prev) => {
        if (prev.filter(b => !b.popped).length >= 6) return prev;
        const styleIdx = Math.floor(Math.random() * colors.length);
        const nextId = ++balloonId;
        const surpriseIdx = Math.floor(Math.random() * surprises.length);
        return [
          ...prev,
          {
            id: nextId,
            x: 10 + Math.random() * 80,
            style: colors[styleIdx],
            speed: 10 + Math.random() * 6,
            size: 55 + Math.random() * 20,
            sway: 3 + Math.random() * 5,
            surprise: surprises[surpriseIdx],
            popped: false
          }
        ];
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const playPopSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (err) {
      console.error("Failed to play sound", err);
    }
  };

  const handlePop = (id: number) => {
    setBalloons((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          playPopSound();
          setActiveSurprise(b.surprise);
          setPoppedCount((c) => c + 1);
          return { ...b, popped: true };
        }
        return b;
      })
    );
  };

  const handleBalloonOffScreen = (id: number) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  // Submit Message Wall entry
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgName.trim() || !msgText.trim()) return;
    setIsSubmittingMsg(true);
    try {
      const newMsg = await postMessage(msgName.trim(), msgText.trim());
      setMessages((prev) => [newMsg, ...prev]);
      setMsgName('');
      setMsgText('');
      setFormFeedback({ type: 'msg', text: 'Thank you for sharing your beautiful memory!' });
      setTimeout(() => setFormFeedback(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMsg(false);
    }
  };

  // Submit Guest Book wish
  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishText.trim()) return;
    setIsSubmittingWish(true);
    try {
      const newWish = await postWish(wishName.trim(), wishText.trim());
      setWishes((prev) => [newWish, ...prev]);
      setWishName('');
      setWishText('');
      setFormFeedback({ type: 'wish', text: 'Thank you for sharing your warm wish!' });
      setTimeout(() => setFormFeedback(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingWish(false);
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (id: number) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // Delete wish handler
  const handleDeleteWish = async (id: number) => {
    try {
      await deleteWish(id);
      setWishes((prev) => prev.filter((wish) => wish.id !== id));
    } catch (err) {
      console.error("Failed to delete wish:", err);
    }
  };

  const scrollToMemories = () => {
    document.getElementById('countdown')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream font-body text-ink selection:bg-lavender/30">
      {/* Decorative Interactive Background Elements */}
      <MagicCanvas />
      <MouseGlow />

      {/* ================= SECTION 1: HERO SECTION ================= */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        {/* Animated Clouds & Butterflies */}
        <CloudBackground />
        <Butterflies />

        {/* Ambient background grid gradient */}
        <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-cream/40 to-cream" />

        <div className="relative z-10 flex flex-col items-center max-w-4xl gap-8">
          {/* Circular Baby Image with Glow border */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-lavender via-gold to-babyblue opacity-75 blur-md animate-glow" />
            <div className="relative h-44 w-44 overflow-hidden rounded-full border-[6px] border-white shadow-2xl sm:h-52 sm:w-52 bg-slate-100">
              {HERO_IMAGE ? (
                <img
                  src={HERO_IMAGE.url}
                  alt="Our Little Prince"
                  className="h-full w-full object-cover scale-105"
                  style={{ objectPosition: HERO_IMAGE.objectPosition }}
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-gradient-to-br from-lavender/20 via-white/30 to-babyblue/20" />
              )}
            </div>
          </motion.div>

          {/* Typography details */}
          <div className="flex flex-col gap-4">
            <motion.span
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-script text-3xl font-semibold text-lavender-deep sm:text-4xl"
            >
              Happy 1st Birthday In The Making
            </motion.span>
            
            <motion.h1
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-gradient text-5xl font-black tracking-tight sm:text-6xl md:text-7.5xl"
            >
              {HERO_HEADING}
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mx-auto max-w-xl text-lg text-ink-soft sm:text-xl md:text-2xl font-light"
            >
              {HERO_SUBHEADING}
            </motion.p>
          </div>

          {/* Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            onClick={scrollToMemories}
            className="group relative mt-4 overflow-hidden rounded-full bg-gradient-to-r from-lavender to-babyblue px-8 py-4 text-base font-medium text-white shadow-lg shadow-lavender/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-lavender/35 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Memories
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold to-lavender transition-transform duration-500 group-hover:translate-x-0" />
          </motion.button>
        </div>
      </section>

      {/* ================= SECTION 2: LIVE BIRTHDAY COUNTDOWN ================= */}
      <section id="countdown" className="relative px-6 pt-10 pb-16 z-10">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow="Ticking Closer to the Big One"
            title="Countdown to 1st Birthday"
            subtitle="Our sweet little prince will turn one year old soon! Here is the live countdown to his special day."
          />

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes },
              { label: 'Seconds', value: countdown.seconds },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 0.15} className="w-full">
                <div className="glass flex flex-col items-center justify-center rounded-3xl p-6 text-center shadow-lg transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="relative mb-2">
                    <span className="text-4xl font-extrabold text-gradient sm:text-5xl md:text-6xl tracking-tight">
                      {String(card.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft sm:text-sm">
                    {card.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: LITTLE MOMENTS (SCRAPBOOK) ================= */}
      <section className="relative px-6 pt-12 pb-16 bg-cream-deep/30 overflow-hidden z-10">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Scrapbook Memories"
            title="Little Moments"
            subtitle="Polaroid snippets of love, smiles, and tiny adventures. Handcrafted snapshots from daily life."
          />

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {LITTLE_MOMENTS.map((img, i) => {
              // Soft random rotations for the scrapbook effect
              const rotations = [-3, 2, -1.5, 3, -2, 1.8];
              const rotate = rotations[i % rotations.length];
              return (
                <div key={img.id} className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.04, rotate: rotate * 0.4, zIndex: 10 }}
                    style={{ rotate: `${rotate}deg` }}
                    className="w-full max-w-[320px] bg-white p-4 pb-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow duration-300 flex flex-col gap-4 rounded-sm"
                  >
                    {/* Polaroid-style image */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 rounded-sm w-full">
                      <SmartImage
                        image={img}
                        mode="cover"
                        ratio="1 / 1"
                        priority={true}
                        rounded="rounded-sm"
                        className="w-full h-full"
                      />
                      <div className="absolute inset-0 shadow-inner pointer-events-none" />
                    </div>
                    {/* Polaroid handwritten caption */}
                    <div className="text-center font-script text-2xl text-ink-soft pt-2">
                      {img.caption}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: MEMORY GALLERY ================= */}
      <section className="relative px-6 py-16 z-10">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Pinterest Grid"
            title="The Memory Gallery"
            subtitle="Click on any photo to open it in full view. Images are preserved in their true aspect ratio so that facial features are never cropped."
          />

          <PhotoProvider>
            <div className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance] box-border">
              {GALLERY_IMAGES.map((img) => (
                <div key={img.id} className="break-inside-avoid mb-6 box-border">
                  <PhotoView src={img.url}>
                    <div className="group relative overflow-hidden rounded-3xl shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
                      {/* Using mode="natural" ensures no cropping of face, eyes, and expressions */}
                      <SmartImage
                        image={img}
                        mode="natural"
                        className="w-full h-auto"
                        imgClassName="group-hover:scale-104"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="text-sm font-medium text-white">
                          Photo #{img.id}
                        </span>
                        <div className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </PhotoView>
                </div>
              ))}
            </div>
          </PhotoProvider>
        </div>
      </section>

      {/* ================= SECTION 4: FEATURED MEMORIES ================= */}
      <section className="relative px-6 py-16 z-10">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow="Tender Stories"
            title="Featured Memories"
            subtitle="A cinematic journey showcasing our most cherished moments through beautiful baby portraits."
          />

          <div className="mt-20 flex flex-col gap-24">
            {FEATURED_IMAGES.map((img, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={img.id}
                  className={`flex flex-col items-center gap-10 md:flex-row md:gap-16 ${
                    isEven ? '' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Image Card Container */}
                  <div className="w-full md:w-1/2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 hover:shadow-2xl"
                    >
                      <SmartImage
                        image={img}
                        mode="cover"
                        ratio="4 / 5"
                        priority={true}
                        className="w-full"
                        imgClassName="group-hover:scale-105"
                      />
                      {/* Decorative soft overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </motion.div>
                  </div>

                  {/* Typography Content */}
                  <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <h3 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                      {img.caption}
                    </h3>
                    <p className="text-base text-ink-soft leading-relaxed">
                      Every single day brings something wonderful to treasure. Watching you smile, play, and look at the world with curious eyes fills our hearts with a love that grows larger each moment.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-[2px] w-12 bg-lavender" />
                      <span className="text-xs uppercase tracking-widest font-semibold text-lavender-deep">
                        Precious Chapter
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: PHOTO HIGHLIGHTS ================= */}
      <section className="relative px-6 py-16 bg-cream-deep/20 z-10 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Cinematic Banners"
            title="Photo Highlights"
            subtitle="Wide cinematic views captures that portray the simple beauty of our little one's quiet, magical hours."
          />

          <div className="mt-16 flex flex-col gap-10">
            {PHOTO_HIGHLIGHTS.map((img, i) => (
              <Reveal key={img.id} delay={i * 0.15} y={40}>
                <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700">
                  {/* Cinematic banner frame */}
                  <div className="relative aspect-[16/7] w-full overflow-hidden sm:aspect-[16/6] md:aspect-[21/8]">
                    <img
                      src={img.url}
                      alt={img.caption}
                      loading="lazy"
                      style={{ objectPosition: img.objectPosition }}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-103"
                    />
                    {/* Shadow overlay to read text beautifully */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    
                    {/* Bottom-left overlay info */}
                    <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white flex flex-col gap-1 sm:gap-2">
                      <span className="font-script text-2xl text-gold sm:text-3xl">
                        Happy Moments
                      </span>
                      <h4 className="text-xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                        {img.caption}
                      </h4>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: MAGICAL BALLOON POPPING GAME ================= */}
      <section className="relative px-6 py-16 bg-cream-deep/30 z-10 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Playful Blessings"
            title="Magical Balloon Pop"
            subtitle="Click or tap on the floating colorful balloons to pop them! Each popped balloon will play a cute sound and reveal a sweet blessing or a surprise baby photo."
          />

          {/* Balloon Game Play Area */}
          <div className="relative mt-12 h-[550px] w-full rounded-4xl bg-gradient-to-b from-[#e0f2fe]/40 via-[#f3e8ff]/20 to-[#fafaf9]/70 border border-lavender/10 shadow-lg overflow-hidden flex items-center justify-center">
            {/* Background clouds */}
            <div className="absolute top-10 left-[10%] opacity-20 w-32 h-12 bg-white rounded-full blur-md" />
            <div className="absolute top-20 right-[15%] opacity-25 w-44 h-16 bg-white rounded-full blur-md" />
            <div className="absolute bottom-28 left-[20%] opacity-15 w-24 h-8 bg-white rounded-full blur-md" />

            {/* Score & Counter Banner */}
            <div className="absolute top-4 left-4 z-20 glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-lavender-deep shadow-sm">
              <span className="text-lg">🎈</span>
              <span>Balloons Popped: {poppedCount}</span>
            </div>

            {/* Hint overlay if none popped yet */}
            {poppedCount === 0 && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-lavender/10 border border-lavender/20 text-[11px] font-semibold text-lavender-deep px-3 py-1.5 rounded-full animate-bounce">
                Click a floating balloon to pop it! 👇
              </div>
            )}

            {/* Floating balloons loop */}
            {balloons.map((balloon) => {
              if (balloon.popped) return null;
              
              return (
                <motion.div
                  key={balloon.id}
                  initial={{ y: '580px', x: `${balloon.x}%` }}
                  animate={{
                    y: '-120px',
                    x: [
                      `${balloon.x}%`,
                      `${balloon.x + balloon.sway}%`,
                      `${balloon.x - balloon.sway}%`,
                      `${balloon.x}%`
                    ]
                  }}
                  transition={{
                    y: { duration: balloon.speed, ease: 'linear' },
                    x: { duration: balloon.speed / 2.5, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  onAnimationComplete={() => handleBalloonOffScreen(balloon.id)}
                  onClick={() => handlePop(balloon.id)}
                  className="absolute cursor-pointer select-none origin-bottom z-10"
                  style={{ width: `${balloon.size}px` }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Balloon Body */}
                    <div
                      className={`rounded-full bg-gradient-to-tr ${balloon.style.bg} ${balloon.style.border} shadow-lg transition-transform duration-200 hover:scale-105 active:scale-90`}
                      style={{
                        width: `${balloon.size}px`,
                        height: `${balloon.size * 1.25}px`,
                        borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                      }}
                    />
                    {/* Glossy reflection bubble */}
                    <div className="absolute top-[8%] left-[15%] w-[22%] h-[28%] bg-white/35 rounded-full rotate-[-25deg] pointer-events-none" />
                    
                    {/* Knot */}
                    <div
                      className="-mt-1 border-b-[6px] border-b-current border-x-[5px] border-x-transparent"
                      style={{ color: balloon.style.knot.replace('text-', '') }}
                    />
                    {/* String */}
                    <div className="w-[1.2px] h-14 bg-slate-400/30" />
                  </div>
                </motion.div>
              );
            })}

            {/* Inside Game popup surprise modal */}
            <AnimatePresence>
              {activeSurprise && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveSurprise(null)}
                  className="absolute inset-0 bg-slate-950/20 backdrop-blur-md z-30 flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl p-6 max-w-sm w-[90%] shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-5 relative"
                  >
                    {/* Soft background particles glow */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-lavender/10 to-gold/10 opacity-70 blur-md pointer-events-none" />

                    <div className="text-4xl animate-bounce">🎉</div>
                    
                    {activeSurprise.type === 'text' ? (
                      <div className="flex flex-col gap-2 z-10">
                        <span className="text-xs uppercase font-extrabold tracking-widest text-lavender-deep">Blessing Unlocked</span>
                        <p className="text-base font-bold text-ink leading-relaxed">
                          "{activeSurprise.text}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3.5 w-full z-10">
                        <span className="text-xs uppercase font-extrabold tracking-widest text-lavender-deep">Surprise Photo Unlocked</span>
                        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100">
                          <SmartImage
                            image={activeSurprise.image}
                            mode="cover"
                            ratio="1 / 1"
                            className="w-full h-full"
                          />
                        </div>
                        <p className="text-sm font-bold text-ink-soft italic">
                          {activeSurprise.text}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setActiveSurprise(null)}
                      className="w-full rounded-2xl bg-gradient-to-r from-lavender to-babyblue py-3 text-sm font-bold text-white shadow-md shadow-lavender/25 hover:shadow-lg transition-all active:scale-98 cursor-pointer z-10"
                    >
                      Keep Popping! 🎈
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ================= SECTION 8: MEMORY WALL ================= */}
      <section className="relative px-6 py-16 z-10">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow="Interactive Wall"
            title="The Memory Wall"
            subtitle="Leave a lovely little message or memory of your own. Your thoughts will drift gently on the wall."
          />

          <div className="mt-16 flex flex-col gap-12 lg:flex-row">
            {/* Form */}
            <div className="w-full lg:w-2/5">
              <div className="glass rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-gradient flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Leave a Message
                </h3>

                <form onSubmit={handleSubmitMessage} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="msgName" className="text-sm font-semibold text-ink-soft">
                      Your Name
                    </label>
                    <input
                      id="msgName"
                      type="text"
                      required
                      value={msgName}
                      onChange={(e) => setMsgName(e.target.value)}
                      placeholder="Your Name"
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-lavender focus:bg-white shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="msgText" className="text-sm font-semibold text-ink-soft">
                      Your Message
                    </label>
                    <textarea
                      id="msgText"
                      required
                      rows={4}
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Write your message here..."
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-lavender focus:bg-white shadow-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingMsg}
                    className="mt-2 rounded-2xl bg-gradient-to-r from-lavender to-babyblue py-3.5 text-sm font-bold text-white shadow-md shadow-lavender/10 hover:shadow-lg hover:shadow-lavender/25 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingMsg ? 'Sending...' : 'Post Message'}
                  </button>
                </form>

                {formFeedback && formFeedback.type === 'msg' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700 border border-green-100"
                  >
                    {formFeedback.text}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Sticky/Floating Note Wall Grid */}
            <div className="w-full lg:w-3/5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-h-[520px] overflow-y-auto pr-2 scrollbar-hidden">
                <AnimatePresence initial={false}>
                  {Array.isArray(messages) && messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      whileHover={{ scale: 1.03, rotate: 1 }}
                      className="glass rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between border-l-4 border-l-lavender gap-4"
                    >
                      <p className="text-sm italic text-ink-soft leading-relaxed">
                        "{m.message}"
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gradient">
                            — {m.name}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            {new Date(m.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9: DIGITAL GUEST BOOK ================= */}
      <section className="relative px-6 py-16 bg-cream-deep/20 z-10">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow="Love Letters"
            title="Digital Guest Book"
            subtitle="Write your birthday wishes here for our little prince to read when he grows up."
          />

          <div className="mt-16 flex flex-col gap-12 lg:flex-row-reverse">
            {/* Form */}
            <div className="w-full lg:w-2/5">
              <div className="glass rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-gradient flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send a Wish
                </h3>

                <form onSubmit={handleSubmitWish} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="wishName" className="text-sm font-semibold text-ink-soft">
                      Your Name
                    </label>
                    <input
                      id="wishName"
                      type="text"
                      required
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      placeholder="Your Name"
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-lavender focus:bg-white shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="wishText" className="text-sm font-semibold text-ink-soft">
                      Your Wish
                    </label>
                    <textarea
                      id="wishText"
                      required
                      rows={4}
                      value={wishText}
                      onChange={(e) => setWishText(e.target.value)}
                      placeholder="Write your wish here..."
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-lavender focus:bg-white shadow-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingWish}
                    className="mt-2 rounded-2xl bg-gradient-to-r from-lavender to-babyblue py-3.5 text-sm font-bold text-white shadow-md shadow-lavender/10 hover:shadow-lg hover:shadow-lavender/25 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingWish ? 'Sending Star...' : 'Send Magical Wish'}
                  </button>
                </form>

                {formFeedback && formFeedback.type === 'wish' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700 border border-green-100"
                  >
                    {formFeedback.text}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Wishes Scrollable List */}
            <div className="w-full lg:w-3/5">
              <div className="flex flex-col gap-6 max-h-[520px] overflow-y-auto pr-2 scrollbar-hidden">
                <AnimatePresence initial={false}>
                  {Array.isArray(wishes) && wishes.map((w) => (
                    <motion.div
                      key={w.id}
                      initial={{ scale: 0.9, opacity: 0, x: -30 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      exit={{ scale: 0.9, opacity: 0, x: 30 }}
                      className="glass rounded-3xl p-6 shadow-sm border border-white/60 flex items-start gap-4"
                    >
                      {/* Heart icon */}
                      <div className="rounded-2xl bg-gold/10 p-3.5 text-gold shrink-0">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-base font-bold text-ink">{w.name}</h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(w.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteWish(w.id)}
                            className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete wish"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-ink-soft leading-relaxed">
                          {w.wish}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 10: CELEBRATE TOGETHER ================= */}
      <section className="relative px-6 py-20 bg-gradient-to-b from-cream via-lavender/5 to-cream z-10 overflow-hidden text-center border-t border-cream-deep/40">
        {/* Confetti / floating shapes when music is playing */}
        {isMusicPlaying && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: '580px', 
                  x: `${10 + Math.random() * 80}%`,
                  scale: 0.5 + Math.random() * 0.7,
                  rotate: 0 
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  y: '-100px', 
                  x: `${10 + Math.random() * 80}%`,
                  rotate: 360 
                }}
                transition={{ 
                  duration: 4.5 + Math.random() * 4, 
                  repeat: Infinity, 
                  delay: i * 0.25 
                }}
                className="absolute text-2xl select-none"
              >
                {['🎉', '🎈', '🍰', '🎵', '✨', '🎁', '🎀'][i % 7]}
              </motion.div>
            ))}
          </div>
        )}

        <div className="relative mx-auto max-w-3xl z-10 flex flex-col items-center gap-8">
          <SectionTitle
            eyebrow="Time for Joy"
            title="Let's Celebrate Together!"
            subtitle="Click the music button below to start the celebration with a soft, sweet music-box tune of Happy Birthday!"
          />

          {/* Interactive Music Box Player */}
          <div className="flex flex-col items-center gap-6">
            <motion.button
              onClick={handleMusicToggle}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className={`relative h-36 w-36 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-500 ${
                isMusicPlaying
                  ? 'bg-gradient-to-r from-lavender to-babyblue ring-8 ring-lavender/20'
                  : 'bg-white border-4 border-lavender/30 ring-4 ring-slate-100 hover:border-lavender'
              }`}
            >
              {/* Outer rotating vinyl record pattern */}
              <motion.div
                animate={{ rotate: isMusicPlaying ? 360 : 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 border-2 border-dashed border-lavender-deep/40 rounded-full flex items-center justify-center"
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-3 border border-lavender-deep/10 rounded-full" />
                <div className="absolute inset-6 border border-lavender-deep/20 rounded-full" />
                <div className="absolute inset-9 border border-lavender-deep/10 rounded-full" />
              </motion.div>

              {/* Pulsing play icon / equalizing bars */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                {isMusicPlaying ? (
                  <>
                    {/* Equalizer animation */}
                    <div className="flex items-center gap-1.5 h-6 mb-1">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <motion.div
                          key={bar}
                          animate={{
                            height: [8, 26, 8],
                          }}
                          transition={{
                            duration: 0.4 + bar * 0.1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-1 bg-white rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white animate-pulse">Playing</span>
                  </>
                ) : (
                  <>
                    {/* Play Heart Icon */}
                    <svg
                      className="h-10 w-10 text-lavender-deep"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-lavender-deep">Play Tune</span>
                  </>
                )}
              </div>

              {/* Little music note bubbles drifting when playing */}
              {isMusicPlaying && (
                <>
                  <motion.span
                    initial={{ opacity: 0, y: 10, x: -10 }}
                    animate={{ opacity: [0, 1, 0], y: -50, x: -30, scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }}
                    className="absolute z-20 text-lg text-lavender-deep select-none"
                  >
                    🎵
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10, x: 10 }}
                    animate={{ opacity: [0, 1, 0], y: -60, x: 30, scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}
                    className="absolute z-20 text-lg text-babyblue select-none"
                  >
                    🎶
                  </motion.span>
                </>
              )}
            </motion.button>

            {/* Sub-tagline hint */}
            <p className="text-xs uppercase font-extrabold tracking-widest text-ink-soft/60">
              {isMusicPlaying ? "Enjoy the melody box 🧸" : "Tap to activate magic 🪄"}
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-cream-deep/40 bg-cream py-8 px-6 text-center">
        <p className="font-script text-2xl text-lavender-deep sm:text-3xl">
          Thank you for visiting and sharing your love.
        </p>
      </footer>
    </div>
  );
}
