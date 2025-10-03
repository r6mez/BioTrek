import { ApiProperty } from '@nestjs/swagger';
import { ChatHistory } from './chat-history';

export enum MessageRole {
  USER = 'user',
  AI = 'ai',
}

export class ChatMessage {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: () => ChatHistory,
    description: 'Chat history this message belongs to',
  })
  chatHistory: ChatHistory;

  @ApiProperty({
    enum: MessageRole,
    example: MessageRole.USER,
    description: 'Role of the message sender (user or ai)',
  })
  role: MessageRole;

  @ApiProperty({
    type: String,
    example: 'What is the impact of microgravity on biological systems?',
    description: 'Content of the message',
  })
  content: string;

  @ApiProperty({
    required: false,
    description: 'Additional metadata like sources, processing time, etc.',
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    type: Date,
    description: 'Date when the message was created',
  })
  createdAt: Date;
}

