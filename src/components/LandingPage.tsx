import { Mic, Brain, Sparkles, Clock, Search, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

type LandingPageProps = {
  onStartRecording: () => void;
  onViewLectures: () => void;
  lectureCount: number;
};

export function LandingPage({ onStartRecording, onViewLectures, lectureCount }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>AI Lecture Mate</h1>
              <p className="text-sm text-gray-600">AI 학습 파트너</p>
            </div>
          </div>
          {lectureCount > 0 && (
            <Button variant="outline" onClick={onViewLectures}>
              <BookOpen className="w-4 h-4 mr-2" />
              내 강의 ({lectureCount})
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">AI가 실시간으로 핵심을 찾아주는 스마트 학습</span>
        </div>
        
        <h2 className="text-5xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          더 이상 중요한 내용을<br />놓치지 마세요
        </h2>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          긴 강의를 다시 듣지 않아도 괜찮습니다.<br />
          AI가 핵심 구간을 자동으로 찾아 요약해드립니다.
        </p>

        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={onStartRecording}
          >
            <Mic className="w-5 h-5 mr-2" />
            강의 녹음 시작하기
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="mb-2">실시간 강조 구간 탐지</h3>
            <p className="text-sm text-gray-600">
              목소리 톤, 키워드, 반복을 AI가 실시간으로 분석하여 중요 구간을 자동 포착
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="mb-2">자동 요약 및 하이라이트</h3>
            <p className="text-sm text-gray-600">
              강조 구간을 즉시 텍스트로 변환하고 핵심만 간추려 요약본 생성
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="mb-2">스마트 복습 노트</h3>
            <p className="text-sm text-gray-600">
              핵심 요약 카드가 시간순으로 정리되어 빠른 복습 가능
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="mb-2">키워드 검색</h3>
            <p className="text-sm text-gray-600">
              원하는 키워드로 해당 내용이 언급된 구간으로 바로 이동
            </p>
          </Card>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl mb-6">이런 경험 없으신가요?</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-600">✗</span>
                </div>
                <p className="text-gray-700">긴 강의를 다시 들으며 중요한 부분을 찾느라 시간 낭비</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-600">✗</span>
                </div>
                <p className="text-gray-700">필기에 집중하느라 정작 강의 내용은 제대로 못 들음</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-600">✗</span>
                </div>
                <p className="text-gray-700">복습할 때 어디가 중요한지 몰라 전체를 다시 봐야 함</p>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-3xl mb-6">AI Lecture Mate와 함께라면</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-gray-700">AI가 자동으로 중요 구간을 찾아 시간 절약</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-gray-700">필기 부담 없이 강의에만 집중할 수 있음</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-gray-700">핵심 요약 카드로 10분 안에 빠른 복습 완료</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Card className="p-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h3 className="text-3xl mb-4">지금 바로 시작하세요</h3>
          <p className="text-xl mb-8 opacity-90">
            학습은 더 스마트해지고, 당신의 시간은 더 가치 있어집니다.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={onStartRecording}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <Mic className="w-5 h-5 mr-2" />
            첫 강의 녹음하기
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-600">
          <p>AI Lecture Mate - 당신만의 스마트 학습 파트너</p>
          <p className="mt-2">Powered by Whisper AI, GPT, and Advanced NLP</p>
        </div>
      </footer>
    </div>
  );
}
