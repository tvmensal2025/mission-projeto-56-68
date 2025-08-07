import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Scale, Ruler, Calculator, CheckCircle } from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WeighingReport from './WeighingReport';

const SimpleWeightForm: React.FC = () => {
  const { physicalData } = useWeightMeasurement();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    peso_kg: '',
    circunferencia_abdominal_cm: ''
  });

  const [altura, setAltura] = useState(165); // Altura padrão
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [lastMeasurement, setLastMeasurement] = useState<any>(null);

  useEffect(() => {
    // Se há dados físicos, usar a altura cadastrada
    if (physicalData?.altura_cm) {
      setAltura(physicalData.altura_cm);
    }
  }, [physicalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.peso_kg) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu peso.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Iniciando salvamento de pesagem...');

      // Garantir que dados físicos existem
      if (!physicalData) {
        console.log('Criando dados físicos padrão...');
        const { error: physicalError } = await supabase
          .from('user_physical_data')
          .upsert({
            user_id: user.id,
            altura_cm: altura,
            idade: 30, // Idade padrão
            sexo: 'masculino', // Sexo padrão
            nivel_atividade: 'moderado'
          });

        if (physicalError) {
          console.error('Erro ao criar dados físicos:', physicalError);
          throw new Error(`Erro ao criar dados físicos: ${physicalError.message}`);
        }
      }

      // Salvar pesagem - deixar o trigger calcular tudo automaticamente
      const { data: savedMeasurement, error } = await supabase
        .from('weight_measurements')
        .insert({
          user_id: user.id,
          peso_kg: parseFloat(formData.peso_kg),
          circunferencia_abdominal_cm: formData.circunferencia_abdominal_cm ? parseFloat(formData.circunferencia_abdominal_cm) : null,
          device_type: 'manual',
          notes: 'Entrada manual'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar pesagem:', error);
        throw new Error(`Erro ao salvar pesagem: ${error.message}`);
      }

      console.log('Pesagem salva com sucesso:', savedMeasurement);
      
      // Limpar formulário
      setFormData({
        peso_kg: '',
        circunferencia_abdominal_cm: ''
      });

      // Mostrar relatório detalhado
      setLastMeasurement(savedMeasurement);
      setShowReport(true);
      
      toast({
        title: "✅ Pesagem Concluída!",
        description: `Dados salvos com sucesso! Visualize o relatório completo.`,
        duration: 3000,
      });

    } catch (err) {
      console.error('Erro completo:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao salvar pesagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (weight: number) => {
    const heightInMeters = altura / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-500' };
    return { text: 'Obesidade', color: 'text-red-500' };
  };

  const currentBMI = formData.peso_kg ? calculateBMI(parseFloat(formData.peso_kg)) : null;

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Nova Pesagem Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Altura */}
            <div className="space-y-2">
              <Label htmlFor="altura" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Altura (cm)
              </Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                min="100"
                max="250"
                value={altura}
                onChange={(e) => setAltura(parseFloat(e.target.value) || 165)}
                placeholder="165"
                disabled={!!physicalData?.altura_cm}
              />
              {physicalData?.altura_cm ? (
                <p className="text-xs text-muted-foreground">
                  Altura cadastrada: {physicalData.altura_cm}cm
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Altura padrão: 165cm (será salva automaticamente)
                </p>
              )}
            </div>

            {/* Peso obrigatório */}
            <div className="space-y-2">
              <Label htmlFor="peso" className="flex items-center gap-2 text-primary">
                <Scale className="h-4 w-4" />
                Peso (kg) *
              </Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.peso_kg}
                onChange={(e) => setFormData({...formData, peso_kg: e.target.value})}
                placeholder="72.5"
                required
                className="text-lg"
              />
            </div>

            {/* Perímetro da cintura */}
            <div className="space-y-2">
              <Label htmlFor="cintura" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Perímetro da Cintura (cm)
              </Label>
              <Input
                id="cintura"
                type="number"
                step="0.1"
                min="50"
                max="150"
                value={formData.circunferencia_abdominal_cm}
                onChange={(e) => setFormData({...formData, circunferencia_abdominal_cm: e.target.value})}
                placeholder="85.5"
              />
            </div>

            {/* Preview do IMC */}
            {currentBMI && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4" />
                  <span className="font-medium">IMC Calculado</span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{currentBMI.toFixed(1)}</p>
                  <p className={`text-sm ${getBMIClassification(currentBMI).color}`}>
                    {getBMIClassification(currentBMI).text}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Salvando...' : 'Salvar Pesagem'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal com Relatório Detalhado */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Pesagem Realizada com Sucesso
            </DialogTitle>
          </DialogHeader>
          
          {lastMeasurement && (
            <>
              <WeighingReport 
                measurement={lastMeasurement} 
                physicalData={physicalData}
              />
              
              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={() => {
                    setShowReport(false);
                    window.location.reload();
                  }}
                  className="flex-1"
                >
                  Ver Gráficos Atualizados
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReport(false)}
                  className="flex-1"
                >
                  Fechar Relatório
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimpleWeightForm; 