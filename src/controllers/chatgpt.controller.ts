import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { ChatGptService } from '../services/chatgpt.service';
import { SupportedLanguages } from '../utils/supportedLangs';

@controller('/chatgpt')
export class ChatGptController {
  constructor(@inject(ChatGptService) private chatGptService: ChatGptService) {}

  @httpGet('/')
  async welcomeMessage(req: Request, res: Response): Promise<void> {
    res.send({ message: 'Welcome to the Translate api' });
  }

  @httpGet('/supported-languages')
  async supportedLanguages(req: Request, res: Response): Promise<void> {
    res.send({ supportedLanguages: Object.keys(SupportedLanguages) });
  }

  @httpPost('/translate')
  async generateResponse(req: Request, res: Response): Promise<void> {
    // send json as application/json
    const from: SupportedLanguages = (
      (req.body.from as string) ?? ''
    ).toUpperCase() as SupportedLanguages;
    const to: SupportedLanguages = (
      (req.body.to as string) ?? ''
    ).toUpperCase() as SupportedLanguages;
    const target = req.body.target;

    if (
      !Object.keys(SupportedLanguages).includes(from) ||
      !Object.keys(SupportedLanguages).includes(to)
    ) {
      res.status(400).send({ error: 'Language not supported.' });
      return;
    }

    if (target.length > 4097) {
      res.status(400).send({ error: 'Target text is too long.' });
      return;
    }

    const prompt = `translate following from ${from} to ${to} ${target}`;

    try {
      const response = await this.chatGptService.generateResponse(prompt);
      res.send({ response });
    } catch (error) {
      if ((error as { response: { status: number } }).response.status === 429) {
        res.status(429).send({ error: 'Too many requests.' });
      } else {
        res
          .status(400)
          .send({ error: 'An error occurred while generating the response.' });
      }
    }
  }
}
