import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { ChatGptService } from '../services/chatgpt.service';
import { SupportedLanguages } from '../utils/supportedLangs';

@controller('/chatgpt')
export class ChatGptController {
  constructor(@inject(ChatGptService) private chatGptService: ChatGptService) {}

  private getParameters(req: Request) {
    const from: SupportedLanguages = (
      (req.body.from as string) ?? ''
    ).toUpperCase() as SupportedLanguages;

    const to: SupportedLanguages[] =
      typeof req.body.to === 'string'
        ? [((req.body.to as string) ?? '').toUpperCase() as SupportedLanguages]
        : (((req.body.to as string[]) ?? []).map((lang) =>
            lang.toUpperCase(),
          ) as SupportedLanguages[]);

    const target: string = req.body.target ?? '';

    return { from, to, target };
  }

  private checkParameters(
    from: string,
    to: string[],
    target: string,
  ): string | void {
    if (!Object.keys(SupportedLanguages).includes(from))
      return 'Language not supported.';

    for (const lang of to) {
      if (!Object.keys(SupportedLanguages).includes(lang)) {
        return 'Language not supported.';
      }
    }

    if (target.length > 4097) return 'Target text is too long.';

    if (!target.length) return 'Target text is too short.';
  }

  private async getResponse(
    prompt: string,
  ): Promise<{ response: string; error?: string }> {
    try {
      const response = await this.chatGptService.generateResponse(prompt);
      return { response };
    } catch (error) {
      if (
        (error as { response: { status: number } })?.response?.status === 429
      ) {
        return {
          response: '',
          error: 'Too many requests. Please try again later.',
        };
      } else {
        return { response: '', error: 'Something went wrong.' };
      }
    }
  }

  @httpGet('/')
  async welcomeMessage(req: Request, res: Response): Promise<void> {
    res.send({ message: 'Welcome to the Translate api' });
  }

  @httpGet('/supported-languages')
  async supportedLanguages(req: Request, res: Response): Promise<void> {
    res.send({ supportedLanguages: Object.keys(SupportedLanguages) });
  }

  @httpPost('/suggest')
  async suggest(req: Request, res: Response): Promise<void> {
    // send json as application/json
    const { from, to, target } = this.getParameters(req);

    const error = this.checkParameters(from, to, target);

    if (error) {
      res.status(400).send({ error });
      return;
    }

    const prompt = `show detailed(details in ${from}) translation suggestions in ${from} for the following word from ${from} to ${to.join(
      ',',
    )}: ${target}`;

    const result = await this.getResponse(prompt);

    if (result.error) {
      res.status(400).send({ error: result.error });
      return;
    }

    res.send({ suggestions: result.response });
  }

  @httpPost('/translate')
  async generateResponse(req: Request, res: Response): Promise<void> {
    // send json as application/json
    const { from, to, target } = this.getParameters(req);

    const error = this.checkParameters(from, to, target);

    if (error) {
      res.status(400).send({ error });
      return;
    }

    const prompt = `translate following from ${from} to ${to.join(
      ',',
    )}: ${target}`;

    const result = await this.getResponse(prompt);

    if (result.error) {
      res.status(400).send({ error: result.error });
      return;
    }

    res.send({ translation: result.response });
  }
}
