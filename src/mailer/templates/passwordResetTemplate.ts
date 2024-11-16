// spectral5.0/src/mailer/templates/passwordResetTemplate.ts

export const passwordResetTemplate = (resetUrl: string): string => `
  <div style="font-family: 'Kanit', sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <h1 style="font-family: 'Oxanium', sans-serif; color: #333333; text-align: center;">Réinitialisation du mot de passe</h1>
      <p style="font-size: 16px; color: #555555;">Bonjour,</p>
      <p style="font-size: 16px; color: #555555;">
        Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3498db; color: #ffffff; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-size: 16px;">
          Réinitialiser votre mot de passe
        </a>
      </div>
      <p style="font-size: 14px; color: #888888;">
        Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.
      </p>
    </div>
  </div>
`;
