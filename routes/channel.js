import * as express from 'express';
const channelRouter = express.Router();
import { checkAuthToken } from './auth.js';
import { Channel } from '../models/Channel.js';
import { Message } from '../models/Message.js';
import { UserGroups } from '../models/UserGroups.js';
import { User } from '../models/User.js';

channelRouter.post('/:id', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    const channel = await Channel.findOne({ where: { id: params.id, groupId: parseInt(body.groupId) } });
    if (channel)
        return res.status(200).json({ ok: true, data: channel });
    else
        return res.status(404).json({ ok: false, reason: "Channel not found." });
});

channelRouter.post('/create', checkAuthToken, async (req, res) => {
    const body = req.body;

    try {
        const group = await UserGroups.findOne({ where: { userId: body.userId, groupId: parseInt(body.groupId) } });
        if (group == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        const channel = await Channel.create({ name: body.name, groupId: parseInt(body.groupId) }).catch(err => console.log(err));
        if (channel == null)
            return res.status(500).json({ ok: false, reason: "Channel could not be created." });

        return res.status(200).json({ ok: true, data: channel });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

channelRouter.post('/:id/delete', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        const group = await UserGroups.findOne({ where: { userId: body.userId, groupId: parseInt(params.id) } });
        if (group == null) return res.status(403).json({ ok: false, reason: "Forbidden." });
        const channel = await Channel.findOne({ where: { id: params.id, groupId: group.id } });
        if (channel == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        channel = await Channel.destroy({ where: { id: parseInt(params.id) } });
        if (channel === 0)
            return res.status(400).json({ ok: false, reason: "No group found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

channelRouter.post('/:id/messages', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        const userGroup = await UserGroups.findOne({ where: { userId: parseInt(body.userId), groupId: parseInt(body.groupId) } });
        if (userGroup == null) return res.status(403).json({ ok: false, reason: "Forbidden." });
        const channel = await Channel.findOne({ where: { id: params.id, groupId: userGroup.groupId } });
        if (channel == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        const messages = await Message.findAll({ where: { channelId: params.id }, limit: 100, order: [['sentAt', 'ASC']], include: User });
        return res.status(200).json({ ok: true, data: messages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

export default channelRouter;