import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TruckingPageWrapper } from '@/components/trucking/TruckingPageWrapper';
import { CEIKPICards } from '@/components/trucking/analytics/CEIKPICards';
import { CEIEngagementCards } from '@/components/trucking/analytics/CEIEngagementCards';
import { CEIBandChart } from '@/components/trucking/analytics/CEIBandChart';
import { CEICallsTable } from '@/components/trucking/analytics/CEICallsTable';
import { CEICallDetailDrawer } from '@/components/trucking/analytics/CEICallDetailDrawer';
import { CEIDailyReportPanel } from '@/components/trucking/analytics/CEIDailyReportPanel';
import { useTruckingCalls, useTruckingCallsStats, useTruckingCallsExist, TruckingCall } from '@/hooks/trucking/useTruckingCalls';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

type DatePreset = 'today' | 'yesterday' | 'last7days' | 'custom';

export default function AICallAnalyticsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [selectedCall, setSelectedCall] = useState<TruckingCall | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { data: calls, isLoading: callsLoading } = useTruckingCalls(date);
  const stats = useTruckingCallsStats(date);
  const { data: callsExist } = useTruckingCallsExist();

  const handleSelectCall = (call: TruckingCall) => {
    setSelectedCall(call);
    setDrawerOpen(true);
  };

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    switch (preset) {
      case 'today':
        setDate(new Date());
        break;
      case 'yesterday':
        setDate(subDays(new Date(), 1));
        break;
      case 'last7days':
        // For now, show today but we could expand this
        setDate(new Date());
        break;
      case 'custom':
        // Keep current date, calendar will be used
        break;
    }
  };

  const presetLabels: Record<DatePreset, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    last7days: 'Last 7 Days',
    custom: 'Custom Date',
  };

  const showNoDataHint = !callsLoading && (calls?.length === 0) && callsExist;

  return (
    <TruckingPageWrapper
      title="AI Call Performance"
      description="Daily outcomes, CEI score, and what to improve next."
      action={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                {presetLabels[datePreset]}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePresetChange('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePresetChange('yesterday')}>
                Yesterday
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePresetChange('custom')}>
                Custom Date
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setDatePreset('custom');
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      }
    >
      <div className="space-y-6">
        {/* No data hint */}
        {showNoDataHint && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No calls found for {format(date, 'MMMM d, yyyy')}. 
              There are calls on other dates — try selecting <strong>Yesterday</strong> or use the calendar to pick a different date.
            </AlertDescription>
          </Alert>
        )}

        {/* Primary KPI Cards */}
        <CEIKPICards
          totalCalls={stats.totalCalls}
          resolvedWithoutHandoffPct={stats.resolvedWithoutHandoffPct}
          handoffRequestedPct={stats.handoffRequestedPct}
          leadCreatedPct={stats.leadCreatedPct}
          avgCeiScore={stats.avgCeiScore}
          isLoading={stats.isLoading}
        />

        {/* Engagement Metrics Row */}
        <CEIEngagementCards
          avgDurationSeconds={stats.avgDurationSeconds}
          engagedCallsCount={stats.engagedCallsCount}
          quickHangupsCount={stats.quickHangupsCount}
          avgTimeToHandoffSeconds={stats.avgTimeToHandoffSeconds}
          totalCalls={stats.totalCalls}
          isLoading={stats.isLoading}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CEIBandChart 
            breakdown={stats.ceiBandBreakdown} 
            isLoading={stats.isLoading} 
          />
          <CEIDailyReportPanel date={date} />
        </div>

        {/* Calls Table */}
        <CEICallsTable
          calls={calls || []}
          isLoading={callsLoading}
          onSelectCall={handleSelectCall}
        />

        {/* Call Detail Drawer */}
        <CEICallDetailDrawer
          call={selectedCall}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </TruckingPageWrapper>
  );
}
