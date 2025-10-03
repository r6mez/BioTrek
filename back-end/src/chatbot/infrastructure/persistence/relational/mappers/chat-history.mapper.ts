import { ChatHistory } from '../../../../domain/chat-history';
import { ChatHistoryEntity } from '../entities/chat-history.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { ChatMessageMapper } from './chat-message.mapper';

export class ChatHistoryMapper {
  static toDomain(raw: ChatHistoryEntity): ChatHistory {
    const domainEntity = new ChatHistory();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    
    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }
    
    if (raw.messages) {
      domainEntity.messages = raw.messages.map((message) =>
        ChatMessageMapper.toDomain(message),
      );
    }
    
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    
    return domainEntity;
  }

  static toPersistence(domainEntity: ChatHistory): ChatHistoryEntity {
    const persistenceEntity = new ChatHistoryEntity();
    
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    
    persistenceEntity.title = domainEntity.title;
    
    if (domainEntity.user) {
      persistenceEntity.user = UserMapper.toPersistence(domainEntity.user);
    }
    
    if (domainEntity.messages) {
      persistenceEntity.messages = domainEntity.messages.map((message) =>
        ChatMessageMapper.toPersistence(message),
      );
    }
    
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    
    return persistenceEntity;
  }
}



