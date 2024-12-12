import { Appointment } from '../types';

export async function sendEmailReminder(appointment: Appointment) {
  // In a real app, this would integrate with an email service
  console.log('Sending email reminder for appointment:', appointment);
}

export async function sendSMSReminder(appointment: Appointment) {
  // In a real app, this would integrate with an SMS service
  console.log('Sending SMS reminder for appointment:', appointment);
}

export async function sendReminders(appointments: Appointment[]) {
  for (const appointment of appointments) {
    if (!appointment.reminderSent && appointment.reminderType) {
      if (appointment.reminderType === 'email' || appointment.reminderType === 'both') {
        await sendEmailReminder(appointment);
      }
      if (appointment.reminderType === 'sms' || appointment.reminderType === 'both') {
        await sendSMSReminder(appointment);
      }
    }
  }
}