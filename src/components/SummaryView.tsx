import { useState } from 'react';
import { ArrowLeft, Clock, Sparkles, Search, Download, Share2, Tag, FileText, Trash2, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { HighlightCard } from './HighlightCard';
import type { Lecture } from '../App';

type SummaryViewProps = {
  lecture: Lecture;
  onUpdateLecture: (lecture: Lecture) => void;
  onDeleteLecture: (lectureId: string) => void;
  onBack: () => void;
};

export function SummaryView({ lecture, onUpdateLecture, onDeleteLecture, onBack }: SummaryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(lecture.title);

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

  // Get all unique keywords
  const allKeywords = Array.from(
    new Set(lecture.highlights.flatMap(h => h.keywords))
  );

  // Filter highlights based on search or selected keyword
  const filteredHighlights = lecture.highlights.filter(highlight => {
    if (selectedKeyword) {
      return highlight.keywords.includes(selectedKeyword);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        highlight.text.toLowerCase().includes(query) ||
        highlight.summary.toLowerCase().includes(query) ||
        highlight.keywords.some(k => k.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Filter transcript based on search
  const filteredTranscript = lecture.transcript.filter(segment => {
    if (searchQuery) {
      return segment.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleSaveTitle = () => {
    onUpdateLecture({ ...lecture, title: editedTitle });
    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    onDeleteLecture(lecture.id);
    onBack();
  };

  const handleExport = () => {
    const content = `${lecture.title}\n${formatDate(lecture.date)}\n\n=== 핵심 하이라이트 ===\n\n${lecture.highlights.map((h, i) => `${i + 1}. [${formatTime(h.timestamp)}] ${h.summary}\n   키워드: ${h.keywords.join(', ')}\n`).join('\n')}\n\n=== 전체 자막 ===\n\n${lecture.transcript.map(t => `[${formatTime(t.timestamp)}] ${t.text}`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lecture.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-3xl mb-2">{lecture.title}</h2>
                <p className="text-gray-600">{formatDate(lecture.date)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditedTitle(lecture.title); setEditDialogOpen(true); }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  수정
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  내보내기
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(lecture.duration)}</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span>핵심 {lecture.highlights.length}개</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4" />
                <span>자막 {lecture.transcript.length}줄</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="키워드로 검색 (예: 데이터베이스, 정규화, ACID)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedKeyword(null);
                }}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <Button variant="ghost" onClick={() => setSearchQuery('')}>
                초기화
              </Button>
            )}
          </div>

          {/* Keyword Filter */}
          {allKeywords.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">빠른 검색:</span>
              {allKeywords.slice(0, 10).map((keyword, idx) => (
                <Badge
                  key={idx}
                  variant={selectedKeyword === keyword ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedKeyword(selectedKeyword === keyword ? null : keyword);
                    setSearchQuery('');
                  }}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="highlights" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="highlights">
              <Sparkles className="w-4 h-4 mr-2" />
              핵심 하이라이트
            </TabsTrigger>
            <TabsTrigger value="transcript">
              <FileText className="w-4 h-4 mr-2" />
              전체 자막
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="space-y-4">
            {filteredHighlights.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">검색 결과가 없습니다</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredHighlights.map((highlight, index) => (
                  <HighlightCard
                    key={highlight.id}
                    highlight={highlight}
                    index={index + 1}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transcript" className="space-y-4">
            <Card className="p-6">
              {filteredTranscript.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">검색 결과가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTranscript.map((segment) => (
                    <div
                      key={segment.id}
                      className={`p-4 rounded-lg transition-colors ${
                        segment.isHighlight
                          ? 'bg-yellow-100 border-l-4 border-yellow-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-500 mt-0.5 min-w-[3rem]">
                          {formatTime(segment.timestamp)}
                        </span>
                        <p className={segment.isHighlight ? 'text-yellow-900' : 'text-gray-700'}>
                          {segment.text}
                        </p>
                        {segment.isHighlight && (
                          <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <Card className="p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="mb-4">학습 인사이트</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">전체 강의 시간</p>
              <p className="text-2xl">{formatTime(lecture.duration)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">핵심 구간 비율</p>
              <p className="text-2xl">
                {lecture.transcript.length > 0
                  ? Math.round((lecture.highlights.length / lecture.transcript.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">주요 키워드</p>
              <p className="text-2xl">{allKeywords.length}개</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Title Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>강의 제목 수정</DialogTitle>
            <DialogDescription>
              강의 제목을 수정하세요
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="강의 제목"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveTitle}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>강의를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. {lecture.highlights.length}개의 하이라이트와 모든 자막이 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
