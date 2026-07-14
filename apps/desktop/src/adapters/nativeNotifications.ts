import { decideReminderDelivery, type ReminderDeliveryReason } from '@attentionos/guidance';
import { isTauri } from '@tauri-apps/api/core';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import { queuePersistAppState } from './storage/persistence';
import { readReminderSettings } from './storage/reminderSettings';
import { recordMalformedStorageEntry } from './storage/storageRecovery';

export const NATIVE_REMINDER_DELIVERY_STORAGE_KEY = 'attentionos.nativeReminderDelivery.v1';

const REMINDER_CHECK_INTERVAL_MS = 60_000;
const REMINDER_NOTIFICATION = {
  body: 'Pause, review your current focus, and choose the next intentional action.',
  title: 'Attention check-in',
} as const;

export type NativeReminderPermissionResult = 'denied' | 'granted' | 'unavailable';
export type NativeReminderDeliveryStatus =
  | Exclude<ReminderDeliveryReason, 'eligible'>
  | 'delivered'
  | 'failed'
  | 'permission-not-granted'
  | 'unavailable';

export interface NativeReminderDeliveryResult {
  readonly status: NativeReminderDeliveryStatus;
}

interface NativeReminderDeliveryState {
  readonly deliveredToday: number;
  readonly lastDeliveredAt: string | null;
  readonly localDate: string;
}

export interface NativeNotificationDependencies {
  readonly isPermissionGranted: () => Promise<boolean>;
  readonly isTauri: () => boolean;
  readonly requestPermission: () => Promise<NotificationPermission>;
  readonly sendNotification: (notification: {
    readonly body: string;
    readonly title: string;
  }) => void;
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function emptyDeliveryState(now: Date): NativeReminderDeliveryState {
  return {
    deliveredToday: 0,
    lastDeliveredAt: null,
    localDate: localDateKey(now),
  };
}

function readDeliveryState(now: Date): NativeReminderDeliveryState {
  const raw = localStorage.getItem(NATIVE_REMINDER_DELIVERY_STORAGE_KEY);
  if (!raw) return emptyDeliveryState(now);

  try {
    const parsed = JSON.parse(raw) as Partial<NativeReminderDeliveryState>;
    const currentLocalDate = localDateKey(now);
    return {
      deliveredToday:
        parsed.localDate === currentLocalDate && Number.isFinite(parsed.deliveredToday)
          ? Math.max(0, Number(parsed.deliveredToday))
          : 0,
      lastDeliveredAt: typeof parsed.lastDeliveredAt === 'string' ? parsed.lastDeliveredAt : null,
      localDate: currentLocalDate,
    };
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Resetting the native reminder delivery counter without changing preferences.',
      payload: raw,
      storageKey: NATIVE_REMINDER_DELIVERY_STORAGE_KEY,
    });
    return emptyDeliveryState(now);
  }
}

function recordDelivery(state: NativeReminderDeliveryState, now: Date): void {
  localStorage.setItem(
    NATIVE_REMINDER_DELIVERY_STORAGE_KEY,
    JSON.stringify({
      deliveredToday: state.deliveredToday + 1,
      lastDeliveredAt: now.toISOString(),
      localDate: localDateKey(now),
    } satisfies NativeReminderDeliveryState),
  );
  queuePersistAppState();
}

export function createNativeReminderAdapter(dependencies: NativeNotificationDependencies) {
  let deliveryQueue: Promise<void> = Promise.resolve();

  async function deliverOnce(now: Date): Promise<NativeReminderDeliveryResult> {
    const settings = readReminderSettings();
    const state = readDeliveryState(now);
    const decision = decideReminderDelivery({
      deliveredToday: state.deliveredToday,
      lastDeliveredAt: state.lastDeliveredAt,
      now,
      settings,
    });

    if (!decision.eligible) return { status: decision.reason };
    if (!dependencies.isTauri()) return { status: 'unavailable' };

    try {
      if (!(await dependencies.isPermissionGranted())) {
        return { status: 'permission-not-granted' };
      }

      dependencies.sendNotification(REMINDER_NOTIFICATION);
      recordDelivery(state, now);
      return { status: 'delivered' };
    } catch {
      return { status: 'failed' };
    }
  }

  return {
    async requestPermissionFromUser(): Promise<NativeReminderPermissionResult> {
      if (!dependencies.isTauri()) return 'unavailable';

      try {
        if (await dependencies.isPermissionGranted()) return 'granted';
        return (await dependencies.requestPermission()) === 'granted' ? 'granted' : 'denied';
      } catch {
        return 'unavailable';
      }
    },

    deliverDueReminder(now = new Date()): Promise<NativeReminderDeliveryResult> {
      const delivery = deliveryQueue.then(
        () => deliverOnce(now),
        () => deliverOnce(now),
      );
      deliveryQueue = delivery.then(
        () => undefined,
        () => undefined,
      );
      return delivery;
    },
  };
}

const nativeReminderAdapter = createNativeReminderAdapter({
  isPermissionGranted,
  isTauri,
  requestPermission,
  sendNotification,
});

export function requestNativeReminderPermission(): Promise<NativeReminderPermissionResult> {
  return nativeReminderAdapter.requestPermissionFromUser();
}

export function deliverDueNativeReminder(now = new Date()): Promise<NativeReminderDeliveryResult> {
  return nativeReminderAdapter.deliverDueReminder(now);
}

export function startNativeReminderDelivery(): () => void {
  let deliveryInFlight = false;

  async function checkDelivery() {
    if (deliveryInFlight) return;
    deliveryInFlight = true;
    try {
      await deliverDueNativeReminder();
    } finally {
      deliveryInFlight = false;
    }
  }

  void checkDelivery();
  const interval = window.setInterval(() => void checkDelivery(), REMINDER_CHECK_INTERVAL_MS);
  return () => window.clearInterval(interval);
}
