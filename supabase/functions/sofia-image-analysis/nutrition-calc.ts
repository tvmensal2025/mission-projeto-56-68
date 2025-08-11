// nutrition-calc.ts
export type Macros100g = { kcal:number; protein:number; carbs:number; fat:number; fiber?:number; sodium?:number };
export type PlateItem = { name: string; grams: number };

const DB: Record<string, Macros100g> = {
  // Cozidos / prontos (aprox. TACO)
  "arroz_branco_cozido":      { kcal:128, protein:2.5, carbs:28.2, fat:0.3, fiber:0.4, sodium:1 },
  "batata_cozida":            { kcal:77,  protein:2.0, carbs:17.1, fat:0.1, fiber:2.2, sodium:6 },
  "brocolis_cozido":          { kcal:25,  protein:2.1, carbs:4.4,  fat:0.3, fiber:3.3, sodium:22 },
  "couveflor_cozida":         { kcal:23,  protein:1.8, carbs:4.1,  fat:0.3, fiber:2.3, sodium:15 },
  "abobora_cabotia_cozida":   { kcal:48,  protein:1.4, carbs:11.7, fat:0.2, fiber:2.0, sodium:1 },
  "salada_verde":             { kcal:14,  protein:1.2, carbs:2.6,  fat:0.2, fiber:1.5, sodium:15 },

  // Proteínas
  "carne_magra_grelhada":     { kcal:222, protein:31.0, carbs:0,   fat:10.0, fiber:0,  sodium:60 }, // patinho/coxão
  "contra_file_grelhado":     { kcal:300, protein:26.0, carbs:0,   fat:21.0, fiber:0,  sodium:60 },
  "frango_grelhado":          { kcal:165, protein:31.0, carbs:0,   fat:3.6,  fiber:0,  sodium:74 },

  // Processados / compostos
  "linguica_toscana_grelhada":{ kcal:320, protein:14.0, carbs:1.5, fat:28.0, fiber:0,  sodium:900 },
  "linguica_frita":           { kcal:350, protein:14.0, carbs:2.0, fat:31.0, fiber:0,  sodium:950 },
  "farofa_tradicional":       { kcal:410, protein:2.5,  carbs:70.0, fat:12.0, fiber:5.0, sodium:390 },
  "lasanha_bolonhesa":        { kcal:160, protein:7.0,  carbs:17.0, fat:7.0,  fiber:1.5, sodium:300 },
  "queijo_mucarela":          { kcal:285, protein:22.0, carbs:2.0,  fat:21.0, fiber:0,  sodium:560 },

  // Temperos
  "oregano_seco":             { kcal:265, protein:9.0,  carbs:69.0, fat:4.3,  fiber:42, sodium:25 },

  // Prato composto exemplo (evita dupla contagem com "queijo")
  "frango_parmegiana":        { kcal:250, protein:18.0, carbs:8.0,  fat:15.0, fiber:1.0, sodium:420 } // por 100g, inclui queijo/molho
};

const ALIASES: Record<string,string> = {
  "arroz branco": "arroz_branco_cozido",
  "batata": "batata_cozida",
  "brócolis": "brocolis_cozido",
  "couve-flor": "couveflor_cozida",
  "abóbora": "abobora_cabotia_cozida",
  "salada": "salada_verde",
  "carne bovina": "carne_magra_grelhada",
  "carne": "carne_magra_grelhada",
  "contrafilé": "contra_file_grelhado",
  "frango": "frango_grelhado",
  "linguiça toscana grelhada": "linguica_toscana_grelhada",
  "linguiça frita": "linguica_frita",
  "farofa": "farofa_tradicional",
  "lasanha": "lasanha_bolonhesa",
  "queijo": "queijo_mucarela",
  "orégano": "oregano_seco",
  "frango à parmegiana": "frango_parmegiana",
  "frango a parmegiana": "frango_parmegiana"
};

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}
function resolveKey(name: string): string | null {
  const n = norm(name);
  if (DB[n]) return n;
  if (ALIASES[n] && DB[ALIASES[n]]) return ALIASES[n];
  return null;
}

export function calcNutrition(items: PlateItem[]) {
  let totals = { kcal:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0 };
  let details: Array<{name:string; grams:number; key:string; per100:Macros100g; contrib:any}> = [];
  let missing: string[] = [];
  let gramsTotal = 0;

  for (const it of items) {
    const key = resolveKey(it.name);
    const g = Number(it.grams) || 0;
    if (!key || g <= 0) { missing.push(it.name); continue; }

    const per = DB[key];
    const factor = g / 100.0;
    const c = {
      kcal: per.kcal * factor,
      protein: per.protein * factor,
      carbs: per.carbs * factor,
      fat: per.fat * factor,
      fiber: (per.fiber ?? 0) * factor,
      sodium: (per.sodium ?? 0) * factor
    };

    totals.kcal    += c.kcal;
    totals.protein += c.protein;
    totals.carbs   += c.carbs;
    totals.fat     += c.fat;
    totals.fiber   += c.fiber;
    totals.sodium  += c.sodium;
    gramsTotal     += g;

    details.push({ name: it.name, grams: g, key, per100: per, contrib: c });
  }

  // Sanity check de densidade
  const density = gramsTotal > 0 ? totals.kcal / gramsTotal : 0;
  const highEnergyPresent = details.some(d => /farofa|linguica|queijo|lasanha/.test(d.key));
  const flags:string[] = [];
  if (gramsTotal === 0) flags.push("grams_total_zero");
  if (highEnergyPresent && density < 1.2) flags.push("density_too_low_high_energy_foods");
  if (!highEnergyPresent && density < 0.35) flags.push("density_too_low_generic");

  const r1 = (n:number)=> Math.round(n*10)/10;
  const r2 = (n:number)=> Math.round(n*100)/100;
  const r3 = (n:number)=> Math.round(n*1000)/1000;

  const perGram = gramsTotal>0 ? {
    kcal: r2(totals.kcal/gramsTotal),
    protein: r3(totals.protein/gramsTotal),
    carbs:   r3(totals.carbs/gramsTotal),
    fat:     r3(totals.fat/gramsTotal),
  } : { kcal:0, protein:0, carbs:0, fat:0 };

  return {
    grams_total: gramsTotal,
    totals: {
      kcal: Math.round(totals.kcal),
      protein: r1(totals.protein),
      carbs:   r1(totals.carbs),
      fat:     r1(totals.fat),
      fiber:   r1(totals.fiber),
      sodium:  Math.round(totals.sodium)
    },
    per_gram: perGram,
    per_100g: {
      kcal: Math.round(perGram.kcal * 100),
      protein: r1(perGram.protein * 100),
      carbs:   r1(perGram.carbs * 100),
      fat:     r1(perGram.fat * 100),
    },
    flags,
    details,
    missing
  };
}


