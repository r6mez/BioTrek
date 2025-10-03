import { ChatMessage } from '../../../../domain/chat-message';
import { ChatMessageEntity } from '../entities/chat-message.entity';

export class ChatMessageMapper {
  static toDomain(raw: ChatMessageEntity): ChatMessage {
    const domainEntity = new ChatMessage();
    domainEntity.id = raw.id;
    domainEntity.role = raw.role;
    domainEntity.content = raw.content;
    domainEntity.metadata = raw.metadata || undefined;
    domainEntity.createdAt = raw.createdAt;
    
    // Note: We don't map chatHistory to avoid circular references
    // The chatHistory will be set by the parent mapper if needed
    
    return domainEntity;
  }

  static toPersistence(domainEntity: ChatMessage): ChatMessageEntity {
    const persistenceEntity = new ChatMessageEntity();
    
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.content = domainEntity.content;
    persistenceEntity.metadata = domainEntity.metadata || null;
    persistenceEntity.createdAt = domainEntity.createdAt;
    
    return persistenceEntity;
  }
}



