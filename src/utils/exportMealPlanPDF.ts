import jsPDF from 'jspdf';

export interface MealIngredient { name: string; quantity: number; unit: string }
export interface MealEntry { name: string; calories_kcal?: number; ingredients?: MealIngredient[]; notes?: string; homemade_measure?: string }

export interface MealPlanForPDF {
  userName?: string;
  dateLabel: string;
  targetCaloriesKcal?: number;
  meals: {
    breakfast?: MealEntry;
    lunch?: MealEntry;
    afternoon_snack?: MealEntry;
    dinner?: MealEntry;
    supper?: MealEntry;
  }
}

export async function exportMealPlanToPDF(plan: MealPlanForPDF) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;

  // Header com logo e selo
  pdf.setFillColor(16, 185, 129); // emerald
  pdf.rect(0, 0, pageWidth, 22, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('Sofia Nutricional — Sugestão de Cardápio', margin, 14);
  pdf.setFontSize(10);
  pdf.text('Sugestão de IA — não substitui avaliação profissional', pageWidth - margin, 14, { align: 'right' });

  // Info
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(12);
  pdf.text(`Usuário: ${plan.userName || '—'}`, margin, 34);
  pdf.text(`Data: ${plan.dateLabel}`, margin, 40);
  if (plan.targetCaloriesKcal) {
    pdf.text(`Meta calórica: ${plan.targetCaloriesKcal} kcal`, margin, 46);
  }

  // Tabela
  const rows = [
    ['Refeição', 'Alimento', 'Medida caseira', 'kcal', 'Observações']
  ];

  const pushMeal = (label: string, entry?: MealEntry) => {
    if (!entry) return;
    const measure = entry.homemade_measure || (entry.ingredients?.map(i => `${i.name} ${Math.round(i.quantity)}${i.unit}`).join(', ') || '—');
    rows.push([label, entry.name || '—', measure, String(entry.calories_kcal ?? '—'), entry.notes || '—']);
  };

  pushMeal('Café da manhã', plan.meals.breakfast);
  pushMeal('Almoço', plan.meals.lunch);
  pushMeal('Café da tarde', plan.meals.afternoon_snack);
  pushMeal('Jantar', plan.meals.dinner);
  pushMeal('Ceia', plan.meals.supper);

  // Render table simples
  let y = 56;
  pdf.setFontSize(11);
  rows.forEach((r, idx) => {
    const isHeader = idx === 0;
    if (isHeader) {
      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, y - 6, pageWidth - margin * 2, 8, 'F');
      pdf.setFont(undefined, 'bold');
    } else {
      pdf.setFont(undefined, 'normal');
    }
    const colW = [36, 52, 60, 16, pageWidth - margin * 2 - (36 + 52 + 60 + 16)];
    let x = margin + 2;
    r.forEach((c, i) => {
      pdf.text(String(c), x, y);
      x += colW[i];
    });
    y += 10;
  });

  // Totais
  const totalKcal = [plan.meals.breakfast, plan.meals.lunch, plan.meals.afternoon_snack, plan.meals.dinner, plan.meals.supper]
    .reduce((acc, m) => acc + (m?.calories_kcal || 0), 0);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Total diário: ${Math.round(totalKcal)} kcal${plan.targetCaloriesKcal ? ` (meta: ${plan.targetCaloriesKcal} kcal)` : ''}`, margin, y + 4);

  // Aviso legal
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text('Aviso: material educativo gerado por IA. Não substitui avaliação individualizada de nutricionista/médico.', margin, 286);

  pdf.save(`cardapio_${new Date().toISOString().split('T')[0]}.pdf`);
}


