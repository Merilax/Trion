import { Router } from 'express';
import { Message } from '../models/Message';

export async function getMessageHistory(req, res) {
    // auth?
    const messages = await Message.findAll({ limit: 100, order: [['sentAt', 'ASC']] });
    return res.status(200).json({ ok: true, data: messages });
}

Router().get('/message/history', getMessageHistory);