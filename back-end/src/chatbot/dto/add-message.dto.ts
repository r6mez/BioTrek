import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { MessageRole } from '../domain/chat-message';

export class AddMessageDto {
  @ApiProperty({
    enum: MessageRole,
    example: MessageRole.USER,
  })
  @IsEnum(MessageRole)
  @IsNotEmpty()
  role: MessageRole;

  @ApiProperty({
    example: 'What is the impact of microgravity on biological systems?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    required: false,
    description: 'Additional metadata like sources, processing time, etc.',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

