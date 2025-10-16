import { useState } from 'react';
import { BookOpen, Clock, Sparkles, ChevronRight, ArrowLeft, Trash2, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import type { Lecture } from '../App';

type LectureListProps = {
  lectures: Lecture[];
  onSelectLecture: (lecture: Lecture) => void;
  onDeleteLecture: (lectureId: string) => void;
  onBack: () => void;
};

export function LectureList({ lectures, onSelectLecture, onDeleteLecture, onBack }: LectureListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDeleteClick = (e: React.MouseEvent, lecture: Lecture) => {
    e.stopPropagation();
    setLectureToDelete(lecture);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (lectureToDelete) {
      onDeleteLecture(lectureToDelete.id);
      setDeleteDialogOpen(false);
      setLectureToDelete(null);
    }
  };

  // Calculate statistics
  const totalDuration = lectures.reduce((sum, l) => sum + l.duration, 0);
  const totalHighlights = lectures.reduce((sum, l) => sum + l.highlights.length, 0);
  const avgHighlights = lectures.length > 0 ? Math.round(totalHighlights / lectures.length) : 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl mb-2">내 강의</h2>
              <p className="text-gray-600">저장된 강의 노트를 확인하세요</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              총 {lectures.length}개
            </Badge>
          </div>
        </div>

        {lectures.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl mb-2 text-gray-600">아직 저장된 강의가 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 강의를 녹음하고 AI가 핵심을 찾아주는 경험을 해보세요</p>
            <Button onClick={onBack}>
              강의 녹음 시작하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {lectures.map((lecture) => (
              <Card
                key={lecture.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onSelectLecture(lecture)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl mb-1">{lecture.title}</h3>
                        <p className="text-sm text-gray-500">{formatDate(lecture.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 ml-15">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatTime(lecture.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm">핵심 {lecture.highlights.length}개</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">자막 {lecture.transcript.length}줄</span>
                      </div>
                    </div>

                    {lecture.highlights.length > 0 && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {lecture.highlights.slice(0, 5).map((highlight, idx) => (
                          highlight.keywords.slice(0, 2).map((keyword, kidx) => (
                            <Badge key={`${idx}-${kidx}`} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))
                        ))}
                        {lecture.highlights.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{lecture.highlights.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDeleteClick(e, lecture)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="group-hover:bg-gray-100">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>강의를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {lectureToDelete?.title}을(를) 삭제하면 복구할 수 없습니다.
              {lectureToDelete && ` ${lectureToDelete.highlights.length}개의 하이라이트와 모든 자막이 함께 삭제됩니다.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
