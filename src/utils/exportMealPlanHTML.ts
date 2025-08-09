export interface MealIngredient { name: string; quantity: number; unit: string }
export interface MealEntry { name: string; calories_kcal?: number; ingredients?: MealIngredient[]; notes?: string; homemade_measure?: string }

export interface MealPlanForHTML {
  userName?: string;
  dateLabel: string;
  targetCaloriesKcal?: number;
  guaranteed?: boolean;
  meals: {
    breakfast?: MealEntry;
    lunch?: MealEntry;
    afternoon_snack?: MealEntry;
    dinner?: MealEntry;
    supper?: MealEntry;
  }
}

function escapeHtml(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateMealPlanHTML(plan: MealPlanForHTML): string {
  type Nutrients = { kcal: number; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number; sodium_mg: number };

  const kcalPerGram = (name: string): Nutrients => {
    const n = name.toLowerCase();
    if (n.includes('arroz')) return { kcal: 1.3, protein_g: 0.027, fat_g: 0.003, carbs_g: 0.28, fiber_g: 0.004, sodium_mg: 0.01 };
    if (n.includes('frango')) return { kcal: 1.1, protein_g: 0.206, fat_g: 0.036, carbs_g: 0, fiber_g: 0, sodium_mg: 0.74 };
    if (n.includes('peixe')) return { kcal: 1.0, protein_g: 0.22, fat_g: 0.02, carbs_g: 0, fiber_g: 0, sodium_mg: 0.6 };
    if (n.includes('atum')) return { kcal: 1.32, protein_g: 0.29, fat_g: 0.01, carbs_g: 0, fiber_g: 0, sodium_mg: 0.37 };
    if (n.includes('ovo')) return { kcal: 1.56, protein_g: 0.126, fat_g: 0.106, carbs_g: 0.012, fiber_g: 0, sodium_mg: 1.24 };
    if (n.includes('aveia')) return { kcal: 3.89, protein_g: 0.17, fat_g: 0.07, carbs_g: 0.66, fiber_g: 0.11, sodium_mg: 0.02 };
    if (n.includes('pão') || n.includes('pao')) return { kcal: 2.6, protein_g: 0.08, fat_g: 0.03, carbs_g: 0.49, fiber_g: 0.025, sodium_mg: 5 };
    if (n.includes('banana')) return { kcal: 0.89, protein_g: 0.011, fat_g: 0.003, carbs_g: 0.23, fiber_g: 0.026, sodium_mg: 0.001 };
    if (n.includes('maç') || n.includes('maca')) return { kcal: 0.52, protein_g: 0.003, fat_g: 0.002, carbs_g: 0.14, fiber_g: 0.024, sodium_mg: 0.001 };
    if (n.includes('iogurte')) return { kcal: 0.63, protein_g: 0.035, fat_g: 0.033, carbs_g: 0.049, fiber_g: 0, sodium_mg: 0.5 };
    if (n.includes('leite')) return { kcal: 0.64, protein_g: 0.033, fat_g: 0.036, carbs_g: 0.05, fiber_g: 0, sodium_mg: 0.44 };
    if (n.includes('queijo')) return { kcal: 4, protein_g: 0.25, fat_g: 0.33, carbs_g: 0.013, fiber_g: 0, sodium_mg: 6 };
    if (n.includes('batata doce')) return { kcal: 0.86, protein_g: 0.016, fat_g: 0.001, carbs_g: 0.20, fiber_g: 0.03, sodium_mg: 0.055 };
    if (n.includes('batata')) return { kcal: 0.77, protein_g: 0.02, fat_g: 0.001, carbs_g: 0.17, fiber_g: 0.026, sodium_mg: 0.005 };
    if (n.includes('salada') || n.includes('legume')) return { kcal: 0.25, protein_g: 0.012, fat_g: 0.003, carbs_g: 0.04, fiber_g: 0.02, sodium_mg: 0.01 };
    if (n.includes('azeite')) return { kcal: 8.84, protein_g: 0, fat_g: 1.0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
    if (n.includes('molho')) return { kcal: 0.29, protein_g: 0.015, fat_g: 0.002, carbs_g: 0.05, fiber_g: 0.015, sodium_mg: 4 };
    return { kcal: 1.0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
  };

  const computeMeal = (m?: MealEntry): Nutrients => {
    if (!m) return { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
    const base = (m.ingredients || []).reduce<Nutrients>((acc, ing) => {
      const per = kcalPerGram(ing.name);
      const grams = Number(ing.quantity || 0);
      acc.kcal += per.kcal * grams;
      acc.protein_g += per.protein_g * grams;
      acc.fat_g += per.fat_g * grams;
      acc.carbs_g += per.carbs_g * grams;
      acc.fiber_g += per.fiber_g * grams;
      acc.sodium_mg += per.sodium_mg * grams;
      return acc;
    }, { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 });
    if (m.calories_kcal && base.kcal === 0) base.kcal = m.calories_kcal;
    return base;
  };

  const breakfastN = computeMeal(plan.meals.breakfast);
  const lunchN = computeMeal(plan.meals.lunch);
  const snackN = computeMeal(plan.meals.afternoon_snack);
  const dinnerN = computeMeal(plan.meals.dinner);
  const supperN = computeMeal(plan.meals.supper);

  const total: Nutrients = {
    kcal: breakfastN.kcal + lunchN.kcal + snackN.kcal + dinnerN.kcal + supperN.kcal,
    protein_g: breakfastN.protein_g + lunchN.protein_g + snackN.protein_g + dinnerN.protein_g + supperN.protein_g,
    fat_g: breakfastN.fat_g + lunchN.fat_g + snackN.fat_g + dinnerN.fat_g + supperN.fat_g,
    carbs_g: breakfastN.carbs_g + lunchN.carbs_g + snackN.carbs_g + dinnerN.carbs_g + supperN.carbs_g,
    fiber_g: breakfastN.fiber_g + lunchN.fiber_g + snackN.fiber_g + dinnerN.fiber_g + supperN.fiber_g,
    sodium_mg: breakfastN.sodium_mg + lunchN.sodium_mg + snackN.sodium_mg + dinnerN.sodium_mg + supperN.sodium_mg,
  };

  const macros = (n: Nutrients) => `Prot ${Math.round(n.protein_g)} g • Carb ${Math.round(n.carbs_g)} g • Gord ${Math.round(n.fat_g)} g • Fibra ${Math.round(n.fiber_g)} g`;

  const row = (label: string, entry?: MealEntry, n?: Nutrients) => {
    if (!entry) return '';
    const measure = entry.homemade_measure || (entry.ingredients?.map(i => `${escapeHtml(i.name)} ${Math.round(i.quantity)}${escapeHtml(i.unit)}`).join(', ') || '—');
    return `
      <tr>
        <td class="cell meal">${escapeHtml(label)}</td>
        <td class="cell food">${escapeHtml(entry.name || '—')}</td>
        <td class="cell measure">${escapeHtml(measure)}</td>
        <td class="cell kcal">${Math.round(n?.kcal || entry.calories_kcal || 0)}</td>
        <td class="cell notes">${escapeHtml(entry.notes || '—')}</td>
      </tr>
      <tr>
        <td></td>
        <td colspan="4" class="cell" style="color:#6b7280;font-size:12px;padding-top:4px;">${macros(n || computeMeal(entry))}</td>
      </tr>
    `;
  };

  const html = `<!doctype html>
  <html lang="pt-br">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cardápio — Sofia Nutricional</title>
    <style>
      :root { --emerald:#10B981; --bg:#ffffff; --muted:#f3f4f6; --text:#111827; --sub:#6b7280; }
      body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background:var(--bg); color:var(--text); }
      .header { background:var(--emerald); color:#fff; padding:20px 24px; }
      .title { margin:0; font-size:20px; font-weight:700; }
      .subtitle { margin-top:4px; font-size:12px; opacity:.9 }
      .container { max-width:920px; margin:0 auto; padding:16px 24px 48px; }
      .info { display:flex; gap:24px; flex-wrap:wrap; margin:16px 0 12px; }
      .tag { background:var(--muted); color:var(--sub); border-radius:8px; padding:6px 10px; font-size:12px; }
      table { width:100%; border-collapse:separate; border-spacing:0; margin-top:16px; }
      thead th { text-align:left; font-size:12px; color:var(--sub); background:var(--muted); padding:10px 12px; }
      tr:nth-child(even) { background:#fafafa; }
      .cell { padding:12px; font-size:14px; vertical-align:top; border-bottom:1px solid #eee; }
      .meal { width:140px; font-weight:600; }
      .food { width:240px; }
      .measure { color:var(--sub); }
      .kcal { width:80px; text-align:right; font-variant-numeric: tabular-nums; }
      .notes { color:var(--sub); }
      .totals { margin-top:16px; font-weight:700; }
      .legal { margin-top:28px; color:var(--sub); font-size:12px; }
      .footer { margin-top:36px; display:flex; justify-content:space-between; color:var(--sub); font-size:12px; }
      @media print { .print-hide { display:none; } body { background:#fff; } }
      .btn { display:inline-block; border:1px solid var(--emerald); color:var(--emerald); padding:8px 12px; border-radius:8px; text-decoration:none; font-size:14px; }
      .btn:hover { background:rgba(16,185,129,.06); }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="container">
        <h1 class="title">Sofia Nutricional — Sugestão de Cardápio</h1>
        <div class="subtitle">${plan.guaranteed ? 'Garantido ✓ metas atendidas' : 'Sugestão de IA — não substitui avaliação profissional'}</div>
      </div>
    </div>
    <div class="container">
      <div class="info">
        <div class="tag">Usuário: ${escapeHtml(plan.userName || '—')}</div>
        <div class="tag">Data: ${escapeHtml(plan.dateLabel)}</div>
        ${plan.targetCaloriesKcal ? `<div class="tag">Meta: ${Math.round(plan.targetCaloriesKcal)} kcal</div>` : ''}
        <div class="print-hide" style="margin-left:auto;">
          <a class="btn" href="#" onclick="window.print();return false;">Imprimir</a>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Refeição</th>
            <th>Alimento</th>
            <th>Medida caseira / Ingredientes</th>
            <th style="text-align:right">kcal</th>
            <th>Obs.</th>
          </tr>
        </thead>
        <tbody>
          ${row('Café da manhã', plan.meals.breakfast, breakfastN)}
          ${row('Almoço', plan.meals.lunch, lunchN)}
          ${row('Café da tarde', plan.meals.afternoon_snack, snackN)}
          ${row('Jantar', plan.meals.dinner, dinnerN)}
          ${row('Ceia', plan.meals.supper, supperN)}
        </tbody>
      </table>

      <div class="totals">Total diário: ${Math.round(total.kcal)} kcal${plan.targetCaloriesKcal ? ` (meta: ${Math.round(plan.targetCaloriesKcal)} kcal)` : ''}</div>
      <div class="totals" style="color:#6b7280;font-weight:500;">${macros(total)}</div>
      <div class="legal">Aviso: material educativo gerado por IA. Valores nutricionais são estimativas e podem variar por marca/porção.</div>

      <div class="footer">
        <div>Instituto dos Sonhos</div>
        <div>Sofia Nutricional</div>
      </div>
    </div>
  </body>
  </html>`;

  return html;
}

export function openMealPlanHTML(plan: MealPlanForHTML) {
  const html = generateMealPlanHTML(plan);
  const w = window.open('', '_blank');
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}

export function downloadMealPlanHTML(plan: MealPlanForHTML) {
  const html = generateMealPlanHTML(plan);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cardapio_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


