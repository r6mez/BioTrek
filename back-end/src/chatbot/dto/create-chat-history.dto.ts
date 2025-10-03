import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatHistoryDto {
  @ApiProperty({
    example: 'Space Biology Research',
    description: 'Title of the chat conversation',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}



