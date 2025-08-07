import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Edit2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
}

interface SofiaConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  detectedFoods: string[];
  userName: string;
  userId: string;
  onConfirmation: (response: string, calories?: number) => void;
}

const SofiaConfirmationModal: React.FC<SofiaConfirmationModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  detectedFoods,
  userName,
  userId,
  onConfirmation
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(
    detectedFoods.map(food => ({
      name: food,
      quantity: getEstimatedQuantity(food),
      unit: getUnit(food)
    }))
  );
  const [newFood, setNewFood] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Função para estimar quantidade baseada no alimento
  function getEstimatedQuantity(food: string): number {
    const foodLower = food.toLowerCase();
    
    // Líquidos - estimativas em ml
    if (foodLower.includes('suco') || foodLower.includes('água') || 
        foodLower.includes('leite') || foodLower.includes('café') ||
        foodLower.includes('chá') || foodLower.includes('refrigerante')) {
      return 200;
    }
    
    // Carnes e proteínas
    if (foodLower.includes('frango') || foodLower.includes('carne') ||
        foodLower.includes('peixe') || foodLower.includes('porco') ||
        foodLower.includes('bife')) {
      return 100;
    }
    
    // Cereais e grãos
    if (foodLower.includes('arroz') || foodLower.includes('macarrão') ||
        foodLower.includes('massa') || foodLower.includes('quinoa')) {
      return 120;
    }
    
    // Leguminosas
    if (foodLower.includes('feijão') || foodLower.includes('lentilha') ||
        foodLower.includes('grão') || foodLower.includes('ervilha')) {
      return 90;
    }
    
    // Verduras e legumes
    if (foodLower.includes('salada') || foodLower.includes('alface') ||
        foodLower.includes('tomate') || foodLower.includes('cenoura') ||
        foodLower.includes('brócolis')) {
      return 80;
    }
    
    // Frutas
    if (foodLower.includes('banana') || foodLower.includes('maçã') ||
        foodLower.includes('laranja') || foodLower.includes('fruta')) {
      return 150;
    }
    
    // Batata e tubérculos
    if (foodLower.includes('batata') || foodLower.includes('mandioca') ||
        foodLower.includes('inhame')) {
      return 100;
    }
    
    // Pães e similares
    if (foodLower.includes('pão') || foodLower.includes('torrada') ||
        foodLower.includes('biscoito')) {
      return 50;
    }
    
    // Default para sólidos
    return 100;
  }

  // Função para determinar a unidade baseada no alimento
  function getUnit(food: string): string {
    const foodLower = food.toLowerCase();
    
    // Líquidos usam ml
    if (foodLower.includes('suco') || foodLower.includes('água') || 
        foodLower.includes('leite') || foodLower.includes('café') ||
        foodLower.includes('chá') || foodLower.includes('refrigerante')) {
      return 'ml';
    }
    
    // Sólidos usam g
    return 'g';
  }

  const handleAddFood = () => {
    if (newFood.trim()) {
      const newItem: FoodItem = {
        name: newFood.trim(),
        quantity: getEstimatedQuantity(newFood.trim()),
        unit: getUnit(newFood.trim())
      };
      setFoodItems([...foodItems, newItem]);
      setNewFood('');
    }
  };

  const handleRemoveFood = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: string) => {
    const quantity = parseFloat(newQuantity) || 0;
    if (quantity >= 0) {
      setFoodItems(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ));
    }
  };

  const handleConfirm = async (confirmed: boolean) => {
    setIsLoading(true);
    
    try {
      const requestBody = {
        analysisId,
        confirmed: confirmed && isCorrect !== false,
        userId,
        userCorrections: !confirmed || isCorrect === false ? {
          alimentos: foodItems.map(item => item.name),
          quantities: foodItems.reduce((acc, item, index) => {
            acc[item.name] = { quantity: item.quantity, unit: item.unit };
            return acc;
          }, {} as Record<string, { quantity: number; unit: string }>)
        } : null
      };

      console.log('🔄 Enviando confirmação:', requestBody);

      const { data, error } = await supabase.functions.invoke('sofia-food-confirmation', {
        body: requestBody
      });

      if (error) {
        console.error('❌ Erro na confirmação:', error);
        toast.error('Erro ao processar confirmação');
        return;
      }

      console.log('✅ Confirmação processada:', data);

      if (data.success) {
        onConfirmation(data.sofia_response, data.estimated_calories);
        toast.success('✅ Análise confirmada pela Sofia!');
        onClose();
      } else {
        toast.error('Erro na confirmação');
      }
    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast.error('Erro ao processar confirmação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">🤔</span>
            Confirmação da Sofia
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Oi {userName}! Identifiquei estes alimentos:
            </p>
          </div>

          <Card>
            <CardContent className="p-3 space-y-3">
              {foodItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="flex-1 justify-start min-w-0">
                      • {item.name}
                    </Badge>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        placeholder={item.quantity ? '' : 'Digite a quantidade'}
                        className="w-16 h-8 text-xs text-center"
                        min="0"
                        step="0.1"
                      />
                      <span className="text-xs text-gray-500 min-w-[20px]">
                        {item.unit}
                      </span>
                    </div>
                    {isCorrect === false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFood(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {isCorrect === false && (
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Adicionar alimento..."
                    value={newFood}
                    onChange={(e) => setNewFood(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFood()}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddFood}
                    className="px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm font-medium mb-3">
              Esses alimentos estão corretos?
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setIsCorrect(true);
                  handleConfirm(true);
                }}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                ✅ Está certo
              </Button>
              
              <Button
                onClick={() => {
                  if (isCorrect === false) {
                    handleConfirm(false);
                  } else {
                    setIsCorrect(false);
                  }
                }}
                disabled={isLoading}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                {isCorrect === false ? (
                  <>
                    <Check className="h-4 w-4" />
                    Confirmar correções
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    ❌ Está errado
                  </>
                )}
              </Button>
            </div>
          </div>

          {isCorrect === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 text-center">
                💡 Edite a lista acima removendo alimentos incorretos ou adicionando os que faltam
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SofiaConfirmationModal;