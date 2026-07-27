// Layout HTML commun à tous les emails Seranya : logo, charte noir/vert, pied de page.

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const LOGO_URL = `${FRONTEND_URL}/logos/seranyaicon.png`;

interface EmailLayoutOptions {
  title: string;
  preheader: string;
  bodyHtml: string;
}

export const renderEmailLayout = ({
  title,
  preheader,
  bodyHtml,
}: EmailLayoutOptions): string => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0a0a0a; font-family:'Kanit','Segoe UI',Arial,sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${preheader}</div>
    <div style="background-color:#0a0a0a; padding:32px 16px;">
      <div style="max-width:520px; margin:0 auto; background-color:#111111; border:1px solid #1f2a1f; border-radius:12px; overflow:hidden;">
        <div style="background-color:#000000; padding:24px; text-align:center; border-bottom:2px solid #4ade80;">
          <img src="${LOGO_URL}" alt="Seranya" width="120" style="display:block; margin:0 auto; border:0;" />
        </div>
        <div style="padding:32px;">
          <h1 style="font-family:'Oxanium','Segoe UI',Arial,sans-serif; color:#ffffff; font-size:22px; text-align:center; margin:0 0 24px;">${title}</h1>
          ${bodyHtml}
        </div>
        <div style="padding:20px 32px; border-top:1px solid #1f2a1f; text-align:center;">
          <p style="font-size:12px; color:#6b7280; margin:0;">© ${new Date().getFullYear()} Seranya. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  </body>
</html>
`;

export const emailParagraph = (text: string): string =>
  `<p style="font-size:15px; line-height:1.6; color:#d1d5db; margin:0 0 16px;">${text}</p>`;

export const emailNote = (text: string): string =>
  `<p style="font-size:13px; line-height:1.6; color:#6b7280; margin:24px 0 0;">${text}</p>`;

export const emailButton = (url: string, label: string): string => `
  <div style="text-align:center; margin:28px 0;">
    <a href="${url}" style="background-color:#4ade80; color:#0a0a0a; padding:14px 28px; border-radius:6px; text-decoration:none; font-size:16px; font-weight:600; display:inline-block;">
      ${label}
    </a>
  </div>
`;
