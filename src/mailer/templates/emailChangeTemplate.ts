// spectral5.0/src/mailer/templates/emailChangeTemplate.ts

export const emailChangeTemplate = (confirmUrl: string): string => `
  <div style="font-family: 'Kanit', sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <h1 style="font-family: 'Oxanium', sans-serif; color: #333333; text-align: center;">Confirmez votre nouvelle adresse email</h1>
      <p style="font-size: 16px; color: #555555;">Bonjour,</p>
      <p style="font-size: 16px; color: #555555;">
        Vous avez demandé à changer l'adresse email associée à votre compte Seranya. Cliquez sur le bouton ci-dessous pour confirmer cette nouvelle adresse.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmUrl}" style="background-color: #3498db; color: #ffffff; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-size: 16px;">
          Confirmer ma nouvelle adresse email
        </a>
      </div>
      <p style="font-size: 14px; color: #888888;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre adresse actuelle restera inchangée.
      </p>
    </div>
  </div>
`;
