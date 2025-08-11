import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DaySeriesPoint {
  dateLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionWeeklyChartsProps {
  data: DaySeriesPoint[];
}

export const NutritionWeeklyCharts: React.FC<NutritionWeeklyChartsProps> = ({ data }) => {
  const categories = data.map((d) => d.dateLabel);

  const caloriesOptions: any = {
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories },
    colors: ['#10b981'],
    yaxis: { title: { text: 'kcal' } },
  };

  const macrosOptions: any = {
    chart: { type: 'bar', height: 320, stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories },
    yaxis: { title: { text: 'gramas' } },
    colors: ['#22c55e', '#f59e0b', '#ef4444'],
    legend: { position: 'top' as const },
  };

  const caloriesSeries = [{ name: 'Calorias', data: data.map((d) => Math.round(d.calories)) }];
  const macrosSeries = [
    { name: 'Proteínas', data: data.map((d) => Math.round(d.protein)) },
    { name: 'Carboidratos', data: data.map((d) => Math.round(d.carbs)) },
    { name: 'Gorduras', data: data.map((d) => Math.round(d.fat)) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm border-0">
        <CardHeader>
          <CardTitle>Calorias por dia (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactApexChart options={caloriesOptions} series={caloriesSeries} type="bar" height={300} />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-0">
        <CardHeader>
          <CardTitle>Macronutrientes por dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactApexChart options={macrosOptions} series={macrosSeries} type="bar" height={320} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionWeeklyCharts;


