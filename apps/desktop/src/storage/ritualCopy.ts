export const RITUAL_COPY_STORAGE_KEY = 'attentionos.ritualCopy.v1';

export interface RitualCopy {
  readonly intentionText: string;
  readonly dedicationText: string;
}

export const DEFAULT_RITUAL_COPY: RitualCopy = {
  intentionText:
    'Settle your attention and name the intention you want to carry into the next work block.',
  dedicationText:
    'Dedicate this session to the work that matters, then step into the wider view when you are ready.',
};

function isRitualCopy(value: unknown): value is Partial<RitualCopy> {
  return typeof value === 'object' && value !== null;
}

function readConfiguredCopy(): Partial<RitualCopy> {
  const raw = localStorage.getItem(RITUAL_COPY_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return isRitualCopy(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function readRitualCopy(): RitualCopy {
  const configuredCopy = readConfiguredCopy();

  return {
    intentionText:
      typeof configuredCopy.intentionText === 'string' && configuredCopy.intentionText.trim()
        ? configuredCopy.intentionText.trim()
        : DEFAULT_RITUAL_COPY.intentionText,
    dedicationText:
      typeof configuredCopy.dedicationText === 'string' && configuredCopy.dedicationText.trim()
        ? configuredCopy.dedicationText.trim()
        : DEFAULT_RITUAL_COPY.dedicationText,
  };
}
