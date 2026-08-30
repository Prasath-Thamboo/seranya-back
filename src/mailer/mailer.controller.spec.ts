import { MailerController } from './mailer.controller';

describe('MailerController', () => {
  let controller: MailerController;
  let service: any;

  beforeEach(() => {
    service = {
      sendMail: jest.fn().mockResolvedValue(undefined),
      sendContactMessage: jest.fn().mockResolvedValue(undefined),
      sendDataRequest: jest.fn().mockResolvedValue(undefined),
    };
    controller = new MailerController(service);
  });

  it('delegates a raw send and confirms success', async () => {
    const res = await controller.sendMail(
      'to@x.y',
      'Subj',
      'body',
      '<p>body</p>',
    );
    expect(service.sendMail).toHaveBeenCalledWith(
      'to@x.y',
      'Subj',
      'body',
      '<p>body</p>',
    );
    expect(res).toEqual({ message: 'Email sent successfully' });
  });

  describe('contact', () => {
    it('delegates the contact message and returns the localized confirmation', async () => {
      const res = await controller.sendContactMessage('v@x.y', 'Hi', 'msg');
      expect(service.sendContactMessage).toHaveBeenCalledWith(
        'v@x.y',
        'Hi',
        'msg',
      );
      expect(res).toEqual({ message: 'Message envoyé avec succès.' });
    });

    it('surfaces a service failure as an error', async () => {
      service.sendContactMessage.mockRejectedValue(new Error('smtp down'));
      await expect(
        controller.sendContactMessage('v@x.y', 'Hi', 'msg'),
      ).rejects.toThrow("Erreur lors de l'envoi du message.");
    });
  });

  describe('data-request (RGPD)', () => {
    it('delegates the GDPR request and returns the localized confirmation', async () => {
      const res = await controller.sendDataRequest(
        'Bob',
        'b@x.y',
        'suppression',
        'msg',
      );
      expect(service.sendDataRequest).toHaveBeenCalledWith(
        'Bob',
        'b@x.y',
        'suppression',
        'msg',
      );
      expect(res).toEqual({
        message: 'Votre demande a été envoyée avec succès.',
      });
    });

    it('surfaces a service failure as an error', async () => {
      service.sendDataRequest.mockRejectedValue(new Error('smtp down'));
      await expect(
        controller.sendDataRequest('Bob', 'b@x.y', 'accès', 'msg'),
      ).rejects.toThrow("Erreur lors de l'envoi de votre demande.");
    });
  });
});
