import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DrVitalNutritionInsightsProps {
  userId?: string;
}

export const DrVitalNutritionInsights: React.FC<DrVitalNutritionInsightsProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string>('');
  const [weekStart, setWeekStart] = useState<string>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // segunda-feira
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  });

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = userId || auth.user?.id;
      if (!uid) return;
      const { data, error } = await supabase.functions.invoke('dr-vital-weekly-report', {
        body: { userId: uid, weekStartDate: weekStart },
      });
      if (error) throw error;
      const resultText = typeof data === 'string' ? data : (data?.analysis || data?.report || JSON.stringify(data));
      setText(resultText);
    } catch (e: any) {
      setText('Não foi possível gerar insights agora. Tente novamente mais tarde.');
      console.error('DrVitalNutritionInsights error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  return (
    <Card className="bg-white shadow-sm border-0">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-emerald-600" />
          Insights do Dr. Vital (semanais)
        </CardTitle>
        <Button size="sm" variant="outline" onClick={fetchInsights} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Gerando...' : 'Regerar'}
        </Button>
      </CardHeader>
      <CardContent>
        {text ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{text}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Sem texto gerado.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default DrVitalNutritionInsights;


