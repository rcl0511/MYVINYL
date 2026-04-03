"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 문의 제출 구현
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
            <h1 className="text-2xl font-bold text-white">고객지원센터</h1>
            <p className="text-gray-400 text-sm mt-2">
              문의사항이 있으시면 아래 폼을 작성해 주세요
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">문의가 접수되었습니다</h2>
                <p className="text-gray-400 text-sm">
                  빠른 시일 내에 답변 드리겠습니다.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="문의 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    문의 내용
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="문의 내용을 상세히 입력하세요"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  문의하기
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div className="px-8 py-6 border-t border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">자주 묻는 질문</h2>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium text-white text-sm mb-2">
                  로그인이 안되요
                </h3>
                <p className="text-gray-400 text-xs">
                  소셜 로그인 제공자의 서비스가 일시적으로 중단되었을 수 있습니다.
                  잠시 후 다시 시도해 주세요.
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium text-white text-sm mb-2">
                  오디오가 재생되지 않아요
                </h3>
                <p className="text-gray-400 text-xs">
                  YouTube API 연결에 문제가 있을 수 있습니다.
                  인터넷 연결을 확인하고 다시 시도해 주세요.
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium text-white text-sm mb-2">
                  계정을 삭제하고 싶어요
                </h3>
                <p className="text-gray-400 text-xs">
                  프로필 페이지에서 계정 삭제를 요청할 수 있습니다.
                  삭제 후 30일 동안 복구가 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}