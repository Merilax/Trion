import * as express from 'express';
const channelRouter = express.Router();
import { Channel } from '../models/Channel.js';
import { Message } from '../models/Message.js';
import { UserGroups } from '../models/UserGroups.js';
import { checkAuthToken } from './auth.js';

channelRouter.post('/create', checkAuthToken, async (req, res) => {
    const body = req.body;

    const group = await UserGroups.findOne({ where: { userId: body.userId, groupId: parseInt(body.groupId) } });
    if (group == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

    try {
        const channel = await Channel.create({ name: body.name, groupId: parseInt(body.groupId) });
        if (channel == null)
            return res.status(500).json({ ok: false, reason: "Channel could not be created." });

        return res.status(200).json({ ok: true, data: channel });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

channelRouter.post('/:id(\d+)/delete', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    const group = await UserGroups.findOne({ where: { userId: body.userId, groupId: parseInt(params.id) } });
    if (group == null) return res.status(403).json({ ok: false, reason: "Forbidden." });
    const channel = await Channel.findOne({ where: { id: params.id, groupId: group.id } });
    if (channel == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

    try {
        const channel = await Channel.destroy({ where: { id: parseInt(params.id) } });
        if (channel === 0)
            return res.status(400).json({ ok: false, reason: "No group found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

channelRouter.post('/:id(\d+)/messages', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    const group = await UserGroups.findOne({ where: { userId: body.userId, groupId: parseInt(body.groupId) } });
    if (group == null) return res.status(403).json({ ok: false, reason: "Forbidden." });
    const channel = await Channel.findOne({ where: { id: params.id, groupId: group.id } });
    if (channel == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

    const messages = await Message.findAll({ where: { channelId: params.id }, limit: 100, order: [['sentAt', 'ASC']] });
    return res.status(200).json({ ok: true, data: messages });
});

export default channelRouter;