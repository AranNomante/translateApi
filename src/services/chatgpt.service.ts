import { injectable } from 'inversify';
import {
  OpenAIApi,
  Configuration,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize the OpenAI API client
const openai = new OpenAIApi(configuration);

@injectable()
export class ChatGptService {
  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo', // Change the engine to 'gpt-3.5-turbo'
        messages: [
          { content: prompt, role: ChatCompletionRequestMessageRoleEnum.User },
        ],
      });

      return response.data.choices[0].message?.content ?? '';
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }
}
