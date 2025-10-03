import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { join } from 'path';
import { ChatbotConfig } from './config/chatbot-config.type';
import { ChatbotResponseDto, SourceDocument } from './dto/chatbot-response.dto';
import { ChatHistoryRepository } from './infrastructure/persistence/chat-history.repository';
import { MessageRole } from './domain/chat-message';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly configService: ConfigService<{ chatbot: ChatbotConfig }>,
    private readonly chatHistoryRepository: ChatHistoryRepository,
  ) {}

  async askQuestion(query: string, userId?: number, chatHistoryId?: number): Promise<ChatbotResponseDto> {
    const startTime = Date.now();
    
    try {
      const response = await this.callPythonChatbot(query);
      const processingTime = Date.now() - startTime;

      // Save the conversation to chat history if userId and chatHistoryId are provided
      if (userId && chatHistoryId) {
        try {
          // Save user message
          await this.chatHistoryRepository.addMessage(chatHistoryId, {
            role: MessageRole.USER,
            content: query,
            metadata: {},
          });

          // Save AI response
          await this.chatHistoryRepository.addMessage(chatHistoryId, {
            role: MessageRole.AI,
            content: response.answer,
            metadata: {
              sources: response.sources,
              references: response.references,
              timeline: response.timeline,
              processingTime,
            },
          });
        } catch (error) {
          this.logger.error(`Failed to save chat history: ${error.message}`);
          // Don't throw error, just log it
        }
      }

      return {
        ...response,
        processingTime,
      };
    } catch (error) {
      this.logger.error(`Error processing chatbot query: ${error.message}`);
      throw new InternalServerErrorException('Failed to process chatbot query');
    }
  }

  async getChatHistory(userId: number) {
    return this.chatHistoryRepository.findByUserId(userId);
  }

  async getChatHistoryById(id: number, userId: number) {
    const chatHistory = await this.chatHistoryRepository.findById(id);
    
    if (!chatHistory) {
      throw new NotFoundException('Chat history not found');
    }

    // Verify the chat history belongs to the user
    if (chatHistory.user.id !== userId) {
      throw new NotFoundException('Chat history not found');
    }

    return chatHistory;
  }

  async createChatHistory(userId: number, title: string) {
    return this.chatHistoryRepository.create({
      title,
      user: { id: userId } as any,
      messages: [],
    });
  }

  async updateChatHistory(id: number, userId: number, title: string) {
    const chatHistory = await this.chatHistoryRepository.findById(id);
    
    if (!chatHistory) {
      throw new NotFoundException('Chat history not found');
    }

    // Verify the chat history belongs to the user
    if (chatHistory.user.id !== userId) {
      throw new NotFoundException('Chat history not found');
    }

    return this.chatHistoryRepository.update(id, { title });
  }

  async deleteChatHistory(id: number, userId: number) {
    const chatHistory = await this.chatHistoryRepository.findById(id);
    
    if (!chatHistory) {
      throw new NotFoundException('Chat history not found');
    }

    // Verify the chat history belongs to the user
    if (chatHistory.user.id !== userId) {
      throw new NotFoundException('Chat history not found');
    }

    await this.chatHistoryRepository.remove(id);
  }

  async clearAllChatHistory(userId: number) {
    await this.chatHistoryRepository.removeAllByUserId(userId);
  }

  private async callPythonChatbot(query: string): Promise<ChatbotResponseDto> {
    const chatbotConfig = this.configService.get('chatbot', { infer: true });
    
    if (!chatbotConfig) {
      throw new InternalServerErrorException('Chatbot configuration not found');
    }

    if (!chatbotConfig.groqApiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is required but not configured');
    }

    try {
      const pythonPath = chatbotConfig.pythonPath;
      const chatbotPath = join(process.cwd(), chatbotConfig.chatbotPath);
      
      // Always use full chatbot_api.py (fallback to simple if import fails at runtime)
      const scriptPath = join(chatbotPath, 'chatbot_api.py');

      // Set environment variables for the Python process
      const env = {
        ...process.env,
        GROQ_API_KEY: chatbotConfig.groqApiKey,
        PATH: process.env.PATH + ':/Users/ramez.medhat/.asdf/shims',
        TOKENIZERS_PARALLELISM: 'false', // Suppress tokenizer warnings
      };

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new BadRequestException('Chatbot request timed out'));
        }, chatbotConfig.maxResponseTime);

        const pythonProcess = spawn(pythonPath, [scriptPath, 'query', query], {
          cwd: chatbotPath,
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr?.on('data', (data) => {
          const stderrData = data.toString();
          stderr += stderrData;
          // Log stderr in real-time if logging is enabled
          if (chatbotConfig.enableLogging) {
            this.logger.debug(`Python stderr: ${stderrData}`);
          }
        });

        pythonProcess.on('close', (code) => {
          clearTimeout(timeout);
          
          if (chatbotConfig.enableLogging) {
            this.logger.debug(`Python process exited with code ${code}`);
            this.logger.debug(`stdout: ${stdout}`);
            this.logger.debug(`stderr: ${stderr}`);
          }
          
          if (code !== 0) {
            this.logger.error(`Python process exited with code ${code}`);
            this.logger.error(`stdout: ${stdout}`);
            this.logger.error(`stderr: ${stderr}`);
            reject(new InternalServerErrorException(`Chatbot process error: ${stderr || 'Process exited with non-zero code'}`));
            return;
          }

          try {
            // Extract JSON from stdout (might have warnings before it)
            const jsonMatch = stdout.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              this.logger.error(`No JSON found in output: ${stdout}`);
              reject(new InternalServerErrorException('No valid JSON response from chatbot'));
              return;
            }
            
            const result = JSON.parse(jsonMatch[0]);
            if (result.success) {
              resolve({
                answer: result.answer,
                sources: result.sources || [],
                references: result.references || [],
                timeline: result.timeline || [],
              });
            } else {
              reject(new InternalServerErrorException(result.error || 'Unknown chatbot error'));
            }
          } catch (parseError) {
            this.logger.error(`Failed to parse Python response: ${stdout}`);
            reject(new InternalServerErrorException('Failed to parse chatbot response'));
          }
        });

        pythonProcess.on('error', (error: any) => {
          clearTimeout(timeout);
          if (error.code === 'ENOENT') {
            reject(new InternalServerErrorException(
              'Python is not available in this environment. The chatbot requires Python with the necessary dependencies to be installed.'
            ));
          } else {
            reject(new InternalServerErrorException(`Failed to start Python process: ${error.message}`));
          }
        });
      });
    } catch (error) {
      throw new InternalServerErrorException(`Chatbot service error: ${error.message}`);
    }
  }


  async rebuildVectorStore(): Promise<{ message: string }> {
    const chatbotConfig = this.configService.get('chatbot', { infer: true });
    
    if (!chatbotConfig) {
      throw new InternalServerErrorException('Chatbot configuration not found');
    }

    if (!chatbotConfig.groqApiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is required but not configured');
    }

    try {
      const pythonPath = chatbotConfig.pythonPath;
      const chatbotPath = join(process.cwd(), chatbotConfig.chatbotPath);
      
      // Always use full chatbot_api.py (fallback to simple if import fails at runtime)
      const scriptPath = join(chatbotPath, 'chatbot_api.py');

      // Set environment variables for the Python process
      const env = {
        ...process.env,
        GROQ_API_KEY: chatbotConfig.groqApiKey,
        PATH: process.env.PATH + ':/Users/ramez.medhat/.asdf/shims',
        TOKENIZERS_PARALLELISM: 'false', // Suppress tokenizer warnings
      };

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new BadRequestException('Vector store rebuild timed out'));
        }, 300000); // 5 minutes timeout for rebuild

        const pythonProcess = spawn(pythonPath, [scriptPath, 'rebuild'], {
          cwd: chatbotPath,
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
          clearTimeout(timeout);
          
          if (code !== 0) {
            this.logger.error(`Python rebuild process exited with code ${code}: ${stderr}`);
            reject(new InternalServerErrorException(`Vector store rebuild error: ${stderr}`));
            return;
          }

          try {
            const result = JSON.parse(stdout);
            if (result.success) {
              resolve({
                message: result.message || 'Vector store rebuild completed successfully.',
              });
            } else {
              reject(new InternalServerErrorException(result.error || 'Unknown rebuild error'));
            }
          } catch (parseError) {
            this.logger.error(`Failed to parse rebuild response: ${stdout}`);
            reject(new InternalServerErrorException('Failed to parse rebuild response'));
          }
        });

        pythonProcess.on('error', (error: any) => {
          clearTimeout(timeout);
          if (error.code === 'ENOENT') {
            reject(new InternalServerErrorException(
              'Python is not available in this environment. The chatbot requires Python with the necessary dependencies to be installed.'
            ));
          } else {
            reject(new InternalServerErrorException(`Failed to start rebuild process: ${error.message}`));
          }
        });
      });
    } catch (error) {
      this.logger.error(`Error rebuilding vector store: ${error.message}`);
      throw new InternalServerErrorException('Failed to rebuild vector store');
    }
  }

  async getLastSources(): Promise<SourceDocument[]> {
    // This would return the last sources from the Python service
    // For now, return empty array as this requires state management
    return [];
  }

  async getHealthStatus(): Promise<{ status: string; initialized: boolean }> {
    // Test if Python and the chatbot script are accessible
    const chatbotConfig = this.configService.get('chatbot', { infer: true });
    
    if (!chatbotConfig || !chatbotConfig.groqApiKey) {
      this.logger.warn('Chatbot configuration missing or GROQ API key not set');
      return {
        status: 'error',
        initialized: false,
      };
    }

    try {
      const pythonPath = chatbotConfig.pythonPath;
      const chatbotPath = join(process.cwd(), chatbotConfig.chatbotPath);
      // Always use chatbot_api.py as it's the only script available
      const scriptPath = join(chatbotPath, 'chatbot_api.py');

      this.logger.debug(`Health check: Testing Python at ${pythonPath} with script ${scriptPath}`);

      // Test if we can run the init command
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        let stdout = '';
        let stderr = '';

        const testProcess = spawn(pythonPath, [scriptPath, 'init'], {
          cwd: chatbotPath,
          env: {
            ...process.env,
            GROQ_API_KEY: chatbotConfig.groqApiKey,
            PATH: process.env.PATH + ':/Users/ramez.medhat/.asdf/shims',
            TOKENIZERS_PARALLELISM: 'false',
          },
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        // Increased timeout to 30 seconds to allow for initialization
        const timeout = setTimeout(() => {
          testProcess.kill();
          this.logger.warn('Health check timed out after 30 seconds');
          resolve({ success: false, error: 'Timeout after 30 seconds' });
        }, 30000);

        testProcess.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        testProcess.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        testProcess.on('close', (code) => {
          clearTimeout(timeout);
          
          if (code === 0) {
            this.logger.debug('Health check passed');
            resolve({ success: true });
          } else {
            this.logger.warn(`Health check failed with exit code ${code}`);
            this.logger.debug(`stdout: ${stdout}`);
            this.logger.debug(`stderr: ${stderr}`);
            resolve({ success: false, error: stderr || `Process exited with code ${code}` });
          }
        });

        testProcess.on('error', (error: any) => {
          clearTimeout(timeout);
          if (error.code === 'ENOENT') {
            this.logger.error(`Python executable not found at ${pythonPath}`);
            resolve({ success: false, error: 'Python executable not found' });
          } else {
            this.logger.error(`Python health check error: ${error.message}`);
            resolve({ success: false, error: error.message });
          }
        });
      });

      return {
        status: result.success ? 'healthy' : 'error',
        initialized: result.success,
      };
    } catch (error) {
      this.logger.error(`Health check exception: ${error.message}`);
      return {
        status: 'error',
        initialized: false,
      };
    }
  }
}
