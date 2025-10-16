import { Clock, Tag } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { Highlight } from '../App';

type HighlightCardProps = {
  highlight: Highlight;
  index: number;
  formatTime: (seconds: number) => string;
  onClick?: () => void;
};

export function HighlightCard({ highlight, index, formatTime, onClick }: HighlightCardProps) {
  const importanceColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-orange-100 text-orange-700 border-orange-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${
        importanceColors[highlight.importance]
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          핵심 #{index}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {formatTime(highlight.timestamp)}
        </div>
      </div>
      
      <p className="text-sm mb-3 line-clamp-3">{highlight.summary}</p>
      
      {highlight.keywords.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-3 h-3 text-gray-400" />
          {highlight.keywords.map((keyword, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
