import { useState } from 'react';
import { BookOpen, Clock, Sparkles, ChevronRight, ArrowLeft, Trash2, BarChart3, User } from 'lucide-react';
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
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl">내 강의</h2>
            <Badge variant="secondary">
              총 {lectures.length}개
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        {lectures.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <Card className="p-3">
              <p className="text-xs text-gray-600">총 강의</p>
              <p className="text-lg">{lectures.length}개</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-gray-600">학습 시간</p>
              <p className="text-lg">{formatTime(totalDuration)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-gray-600">하이라이트</p>
              <p className="text-lg">{totalHighlights}개</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-gray-600">평균</p>
              <p className="text-lg">{avgHighlights}개</p>
            </Card>
          </div>
        )}

        {lectures.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="mb-2 text-gray-600">아직 저장된 강의가 없습니다</h3>
            <p className="text-sm text-gray-500 mb-4">첫 강의를 녹음해보세요</p>
            <Button onClick={onBack} size="sm">
              강의 녹음 시작하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {lectures.map((lecture) => (
              <Card
                key={lecture.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onSelectLecture(lecture)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm truncate">{lecture.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {lecture.professor && (
                            <>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {lecture.professor}
                              </span>
                              <span className="text-gray-300">•</span>
                            </>
                          )}
                          <span>{formatDate(lecture.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(lecture.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{lecture.highlights.length}개</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{lecture.transcript.length}줄</span>
                      </div>
                    </div>

                    {lecture.highlights.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {lecture.highlights.slice(0, 3).map((highlight, idx) => (
                          highlight.keywords.slice(0, 1).map((keyword, kidx) => (
                            <Badge key={`${idx}-${kidx}`} variant="outline" className="text-xs py-0">
                              {keyword}
                            </Badge>
                          ))
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDeleteClick(e, lecture)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 group-hover:bg-gray-100">
                      <ChevronRight className="w-4 h-4" />
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
