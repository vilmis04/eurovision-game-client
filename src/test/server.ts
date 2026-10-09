import { setupServer } from 'msw/node';

export const API_URL = 'http://localhost/api';

export const server = setupServer();
