// src/payments/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [], // Si vous avez besoin d'autres modules, importez-les ici
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
