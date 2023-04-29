import 'reflect-metadata';
import { Container } from 'inversify';
import { ChatGptService } from '../services/chatgpt.service';

const container = new Container();
container.bind<ChatGptService>(ChatGptService).toSelf().inSingletonScope();

export default container;
