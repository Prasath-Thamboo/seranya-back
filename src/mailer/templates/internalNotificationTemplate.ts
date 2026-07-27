// backend/src/mailer/templates/internalNotificationTemplate.ts
// Notifications internes (contact, alertes RGPD) : mêmes codes/logo que les emails
// utilisateurs, mais présentation en fiche de données plutôt qu'en message rédigé.

import { renderEmailLayout } from './baseTemplate';

interface NotificationField {
  label: string;
  value: string;
}

const fieldRow = ({ label, value }: NotificationField): string => `
  <tr>
    <td style="padding:8px 0; font-size:13px; color:#6b7280; vertical-align:top; white-space:nowrap;">${label}</td>
    <td style="padding:8px 0 8px 16px; font-size:14px; color:#e5e7eb;">${value}</td>
  </tr>
`;

export const internalNotificationTemplate = (
  title: string,
  fields: NotificationField[],
  message: string,
): string =>
  renderEmailLayout({
    title,
    preheader: title,
    bodyHtml: `
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        ${fields.map(fieldRow).join('')}
      </table>
      <div style="background-color:#0a0a0a; border:1px solid #1f2a1f; border-radius:8px; padding:16px;">
        <p style="font-size:14px; line-height:1.6; color:#d1d5db; margin:0; white-space:pre-line;">${message}</p>
      </div>
    `,
  });
