/**
 * Portal-scoped Daily Brief Panel
 * Shows daily brief content specific to the current portal
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Calendar, TrendingUp, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { PortalType, PORTAL_LABELS } from '@/hooks/useHelpDrawer';
import { useNavigate } from 'react-router-dom';
import { useHelpDrawerStore } from '@/hooks/useHelpDrawer';

interface DailyBriefPanelProps {
  portal: PortalType;
  contentKey: string;
}

// Portal-specific brief sections
const PORTAL_BRIEFS: Record<PortalType, {
  title: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'trend';
  }>;
}> = {
  admin: {
    title: 'Admin Daily Brief',
    sections: [
      { id: 'a1', title: 'Platform Health', content: 'All systems operational. No critical issues detected.', type: 'success' },
      { id: 'a2', title: 'User Activity', content: 'Active users up 12% from yesterday. 45 new signups.', type: 'trend' },
      { id: 'a3', title: 'Pending Actions', content: '3 support tickets awaiting response.', type: 'warning' },
      { id: 'a4', title: 'System Updates', content: 'Scheduled maintenance window: Sunday 2AM-4AM UTC.', type: 'info' },
    ],
  },
  creator: {
    title: 'Creator Daily Brief',
    sections: [
      { id: 'c1', title: 'Audience Growth', content: 'You gained 23 new followers this week.', type: 'trend' },
      { id: 'c2', title: 'Content Performance', content: 'Your latest episode has 150 plays.', type: 'success' },
      { id: 'c3', title: 'Engagement', content: '5 new comments on your content.', type: 'info' },
      { id: 'c4', title: 'Monetization', content: 'Earnings this month: $45.00', type: 'trend' },
    ],
  },
  advertiser: {
    title: 'Advertiser Daily Brief',
    sections: [
      { id: 'ad1', title: 'Campaign Performance', content: 'Active campaigns: 3. Total impressions today: 12,500.', type: 'trend' },
      { id: 'ad2', title: 'Budget Status', content: '65% of monthly budget utilized.', type: 'info' },
      { id: 'ad3', title: 'Top Performing', content: 'Summer Sale campaign: 2.3% CTR', type: 'success' },
      { id: 'ad4', title: 'Attention Needed', content: '1 campaign approaching budget limit.', type: 'warning' },
    ],
  },
  board: {
    title: 'Board Daily Brief',
    sections: [
      { id: 'b1', title: 'Key Metrics', content: 'MRR: $45,000 (+8% MoM). Active creators: 1,200.', type: 'trend' },
      { id: 'b2', title: 'Growth Update', content: 'On track for Q4 targets.', type: 'success' },
      { id: 'b3', title: 'Market Intel', content: '2 new competitor announcements to review.', type: 'info' },
      { id: 'b4', title: 'Action Items', content: 'Board meeting scheduled for next Tuesday.', type: 'warning' },
    ],
  },
};

export function DailyBriefPanel({ portal, contentKey }: DailyBriefPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { close } = useHelpDrawerStore();
  
  const brief = PORTAL_BRIEFS[portal];
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };
  
  const handleViewFullBrief = () => {
    close();
    const route = portal === 'admin' ? '/admin/daily-brief' : '/creator/daily-brief';
    navigate(route);
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Today's brief for {PORTAL_LABELS[portal]}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewFullBrief}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Full Brief
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {brief.sections.map(section => (
          <Card key={section.id}>
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center gap-2">
                {getIcon(section.type)}
                <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-3">
              <CardDescription className="text-sm">
                {section.content}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
