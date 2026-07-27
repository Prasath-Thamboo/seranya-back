import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailChangeTemplate } from './templates/emailChangeTemplate';
import { confirmationTemplate } from './templates/confirmationTemplate';
import { gdprAcknowledgementTemplate } from './templates/gdprAcknowledgementTemplate';
import { internalNotificationTemplate } from './templates/internalNotificationTemplate';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MailerService {
  private transporter;

  constructor(private readonly notificationService: NotificationService) {
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
    await this.sendMail(
      to,
      'Bienvenue sur Seranya — confirmez votre inscription',
      'Merci de votre inscription sur Seranya. Confirmez votre adresse email en cliquant sur le lien suivant : ' +
        confirmationUrl,
      confirmationTemplate(confirmationUrl),
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
    const htmlContent = internalNotificationTemplate(
      'Nouveau message de contact',
      [
        { label: 'De', value: email },
        { label: 'Sujet', value: subject },
      ],
      message,
    );

    await this.sendMail(
      process.env.CONTACT_EMAIL_TO, // L'adresse qui recevra les messages de contact
      `Message de contact: ${subject}`,
      `De: ${email}\nSujet: ${subject}\n\n${message}`,
      htmlContent,
    );

    try {
      await this.notificationService.create('CONTACT', `Nouveau message de contact : ${subject}`);
    } catch (error) {
      Logger.warn(`Notification CONTACT non créée: ${error.message}`);
    }
  }

  // Demande d'exercice de droits RGPD (accès, rectification, suppression, opposition, portabilité)
  async sendDataRequest(
    name: string,
    email: string,
    requestType: string,
    message: string,
  ) {
    const htmlContent = internalNotificationTemplate(
      `Demande RGPD : ${requestType}`,
      [
        { label: 'Type de demande', value: requestType },
        { label: 'Nom', value: name },
        { label: 'Email du demandeur', value: email },
      ],
      message,
    );

    // Notification au DPO : c'est la partie qui doit faire foi de la demande.
    // Une éventuelle panne d'envoi ici doit remonter en erreur.
    await this.sendMail(
      process.env.DPO_EMAIL_TO || process.env.CONTACT_EMAIL_TO,
      `Demande RGPD (${requestType}) de ${name}`,
      `Type de demande: ${requestType}\nNom: ${name}\nEmail: ${email}\n\n${message}`,
      htmlContent,
    );

    try {
      await this.notificationService.create(
        'GDPR_REQUEST',
        `Demande RGPD (${requestType}) de ${name}`,
      );
    } catch (error) {
      Logger.warn(`Notification GDPR_REQUEST non créée: ${error.message}`);
    }

    // Accusé de réception envoyé au demandeur : preuve de la date de réception
    // pour respecter le délai légal de réponse d'un mois. Best-effort : le DPO a
    // déjà été notifié, donc un échec ici (ex. domaine d'envoi non vérifié côté
    // fournisseur mail) ne doit pas faire échouer la demande aux yeux de l'utilisateur.
    const confirmationHtml = gdprAcknowledgementTemplate(name, requestType);

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
