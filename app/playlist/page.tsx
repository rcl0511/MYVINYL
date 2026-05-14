"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MOCK_LPS } from "@/lib/mock-data";
import Button from "@/components/ui/Button";

interface Playlist {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  track_count: number;
}

interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  lp_id: string;
  position: number;
  added_at: string;
}

const TRACK_INDEX = new Map<string, { title: string; duration: string; artist: string; lpTitle: string; lpId: string }>();
for (const lp of MOCK_LPS) {
  for (const t of lp.tracks) {
    TRACK_INDEX.set(t.id, { title: t.title, duration: t.duration, artist: lp.artist, lpTitle: lp.title, lpId: lp.id });
  }
}

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/playlists")
      .then((r) => r.ok ? r.json() : [])
      .then((d: Playlist[]) => {
        setPlaylists(Array.isArray(d) ? d : []);
        if (Array.isArray(d) && d.length > 0) setSelectedId(d[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setTracks([]); return; }
    fetch(`/api/playlists/${selectedId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setTracks(d?.tracks ?? []))
      .catch(() => setTracks([]));
  }, [selectedId]);

  async function createPlaylist() {
    if (!newName.trim()) return;
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const pl: Playlist = await res.json();
      setPlaylists((prev) => [{ ...pl, track_count: 0 }, ...prev]);
      setSelectedId(pl.id);
      setNewName("");
      setCreating(false);
    }
  }

  async function deletePlaylist(id: string) {
    if (!confirm("플레이리스트를 삭제할까요?")) return;
    const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) setSelectedId(playlists.find((p) => p.id !== id)?.id ?? null);
    }
  }

  async function removeTrack(track_id: string) {
    if (!selectedId) return;
    const res = await fetch(`/api/playlists/${selectedId}/tracks?track_id=${encodeURIComponent(track_id)}`, { method: "DELETE" });
    if (res.ok) {
      setTracks((prev) => prev.filter((t) => t.track_id !== track_id));
      setPlaylists((prev) => prev.map((p) => p.id === selectedId ? { ...p, track_count: Math.max(0, p.track_count - 1) } : p));
    }
  }

  const selected = playlists.find((p) => p.id === selectedId);
  const totalSec = tracks.reduce((acc, t) => {
    const info = TRACK_INDEX.get(t.track_id);
    if (!info) return acc;
    const [m, s] = info.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const totalMin = Math.round(totalSec / 60);

  return (
    <div className="min-h-[calc(100vh-64px)] flex max-w-[1440px] mx-auto">
      <aside className="hidden md:flex w-72 shrink-0 border-r border-lp-border bg-lp-sidebar px-6 py-8 flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-lp-primary">내 플레이리스트</h2>
        </div>
        {creating ? (
          <div className="mb-4 space-y-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
              placeholder="플레이리스트 이름"
              className="w-full px-3 py-2 text-sm border border-lp-border rounded-lg outline-none focus:border-lp-accent"
            />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={createPlaylist}>만들기</Button>
              <Button variant="outline" size="sm" onClick={() => { setCreating(false); setNewName(""); }}>취소</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="mb-4 w-full" onClick={() => setCreating(true)}>+ 새 플레이리스트</Button>
        )}

        <div className="space-y-1 flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-lp-tertiary text-xs">불러오는 중...</p>
          ) : playlists.length === 0 ? (
            <p className="text-lp-tertiary text-xs">아직 플레이리스트가 없어요.</p>
          ) : playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedId(pl.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${selectedId === pl.id ? "bg-lp-accent-light" : "hover:bg-lp-chip"}`}
            >
              <div className="w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: pl.color }} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${selectedId === pl.id ? "text-lp-accent" : "text-lp-primary"}`}>{pl.name}</p>
                <p className="text-xs text-lp-tertiary">{pl.track_count}곡</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto min-w-0">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full py-24 text-lp-tertiary">
            <p>{playlists.length === 0 ? "왼쪽에서 플레이리스트를 만들어보세요." : "플레이리스트를 선택해주세요."}</p>
          </div>
        ) : (
          <>
            <div className="bg-lp-accent-light px-4 sm:px-8 py-6 sm:py-8 flex items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl shrink-0 shadow-md" style={{ backgroundColor: selected.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-lp-secondary text-xs mb-1">플레이리스트</p>
                <h1 className="text-xl sm:text-3xl font-bold text-lp-primary truncate">{selected.name}</h1>
                <p className="text-lp-secondary text-sm mt-2">{tracks.length}곡 · 약 {totalMin}분</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    전체 재생
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deletePlaylist(selected.id)}>삭제</Button>
                </div>
              </div>
            </div>

            <div className="hidden sm:grid grid-cols-[2rem_1fr_1fr_5rem] gap-4 px-4 sm:px-8 py-3 border-b border-lp-border bg-lp-chip text-lp-secondary text-xs font-semibold">
              <span>#</span><span>제목</span><span>앨범</span><span className="text-right">시간</span>
            </div>

            <div>
              {tracks.length === 0 ? (
                <p className="text-lp-tertiary text-sm py-12 text-center">트랙이 없어요. LP 상세에서 추가해보세요.</p>
              ) : tracks.map((t, idx) => {
                const info = TRACK_INDEX.get(t.track_id);
                if (!info) return null;
                return (
                  <div key={t.track_id} className={`flex sm:grid sm:grid-cols-[2rem_1fr_1fr_5rem] gap-3 sm:gap-4 px-4 sm:px-8 py-3 sm:py-3.5 border-b border-lp-border items-center group hover:bg-lp-bg transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-lp-bg/50"}`}>
                    <span className="text-xs text-lp-tertiary tabular-nums w-6 shrink-0">{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-lp-primary truncate">{info.title}</p>
                      <p className="text-xs text-lp-tertiary truncate">{info.artist}</p>
                    </div>
                    <Link href={`/lp/${info.lpId}`} className="hidden sm:block text-sm text-lp-secondary truncate hover:text-lp-accent hover:underline">{info.lpTitle}</Link>
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <button onClick={() => removeTrack(t.track_id)} className="opacity-0 group-hover:opacity-100 text-lp-tertiary hover:text-lp-danger transition-all" title="제거">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                      <span className="text-xs text-lp-tertiary tabular-nums">{info.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
