import type { PrivacyLevel } from '@attentionos/core';

export interface SanitizeForModelInput {
  readonly text: string;
  readonly privacyLevel?: PrivacyLevel;
  readonly target: 'external' | 'local';
}

export interface SanitizedText {
  readonly text: string;
  readonly privacyLevel: PrivacyLevel;
  readonly redactions: readonly string[];
}

export interface PrivacyGateway {
  classifyText(text: string): PrivacyLevel;
  sanitizeForModel(input: SanitizeForModelInput): SanitizedText;
}

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const EMAIL_TEST_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const PHONE_TEST_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const NEVER_PROCESS_RE =
  /\b(password vault|private key|seed phrase|raw password|credential dump)\b/i;

function redact(text: string): { text: string; redactions: string[] } {
  const redactions: string[] = [];
  let output = text.replace(EMAIL_RE, () => {
    redactions.push('email');
    return '[redacted:email]';
  });

  output = output.replace(PHONE_RE, () => {
    redactions.push('phone');
    return '[redacted:phone]';
  });

  return { text: output, redactions };
}

export function createPrivacyGateway(): PrivacyGateway {
  return {
    classifyText(text) {
      if (NEVER_PROCESS_RE.test(text)) return 'L3';
      if (EMAIL_TEST_RE.test(text) || PHONE_TEST_RE.test(text)) return 'L1';
      return 'L0';
    },

    sanitizeForModel(input) {
      const privacyLevel = input.privacyLevel ?? this.classifyText(input.text);

      if (privacyLevel === 'L3') {
        throw new Error('L3 never-process context cannot be sent to any model');
      }

      if (privacyLevel === 'L2' && input.target === 'external') {
        throw new Error('L2 local-only context cannot be sent to external models');
      }

      if (privacyLevel === 'L1' && input.target === 'external') {
        const redacted = redact(input.text);
        return { text: redacted.text, privacyLevel, redactions: redacted.redactions };
      }

      return { text: input.text, privacyLevel, redactions: [] };
    },
  };
}
