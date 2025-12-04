import { BoardLayout } from '@/components/board/BoardLayout';
import { MarkdownRenderer } from '@/components/board/MarkdownRenderer';
import { useBoardContent } from '@/hooks/useBoardContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardBusinessModel() {
  const navigate = useNavigate();
  const { content, isLoading } = useBoardContent('business-model');

  return (
    <BoardLayout>
      <div>
        <Button
          variant="ghost"
          className="text-slate-500 hover:text-slate-700 mb-6 -ml-2"
          onClick={() => navigate('/board')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Business Model</h1>
            <p className="text-slate-500">Revenue streams & monetization strategy</p>
          </div>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-48 mt-8" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : content?.content ? (
              <div className="prose prose-slate max-w-none">
                <MarkdownRenderer content={content.content} />
              </div>
            ) : (
              <div className="space-y-6 text-slate-700">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Revenue Model</h3>
                  <p className="mb-4">Seeksy operates a multi-stream revenue model targeting both creators and advertisers:</p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li><strong>Creator Subscriptions:</strong> Premium tools, analytics, and monetization features</li>
                    <li><strong>Advertising Revenue:</strong> CPM-based audio and video ad placements</li>
                    <li><strong>Transaction Fees:</strong> Percentage of creator earnings from tips, products, and paid DMs</li>
                    <li><strong>Enterprise Licensing:</strong> White-label solutions for agencies and networks</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Competitive Moat</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Blockchain-verified voice and face identity credentials</li>
                    <li>Integrated podcast hosting with RSS migration support</li>
                    <li>AI-powered content generation and editing tools</li>
                    <li>Unified creator-to-advertiser marketplace</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {content?.updated_at && (
          <p className="text-sm text-slate-400 mt-4 text-right">
            Last updated: {new Date(content.updated_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </BoardLayout>
  );
}
