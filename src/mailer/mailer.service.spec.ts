jest.mock('nodemailer');

import * as nodemailer from 'nodemailer';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  let service: MailerService;
  let sendMail: jest.Mock;
  let notification: any;

  beforeEach(() => {
    sendMail = jest.fn().mockResolvedValue(undefined);
    jest
      .mocked(nodemailer.createTransport)
      .mockReturnValue({ sendMail } as any);
    notification = { create: jest.fn().mockResolvedValue(undefined) };
    process.env.EMAIL_FROM = 'noreply@seranya-blog.com';
    process.env.CONTACT_EMAIL_TO = 'inbox@example.com';
    process.env.DPO_EMAIL_TO = 'dpo@example.com';

    service = new MailerService(notification);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('forwards the message to the SMTP transport', async () => {
      await service.sendMail(
        'to@example.com',
        'Subject',
        'body',
        '<p>body</p>',
      );

      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@seranya-blog.com',
          to: 'to@example.com',
          subject: 'Subject',
          text: 'body',
          html: '<p>body</p>',
        }),
      );
    });

    it('wraps a transport failure into a generic error', async () => {
      sendMail.mockRejectedValue(new Error('connection refused'));

      await expect(
        service.sendMail('to@example.com', 'Subject', 'body'),
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendContactMessage', () => {
    it('emails the contact inbox and raises a CONTACT notification', async () => {
      await service.sendContactMessage(
        'visitor@example.com',
        'Hello',
        'A question',
      );

      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'inbox@example.com' }),
      );
      expect(notification.create).toHaveBeenCalledWith(
        'CONTACT',
        expect.stringContaining('Hello'),
      );
    });

    it('does not fail the request when the notification cannot be stored', async () => {
      notification.create.mockRejectedValue(new Error('db down'));

      await expect(
        service.sendContactMessage('visitor@example.com', 'Hello', 'msg'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendDataRequest', () => {
    it('notifies the DPO and records a GDPR_REQUEST notification', async () => {
      await service.sendDataRequest(
        'Bob',
        'bob@example.com',
        'suppression',
        'please erase me',
      );

      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'dpo@example.com' }),
      );
      expect(notification.create).toHaveBeenCalledWith(
        'GDPR_REQUEST',
        expect.stringContaining('suppression'),
      );
    });

    it('still resolves when the acknowledgement email to the requester fails', async () => {
      // 1st call: DPO notification succeeds. 2nd call: acknowledgement fails.
      sendMail
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('bad domain'));

      await expect(
        service.sendDataRequest('Bob', 'bob@example.com', 'accès', 'msg'),
      ).resolves.toBeUndefined();

      expect(sendMail).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendConfirmationEmail', () => {
    it('sends the welcome/confirmation email with the confirmation URL', async () => {
      await service.sendConfirmationEmail(
        'new@example.com',
        'https://site/confirm?token=abc',
      );

      const call = sendMail.mock.calls[0][0];
      expect(call.to).toBe('new@example.com');
      expect(call.text).toContain('https://site/confirm?token=abc');
    });
  });
});
