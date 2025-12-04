import { BoardLayout } from '@/components/board/BoardLayout';
import { MarkdownRenderer } from '@/components/board/MarkdownRenderer';
import { useBoardContent } from '@/hooks/useBoardContent';
import { Card, CardContent } from '@/components/ui/card';
import { Target, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardGTM() {
  const navigate = useNavigate();
  const { content, isLoading } = useBoardContent('gtm');

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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">GTM Strategy</h1>
            <p className="text-slate-500">Go-to-market plan & acquisition channels</p>
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
              </div>
            ) : content?.content ? (
              <div className="prose prose-slate max-w-none">
                <MarkdownRenderer content={content.content} />
              </div>
            ) : (
              <div className="space-y-6 text-slate-700">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Phase 1: Foundation (Q1-Q2 2025)</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Onboard 1,000 early-adopter podcasters with migration incentives</li>
                    <li>Launch creator referral program with revenue share</li>
                    <li>Content marketing focused on podcast hosting comparison guides</li>
                    <li>Partnership outreach to podcast networks and agencies</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Phase 2: Growth (Q3-Q4 2025)</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Scale to 10,000+ creators with expanded tool suite</li>
                    <li>Launch advertiser self-serve platform</li>
                    <li>Introduce identity verification as premium differentiator</li>
                    <li>Expand into video creator segment</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Phase 3: Scale (2026)</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Target 100,000+ creators across multiple verticals</li>
                    <li>Enterprise white-label partnerships</li>
                    <li>International expansion starting with English-speaking markets</li>
                    <li>Full monetization suite including digital products and paid communities</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Acquisition Channels</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li><strong>Organic:</strong> SEO, content marketing, podcast guest appearances</li>
                    <li><strong>Paid:</strong> Targeted social ads to existing podcasters</li>
                    <li><strong>Partnerships:</strong> Integrations with editing tools and hosting platforms</li>
                    <li><strong>Events:</strong> Podcast conferences, creator summits</li>
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
