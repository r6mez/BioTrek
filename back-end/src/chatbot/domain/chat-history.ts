import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { ChatMessage } from './chat-message';

export class ChatHistory {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'Space Biology Research',
    description: 'Title of the chat conversation',
  })
  title: string;

  @ApiProperty({
    type: () => User,
    description: 'User who owns this chat history',
  })
  user: User;

  @ApiProperty({
    type: () => [ChatMessage],
    description: 'Messages in this chat history',
  })
  messages?: ChatMessage[];

  @ApiProperty({
    type: Date,
    description: 'Date when the chat was created',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Date when the chat was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Date when the chat was deleted',
  })
  deletedAt: Date | null;
}



