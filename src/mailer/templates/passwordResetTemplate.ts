// backend/src/mailer/templates/passwordResetTemplate.ts

import { renderEmailLayout, emailParagraph, emailNote, emailButton } from './baseTemplate';

export const passwordResetTemplate = (resetUrl: string): string =>
  renderEmailLayout({
    title: 'Réinitialisation de mot de passe',
    preheader: 'Réinitialisez votre mot de passe Seranya en toute sécurité.',
    bodyHtml: `
      ${emailParagraph('Bonjour,')}
      ${emailParagraph(
        "Vous avez demandé à réinitialiser le mot de passe de votre compte Seranya. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.",
      )}
      ${emailButton(resetUrl, 'Réinitialiser mon mot de passe')}
      ${emailNote(
        "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité : votre mot de passe restera inchangé.",
      )}
    `,
  });
