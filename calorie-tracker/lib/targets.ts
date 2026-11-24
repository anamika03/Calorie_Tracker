export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Tier = "cut" | "maintain" | "bulk";

export interface ProfileInput {
  sex: Sex; age: number; heightCm: number; weightKg: number; activity: Activity; tier: Tier;
}

export const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: "Sedentary (desk job, little exercise)",
  light: "Light (1–3 workouts / week)",
  moderate: "Moderate (3–5 workouts / week)",
  active: "Active (6–7 workouts / week)",
  very_active: "Very active (2× a day / physical job)",
};

export const TIER_OFFSETS: Record<Tier, number> = { cut: -500, maintain: 0, bulk: 300 };
export const TIER_LABELS: Record<Tier, string> = {
  cut: "Cut — lose fat", maintain: "Maintain — recomp", bulk: "Bulk — build muscle",
};
export const PROTEIN_PER_KG: Record<Tier, number> = { cut: 1.6, maintain: 1.6, bulk: 2.0 };
export const WATER_ML_PER_KG = 35;

/** Mifflin-St Jeor basal metabolic rate. */
export function bmr(p: Pick<ProfileInput, "sex" | "age" | "heightCm" | "weightKg">): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "male" ? base + 5 : base - 161;
}

export function targets(p: ProfileInput) {
  const tdee = bmr(p) * ACTIVITY_FACTORS[p.activity];
  return {
    kcal: Math.round(tdee + TIER_OFFSETS[p.tier]),
    protein: Math.round(p.weightKg * PROTEIN_PER_KG[p.tier]),
    waterMl: Math.round((p.weightKg * WATER_ML_PER_KG) / 50) * 50,
  };
}
