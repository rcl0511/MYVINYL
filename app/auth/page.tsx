import Link from "next/link";

const SOCIAL_BTNS = [
  {
    label: "Google로 계속하기",
    bg: "bg-white",
    text: "text-lp-primary",
    border: "border border-lp-border",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    label: "카카오로 계속하기",
    bg: "bg-[#FEE500]",
    text: "text-[#191919]",
    border: "",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
        <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.7 5.07 4.26 6.48L5.2 21l4.17-2.76A11.6 11.6 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
      </svg>
    ),
  },
  {
    label: "네이버로 계속하기",
    bg: "bg-[#03C75A]",
    text: "text-white",
    border: "",
    icon: (
      <span className="text-white font-bold text-sm leading-none">N</span>
    ),
  },
];

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-lp-bg px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-lp-border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-lp-accent-btn mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">LP</span>
          </div>
          <h1 className="text-2xl font-bold text-lp-primary">LP Player</h1>
          <p className="text-lp-secondary text-sm mt-2">
            로그인하고 LP 감상을 시작하세요
          </p>
        </div>

        <div className="mx-10 border-t border-lp-border" />

        {/* Social buttons */}
        <div className="px-10 py-8 space-y-3">
          {SOCIAL_BTNS.map(({ label, bg, text, border, icon }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-opacity hover:opacity-90 ${bg} ${text} ${border}`}
            >
              <span className="w-6 h-6 flex items-center justify-center shrink-0">{icon}</span>
              <span className="flex-1 text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Terms notice */}
        <div className="px-10 pb-8 text-center">
          <p className="text-lp-tertiary text-xs leading-relaxed">
            가입 시{" "}
            <Link href="/terms" className="underline hover:text-lp-accent">이용약관</Link>
            {" "}및{" "}
            <Link href="/terms" className="underline hover:text-lp-accent">개인정보처리방침</Link>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
