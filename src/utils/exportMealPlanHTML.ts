export interface MealIngredient { name: string; quantity: number; unit: string }
export interface MealEntry { name: string; calories_kcal?: number; ingredients?: MealIngredient[]; notes?: string; homemade_measure?: string }

export interface MealPlanForHTML {
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
  const totalKcal = [plan.meals.breakfast, plan.meals.lunch, plan.meals.afternoon_snack, plan.meals.dinner, plan.meals.supper]
    .reduce((acc, m) => acc + (m?.calories_kcal || 0), 0);

  const row = (label: string, entry?: MealEntry) => {
    if (!entry) return '';
    const measure = entry.homemade_measure || (entry.ingredients?.map(i => `${escapeHtml(i.name)} ${Math.round(i.quantity)}${escapeHtml(i.unit)}`).join(', ') || '—');
    return `
      <tr>
        <td class="cell meal">${escapeHtml(label)}</td>
        <td class="cell food">${escapeHtml(entry.name || '—')}</td>
        <td class="cell measure">${escapeHtml(measure)}</td>
        <td class="cell kcal">${entry.calories_kcal ? Math.round(entry.calories_kcal) : '—'}</td>
        <td class="cell notes">${escapeHtml(entry.notes || '—')}</td>
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
        <div class="subtitle">Sugestão de IA — não substitui avaliação profissional</div>
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
          ${row('Café da manhã', plan.meals.breakfast)}
          ${row('Almoço', plan.meals.lunch)}
          ${row('Café da tarde', plan.meals.afternoon_snack)}
          ${row('Jantar', plan.meals.dinner)}
          ${row('Ceia', plan.meals.supper)}
        </tbody>
      </table>

      <div class="totals">Total diário: ${Math.round(totalKcal)} kcal${plan.targetCaloriesKcal ? ` (meta: ${Math.round(plan.targetCaloriesKcal)} kcal)` : ''}</div>
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


