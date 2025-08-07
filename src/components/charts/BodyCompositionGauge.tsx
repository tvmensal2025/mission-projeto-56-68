import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BodyCompositionGaugeProps {
  percentualGordura: number;
  massaGorda: number;
  massaMagra: number;
  peso: number;
  idade: number;
  sexo: 'M' | 'F';
  classificacao: string;
}

export const BodyCompositionGauge: React.FC<BodyCompositionGaugeProps> = ({
  percentualGordura,
  massaGorda,
  massaMagra,
  peso,
  idade,
  sexo,
  classificacao
}) => {
  // Configuração do gauge circular
  const options = {
    chart: {
      type: 'radialBar' as const,
      height: 350,
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          margin: 0,
          size: '70%',
          background: '#fff',
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: 'front' as const,
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24
          }
        },
        track: {
          background: '#fff',
          strokeWidth: '67%',
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35
          }
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: '#888',
            fontSize: '17px'
          },
          value: {
            formatter: function(val: number) {
              return val.toFixed(1) + '%';
            },
            color: '#111',
            fontSize: '36px',
            show: true
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#22c55e'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    labels: ['Gordura Corporal'],
    colors: ['#ef4444']
  };

  // Determinar classificação da composição corporal
  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'atlético':
      case 'excelente':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fitness':
      case 'bom':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'aceitável':
      case 'regular':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'obeso':
      case 'alto':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Composição Corporal</CardTitle>
          <Badge className={getClassificationColor(classificacao)}>
            {classificacao}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ReactApexChart
              options={options}
              series={[percentualGordura]}
              type="radialBar" as const
              height={350}
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {massaGorda.toFixed(1)} kg
              </div>
              <div className="text-sm text-gray-600">Massa Gorda</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {massaMagra.toFixed(1)} kg
              </div>
              <div className="text-sm text-gray-600">Massa Magra</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {peso.toFixed(1)} kg
              </div>
              <div className="text-sm text-gray-600">Peso Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};