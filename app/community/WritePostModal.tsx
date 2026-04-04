"use client";

import { useState } from "react";

const TAGS = ["LP 추천", "장비 리뷰", "컬렉션 자랑", "음악 이야기", "뉴비 질문"];

interface Props {
  onClose: () => void;
  onSubmit: (post: { title: string; content: string; tag: string }) => Promise<void>;
}

export default function WritePostModal({ onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("음악 이야기");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ title, content, tag });
      onClose();
    } catch {
      setError("글 작성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-lp-border">
          <h2 className="text-base font-bold text-lp-primary">글쓰기</h2>
          <button
            onClick={onClose}
            className="text-lp-tertiary hover:text-lp-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* 태그 선택 */}
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tag === t
                    ? "bg-lp-accent text-white"
                    : "bg-lp-chip text-lp-secondary hover:bg-lp-border"
                }`}
              >
                # {t}
              </button>
            ))}
          </div>

          {/* 제목 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl border border-lp-border text-sm text-lp-primary placeholder:text-lp-tertiary focus:outline-none focus:border-lp-accent transition-colors"
          />

          {/* 내용 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={6}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl border border-lp-border text-sm text-lp-primary placeholder:text-lp-tertiary focus:outline-none focus:border-lp-accent transition-colors resize-none"
          />

          {error && <p className="text-xs text-lp-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-lp-secondary hover:bg-lp-chip transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-lp-accent text-white hover:bg-lp-accent-btn disabled:opacity-50 transition-colors"
            >
              {loading ? "등록 중..." : "게시하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
