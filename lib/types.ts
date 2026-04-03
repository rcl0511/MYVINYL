export interface Track {
  id: string;
  number: number;
  title: string;
  duration: string; // "m:ss"
  side: "A" | "B";
  youtubeId?: string;
  lyrics?: LyricLine[]; // 가사 데이터
}

export interface LyricLine {
  time: number; // 초 단위
  text: string;
}

export type VinylStyle = "standard" | "color" | "splatter" | "marble";

export interface LP {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  label: string;
  coverUrl: string;  // placeholder color or URL
  coverColor: string; // CSS color for placeholder
  vinylStyle?: VinylStyle;
  tracks: Track[];
  description?: string;
  externalPurchaseUrl?: string;
  playCount?: number;
  youtubeId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  coverColor: string;
  trackCount: number;
  totalDuration: string;
  tracks: PlaylistTrack[];
}

export interface PlaylistTrack extends Track {
  lpId: string;
  lpTitle: string;
  artist: string;
}

export interface User {
  id: string;
  nickname: string;
  bio: string;
  avatarColor: string;
  followerCount: number;
  followingCount: number;
  collectionCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  nickname: string;
  avatarColor: string;
  content: string;
  timeAgo: string;
  likeCount: number;
}

export interface Post {
  id: string;
  userId: string;
  nickname: string;
  avatarColor: string;
  title: string;
  preview: string;
  timeAgo: string;
  likeCount: number;
  commentCount: number;
  tag: string;
}

export type PlayerState = "playing" | "paused" | "stopped";
export type LPSide = "A" | "B";
