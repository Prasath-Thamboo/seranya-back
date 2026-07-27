// backend/src/mailer/templates/emailChangeTemplate.ts

import { renderEmailLayout, emailParagraph, emailNote, emailButton } from './baseTemplate';

export const emailChangeTemplate = (confirmUrl: string): string =>
  renderEmailLayout({
    title: 'Confirmez votre nouvelle adresse email',
    preheader: 'Confirmez le changement d’adresse email de votre compte Seranya.',
    bodyHtml: `
      ${emailParagraph('Bonjour,')}
      ${emailParagraph(
        "Vous avez demandé à changer l'adresse email associée à votre compte Seranya. Cliquez sur le bouton ci-dessous pour confirmer cette nouvelle adresse.",
      )}
      ${emailButton(confirmUrl, 'Confirmer ma nouvelle adresse email')}
      ${emailNote(
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre adresse actuelle restera inchangée.",
      )}
    `,
  });
