export type Orientation = 'portrait' | 'landscape' | 'square';

export interface BabyImage {
  id: number;
  url: string;
  w: number;
  h: number;
  ratio: number; // w / h
  orientation: Orientation;
  /** CSS object-position used only when a fixed aspect-ratio frame is unavoidable */
  objectPosition: string;
  caption?: string;
}

export interface Message {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export interface Wish {
  id: number;
  name: string;
  wish: string;
  created_at: string;
}
