import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { ChatHistory } from '../../domain/chat-history';
import { ChatMessage } from '../../domain/chat-message';

export abstract class ChatHistoryRepository {
  abstract create(
    data: Omit<ChatHistory, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ChatHistory>;

  abstract findById(id: ChatHistory['id']): Promise<NullableType<ChatHistory>>;

  abstract findByUserId(userId: number): Promise<ChatHistory[]>;

  abstract update(
    id: ChatHistory['id'],
    payload: DeepPartial<ChatHistory>,
  ): Promise<ChatHistory | null>;

  abstract remove(id: ChatHistory['id']): Promise<void>;

  abstract removeAllByUserId(userId: number): Promise<void>;

  abstract addMessage(
    chatHistoryId: number,
    message: Omit<ChatMessage, 'id' | 'createdAt' | 'chatHistory'>,
  ): Promise<ChatMessage>;
}



