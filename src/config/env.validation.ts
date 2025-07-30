import { plainToInstance, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION_TIME: string = '24h';

  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  BCRYPT_SALT_ROUNDS: number = 12;

  @IsString()
  @IsOptional()
  PADDLE_API_KEY?: string;

  @IsString()
  @IsOptional()
  PADDLE_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  PADDLE_ENVIRONMENT?: string;

  @IsString()
  FRONTEND_URL: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  OPENAI_API_KEY?: string;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLAUDE_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
