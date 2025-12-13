/**
 * Portal-scoped Knowledge Hub Panel
 * Content is filtered/loaded based on portal context
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, ExternalLink } from 'lucide-react';
import { PortalType, PORTAL_LABELS } from '@/hooks/useHelpDrawer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useHelpDrawerStore } from '@/hooks/useHelpDrawer';

interface KnowledgeHubPanelProps {
  portal: PortalType;
  contentKey: string;
}

// Portal-specific knowledge articles
const PORTAL_ARTICLES: Record<PortalType, Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  route?: string;
}>> = {
  admin: [
    { id: 'admin-1', title: 'Admin Dashboard Overview', description: 'Learn how to navigate the admin dashboard and manage platform settings.', category: 'Getting Started' },
    { id: 'admin-2', title: 'User Management', description: 'How to manage users, roles, and permissions.', category: 'Administration' },
    { id: 'admin-3', title: 'System Configuration', description: 'Configure platform-wide settings and integrations.', category: 'Configuration' },
    { id: 'admin-4', title: 'Analytics & Reporting', description: 'Access platform analytics and generate reports.', category: 'Analytics' },
  ],
  creator: [
    { id: 'creator-1', title: 'Getting Started as a Creator', description: 'Set up your creator profile and start creating content.', category: 'Getting Started' },
    { id: 'creator-2', title: 'Podcast Studio Guide', description: 'Learn how to use the podcast recording studio.', category: 'Studio' },
    { id: 'creator-3', title: 'Monetization Options', description: 'Explore ways to monetize your content.', category: 'Monetization' },
    { id: 'creator-4', title: 'Growing Your Audience', description: 'Tips and strategies for audience growth.', category: 'Growth' },
  ],
  advertiser: [
    { id: 'adv-1', title: 'Campaign Setup Guide', description: 'Create and manage your advertising campaigns.', category: 'Campaigns' },
    { id: 'adv-2', title: 'Targeting Options', description: 'Learn about audience targeting and segmentation.', category: 'Targeting' },
    { id: 'adv-3', title: 'Budget Management', description: 'Manage your advertising budget and bidding.', category: 'Budget' },
    { id: 'adv-4', title: 'Campaign Analytics', description: 'Track and analyze campaign performance.', category: 'Analytics' },
  ],
  board: [
    { id: 'board-1', title: 'Board Dashboard Overview', description: 'Navigate the board member dashboard.', category: 'Getting Started' },
    { id: 'board-2', title: 'Financial Reports', description: 'Access and understand financial reports.', category: 'Finance' },
    { id: 'board-3', title: 'Company Metrics', description: 'Key metrics and KPIs for board members.', category: 'Metrics' },
    { id: 'board-4', title: 'Investor Relations', description: 'Manage investor communications and updates.', category: 'Investors' },
  ],
};

export function KnowledgeHubPanel({ portal, contentKey }: KnowledgeHubPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { close } = useHelpDrawerStore();
  
  const articles = PORTAL_ARTICLES[portal] || [];
  
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const categories = [...new Set(filteredArticles.map(a => a.category))];
  
  const handleViewFullHub = () => {
    close();
    const route = portal === 'admin' ? '/admin/knowledge-base' : '/knowledge-hub';
    navigate(route);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Knowledge articles for {PORTAL_LABELS[portal]} portal
        </p>
        <Button variant="outline" size="sm" onClick={handleViewFullHub}>
          <ExternalLink className="h-4 w-4 mr-1" />
          View Full Hub
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {categories.map(category => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
          {filteredArticles
            .filter(a => a.category === category)
            .map(article => (
              <Card key={article.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">{article.title}</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs">
                    {article.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
        </div>
      ))}
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No articles found</p>
        </div>
      )}
    </div>
  );
}
