import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-full bg-lp-placeholder mx-auto mb-6 flex items-center justify-center opacity-50">
        <svg className="w-12 h-12 text-lp-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-lp-primary mb-2">404</h1>
      <p className="text-lp-secondary mb-6">요청하신 페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-lp-accent-btn text-white font-medium rounded-xl hover:bg-lp-accent transition-colors"
      >
        LP 탐색으로 돌아가기
      </Link>
    </div>
  );
}
