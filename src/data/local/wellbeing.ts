import type { WellbeingEffectSource } from '../../types/game';

export interface WellbeingDelta {
  health: number;
  happiness: number;
}

export const ZERO_WELLBEING_DELTA: WellbeingDelta = {
  health: 0,
  happiness: 0,
};

export function getWellbeingEffectPerHour(source?: WellbeingEffectSource | null): WellbeingDelta {
  if (!source) {
    return ZERO_WELLBEING_DELTA;
  }

  return {
    health: Number(source.health_effect_per_hour || 0),
    happiness: Number(source.happiness_effect_per_hour || 0),
  };
}

export function sumWellbeingEffectsPerHour(sources: Array<WellbeingEffectSource | null | undefined>): WellbeingDelta {
  return sources.reduce<WellbeingDelta>(
    (total, source) => {
      const effect = getWellbeingEffectPerHour(source);

      return {
        health: total.health + effect.health,
        happiness: total.happiness + effect.happiness,
      };
    },
    { ...ZERO_WELLBEING_DELTA }
  );
}

export function calculateWellbeingDeltaForSeconds(
  source: WellbeingEffectSource | null | undefined,
  workedSeconds: number
): WellbeingDelta {
  if (!source || workedSeconds <= 0) {
    return ZERO_WELLBEING_DELTA;
  }

  const perHour = getWellbeingEffectPerHour(source);
  const ratio = workedSeconds / 3600;

  return {
    health: perHour.health * ratio,
    happiness: perHour.happiness * ratio,
  };
}
