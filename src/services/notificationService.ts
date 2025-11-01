import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export type NotificationType = 'renewal' | 'status' | 'custom';

export interface RenewalData {
  serviceName: string;
  dueDate?: string; // ISO string
  applicationId?: string;
  office?: string;
  link?: string;
  notes?: string;
}

export interface StatusData {
  serviceName: string;
  status: 'received' | 'under_review' | 'approved' | 'rejected' | 'ready_for_collection';
  applicationId?: string;
  lastUpdated?: string; // ISO
  link?: string;
  office?: string;
  etaDays?: number;
}

export async function sendRenewalReminder(toEmail: string, data: RenewalData) {
  const call = httpsCallable(functions, 'sendEmailNotification');
  const payload = { to: toEmail, type: 'renewal' as NotificationType, data };
  return call(payload);
}

export async function sendStatusUpdate(toEmail: string, data: StatusData) {
  const call = httpsCallable(functions, 'sendEmailNotification');
  const payload = { to: toEmail, type: 'status' as NotificationType, data };
  return call(payload);
}

export async function sendCustomNotification(toEmail: string, subject: string, html: string) {
  const call = httpsCallable(functions, 'sendEmailNotification');
  const payload = { to: toEmail, type: 'custom' as NotificationType, subject, html };
  return call(payload);
}
