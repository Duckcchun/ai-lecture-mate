import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Sparkles, Clock, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { HighlightCard } from './HighlightCard';
import type { Lecture, Highlight, TranscriptSegment } from '../App';

type LectureRecorderProps = {
  onSave: (lecture: Lecture) => void;
  onCancel: () => void;
};

// Mock data for simulation
const MOCK_PHRASES = [
  { text: "오늘은 데이터베이스의 정규화에 대해 배워보겠습니다.", highlight: false },
  { text: "이건 정말 중요한 개념입니다. 꼭 기억하세요!", highlight: true, keywords: ["정규화", "데이터베이스"], summary: "데이터베이스 정규화는 중복을 제거하고 데이터 무결성을 보장하는 핵심 개념" },
  { text: "정규화는 데이터 중복을 최소화하는 과정입니다.", highlight: false },
  { text: "첫 번째 정규형, 1NF는 모든 속성이 원자값을 가져야 합니다.", highlight: false },
  { text: "이 부분은 시험에 나올 가능성이 높습니다. 특히 1NF와 2NF의 차이를 명확히 알아야 합니다.", highlight: true, keywords: ["1NF", "2NF", "정규형"], summary: "1NF는 원자값, 2NF는 부분 함수 종속 제거가 핵심 차이점" },
  { text: "두 번째 정규형은 부분 함수 종속성을 제거합니다.", highlight: false },
  { text: "외래키는 다른 테이블의 기본키를 참조하는 속성입니다.", highlight: false },
  { text: "여기서 핵심은 참조 무결성입니다. 반드시 기억하세요!", highlight: true, keywords: ["외래키", "참조 무결성"], summary: "외래키는 테이블 간 관계를 맺고 참조 무결성을 보장하는 핵심 메커니즘" },
  { text: "트랜잭션의 ACID 속성에 대해 알아봅시다.", highlight: false },
  { text: "이것도 정말 중요합니다. ACID는 원자성, 일관성, 격리성, 지속성을 의미합니다.", highlight: true, keywords: ["ACID", "트랜잭션"], summary: "ACID는 데이터베이스 트랜잭션의 신뢰성을 보장하는 4가지 핵심 속성" },
];

export function LectureRecorder({ onSave, onCancel }: LectureRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [lectureTitle, setLectureTitle] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const phraseIndexRef = useRef(0);

  // Auto-scroll to latest transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Simulate real-time transcription
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isRecording && !isPaused && phraseIndexRef.current < MOCK_PHRASES.length) {
      timeout = setTimeout(() => {
        const phrase = MOCK_PHRASES[phraseIndexRef.current];
        
        // Show typing effect
        setCurrentText(phrase.text);
        setAiProcessing(phrase.highlight);
        
        // After text is shown, add to transcript
        setTimeout(() => {
          const segment: TranscriptSegment = {
            id: `seg-${Date.now()}`,
            timestamp: duration,
            text: phrase.text,
            isHighlight: phrase.highlight || false,
          };
          
          setTranscript(prev => [...prev, segment]);
          setCurrentText('');
          
          // If it's a highlight, create highlight card
          if (phrase.highlight) {
            const highlight: Highlight = {
              id: `hl-${Date.now()}`,
              timestamp: duration,
              text: phrase.text,
              summary: phrase.summary || phrase.text,
              keywords: phrase.keywords || [],
              importance: 'high',
            };
            setHighlights(prev => [...prev, highlight]);
            
            setTimeout(() => setAiProcessing(false), 1000);
          }
          
          phraseIndexRef.current++;
        }, 1500);
      }, 3000);
    }
    
    return () => clearTimeout(timeout);
  }, [isRecording, isPaused, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStopRecording = () => {
    setShowSaveDialog(true);
  };

  const handleSave = () => {
    const lecture: Lecture = {
      id: `lec-${Date.now()}`,
      title: lectureTitle || `강의 ${new Date().toLocaleDateString()}`,
      date: new Date(),
      duration,
      highlights,
      transcript,
    };
    onSave(lecture);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl mb-1">실시간 강의 녹음</h2>
            <p className="text-gray-600">AI가 핵심 내용을 자동으로 찾고 있습니다</p>
          </div>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            취소
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Recording Controls & Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recording Control */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isRecording && !isPaused ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                  }`}>
                    <Mic className={`w-8 h-8 ${
                      isRecording && !isPaused ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-2xl">{formatTime(duration)}</span>
                    </div>
                    <Badge variant={isRecording && !isPaused ? 'destructive' : 'secondary'}>
                      {!isRecording ? '대기 중' : isPaused ? '일시정지' : '녹음 중'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button size="lg" onClick={handleStartRecording} className="bg-red-600 hover:bg-red-700">
                      <Mic className="w-5 h-5 mr-2" />
                      녹음 시작
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" variant="outline" onClick={handlePauseResume}>
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      </Button>
                      <Button size="lg" variant="destructive" onClick={handleStopRecording}>
                        <Square className="w-5 h-5 mr-2" />
                        녹음 종료
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {aiProcessing && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg mb-4">
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span className="text-sm text-purple-700">AI가 핵심 구간을 분석 중입니다...</span>
                  <Progress value={66} className="ml-auto w-24" />
                </div>
              )}

              {/* Live Transcript */}
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">실시간 자막</span>
                </div>
                
                <div className="space-y-3">
                  {transcript.map((segment) => (
                    <div
                      key={segment.id}
                      className={`p-3 rounded-lg ${
                        segment.isHighlight
                          ? 'bg-yellow-100 border-l-4 border-yellow-500'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 mt-1">{formatTime(segment.timestamp)}</span>
                        <p className={segment.isHighlight ? 'text-yellow-900' : 'text-gray-700'}>
                          {segment.text}
                        </p>
                        {segment.isHighlight && (
                          <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {currentText && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-blue-500 mt-1">{formatTime(duration)}</span>
                        <p className="text-blue-700 animate-pulse">{currentText}</p>
                      </div>
                    </div>
                  )}
                  
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Highlights */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3>핵심 하이라이트</h3>
                <Badge variant="secondary">{highlights.length}</Badge>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {highlights.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">녹음을 시작하면<br />AI가 핵심 내용을 찾아드립니다</p>
                  </div>
                ) : (
                  highlights.map((highlight, index) => (
                    <HighlightCard
                      key={highlight.id}
                      highlight={highlight}
                      index={index + 1}
                      formatTime={formatTime}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>강의 저장</DialogTitle>
            <DialogDescription>
              녹음한 강의의 제목을 입력하고 저장하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">강의 제목</label>
              <Input
                placeholder="예: 데이터베이스 강의 - 정규화"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">녹음 시간</p>
                <p>{formatTime(duration)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">하이라이트</p>
                <p>{highlights.length}개</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
