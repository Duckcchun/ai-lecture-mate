import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Sparkles, Clock, Save, X, AlertCircle, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { HighlightCard } from './HighlightCard';
import { toast } from 'sonner@2.0.3';
import type { Lecture, Highlight, TranscriptSegment } from '../App';

type LectureRecorderProps = {
  onSave: (lecture: Lecture) => void;
  onCancel: () => void;
};

// Keywords that indicate important content
const HIGHLIGHT_KEYWORDS = [
  '중요', '핵심', '시험', '꼭', '반드시', '기억', '주목', '포인트',
  '정리', '요약', '결론', '강조', '특히', '주의', '필수', '중점'
];

// Declare SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function LectureRecorder({ onSave, onCancel }: LectureRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [lectureTitle, setLectureTitle] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.');
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError('이 브라우저는 마이크 접근을 지원하지 않습니다.');
    }
  }, []);

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

  // Analyze audio level
  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average);
    
    if (!isPaused) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  // Extract keywords from text
  const extractKeywords = (text: string): string[] => {
    const words = text.split(/\s+/);
    const keywords: string[] = [];
    
    // Find important nouns and terms (simple approach)
    words.forEach((word, index) => {
      // Remove punctuation
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      
      // If word is 2+ characters and not a common word
      if (cleanWord.length >= 2) {
        // Check if it follows a highlight keyword
        if (index > 0 && HIGHLIGHT_KEYWORDS.some(k => words[index - 1].includes(k))) {
          keywords.push(cleanWord);
        }
        // Or if it's repeated in the text
        const occurrences = text.split(cleanWord).length - 1;
        if (occurrences >= 2 && keywords.length < 5) {
          keywords.push(cleanWord);
        }
      }
    });
    
    return [...new Set(keywords)].slice(0, 5);
  };

  // Generate summary from text
  const generateSummary = (text: string): string => {
    // Simple summary: take first sentence or limit to 100 chars
    const sentences = text.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 0) {
      return firstSentence.length > 100 
        ? firstSentence.substring(0, 97) + '...'
        : firstSentence;
    }
    
    return text.length > 100 ? text.substring(0, 97) + '...' : text;
  };

  // Check if text should be highlighted
  const shouldHighlight = (text: string, audioLevel: number): boolean => {
    const lowerText = text.toLowerCase();
    
    // Check for highlight keywords
    const hasKeyword = HIGHLIGHT_KEYWORDS.some(keyword => 
      lowerText.includes(keyword)
    );
    
    // Check for elevated audio level (speaker emphasis)
    const hasEmphasis = audioLevel > 80;
    
    // Check for question marks or exclamation
    const hasEmphasisPunctuation = /[!?]/.test(text);
    
    return hasKeyword || (hasEmphasis && text.length > 10) || hasEmphasisPunctuation;
  };

  // Setup speech recognition
  const setupRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      // Show interim results
      if (interimTranscript) {
        setCurrentText(interimTranscript);
      }

      // Process final results
      if (finalTranscript) {
        const isHighlight = shouldHighlight(finalTranscript, audioLevel);
        
        if (isHighlight) {
          setAiProcessing(true);
        }

        const segment: TranscriptSegment = {
          id: `seg-${Date.now()}-${Math.random()}`,
          timestamp: duration,
          text: finalTranscript,
          isHighlight,
        };

        setTranscript(prev => [...prev, segment]);
        setCurrentText('');

        // Create highlight if needed
        if (isHighlight) {
          const keywords = extractKeywords(finalTranscript);
          const summary = generateSummary(finalTranscript);
          
          const highlight: Highlight = {
            id: `hl-${Date.now()}-${Math.random()}`,
            timestamp: duration,
            text: finalTranscript,
            summary,
            keywords,
            importance: 'high',
          };
          
          setHighlights(prev => [...prev, highlight]);
          toast.success('핵심 구간 감지!', {
            description: '중요한 내용이 하이라이트되었습니다.',
          });
          
          setTimeout(() => setAiProcessing(false), 1500);
        }
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore 'no-speech' and 'aborted' errors as they are common and non-critical
      if (event.error === 'no-speech' || event.error === 'aborted') {
        console.info('Speech recognition info:', event.error);
        return;
      }
      
      console.warn('Speech recognition error:', event.error);
      
      // Only show toast for critical errors
      if (event.error === 'not-allowed') {
        toast.error('음성 인식 권한 거부', {
          description: '마이크 권한을 허용해주세요.',
        });
      } else if (event.error !== 'network') {
        // Don't show network errors as they happen frequently
        toast.warning('음성 인식 경고', {
          description: '음성 인식에 일시적인 문제가 있습니다.',
        });
      }
    };

    recognition.onend = () => {
      // Restart if still recording and not paused
      if (isRecording && !isPaused) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  // Setup audio recording and analysis
  const setupAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Permission granted - reset error state
      setPermissionDenied(false);
      setError(null);

      // Setup MediaRecorder for audio recording
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;

      // Setup audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      return { mediaRecorder, stream };
    } catch (err: any) {
      // Handle different types of errors
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        // This is expected when user denies permission - not a critical error
        console.info('Microphone permission denied by user');
        setPermissionDenied(true);
        setError('마이크 접근 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        toast.info('마이크 권한이 필요합니다', {
          description: '브라우저 주소창 왼쪽의 잠금 아이콘을 클릭하여 마이크 권한을 허용해주세요.',
          duration: 6000,
        });
      } else if (err.name === 'NotFoundError') {
        console.warn('Microphone not found:', err);
        setError('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
        toast.error('마이크 없음', {
          description: '마이크가 연결되어 있는지 확인해주세요.',
        });
      } else {
        console.error('Microphone access error:', err);
        setError('마이크 접근 중 오류가 발생했습니다.');
        toast.error('마이크 오류', {
          description: err.message || '마이크 접근에 실패했습니다.',
        });
      }
      throw err;
    }
  };

  const handleStartRecording = async () => {
    if (!isSupported) {
      toast.error('지원되지 않는 브라우저', {
        description: error || '이 기능을 사용할 수 없습니다.',
      });
      return;
    }

    try {
      // Setup audio recording
      const { mediaRecorder } = await setupAudioRecording();
      
      // Setup speech recognition
      const recognition = setupRecognition();
      
      if (!recognition) {
        toast.error('음성 인식 초기화 실패');
        return;
      }

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      recognition.start();
      
      setIsRecording(true);
      setIsPaused(false);
      
      // Start audio analysis
      analyzeAudio();
      
      toast.success('녹음 시작', {
        description: '강의 녹음이 시작되었습니다.',
      });
    } catch (err: any) {
      // Error is already handled in setupAudioRecording with appropriate toast
      console.info('Recording start cancelled:', err.name);
    }
  };

  const handleRetryPermission = () => {
    setPermissionDenied(false);
    setError(null);
    handleStartRecording();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume
      recognitionRef.current?.start();
      mediaRecorderRef.current?.resume();
      setIsPaused(false);
      analyzeAudio();
      toast.info('녹음 재개');
    } else {
      // Pause
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      toast.info('녹음 일시정지');
    }
  };

  const handleStopRecording = () => {
    // Stop recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setShowSaveDialog(true);
    toast.success('녹음 종료', {
      description: `${highlights.length}개의 하이라이트가 생성되었습니다.`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const lecture: Lecture = {
      id: `lec-${Date.now()}`,
      title: lectureTitle || `강의 ${new Date().toLocaleDateString()}`,
      professor: professorName || undefined,
      date: new Date(),
      duration,
      highlights,
      transcript,
    };
    onSave(lecture);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl">실시간 강의 녹음</h2>
            <p className="text-sm text-gray-600">AI가 핵심 내용을 자동으로 찾습니다</p>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            취소
          </Button>
        </div>

        {/* Browser Support Warning */}
        {!isSupported && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error || '이 브라우저는 음성 인식 기능을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Denied Warning */}
        {permissionDenied && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <AlertDescription className="text-blue-900">
                <p className="mb-3"><strong>🎤 마이크 권한 설정 방법</strong></p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm mb-3">
                  <li>브라우저 주소창 왼쪽의 <strong>🔒 잠금 아이콘</strong> 또는 <strong>🎤 마이크 아이콘</strong>을 클릭하세요</li>
                  <li><strong>마이크</strong> 옵션을 찾아 <strong>"허용"</strong>으로 변경하세요</li>
                  <li>아래 "다시 시도" 버튼을 클릭하세요</li>
                </ol>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRetryPermission} 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    다시 시도
                  </Button>
                  <Button 
                    onClick={() => setPermissionDenied(false)} 
                    size="sm" 
                    variant="outline"
                  >
                    닫기
                  </Button>
                </div>
                <p className="text-xs mt-3 text-blue-700">
                  💡 <strong>참고:</strong> 이 기능은 실시간 음성 인식을 위해 마이크 접근이 필수입니다.
                </p>
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left: Recording Controls & Transcript */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recording Control */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isRecording && !isPaused ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                  }`}>
                    <Mic className={`w-6 h-6 ${
                      isRecording && !isPaused ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xl">{formatTime(duration)}</span>
                    </div>
                    <Badge variant={isRecording && !isPaused ? 'destructive' : 'secondary'} className="text-xs">
                      {!isRecording ? '대기 중' : isPaused ? '일시정지' : '녹음 중'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button 
                      onClick={handleStartRecording} 
                      className="bg-red-600 hover:bg-red-700" 
                      disabled={!isSupported}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {permissionDenied ? '권한 허용 후 시작' : '녹음 시작'}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handlePauseResume}>
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleStopRecording}>
                        <Square className="w-4 h-4 mr-2" />
                        종료
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Audio Level Indicator */}
              {isRecording && !isPaused && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">음성 레벨</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(audioLevel, 100)}%` }}
                    />
                  </div>
                </div>
              )}

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
                  <div className={`w-2 h-2 rounded-full ${isRecording && !isPaused ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">실시간 자막</span>
                </div>
                
                {transcript.length === 0 && !currentText && (
                  <div className="text-center py-12 text-gray-400">
                    <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    {permissionDenied ? (
                      <>
                        <p className="text-sm text-gray-600 mb-2">마이크 권한이 필요합니다</p>
                        <p className="text-xs">위의 안내를 따라 권한을 허용해주세요</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">녹음을 시작하면 자동으로 자막이 생성됩니다</p>
                        <p className="text-xs mt-2">명확하게 말씀해주세요</p>
                      </>
                    )}
                  </div>
                )}
                
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
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm">핵심 하이라이트</h3>
                <Badge variant="secondary" className="text-xs">{highlights.length}</Badge>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {highlights.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">녹음을 시작하면<br />AI가 핵심 내용을 찾습니다</p>
                    <div className="mt-4 text-left">
                      <p className="text-xs mb-2">감지 키워드:</p>
                      <div className="flex flex-wrap gap-1">
                        {HIGHLIGHT_KEYWORDS.slice(0, 8).map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs py-0">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
            <div>
              <label className="text-sm text-gray-600 mb-2 block">교수 명 (선택)</label>
              <Input
                placeholder="예: 김철수 교수님"
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
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
