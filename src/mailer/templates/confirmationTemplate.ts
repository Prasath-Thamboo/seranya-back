// backend/src/mailer/templates/confirmationTemplate.ts

import { renderEmailLayout, emailParagraph, emailNote, emailButton } from './baseTemplate';

export const confirmationTemplate = (confirmationUrl: string): string =>
  renderEmailLayout({
    title: 'Bienvenue sur Seranya',
    preheader: 'Confirmez votre inscription pour activer votre compte Seranya.',
    bodyHtml: `
      ${emailParagraph('Bonjour,')}
      ${emailParagraph(
        "Merci de votre inscription sur Seranya. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.",
      )}
      ${emailButton(confirmationUrl, 'Confirmer mon inscription')}
      ${emailNote(
        "Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail.",
      )}
    `,
  });
