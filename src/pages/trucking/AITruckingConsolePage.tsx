import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, CheckCircle, XCircle, TrendingUp, Network } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TruckingPageWrapper, TruckingContentCard, TruckingEmptyState, TruckingStatCardLight } from "@/components/trucking/TruckingPageWrapper";

interface CallLog {
  id: string;
  carrier_phone: string | null;
  load_id: string | null;
  call_direction: string | null;
  summary: string | null;
  transcript_url: string | null;
  recording_url: string | null;
  call_started_at: string | null;
  call_ended_at: string | null;
  created_at: string | null;
  language: string | null;
  outcome: string | null;
  lead_id: string | null;
  duration_seconds: number | null;
  failure_reason: string | null;
  trucking_loads?: { load_number: string } | null;
}

export default function AITruckingConsolePage() {
  const [activeTab, setActiveTab] = useState("all_calls");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch call logs with filters
  const { data: callLogs = [], isLoading } = useQuery({
    queryKey: ['trucking-call-logs', activeTab, dateFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('trucking_call_logs')
        .select(`*, trucking_loads(load_number)`)
        .eq('owner_id', user.id)
        .order('call_started_at', { ascending: false });

      // Date filter
      const now = new Date();
      if (dateFilter === "today") {
        query = query.gte("call_started_at", now.toISOString().split("T")[0]);
      } else if (dateFilter === "7days") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        query = query.gte("call_started_at", weekAgo.toISOString());
      } else if (dateFilter === "30days") {
        const monthAgo = new Date(now.setDate(now.getDate() - 30));
        query = query.gte("call_started_at", monthAgo.toISOString());
      }

      if (activeTab === 'successful_calls') {
        query = query.eq('outcome', 'lead_created');
      } else if (activeTab === 'incomplete_calls') {
        query = query.in('outcome', ['caller_hung_up', 'no_load_found', 'error', 'other']);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CallLog[];
    }
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['trucking-call-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalCalls: 0, successfulLeads: 0, incompleteCalls: 0, successRate: 0 };

      const today = new Date().toISOString().split('T')[0];
      
      const { data: allCalls } = await supabase
        .from('trucking_call_logs')
        .select('id, outcome')
        .eq('owner_id', user.id)
        .gte('call_started_at', today);

      const totalCalls = allCalls?.length || 0;
      const successfulLeads = allCalls?.filter(c => c.outcome === 'lead_created').length || 0;
      const incompleteCalls = allCalls?.filter(c => 
        ['caller_hung_up', 'no_load_found', 'error', 'other'].includes(c.outcome || '')
      ).length || 0;
      const successRate = totalCalls > 0 ? Math.round((successfulLeads / totalCalls) * 100) : 0;

      return { totalCalls, successfulLeads, incompleteCalls, successRate };
    }
  });

  const getOutcomeBadge = (outcome: string | null) => {
    const styles: Record<string, string> = {
      lead_created: "bg-green-100 text-green-700",
      caller_hung_up: "bg-yellow-100 text-yellow-700",
      no_load_found: "bg-orange-100 text-orange-700",
      error: "bg-red-100 text-red-700",
      call_completed: "bg-blue-100 text-blue-700",
    };
    return styles[outcome || ""] || "bg-slate-100 text-slate-600";
  };

  const formatDuration = (seconds: number | null, start?: string | null, end?: string | null) => {
    if (seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${String(secs).padStart(2, '0')}`;
    }
    if (start && end) {
      const duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${String(secs).padStart(2, '0')}`;
    }
    return '—';
  };

  const handleRowClick = (call: CallLog) => {
    setSelectedCall(call);
    setDrawerOpen(true);
  };

  return (
    <TruckingPageWrapper 
      title="AI Call Console" 
      description="Review calls handled by the AI"
      action={
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-32 bg-white border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TruckingStatCardLight 
          label="Total Calls (Today)" 
          value={analytics?.totalCalls || 0} 
          icon={<Phone className="h-6 w-6 text-slate-500" />}
        />
        <TruckingStatCardLight 
          label="Leads Created" 
          value={analytics?.successfulLeads || 0} 
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        />
        <TruckingStatCardLight 
          label="Incomplete Calls" 
          value={analytics?.incompleteCalls || 0} 
          icon={<XCircle className="h-6 w-6 text-yellow-600" />}
        />
        <TruckingStatCardLight 
          label="Success Rate" 
          value={`${analytics?.successRate || 0}%`} 
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
        />
      </div>

      {/* Call Logs Table */}
      <TruckingContentCard noPadding>
        <div className="p-4 border-b border-slate-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all_calls" className="data-[state=active]:bg-white">All Calls</TabsTrigger>
              <TabsTrigger value="successful_calls" className="data-[state=active]:bg-white">Successful</TabsTrigger>
              <TabsTrigger value="incomplete_calls" className="data-[state=active]:bg-white">Incomplete</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : callLogs.length === 0 ? (
          <TruckingEmptyState
            icon={<Network className="h-6 w-6 text-slate-400" />}
            title="No AI calls yet"
            description="Once your number is live, new calls will show up here automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200">
                  <TableHead className="text-slate-500 font-medium">Time</TableHead>
                  <TableHead className="text-slate-500 font-medium">Caller</TableHead>
                  <TableHead className="text-slate-500 font-medium">Load</TableHead>
                  <TableHead className="text-slate-500 font-medium">Language</TableHead>
                  <TableHead className="text-slate-500 font-medium">Outcome</TableHead>
                  <TableHead className="text-slate-500 font-medium">Duration</TableHead>
                  <TableHead className="text-slate-500 font-medium">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((call) => (
                  <TableRow 
                    key={call.id} 
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleRowClick(call)}
                  >
                    <TableCell className="text-slate-600">
                      {call.call_started_at 
                        ? format(new Date(call.call_started_at), 'MMM d, h:mm a')
                        : call.created_at 
                          ? format(new Date(call.created_at), 'MMM d, h:mm a')
                          : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-slate-900">{call.carrier_phone || '—'}</TableCell>
                    <TableCell className="text-slate-600">{call.trucking_loads?.load_number || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {call.language === 'es' ? 'Spanish' : 'English'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getOutcomeBadge(call.outcome)}>
                        {call.outcome?.replace("_", " ") || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDuration(call.duration_seconds, call.call_started_at, call.call_ended_at)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-500">
                      {call.failure_reason || call.summary || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TruckingContentCard>

      {/* Call Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Call Details</SheetTitle>
          </SheetHeader>
          {selectedCall && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Caller</label>
                  <p className="font-mono font-medium text-slate-900">{selectedCall.carrier_phone || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Direction</label>
                  <p className="capitalize text-slate-900">{selectedCall.call_direction || 'Inbound'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-500">Outcome</label>
                <div className="mt-1">
                  <Badge className={getOutcomeBadge(selectedCall.outcome)}>
                    {selectedCall.outcome?.replace("_", " ") || 'Pending'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Language</label>
                  <p className="text-slate-900">{selectedCall.language === 'es' ? 'Spanish' : 'English'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Duration</label>
                  <p className="text-slate-900">{formatDuration(selectedCall.duration_seconds, selectedCall.call_started_at, selectedCall.call_ended_at)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-500">Summary</label>
                <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg text-slate-700">
                  {selectedCall.summary || 'No summary available'}
                </p>
              </div>
              
              {selectedCall.failure_reason && (
                <div>
                  <label className="text-sm text-slate-500">Failure Reason</label>
                  <p className="text-sm text-yellow-600 mt-1">{selectedCall.failure_reason}</p>
                </div>
              )}
              
              {selectedCall.recording_url && (
                <div>
                  <label className="text-sm text-slate-500">Recording</label>
                  <audio controls className="w-full mt-2">
                    <source src={selectedCall.recording_url} type="audio/mpeg" />
                  </audio>
                </div>
              )}
              
              {selectedCall.transcript_url && (
                <Button variant="outline" asChild className="w-full">
                  <a href={selectedCall.transcript_url} target="_blank" rel="noopener noreferrer">
                    View Full Transcript
                  </a>
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </TruckingPageWrapper>
  );
}
