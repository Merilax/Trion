import * as express from 'express';
const channelRouter = express.Router();
import { checkAuthToken } from './auth.js';
import { Channel } from '../models/Channel.js';
import { Message } from '../models/Message.js';
import { UserGroups } from '../models/UserGroups.js';
import { User } from '../models/User.js';

channelRouter.post('/:id/get', checkAuthToken, async (req, res) => {
    const { groupId } = req.body;
    const { id } = req.params;

    if (!groupId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    const channel = await Channel.findOne({ where: { id: id, groupId: parseInt(groupId) } });
    if (channel)
        return res.status(200).json({ ok: true, data: channel });
    else
        return res.status(404).json({ ok: false, reason: "Channel not found." });
});

channelRouter.post('/', checkAuthToken, async (req, res) => {
    const { userId, groupId, name } = req.body;

    if (!userId || !groupId || !name) return res.status(400).json({ ok: false, reason: "Bad request." });

    try {
        const group = await UserGroups.findOne({ where: { userId: parseInt(userId), groupId: parseInt(groupId) } });
        if (group == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        const channel = await Channel.create({ name: name, groupId: parseInt(groupId) });

        return res.status(200).json({ ok: true, data: channel });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

channelRouter.post('/:id/delete', checkAuthToken, async (req, res) => {
    const { userId, groupId } = req.body;
    const { id } = req.params;

    if (!userId || !groupId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    try {
        const userGroup = await UserGroups.findOne({ where: { userId: userId, groupId: parseInt(groupId) } });
        if (userGroup == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        const channel = await Channel.destroy({ where: { id: parseInt(id), groupId: userGroup.groupId } });
        if (channel === 0)
            return res.status(404).json({ ok: false, reason: "No channel found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

channelRouter.post('/:id/modify', checkAuthToken, async (req, res) => {
    const { userId, groupId, name, description } = req.body;
    const { id } = req.params;
    const toUpdate = {};

    if (!userId || !groupId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    if (name) toUpdate.name = "" + name;
    if (description) toUpdate.description = "" + description;

    if (Object.keys(toUpdate).length === 0) return res.status(400).json({ ok: false, reason: "Bad request." });

    try {
        const userGroup = await UserGroups.findOne({ where: { userId: userId, groupId: parseInt(groupId) } });
        if (userGroup == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        const [count, rows] = await Channel.update(toUpdate, { where: { id: parseInt(id), groupId: userGroup.groupId } });
        if (count === 0)
            return res.status(404).json({ ok: false, reason: "No channel found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

channelRouter.post('/:id/messages', checkAuthToken, async (req, res) => {
    const { userId, groupId } = req.body;
    const { id } = req.params;

    if (!userId || !groupId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    try {
        const userGroup = await UserGroups.findOne({ where: { userId: parseInt(userId), groupId: parseInt(groupId) } });
        if (userGroup == null) return res.status(403).json({ ok: false, reason: "Forbidden." });
        const channel = await Channel.findOne({ where: { id: id, groupId: userGroup.groupId } });
        if (channel == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        const messages = await Message.findAll({ where: { channelId: id }, limit: 100, order: [['sentAt', 'ASC']], include: User });
        return res.status(200).json({ ok: true, data: messages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

export default channelRouter;