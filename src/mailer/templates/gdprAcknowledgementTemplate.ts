// backend/src/mailer/templates/gdprAcknowledgementTemplate.ts

import { renderEmailLayout, emailParagraph } from './baseTemplate';

export const gdprAcknowledgementTemplate = (
  name: string,
  requestType: string,
): string =>
  renderEmailLayout({
    title: 'Demande RGPD bien reçue',
    preheader: 'Nous avons bien reçu votre demande concernant vos données personnelles.',
    bodyHtml: `
      ${emailParagraph(`Bonjour ${name},`)}
      ${emailParagraph(
        `Nous avons bien reçu votre demande de type « ${requestType} » concernant vos données personnelles.`,
      )}
      ${emailParagraph(
        "Conformément au RGPD, nous y répondrons dans un délai maximum d'un mois.",
      )}
      ${emailParagraph("L'équipe Seranya")}
    `,
  });
