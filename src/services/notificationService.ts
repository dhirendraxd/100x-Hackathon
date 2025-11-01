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
  if (!toEmail || !toEmail.includes('@')) {
    throw new Error('Invalid email address');
  }
  const call = httpsCallable(functions, 'sendEmailNotification');
  const payload = { to: toEmail, type: 'renewal' as NotificationType, data };
  return call(payload);
}

export async function sendStatusUpdate(toEmail: string, data: StatusData) {
  if (!toEmail || !toEmail.includes('@')) {
    throw new Error('Invalid email address');
  }
  const call = httpsCallable(functions, 'sendEmailNotification');
  const payload = { to: toEmail, type: 'status' as NotificationType, data };
  return call(payload);
}

export async function sendCustomNotification(toEmail: string, subject: string, html: string) {
  if (!toEmail || !toEmail.includes('@')) {
    throw new Error('Invalid email address');
  }
  if (!subject || !html) {
    throw new Error('Subject and HTML content are required');
  }
  const call = httpsCallable(functions, 'sendEmailNotification');
  const payload = { to: toEmail, type: 'custom' as NotificationType, subject, html };
  return call(payload);
}
