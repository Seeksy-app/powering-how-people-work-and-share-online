import { useState, useMemo } from 'react';
import { BoardLayout } from '@/components/board/BoardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SWOT_DATA, categoryConfig, groupByCategory, SwotItem, SwotCategory } from '@/data/swotData';
import { useBoardDataMode } from '@/contexts/BoardDataModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Grid3X3,
  List,
  PieChart,
  LayoutGrid,
  Info,
  Copy,
  Bot,
  Sparkles,
  X,
} from 'lucide-react';

type ViewMode = 'quadrant' | 'stack' | 'radial' | 'tabs';

export default function BoardSWOT() {
  const [viewMode, setViewMode] = useState<ViewMode>('quadrant');
  const [selectedItem, setSelectedItem] = useState<SwotItem | null>(null);
  const [activeTab, setActiveTab] = useState<SwotCategory>('strength');
  const { isDemo } = useBoardDataMode();

  const groupedItems = useMemo(() => groupByCategory(SWOT_DATA), []);
  const quadrantOrder: SwotCategory[] = ['strength', 'weakness', 'opportunity', 'threat'];

  const handleAskAI = (item: SwotItem) => {
    const config = categoryConfig[item.category];
    const prompt = `Analyze the strategic implications of: "${item.title}"

Category: ${config.title}
Description: ${item.description}

Provide:
1. Financial impact on revenue, costs, or growth
2. Strategic urgency and timeline
3. Resource requirements
4. Board-level decisions required`;

    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`/board/ai-analyst?prompt=${encodedPrompt}`, '_blank');
    setSelectedItem(null);
  };

  const handleCopySummary = (item: SwotItem) => {
    const config = categoryConfig[item.category];
    const text = `${config.title.slice(0, -1)}: ${item.title}

${item.description}

Why This Matters:
${item.whyItMatters.map(m => `• ${m}`).join('\n')}

Board Considerations:
${item.boardConsiderations.map(c => `• ${c}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    toast.success("Summary copied to clipboard");
  };

  const handleAskAIQuadrant = (category: SwotCategory) => {
    const config = categoryConfig[category];
    const items = groupedItems[category];
    const prompt = `Summarize the ${config.title} quadrant for Seeksy's strategic position.

Items:
${items.map(i => `- ${i.title}`).join('\n')}

Analyze implications for revenue, CAC, churn, partnerships, and overall strategy.`;

    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`/board/ai-analyst?prompt=${encodedPrompt}`, '_blank');
  };

  // Quadrant View Component
  const QuadrantView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {quadrantOrder.map((category, idx) => {
        const config = categoryConfig[category];
        const items = groupedItems[category] || [];

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={cn(
              "rounded-2xl border p-5 shadow-sm",
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", config.iconBgColor)}>
                  <span className="text-lg">{config.emoji}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{config.title}</h3>
                  <p className="text-xs text-slate-500">{config.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAskAIQuadrant(category)}
                    >
                      <Bot className="w-4 h-4 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ask AI About This Quadrant</TooltipContent>
                </Tooltip>
                <Badge variant="secondary" className="text-xs bg-white/80 text-slate-600">
                  {items.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.1 + i * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "w-full text-left rounded-xl shadow-sm px-4 py-3",
                    "flex items-center justify-between gap-3 cursor-pointer",
                    "transition-all duration-150 ease-out",
                    config.pillBg,
                    config.pillHover
                  )}
                >
                  <span className="text-sm font-medium text-slate-800 line-clamp-2">
                    {item.title}
                  </span>
                  <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // Stack View Component
  const StackView = () => (
    <div className="space-y-6">
      {quadrantOrder.map((category, idx) => {
        const config = categoryConfig[category];
        const items = groupedItems[category] || [];

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", config.iconBgColor)}>
                <span className="text-lg">{config.emoji}</span>
              </div>
              <h3 className="font-semibold text-slate-900">{config.title}</h3>
              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto gap-1.5 text-blue-600"
                onClick={() => handleAskAIQuadrant(category)}
              >
                <Bot className="w-4 h-4" />
                Ask AI
              </Button>
            </div>
            <div className="space-y-2 pl-10">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // Radial View Component
  const RadialView = () => (
    <div className="relative w-full max-w-2xl mx-auto aspect-square">
      <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">SWOT</span>
        </div>
      </div>
      
      {/* Quadrants */}
      {quadrantOrder.map((category, idx) => {
        const config = categoryConfig[category];
        const items = groupedItems[category] || [];
        const angle = (idx * 90) - 45;
        const x = Math.cos((angle * Math.PI) / 180) * 35;
        const y = Math.sin((angle * Math.PI) / 180) * 35;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="absolute"
            style={{
              top: `${50 + y}%`,
              left: `${50 + x}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setActiveTab(category);
                    setViewMode('tabs');
                  }}
                  className={cn(
                    "w-32 h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all",
                    "hover:scale-110 hover:shadow-xl cursor-pointer",
                    config.bgColor,
                    `border-2 ${config.borderColor}`
                  )}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-sm font-semibold text-slate-800">{config.title}</span>
                  <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent>Click to view {config.title.toLowerCase()}</TooltipContent>
            </Tooltip>
          </motion.div>
        );
      })}
    </div>
  );

  // Tabs View Component
  const TabsView = () => (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SwotCategory)}>
        <TabsList className="grid grid-cols-4 w-full">
          {quadrantOrder.map((category) => {
            const config = categoryConfig[category];
            return (
              <TabsTrigger key={category} value={category} className="gap-2">
                <span>{config.emoji}</span>
                <span className="hidden sm:inline">{config.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            const config = categoryConfig[activeTab];
            const items = groupedItems[activeTab] || [];

            return (
              <div className={cn("rounded-2xl border p-6", config.bgColor, config.borderColor)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{config.title}</h3>
                      <p className="text-sm text-slate-500">{config.subtitle}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleAskAIQuadrant(activeTab)}
                  >
                    <Bot className="w-4 h-4" />
                    Ask AI About {config.title}
                  </Button>
                </div>

                <div className="grid gap-3">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-md transition-all bg-white"
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{item.title}</p>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                          <Info className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <BoardLayout>
      <TooltipProvider>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SWOT Analysis</h1>
              <p className="text-sm text-slate-500 mt-1">
                Strategic assessment of Seeksy's position in the creator economy
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isDemo && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Demo data
                </Badge>
              )}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={viewMode === 'quadrant' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('quadrant')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quadrant View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={viewMode === 'stack' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('stack')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Stack View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={viewMode === 'radial' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('radial')}
                    >
                      <PieChart className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Radial View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={viewMode === 'tabs' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('tabs')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tabbed View</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* AI Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
          >
            <div className="p-2 rounded-lg bg-blue-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-blue-900">Coming Soon: AI-Generated SWOT Updates</span>
              <p className="text-xs text-blue-600 mt-0.5">
                AI will track competitive landscape, market shifts, and internal KPIs to suggest SWOT updates.
              </p>
            </div>
          </motion.div>

          {/* View Content */}
          {viewMode === 'quadrant' && <QuadrantView />}
          {viewMode === 'stack' && <StackView />}
          {viewMode === 'radial' && <RadialView />}
          {viewMode === 'tabs' && <TabsView />}

          {/* Detail Modal */}
          <AnimatePresence>
            {selectedItem && (
              <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-lg sm:max-w-2xl rounded-2xl bg-white p-0 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Modal Header */}
                    <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2.5 rounded-xl flex-shrink-0",
                          categoryConfig[selectedItem.category].iconBgColor
                        )}>
                          <span className="text-xl">{categoryConfig[selectedItem.category].emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge className={cn("mb-2 text-xs font-medium", categoryConfig[selectedItem.category].badgeColor)}>
                            {categoryConfig[selectedItem.category].title.slice(0, -1)} • {categoryConfig[selectedItem.category].subtitle}
                          </Badge>
                          <DialogTitle className="text-lg font-semibold text-slate-900 leading-tight pr-8">
                            {selectedItem.title}
                          </DialogTitle>
                        </div>
                      </div>
                    </DialogHeader>

                    {/* Modal Body */}
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{selectedItem.description}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Why This Matters</h4>
                        <ul className="space-y-2.5">
                          {selectedItem.whyItMatters.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Board-Level Considerations</h4>
                        <ul className="space-y-2">
                          {selectedItem.boardConsiderations.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 border-t bg-slate-50/50 flex flex-col sm:flex-row gap-2 sm:justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopySummary(selectedItem)}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy summary
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAskAI(selectedItem)}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Bot className="w-4 h-4" />
                        Ask Board AI Analyst
                      </Button>
                    </div>
                  </motion.div>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </BoardLayout>
  );
}