import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailChangeTemplate } from './templates/emailChangeTemplate';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
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

  async sendEmailChangeConfirmation(to: string, confirmUrl: string) {
    await this.sendMail(
      to,
      'Confirmez votre nouvelle adresse email',
      `Cliquez sur ce lien pour confirmer votre nouvelle adresse email : ${confirmUrl}`,
      emailChangeTemplate(confirmUrl),
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

  // Demande d'exercice de droits RGPD (accès, rectification, suppression, opposition, portabilité)
  async sendDataRequest(
    name: string,
    email: string,
    requestType: string,
    message: string,
  ) {
    const htmlContent = `
      <p><strong>Type de demande RGPD:</strong> ${requestType}</p>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email du demandeur:</strong> ${email}</p>
      <p><strong>Détails:</strong></p>
      <p>${message}</p>
    `;

    // Notification au DPO : c'est la partie qui doit faire foi de la demande.
    // Une éventuelle panne d'envoi ici doit remonter en erreur.
    await this.sendMail(
      process.env.DPO_EMAIL_TO || process.env.CONTACT_EMAIL_TO,
      `Demande RGPD (${requestType}) de ${name}`,
      `Type de demande: ${requestType}\nNom: ${name}\nEmail: ${email}\n\n${message}`,
      htmlContent,
    );

    // Accusé de réception envoyé au demandeur : preuve de la date de réception
    // pour respecter le délai légal de réponse d'un mois. Best-effort : le DPO a
    // déjà été notifié, donc un échec ici (ex. domaine d'envoi non vérifié côté
    // fournisseur mail) ne doit pas faire échouer la demande aux yeux de l'utilisateur.
    const confirmationHtml = `
      <p>Bonjour ${name},</p>
      <p>Nous avons bien reçu votre demande de type « ${requestType} » concernant vos données personnelles.</p>
      <p>Conformément au RGPD, nous y répondrons dans un délai maximum d'un mois.</p>
      <p>L'équipe Seranya</p>
    `;

    try {
      await this.sendMail(
        email,
        'Confirmation de réception de votre demande RGPD',
        `Bonjour ${name},\n\nNous avons bien reçu votre demande de type « ${requestType} » concernant vos données personnelles. Conformément au RGPD, nous y répondrons dans un délai maximum d'un mois.\n\nL'équipe Seranya`,
        confirmationHtml,
      );
    } catch (error) {
      Logger.warn(
        `GDPR request from ${email} recorded, but confirmation email could not be sent: ${error.message}`,
      );
    }
  }
}
