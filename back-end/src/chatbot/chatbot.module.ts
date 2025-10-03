import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ConfigModule } from '@nestjs/config';
import chatbotConfig from './config/chatbot.config';
import { ChatHistoryEntity } from './infrastructure/persistence/relational/entities/chat-history.entity';
import { ChatMessageEntity } from './infrastructure/persistence/relational/entities/chat-message.entity';
import { ChatHistoryRepository } from './infrastructure/persistence/chat-history.repository';
import { ChatHistoryRelationalRepository } from './infrastructure/persistence/relational/repositories/chat-history.repository';

@Module({
  imports: [
    ConfigModule.forFeature(chatbotConfig),
    TypeOrmModule.forFeature([ChatHistoryEntity, ChatMessageEntity]),
  ],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    {
      provide: ChatHistoryRepository,
      useClass: ChatHistoryRelationalRepository,
    },
  ],
  exports: [ChatbotService],
})
export class ChatbotModule {}

