import { ApiProperty } from '@nestjs/swagger';
import { MessageRole } from '../domain/chat-message';

export class ChatMessageDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: MessageRole,
  })
  role: MessageRole;

  @ApiProperty()
  content: string;

  @ApiProperty({
    required: false,
  })
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;
}

export class ChatHistoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({
    type: () => [ChatMessageDto],
  })
  messages: ChatMessageDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ChatHistoryListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({
    description: 'Number of messages in this chat',
  })
  messageCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

