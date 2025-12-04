import { useNavigate } from 'react-router-dom';
import { BoardLayout } from '@/components/board/BoardLayout';
import { MarkdownRenderer } from '@/components/board/MarkdownRenderer';
import { useBoardContent, useBoardMetrics } from '@/hooks/useBoardContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Target,
  TrendingUp,
  Video,
  FileText,
  ArrowRight,
  Users,
  DollarSign,
  Activity,
  Percent,
  Play,
  Wrench,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const quickLinks = [
  {
    title: 'Business Model',
    description: 'Revenue streams & monetization strategy',
    icon: Building2,
    path: '/board/business-model',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'GTM Strategy',
    description: 'Go-to-market plan & acquisition channels',
    icon: Target,
    path: '/board/gtm',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: '3-Year Forecasts',
    description: 'AI-generated financial projections',
    icon: TrendingUp,
    path: '/board/forecasts',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Investor Videos',
    description: 'Product demos & presentations',
    icon: Video,
    path: '/board/videos',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Documents',
    description: 'Reports, legal & meeting minutes',
    icon: FileText,
    path: '/board/docs',
    gradient: 'from-rose-500 to-red-600',
  },
];

const metricIcons: Record<string, any> = {
  total_creators: Users,
  monthly_active: Activity,
  revenue_mtd: DollarSign,
  growth_rate: Percent,
};

// Fallback metrics if none exist in database
const defaultMetrics = [
  { id: '1', metric_key: 'total_creators', metric_label: 'Total Creators', metric_value: '2,450' },
  { id: '2', metric_key: 'monthly_active', metric_label: 'Monthly Active Users', metric_value: '1,200' },
  { id: '3', metric_key: 'revenue_mtd', metric_label: 'Revenue MTD', metric_value: '$45,000' },
  { id: '4', metric_key: 'growth_rate', metric_label: 'MoM Growth', metric_value: '+18%' },
];

export default function BoardDashboard() {
  const navigate = useNavigate();
  const { content, isLoading: contentLoading } = useBoardContent('state-of-company');
  const { metrics: dbMetrics, isLoading: metricsLoading } = useBoardMetrics();

  // Use database metrics if available, otherwise fallback to defaults
  const metrics = dbMetrics && dbMetrics.length > 0 ? dbMetrics : defaultMetrics;

  return (
    <BoardLayout>
      <div className="space-y-8">
        {/* Hero Section - Light theme, full-width centered */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 border border-slate-200 shadow-sm p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              A Clear Window Into the Creator & Podcast Business.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Real-time view into our model, go-to-market, and forecasts—powered by internal R&D insights.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/board/videos')}
                className="bg-blue-600 text-white hover:bg-blue-700 gap-2 shadow-md"
              >
                <Play className="w-5 h-5" />
                Start with Overview Video
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/board/videos')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
              >
                <Wrench className="w-5 h-5" />
                Open Demo & Tools
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid - 4 equal columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            metrics?.map((metric) => {
              const Icon = metricIcons[metric.metric_key] || Activity;
              return (
                <Card key={metric.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{metric.metric_label}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{metric.metric_value}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* State of the Company */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              State of the Company
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {contentLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : content?.content ? (
              <div className="prose prose-slate max-w-none">
                <MarkdownRenderer content={content.content} />
              </div>
            ) : (
              <div className="space-y-6 text-slate-700 leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Current Status</h3>
                  <p>
                    Seeksy is in active development with a strong foundation across creator tools, 
                    podcast hosting, and monetization systems. The platform has onboarded early 
                    creators and is preparing for broader market launch.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Highlights</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Voice and Face Identity verification system live on Polygon mainnet</li>
                    <li>AI-powered clip generation and content certification operational</li>
                    <li>Podcast RSS hosting with migration support from major platforms</li>
                    <li>Advertiser dashboard and campaign management in development</li>
                    <li>Board portal and investor tools completed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Next Quarter Focus</h3>
                  <p>
                    Accelerate creator acquisition, launch advertising marketplace, and expand 
                    monetization tools including digital products and paid DMs.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links Grid */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Access</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card
                  key={link.path}
                  className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(link.path)}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{link.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{link.description}</p>
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-transform"
                    >
                      View <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </BoardLayout>
  );
}
