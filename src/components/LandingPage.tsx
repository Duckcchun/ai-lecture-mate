import { Mic, Brain, Sparkles, Clock, Search, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

type LandingPageProps = {
  onStartRecording: () => void;
  onViewLectures: () => void;
  lectureCount: number;
};

export function LandingPage({ onStartRecording, onViewLectures, lectureCount }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg">AI Lecture Mate</h1>
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
      <section className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          AI 학습 파트너
        </Badge>
        
        <h2 className="text-3xl mb-3">
          더 이상 중요한 내용을<br />놓치지 마세요
        </h2>
        
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          긴 강의를 다시 듣지 않아도 괜찮습니다. AI가 핵심 구간을 자동으로 찾아 요약해드립니다.
        </p>

        <div className="flex gap-2 justify-center">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onStartRecording}
          >
            <Mic className="w-4 h-4 mr-2" />
            강의 녹음 시작하기
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm mb-1">실시간 강조 구간 탐지</h3>
                <p className="text-xs text-gray-600">
                  AI가 실시간으로 중요 구간 자동 포착
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm mb-1">자동 요약 및 하이라이트</h3>
                <p className="text-xs text-gray-600">
                  핵심만 간추려 요약본 생성
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm mb-1">스마트 복습 노트</h3>
                <p className="text-xs text-gray-600">
                  시간순 정리로 빠른 복습
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center flex-shrink-0">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm mb-1">키워드 검색</h3>
                <p className="text-xs text-gray-600">
                  원하는 구간으로 바로 이동
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg mb-3">이런 경험 없으신가요?</h3>
            <ul className="space-y-2">
              <li className="flex gap-2 text-sm">
                <span className="text-red-600">✗</span>
                <p className="text-gray-700">긴 강의를 다시 들으며 시간 낭비</p>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-red-600">✗</span>
                <p className="text-gray-700">필기에 집중하느라 강의 놓침</p>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-red-600">✗</span>
                <p className="text-gray-700">어디가 중요한지 몰라 전체 복습</p>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-3">AI Lecture Mate와 함께라면</h3>
            <ul className="space-y-2">
              <li className="flex gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <p className="text-gray-700">AI가 중요 구간을 자동으로 탐지</p>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <p className="text-gray-700">필기 부담 없이 강의에 집중</p>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <p className="text-gray-700">핵심 요약으로 빠른 복습</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <Card className="p-6 bg-blue-600 text-white">
          <h3 className="text-xl mb-2">지금 바로 시작하세요</h3>
          <p className="text-sm mb-4 opacity-90">
            학습은 더 스마트해지고, 당신의 시간은 더 가치 있어집니다.
          </p>
          <Button 
            variant="secondary"
            onClick={onStartRecording}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Mic className="w-4 h-4 mr-2" />
            첫 강의 녹음하기
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-600">
          <p>AI Lecture Mate - 당신만의 스마트 학습 파트너</p>
        </div>
      </footer>
    </div>
  );
}
