import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'; // Import du client SES v3
import { passwordResetTemplate } from './templates/passwordResetTemplate'; // Import du template

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    const sesClient = new SESClient({
      region: process.env.AWS_REGION, // Récupère la région depuis les variables d'environnement
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.transporter = nodemailer.createTransport({
      SES: { ses: sesClient, aws: { SendRawEmailCommand } }, // Utilisation de SES v3
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM, // L'adresse de l'expéditeur
        to,
        subject,
        text, // Texte alternatif pour les clients email sans support HTML
        html, // Contenu HTML de l'e-mail
      };

      await this.transporter.sendMail(mailOptions);
      Logger.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
      Logger.error('Error sending email:', error.stack);
      throw new Error('Failed to send email');
    }
  }

  // Fonction pour envoyer le mail de réinitialisation du mot de passe
  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/resetPassword?token=${resetToken}`;

    // Utilisation du template avec le lien de réinitialisation
    const htmlContent = passwordResetTemplate(resetUrl);

    await this.sendMail(
      to,
      'Réinitialisation de votre mot de passe',
      `Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe.`,
      htmlContent, // Utilisation du contenu HTML
    );
  }

  async sendConfirmationEmail(to: string, confirmationUrl: string) {
    const htmlContent = `
      <p>Bienvenue sur notre plateforme !</p>
      <p>Veuillez confirmer votre inscription en cliquant sur le lien suivant :</p>
      <a href="${confirmationUrl}">Confirmer mon inscription</a>
    `;

    await this.sendMail(
      to,
      'Confirmez votre inscription',
      'Veuillez confirmer votre inscription en cliquant sur le lien suivant : ' +
        confirmationUrl,
      htmlContent,
    );
  }

  // Nouvelle méthode pour envoyer le message de contact
  async sendContactMessage(email: string, subject: string, message: string) {
    const htmlContent = `
      <p><strong>De:</strong> ${email}</p>
      <p><strong>Sujet:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await this.sendMail(
      process.env.CONTACT_EMAIL_TO, // L'adresse qui recevra les messages de contact
      `Message de contact: ${subject}`,
      `De: ${email}\nSujet: ${subject}\n\n${message}`,
      htmlContent,
    );
  }
}
