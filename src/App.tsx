import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LectureRecorder } from './components/LectureRecorder';
import { LectureList } from './components/LectureList';
import { SummaryView } from './components/SummaryView';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export type Lecture = {
  id: string;
  title: string;
  professor?: string;
  date: Date;
  duration: number;
  highlights: Highlight[];
  transcript: TranscriptSegment[];
};

export type Highlight = {
  id: string;
  timestamp: number;
  text: string;
  summary: string;
  keywords: string[];
  importance: 'high' | 'medium' | 'low';
};

export type TranscriptSegment = {
  id: string;
  timestamp: number;
  text: string;
  isHighlight: boolean;
};

type AppView = 'landing' | 'recorder' | 'lectures' | 'summary';

const STORAGE_KEY = 'ai-lecture-mate-lectures';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);

  // Load lectures from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const lecturesWithDates = parsed.map((lecture: any) => ({
          ...lecture,
          date: new Date(lecture.date),
        }));
        setLectures(lecturesWithDates);
      }
    } catch (error) {
      console.error('Failed to load lectures:', error);
    }
  }, []);

  // Save lectures to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures));
    } catch (error) {
      console.error('Failed to save lectures:', error);
    }
  }, [lectures]);

  const handleStartRecording = () => {
    setCurrentView('recorder');
  };

  const handleSaveLecture = (lecture: Lecture) => {
    setLectures([lecture, ...lectures]);
    setCurrentLecture(lecture);
    setCurrentView('summary');
    toast.success('강의가 저장되었습니다', {
      description: `${lecture.highlights.length}개의 핵심 하이라이트가 생성되었습니다`,
    });
  };

  const handleDeleteLecture = (lectureId: string) => {
    setLectures(lectures.filter(l => l.id !== lectureId));
    toast.success('강의가 삭제되었습니다');
    if (currentLecture?.id === lectureId) {
      setCurrentView('lectures');
    }
  };

  const handleUpdateLecture = (updatedLecture: Lecture) => {
    setLectures(lectures.map(l => l.id === updatedLecture.id ? updatedLecture : l));
    setCurrentLecture(updatedLecture);
    toast.success('강의가 수정되었습니다');
  };

  const handleViewLectures = () => {
    setCurrentView('lectures');
  };

  const handleViewSummary = (lecture: Lecture) => {
    setCurrentLecture(lecture);
    setCurrentView('summary');
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    setCurrentLecture(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'landing' && (
        <LandingPage
          onStartRecording={handleStartRecording}
          onViewLectures={handleViewLectures}
          lectureCount={lectures.length}
        />
      )}
      {currentView === 'recorder' && (
        <LectureRecorder
          onSave={handleSaveLecture}
          onCancel={handleBackToHome}
        />
      )}
      {currentView === 'lectures' && (
        <LectureList
          lectures={lectures}
          onSelectLecture={handleViewSummary}
          onDeleteLecture={handleDeleteLecture}
          onBack={handleBackToHome}
        />
      )}
      {currentView === 'summary' && currentLecture && (
        <SummaryView
          lecture={currentLecture}
          onUpdateLecture={handleUpdateLecture}
          onDeleteLecture={handleDeleteLecture}
          onBack={handleBackToHome}
        />
      )}
      <Toaster position="top-right" />
    </div>
  );
}
