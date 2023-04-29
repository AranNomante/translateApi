import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { ChatGptService } from '../services/chatgpt.service';

@controller('/chatgpt')
export class ChatGptController {
  constructor(@inject(ChatGptService) private chatGptService: ChatGptService) {}

  @httpGet('/')
  async welcomeMessage(req: Request, res: Response): Promise<void> {
    res.send({ message: 'Welcome to the chatgpt api' });
  }

  @httpPost('/')
  async generateResponse(req: Request, res: Response): Promise<void> {
    // send json as application/json
    const prompt = req.body.prompt;

    try {
      const response = await this.chatGptService.generateResponse(prompt);
      res.send({ response });
    } catch (error) {
      res
        .status(500)
        .send({ error: 'An error occurred while generating the response.' });
    }
  }
}
