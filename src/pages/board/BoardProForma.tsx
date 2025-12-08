import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InteractiveSpreadsheet } from '@/components/cfo/InteractiveSpreadsheet';
import { CFOAIChat } from '@/components/cfo/CFOAIChat';
import { GenerateLinkModal } from '@/components/board/investor/GenerateLinkModal';

export default function BoardProForma() {
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <div className="space-y-6 w-full">
      {/* Pro Forma Quick Links */}
      <Card className="border-l-4 border-l-[#053877]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#053877]" />
                Available Pro Formas
              </CardTitle>
              <CardDescription>Financial models for business segments and acquisition opportunities</CardDescription>
            </div>
            <Button onClick={() => setShareModalOpen(true)} className="bg-[#053877] hover:bg-[#053877]/90">
              <Share2 className="h-4 w-4 mr-2" />
              Share with Investor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate('/board/proforma/events-awards')}
              variant="outline"
            >
              Events & Awards Pro Forma
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Financial Models with AI Chat */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <InteractiveSpreadsheet isReadOnly />
        </div>
        <div>
          <CFOAIChat />
        </div>
      </div>
      
      <GenerateLinkModal open={shareModalOpen} onOpenChange={setShareModalOpen} />
    </div>
  );
}
