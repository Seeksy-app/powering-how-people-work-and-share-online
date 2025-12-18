import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface AARListItem {
  id: string;
  event_name: string;
  event_type: string;
  event_date_start: string | null;
  location_city_state: string | null;
  status: string;
  visibility: string;
  created_at: string;
}

export default function AARListPage() {
  const [aars, setAars] = useState<AARListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAARs();
  }, []);

  const fetchAARs = async () => {
    try {
      const { data, error } = await supabase
        .from('aars')
        .select('id, event_name, event_type, event_date_start, location_city_state, status, visibility, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAars(data || []);
    } catch (err) {
      console.error('Error fetching AARs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'review': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">After-Action Reports</h1>
          <p className="text-muted-foreground">Document impact, generate insights, share results</p>
        </div>
        <Button onClick={() => navigate('/aar/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New AAR
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-6 bg-muted rounded w-3/4" /></CardHeader>
              <CardContent><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : aars.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AARs yet</h3>
            <p className="text-muted-foreground mb-4">Create your first After-Action Report to document event impact</p>
            <Button onClick={() => navigate('/aar/new')}>Create AAR</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aars.map(aar => (
            <Link key={aar.id} to={`/aar/${aar.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{aar.event_name || 'Untitled'}</CardTitle>
                    <Badge variant="secondary" className={`${getStatusColor(aar.status)} text-white shrink-0`}>
                      {aar.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{aar.event_type.replace('_', ' ')}</Badge>
                  </div>
                  {aar.event_date_start && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(aar.event_date_start), 'MMM d, yyyy')}
                    </div>
                  )}
                  {aar.location_city_state && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {aar.location_city_state}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
