import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistoryEntity } from '../entities/chat-history.entity';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { ChatHistoryRepository } from '../../chat-history.repository';
import { ChatHistory } from '../../../../domain/chat-history';
import { ChatMessage } from '../../../../domain/chat-message';
import { ChatHistoryMapper } from '../mappers/chat-history.mapper';
import { ChatMessageMapper } from '../mappers/chat-message.mapper';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class ChatHistoryRelationalRepository implements ChatHistoryRepository {
  constructor(
    @InjectRepository(ChatHistoryEntity)
    private readonly chatHistoryRepository: Repository<ChatHistoryEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly chatMessageRepository: Repository<ChatMessageEntity>,
  ) {}

  async create(
    data: Omit<ChatHistory, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ChatHistory> {
    const persistenceModel = ChatHistoryMapper.toPersistence({
      ...data,
      id: 0,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as ChatHistory);

    const newEntity = await this.chatHistoryRepository.save(
      this.chatHistoryRepository.create(persistenceModel),
    );

    return ChatHistoryMapper.toDomain(newEntity);
  }

  async findById(id: ChatHistory['id']): Promise<NullableType<ChatHistory>> {
    const entity = await this.chatHistoryRepository.findOne({
      where: { id },
      relations: ['messages', 'user'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    return entity ? ChatHistoryMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<ChatHistory[]> {
    const entities = await this.chatHistoryRepository.find({
      where: { user: { id: userId } },
      relations: ['messages'],
      order: {
        updatedAt: 'DESC',
      },
    });

    return entities.map((entity) => ChatHistoryMapper.toDomain(entity));
  }

  async update(
    id: ChatHistory['id'],
    payload: DeepPartial<ChatHistory>,
  ): Promise<ChatHistory | null> {
    const entity = await this.chatHistoryRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    // Only update simple fields to avoid type issues
    if (payload.title) {
      entity.title = payload.title;
    }

    const updatedEntity = await this.chatHistoryRepository.save(entity);

    return ChatHistoryMapper.toDomain(updatedEntity);
  }

  async remove(id: ChatHistory['id']): Promise<void> {
    await this.chatHistoryRepository.softDelete(id);
  }

  async removeAllByUserId(userId: number): Promise<void> {
    await this.chatHistoryRepository.softDelete({ user: { id: userId } });
  }

  async addMessage(
    chatHistoryId: number,
    message: Omit<ChatMessage, 'id' | 'createdAt' | 'chatHistory'>,
  ): Promise<ChatMessage> {
    const chatHistory = await this.chatHistoryRepository.findOne({
      where: { id: chatHistoryId },
    });

    if (!chatHistory) {
      throw new Error('Chat history not found');
    }

    const messageEntity = this.chatMessageRepository.create({
      ...message,
      chatHistory,
      createdAt: new Date(),
    });

    const savedMessage = await this.chatMessageRepository.save(messageEntity);

    // Update the chat history's updatedAt timestamp
    await this.chatHistoryRepository.update(chatHistoryId, {
      updatedAt: new Date(),
    });

    return ChatMessageMapper.toDomain(savedMessage);
  }
}

