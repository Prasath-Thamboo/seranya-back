import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  async sendMail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
    @Body('html') html?: string,
  ) {
    await this.mailerService.sendMail(to, subject, text, html);
    return { message: 'Email sent successfully' };
  }

  @Post('contact')
  async sendContactMessage(
    @Body('email') email: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
  ) {
    try {
      await this.mailerService.sendContactMessage(email, subject, message);
      Logger.log(`Contact message sent from ${email} with subject: ${subject}`);
      return { message: 'Message envoyé avec succès.' };
    } catch (error) {
      Logger.error('Failed to send contact message:', error);
      throw new Error("Erreur lors de l'envoi du message.");
    }
  }
}
