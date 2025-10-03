import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber } from 'class-validator';

export class ChatbotQueryDto {
  @ApiProperty({
    description: 'The question to ask the chatbot',
    example: 'What is NASA BioTrek research about?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  query: string;

  @ApiProperty({
    description: 'Optional chat history ID to save the conversation',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  chatHistoryId?: number;
}

