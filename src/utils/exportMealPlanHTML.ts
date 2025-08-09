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

function escapeHtml(str?: string) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateMealPlanHTML(plan: MealPlanForHTML): string {
  const section = (title: string, entry?: MealEntry) => {
    if (!entry) return `<div class="card muted">${title}: não definido</div>`;
    const ings = (entry.ingredients || [])
      .map(i => `<li>${escapeHtml(i.name)} • ${Math.round(i.quantity)} ${escapeHtml(i.unit)}</li>`)
      .join('');
    return `
      <div class="card">
        <div class="card-title">${escapeHtml(title)}</div>
        <div class="item-name">${escapeHtml(entry.name)}</div>
        ${entry.calories_kcal ? `<div class="kcal">${Math.round(entry.calories_kcal)} kcal</div>` : ''}
        ${entry.homemade_measure ? `<div class="detail">Medida caseira: ${escapeHtml(entry.homemade_measure)}</div>` : ''}
        ${entry.notes ? `<div class="detail">Obs.: ${escapeHtml(entry.notes)}</div>` : ''}
        ${(entry.ingredients && entry.ingredients.length) ? `<ul class="ingredients">${ings}</ul>` : ''}
      </div>
    `;
  };

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cardápio Sofia</title>
  <style>
    :root{--bg:#0b0f1a;--panel:#121a2a;--muted:#2a3350;--text:#e6ecff;--accent:#7c3aed;--ok:#10b981}
    html,body{margin:0;padding:0;background:linear-gradient(180deg,#0b0f1a,#111827);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto}
    .wrap{max-width:900px;margin:40px auto;padding:20px}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .h-title{font-weight:700;font-size:22px;letter-spacing:.3px}
    .badge{display:inline-flex;align-items:center;gap:6px;border:1px solid #1f2a44;background:#0f172a;color:#a7b4e0;border-radius:999px;padding:4px 10px;font-size:12px}
    .badge.ok{border-color:#064e3b;color:#d1fae5;background:#052e24}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .card{background:linear-gradient(180deg,#0e1626,#0d1321);border:1px solid #202b45;border-radius:14px;padding:14px}
    .card.muted{opacity:.65}
    .card-title{font-weight:600;color:#9fb0e6;margin-bottom:6px}
    .item-name{font-size:15px;font-weight:600}
    .kcal{margin-top:4px;color:#9ae6b4;font-weight:600}
    .detail{margin-top:2px;color:#a7b4e0;font-size:13px}
    .ingredients{margin:8px 0 0 16px;color:#cdd6f4;font-size:13px}
    .footer{margin-top:14px;display:flex;gap:8px;align-items:center;color:#a7b4e0}
  </style>
  <script>function printNow(){window.print()}</script>
  </head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="h-title">Cardápio Sofia ${plan.userName ? '• '+escapeHtml(plan.userName) : ''}</div>
      <div>
        ${plan.targetCaloriesKcal ? `<span class="badge">Meta ${plan.targetCaloriesKcal} kcal</span>` : ''}
        <span class="badge">${escapeHtml(plan.dateLabel)}</span>
        <span class="badge ok" onclick="printNow()">Imprimir</span>
      </div>
    </div>
    <div class="grid">
      ${section('Café da Manhã', plan.meals.breakfast)}
      ${section('Almoço', plan.meals.lunch)}
      ${section('Café da Tarde', plan.meals.afternoon_snack)}
      ${section('Jantar', plan.meals.dinner)}
      ${section('Ceia', plan.meals.supper)}
    </div>
    <div class="footer">Gerado pela Sofia Nutricional • Instituto dos Sonhos</div>
  </div>
</body>
</html>`;
}

export function openMealPlanHTML(plan: MealPlanForHTML): void {
  const html = generateMealPlanHTML(plan);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function downloadMealPlanHTML(plan: MealPlanForHTML): void {
  const html = generateMealPlanHTML(plan);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cardapio-sofia-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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


