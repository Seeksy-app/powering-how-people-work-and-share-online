import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Calendar, ChevronDown, ChevronUp, Sparkles, Download, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BoardPageHeader } from "@/components/board/BoardPageHeader";
import { toast } from "sonner";
import { DecisionTable } from "@/components/board/DecisionTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DecisionRow {
  Topic: string;
  Option: string;
  Upside: string;
  Risk: string;
  Decision: string;
}

interface MeetingNote {
  id: string;
  title: string;
  meeting_date: string;
  agenda_items: string[];
  memo: {
    purpose?: string;
    current_state?: string[];
    key_questions?: string[];
    objective?: string;
  } | null;
  decision_table: DecisionRow[];
  decisions_summary: string | null;
  decisions_summary_generated_at: string | null;
  decisions_summary_locked: boolean;
  status: string;
  created_at: string;
}

interface CreateMeetingForm {
  title: string;
  meeting_date: string;
  start_time: string;
  duration_minutes: number;
}

export default function BoardMeetingNotes() {
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null);
  const [memoOpen, setMemoOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateMeetingForm>({
    title: "",
    meeting_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "10:00",
    duration_minutes: 60,
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["board-meeting-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_meeting_notes")
        .select("*")
        .order("meeting_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as MeetingNote[];
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (formData: CreateMeetingForm) => {
      const { data: userData } = await supabase.auth.getUser();
      
      // Create EMPTY meeting - no prefilled content
      const newNote = {
        title: formData.title.trim(),
        meeting_date: formData.meeting_date,
        agenda_items: [], // Empty - no prefill
        memo: null, // Empty - no prefill
        decision_table: [], // Empty - no prefill
        decisions_summary: null,
        decisions_summary_generated_at: null,
        decisions_summary_locked: false,
        status: "active",
        created_by: userData.user?.id,
      };

      // Let DB generate the UUID - do NOT pass id from client
      const { data, error } = await supabase
        .from("board_meeting_notes")
        .insert(newNote)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["board-meeting-notes"] });
      setSelectedNote(data as unknown as MeetingNote);
      setIsCreateModalOpen(false);
      setCreateForm({
        title: "",
        meeting_date: format(new Date(), "yyyy-MM-dd"),
        start_time: "10:00",
        duration_minutes: 60,
      });
      toast.success("Meeting created");
    },
    onError: (error) => {
      toast.error("Failed to create meeting");
      console.error(error);
    },
  });

  const handleCreateMeeting = () => {
    if (!createForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!createForm.meeting_date) {
      toast.error("Meeting date is required");
      return;
    }
    createNoteMutation.mutate(createForm);
  };

  const updateDecisionMutation = useMutation({
    mutationFn: async ({ noteId, decisionTable }: { noteId: string; decisionTable: any[] }) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("board_meeting_notes")
        .update({ 
          decision_table: decisionTable,
          updated_by: userData.user?.id
        })
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-meeting-notes"] });
    },
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (!note) throw new Error("Note not found");

      const decisionsWithContent = note.decision_table.filter(row => row.Decision && row.Decision.trim() !== "");
      if (decisionsWithContent.length === 0) {
        throw new Error("No decisions have been made yet");
      }

      const grouped: Record<string, string[]> = {};
      decisionsWithContent.forEach(row => {
        if (!grouped[row.Topic]) grouped[row.Topic] = [];
        grouped[row.Topic].push(row.Decision);
      });

      let summary = "**Decisions Confirmed**\n\n";
      Object.entries(grouped).forEach(([topic, decisions]) => {
        decisions.forEach(decision => {
          summary += `- **${topic}**: ${decision}\n`;
        });
      });

      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("board_meeting_notes")
        .update({ 
          decisions_summary: summary,
          decisions_summary_generated_at: new Date().toISOString(),
          decisions_summary_locked: true,
          updated_by: userData.user?.id
        })
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-meeting-notes"] });
      toast.success("Decisions summary generated and locked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate summary");
    },
  });

  const handleDecisionChange = (noteId: string, rowIndex: number, value: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const updatedTable = [...note.decision_table];
    updatedTable[rowIndex] = { ...updatedTable[rowIndex], Decision: value };
    
    updateDecisionMutation.mutate({ noteId, decisionTable: updatedTable });
    
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, decision_table: updatedTable });
    }
  };

  const exportToPdf = (note: MeetingNote) => {
    toast.info("PDF export coming soon");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BoardPageHeader title="Meeting Notes" subtitle="Board meeting agendas, memos, and decisions" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BoardPageHeader 
        title="Meeting Notes" 
        subtitle="Board meeting agendas, memos, and decisions"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Meeting Notes
          </Button>
        }
      />

      {/* Create Meeting Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Meeting</DialogTitle>
            <DialogDescription>
              Add a new meeting. You can add agenda items and notes after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Portfolio Review & Next Steps"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting_date">Meeting Date *</Label>
              <Input
                id="meeting_date"
                type="date"
                value={createForm.meeting_date}
                onChange={(e) => setCreateForm({ ...createForm, meeting_date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={createForm.start_time}
                  onChange={(e) => setCreateForm({ ...createForm, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (min)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min={15}
                  step={15}
                  value={createForm.duration_minutes}
                  onChange={(e) => setCreateForm({ ...createForm, duration_minutes: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMeeting} disabled={createNoteMutation.isPending}>
              {createNoteMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Recent Meetings</h3>
          {notes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No meeting notes yet. Create your first one.
              </CardContent>
            </Card>
          ) : (
            notes.map(note => (
              <Card 
                key={note.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedNote(note)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{note.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(note.meeting_date), "MMM d, yyyy")}
                      </div>
                    </div>
                    <Badge variant={note.status === 'active' ? 'default' : 'secondary'}>
                      {note.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Selected Note Detail */}
        <div className="lg:col-span-2 space-y-6">
          {selectedNote ? (
            <>
              {/* Header */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedNote.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {format(new Date(selectedNote.meeting_date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportToPdf(selectedNote)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </CardHeader>
              </Card>

              {/* Agenda */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Board Meeting Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedNote.agenda_items.map((item, i) => (
                      <li key={i} className="text-sm text-foreground">{item}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Memo (Collapsible) */}
              {selectedNote.memo && (
                <Collapsible open={memoOpen} onOpenChange={setMemoOpen}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">1-Page Board Memo</CardTitle>
                          {memoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        {selectedNote.memo.purpose && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Purpose</h4>
                            <p className="text-sm text-muted-foreground">{selectedNote.memo.purpose}</p>
                          </div>
                        )}
                        {selectedNote.memo.current_state && selectedNote.memo.current_state.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Current State</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {selectedNote.memo.current_state.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedNote.memo.key_questions && selectedNote.memo.key_questions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Key Questions</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {selectedNote.memo.key_questions.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedNote.memo.objective && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Objective</h4>
                            <p className="text-sm text-muted-foreground">{selectedNote.memo.objective}</p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {/* Decision Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Decision Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <DecisionTable 
                    rows={selectedNote.decision_table}
                    onDecisionChange={(rowIndex, value) => handleDecisionChange(selectedNote.id, rowIndex, value)}
                  />
                </CardContent>
              </Card>

              {/* Generate Summary Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => generateSummaryMutation.mutate(selectedNote.id)}
                  disabled={generateSummaryMutation.isPending || selectedNote.decisions_summary_locked}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Decisions Summary
                </Button>
              </div>

              {/* Decisions Summary */}
              {selectedNote.decisions_summary && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Post-Meeting Decisions Summary
                        {selectedNote.decisions_summary_locked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      {selectedNote.decisions_summary_generated_at && (
                        <span className="text-xs text-muted-foreground">
                          Generated {format(new Date(selectedNote.decisions_summary_generated_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      {selectedNote.decisions_summary.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h4 key={i} className="font-semibold text-foreground mt-0 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                        }
                        if (line.startsWith('- **')) {
                          const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                          if (match) {
                            return (
                              <p key={i} className="my-1">
                                <span className="font-medium">{match[1]}</span>: {match[2]}
                              </p>
                            );
                          }
                        }
                        return line ? <p key={i} className="my-1">{line}</p> : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Select a meeting note from the list to view details, or create a new one.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}