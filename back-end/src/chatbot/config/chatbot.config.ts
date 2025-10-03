import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { ChatbotConfig } from './chatbot-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  PYTHON_PATH: string;

  @IsString()
  @IsOptional()
  CHATBOT_PATH: string;

  @IsString()
  @IsOptional()
  GROQ_API_KEY: string;

  @IsNumber()
  @IsOptional()
  CHATBOT_MAX_RESPONSE_TIME: number;

  @IsBoolean()
  @IsOptional()
  CHATBOT_ENABLE_LOGGING: boolean;
}

export default registerAs<ChatbotConfig>('chatbot', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    pythonPath: process.env.PYTHON_PATH || 'python3',
    chatbotPath: process.env.CHATBOT_PATH || './chatbot',
    groqApiKey: process.env.GROQ_API_KEY || '',
    maxResponseTime: process.env.CHATBOT_MAX_RESPONSE_TIME
      ? parseInt(process.env.CHATBOT_MAX_RESPONSE_TIME, 10)
      : 30000, // 30 seconds
    enableLogging: process.env.CHATBOT_ENABLE_LOGGING === 'true',
  };
});
