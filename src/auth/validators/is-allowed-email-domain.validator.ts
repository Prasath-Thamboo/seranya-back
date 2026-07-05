import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'outlook.fr',
  'hotmail.com',
  'hotmail.fr',
  'live.com',
  'live.fr',
  'yahoo.com',
  'yahoo.fr',
  'icloud.com',
  'protonmail.com',
  'orange.fr',
  'free.fr',
  'laposte.net',
  'sfr.fr',
  'wanadoo.fr',
  'gmx.com',
  'aol.com',
];

@ValidatorConstraint({ name: 'isAllowedEmailDomain', async: false })
class IsAllowedEmailDomainConstraint implements ValidatorConstraintInterface {
  validate(email: unknown) {
    if (typeof email !== 'string' || !email.includes('@')) return false;
    const domain = email.split('@').pop()?.toLowerCase();
    return !!domain && ALLOWED_EMAIL_DOMAINS.includes(domain);
  }

  defaultMessage() {
    return `L'email doit provenir d'un fournisseur reconnu (${ALLOWED_EMAIL_DOMAINS.join(', ')}).`;
  }
}

export function IsAllowedEmailDomain(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAllowedEmailDomainConstraint,
    });
  };
}
