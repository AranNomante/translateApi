import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import container from './utils/container';
import dotenv from 'dotenv';
import { json } from 'express';

// Import the controller
import './controllers/chatgpt.controller';

dotenv.config();

const port = process.env.PORT || 3000;
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(json());
});

const app = server.build();
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
