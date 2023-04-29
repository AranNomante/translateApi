import 'reflect-metadata';
import { ChatGptService } from '../services/chatgpt.service';

describe('ChatGptService', () => {
  let service: ChatGptService;

  beforeAll(() => {
    service = new ChatGptService();
  });

  test('getMessage should return "Hello, world!"', async () => {
    const result = await service.generateResponse(
      'translate English to French: How are you?',
    );

    expect(result).toBeTruthy();
  });
});
