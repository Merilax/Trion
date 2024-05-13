import express from 'express';
import { chatCtrl } from '../ctrl/chatCtrl.js';
const router = express.Router();
router.get('/', chatCtrl); // '/chat' if not landing page
export { router };