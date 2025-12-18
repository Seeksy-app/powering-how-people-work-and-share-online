import { useParams } from 'react-router-dom';
import { useAAR } from '@/hooks/useAAR';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Trash2 } from 'lucide-react';
import { EVENT_TYPES, AAR_STATUS, AAR_VISIBILITY } from '@/types/aar';

export default function AAREditorPage() {
  const { id } = useParams<{ id: string }>();
  const { aar, loading, saving, updateField, save, deleteAAR, completionPercentage } = useAAR(id);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{id === 'new' ? 'New AAR' : 'Edit AAR'}</h1>
          <p className="text-muted-foreground">{completionPercentage}% complete</p>
        </div>
        <div className="flex gap-2">
          {id !== 'new' && (
            <Button variant="destructive" size="icon" onClick={deleteAAR}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Event Metadata */}
        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Event Name *</Label>
              <Input value={aar.event_name || ''} onChange={e => updateField('event_name', e.target.value)} placeholder="Q4 Community Activation" />
            </div>
            <div>
              <Label>Event Type</Label>
              <Select value={aar.event_type} onValueChange={v => updateField('event_type', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Event Date</Label>
              <Input type="date" value={aar.event_date_start || ''} onChange={e => updateField('event_date_start', e.target.value)} />
            </div>
            <div>
              <Label>Venue</Label>
              <Input value={aar.location_venue || ''} onChange={e => updateField('location_venue', e.target.value)} placeholder="City Hall Plaza" />
            </div>
            <div>
              <Label>City/State</Label>
              <Input value={aar.location_city_state || ''} onChange={e => updateField('location_city_state', e.target.value)} placeholder="Austin, TX" />
            </div>
            <div>
              <Label>Hosted By</Label>
              <Input value={aar.hosted_by || ''} onChange={e => updateField('hosted_by', e.target.value)} />
            </div>
            <div>
              <Label>Prepared By</Label>
              <Input value={aar.prepared_by || ''} onChange={e => updateField('prepared_by', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card>
          <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={aar.executive_summary || ''} onChange={e => updateField('executive_summary', e.target.value)} placeholder="What happened, why it mattered, and the overall outcome..." rows={6} />
          </CardContent>
        </Card>

        {/* Wins & Impact */}
        <Card>
          <CardHeader><CardTitle>Wins & Impact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Community Impact</Label>
              <Textarea value={aar.wins_community_impact || ''} onChange={e => updateField('wins_community_impact', e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Relationship Building</Label>
              <Textarea value={aar.wins_relationship_building || ''} onChange={e => updateField('wins_relationship_building', e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Business Support</Label>
              <Textarea value={aar.wins_business_support || ''} onChange={e => updateField('wins_business_support', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Final Assessment */}
        <Card>
          <CardHeader><CardTitle>Final Assessment</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={aar.final_assessment || ''} onChange={e => updateField('final_assessment', e.target.value)} placeholder="Executive takeaway: emotional ROI, strategic value, and long-term significance..." rows={4} />
          </CardContent>
        </Card>

        {/* Status & Visibility */}
        <Card>
          <CardHeader><CardTitle>Status & Sharing</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select value={aar.status} onValueChange={v => updateField('status', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AAR_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={aar.visibility} onValueChange={v => updateField('visibility', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AAR_VISIBILITY.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={aar.is_client_facing || false} onCheckedChange={v => updateField('is_client_facing', v)} />
              <Label>Client-Facing Report</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
