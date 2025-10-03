import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatbotQueryDto } from './dto/chatbot-query.dto';
import { ChatbotResponseDto, SourceDocument } from './dto/chatbot-response.dto';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';
import { UpdateChatHistoryDto } from './dto/update-chat-history.dto';
import { ChatHistoryResponseDto, ChatHistoryListItemDto } from './dto/chat-history-response.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Chatbot')
@Controller({
  path: 'chatbot',
  version: '1',
})
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ask a question to the NASA BioTrek chatbot',
    description: 'Submit a question to the chatbot and receive an AI-generated response based on NASA BioTrek research documents.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chatbot response with answer and sources',
    type: ChatbotResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query or request timeout',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Chatbot service error',
  })
  async askQuestion(
    @Body() chatbotQueryDto: ChatbotQueryDto,
    @Request() request,
  ): Promise<ChatbotResponseDto> {
    const userId = request.user?.id;
    const chatHistoryId = chatbotQueryDto.chatHistoryId;
    
    return this.chatbotService.askQuestion(
      chatbotQueryDto.query,
      userId,
      chatHistoryId,
    );
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all chat histories for the current user',
    description: 'Retrieve all chat conversations for the authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of chat histories',
    type: [ChatHistoryListItemDto],
  })
  async getChatHistories(@Request() request): Promise<ChatHistoryListItemDto[]> {
    const userId = request.user.id;
    const histories = await this.chatbotService.getChatHistory(userId);
    
    return histories.map((history) => ({
      id: history.id,
      title: history.title,
      messageCount: history.messages?.length || 0,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
    }));
  }

  @Get('history/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific chat history by ID',
    description: 'Retrieve a specific chat conversation with all messages.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat history with messages',
    type: ChatHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat history not found',
  })
  async getChatHistoryById(
    @Param('id', ParseIntPipe) id: number,
    @Request() request,
  ): Promise<ChatHistoryResponseDto> {
    const userId = request.user.id;
    const history = await this.chatbotService.getChatHistoryById(id, userId);
    
    return {
      id: history.id,
      title: history.title,
      messages: history.messages || [],
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
    };
  }

  @Post('history')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new chat history',
    description: 'Create a new chat conversation.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Chat history created successfully',
    type: ChatHistoryResponseDto,
  })
  async createChatHistory(
    @Body() createChatHistoryDto: CreateChatHistoryDto,
    @Request() request,
  ): Promise<ChatHistoryResponseDto> {
    const userId = request.user.id;
    const history = await this.chatbotService.createChatHistory(
      userId,
      createChatHistoryDto.title,
    );
    
    return {
      id: history.id,
      title: history.title,
      messages: [],
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
    };
  }

  @Patch('history/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a chat history title',
    description: 'Update the title of a specific chat conversation.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat history updated successfully',
    type: ChatHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat history not found',
  })
  async updateChatHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChatHistoryDto: UpdateChatHistoryDto,
    @Request() request,
  ): Promise<ChatHistoryResponseDto> {
    const userId = request.user.id;
    const history = await this.chatbotService.updateChatHistory(
      id,
      userId,
      updateChatHistoryDto.title,
    );
    
    if (!history) {
      throw new NotFoundException('Chat history not found');
    }
    
    return {
      id: history.id,
      title: history.title,
      messages: history.messages || [],
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
    };
  }

  @Delete('history/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a specific chat history',
    description: 'Delete a specific chat conversation.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Chat history deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat history not found',
  })
  async deleteChatHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() request,
  ): Promise<void> {
    const userId = request.user.id;
    await this.chatbotService.deleteChatHistory(id, userId);
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear all chat history',
    description: 'Delete all chat conversations for the authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All chat history cleared successfully',
  })
  async clearAllChatHistory(@Request() request): Promise<void> {
    const userId = request.user.id;
    await this.chatbotService.clearAllChatHistory(userId);
  }

  @Post('rebuild')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rebuild the vector database',
    description: 'Trigger a rebuild of the vector database from cached documents. This operation may take several minutes.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vector store rebuild initiated',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Vector store rebuild initiated. This may take several minutes to complete.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to rebuild vector store',
  })
  async rebuildVectorStore(): Promise<{ message: string }> {
    return this.chatbotService.rebuildVectorStore();
  }

  @Get('sources')
  @ApiOperation({
    summary: 'Get last query sources',
    description: 'Retrieve the source documents from the last chatbot query.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of source documents',
    type: [SourceDocument],
  })
  async getLastSources(): Promise<SourceDocument[]> {
    return this.chatbotService.getLastSources();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check chatbot service health',
    description: 'Get the current health status of the chatbot service.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chatbot service health status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['healthy', 'initializing', 'error'],
          example: 'healthy',
        },
        initialized: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  async getHealthStatus(): Promise<{ status: string; initialized: boolean }> {
    return this.chatbotService.getHealthStatus();
  }
}

