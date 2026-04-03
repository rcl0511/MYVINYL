"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthModalProps {
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ onClose, message }: AuthModalProps) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(91,33,182,0.08)" }}
          >
            <svg className="w-6 h-6" style={{ color: "#5B21B6" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">로그인이 필요해요</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {message ?? "이 기능은 로그인한 사용자만\n이용할 수 있어요."}
          </p>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <Link
              href={`/auth?callbackUrl=${encodeURIComponent(pathname)}`}
              className="flex-1 py-3 text-white rounded-xl text-sm font-semibold transition-colors text-center"
              style={{ background: "#7C3AED" }}
              onClick={onClose}
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
