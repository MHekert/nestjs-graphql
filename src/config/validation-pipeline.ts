import { ValidationPipeOptions } from '@nestjs/common';

export const validationPipeline: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
};
