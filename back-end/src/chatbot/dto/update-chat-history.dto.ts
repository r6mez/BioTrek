import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChatHistoryDto {
  @ApiProperty({
    example: 'Updated Chat Title',
    description: 'New title for the chat conversation',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}



