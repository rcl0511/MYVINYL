"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2e] to-[#0f0f23] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          <span className="text-sm">뒤로가기</span>
        </Link>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white">이용약관 및 개인정보처리방침</h1>
            <p className="text-gray-400 text-sm mt-2">최종 업데이트: 2026년 4월 3일</p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* 이용약관 */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. 이용약관</h2>

              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <div>
                  <h3 className="font-medium text-white mb-2">1.1 서비스 이용</h3>
                  <p>
                    LP Player 서비스는 가상 턴테이블을 통해 LP 음악을 감상할 수 있는 플랫폼입니다.
                    본 서비스를 이용함으로써 사용자는 본 약관에 동의하는 것으로 간주됩니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">1.2 계정 관리</h3>
                  <p>
                    사용자는 본인의 계정 정보를 안전하게 관리할 책임이 있습니다.
                    계정 공유, 양도, 판매는 금지되며, 이로 인한 손해에 대해 책임을 지지 않습니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">1.3 콘텐츠 이용</h3>
                  <p>
                    서비스 내의 모든 콘텐츠는 저작권법 및 관련 법령의 보호를 받습니다.
                    사용자는 개인적인 목적으로만 콘텐츠를 이용할 수 있으며, 상업적 목적으로 사용할 수 없습니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">1.4 서비스 중단</h3>
                  <p>
                    당사는 시스템 점검, 장애, 기술적 문제 등으로 인해 서비스를 일시 중단할 수 있습니다.
                    이로 인한 손해에 대해 책임을 지지 않습니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 개인정보처리방침 */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. 개인정보처리방침</h2>

              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <div>
                  <h3 className="font-medium text-white mb-2">2.1 수집하는 개인정보</h3>
                  <p>
                    당사는 다음과 같은 개인정보를 수집합니다:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>소셜 로그인 제공자로부터 제공받는 기본 정보 (이름, 이메일, 프로필 사진)</li>
                    <li>서비스 이용 기록 및 활동 데이터</li>
                    <li>기기 정보 및 접속 로그</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">2.2 개인정보의 이용</h3>
                  <p>
                    수집된 개인정보는 다음과 같은 목적으로 사용됩니다:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>서비스 제공 및 개선</li>
                    <li>사용자 인증 및 보안</li>
                    <li>고객 지원 및 문의 응대</li>
                    <li>서비스 통계 및 분석</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">2.3 개인정보의 보관 및 파기</h3>
                  <p>
                    개인정보는 서비스 이용 기간 동안 보관되며, 계정 삭제 시 즉시 파기됩니다.
                    법령에 따라 보관이 필요한 경우에는 해당 기간 동안 보관합니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">2.4 개인정보의 제3자 제공</h3>
                  <p>
                    당사는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
                    다만, 법령에 따라 요구받는 경우에는 예외로 합니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-2">2.5 개인정보의 보안</h3>
                  <p>
                    당사는 개인정보의 안전한 보관을 위해 기술적, 관리적 보안 조치를 취하고 있습니다.
                    하지만 인터넷의 특성상 완전한 보안을 보장할 수 없습니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 연락처 */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. 문의</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                개인정보 처리 및 이용약관에 관한 문의는{" "}
                <Link href="/support" className="text-purple-400 hover:text-purple-300 underline">
                  고객지원센터
                </Link>
                {" "}를 통해 연락해 주시기 바랍니다.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs">
                © 2026 LP Player. All rights reserved.
              </p>
              <Link
                href="/auth"
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                동의하고 계속하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}