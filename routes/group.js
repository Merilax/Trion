import * as express from 'express';
const groupRouter = express.Router();
import { checkAuthToken } from './auth.js';
import { Channel } from '../models/Channel.js';
import { Group } from '../models/Group.js';
import { UserGroups } from '../models/UserGroups.js';
import { User } from '../models/User.js';

groupRouter.post('/:id/get', checkAuthToken, async (req, res) => {
    const { userId } = req.body;
    const { id } = req.params;

    if (!userId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    const group = await UserGroups.findOne({ where: { userId: userId, groupId: parseInt(id) }, include: Group });
    if (group)
        return res.status(200).json({ ok: true, data: group });
    else
        return res.status(404).json({ ok: false, reason: "Group not found." });
});

groupRouter.post('/:id/channels', checkAuthToken, async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ ok: false, reason: "Bad request." });

    const channels = await Channel.findAll({ where: { groupId: parseInt(id) }, order: [['id', 'ASC']] });
    if (channels)
        return res.status(200).json({ ok: true, data: channels });
    else
        return res.status(404).json({ ok: false, reason: "Group not found." });
});

groupRouter.post('/:id/members', checkAuthToken, async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ ok: false, reason: "Bad request." });

    const members = await UserGroups.findAll({ where: { groupId: parseInt(id) }, order: [['createdAt', 'ASC']], include: User }); // TODO sort by name
    if (members)
        return res.status(200).json({ ok: true, data: members });
    else
        return res.status(404).json({ ok: false, reason: "Group not found." });
});

groupRouter.post('/:id/join', checkAuthToken, async (req, res) => {
    const { userId, groupId } = req.body;
    const { id } = req.params;

    if (!userId || !groupId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    let userGroup = await UserGroups.findOne({ where: { userId: parseInt(userId), groupId: parseInt(id) }, include: Group });
    if (userGroup)
        return res.status(403).json({ ok: false, reason: "Already in group." });

    userGroup = await UserGroups.create({ userId: parseInt(userId), groupId: parseInt(id) });
    userGroup = await UserGroups.findOne({ where: { userId: parseInt(userId), groupId: userGroup.groupId }, include: Group });
    if (userGroup)
        return res.status(200).json({ ok: true, data: userGroup });
    else
        return res.status(500).json({ ok: false, reason: "Internal server error." });
});

groupRouter.post('/', checkAuthToken, async (req, res) => {
    const { userId, name } = req.body;

    if (!userId || !name) return res.status(400).json({ ok: false, reason: "Bad request." });

    try {
        const group = await Group.create({ name: name });
        const userGroup = await UserGroups.create({ userId: userId, groupId: group.id, isOwner: true });

        return res.status(200).json({ ok: true, data: group });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

groupRouter.post('/:id/leave', checkAuthToken, async (req, res) => {
    const { userId } = req.body;
    const { id } = req.params;

    if (!userId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    const userGroup = await UserGroups.findOne({ where: { userId: parseInt(userId), groupId: parseInt(id) } });
    if (userGroup == null)
        return res.status(403).json({ ok: false, reason: "Forbidden." });

    try {
        const destroyed = await UserGroups.destroy({ where: { userId: parseInt(userId), groupId: parseInt(id) } });
        if (destroyed === 0)
            return res.status(404).json({ ok: false, reason: "No group found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

groupRouter.post('/:id/modify', checkAuthToken, async (req, res) => {
    const { userId, name, description, allowJoining } = req.body;
    const { id } = req.params;
    const toUpdate = {};

    if (!userId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    if (name) toUpdate.name = "" + name;
    if (description) toUpdate.description = "" + description;
    if (allowJoining) toUpdate.allowJoining = allowJoining;

    if (Object.keys(toUpdate).length === 0) return res.status(400).json({ ok: false, reason: "Bad request." });

    try {
        const userGroup = await UserGroups.findOne({ where: { userId: userId, groupId: parseInt(id), isOwner: true } });
        if (userGroup == null) return res.status(403).json({ ok: false, reason: "Forbidden." });

        const [count, rows] = await Group.update(toUpdate, { where: { id: parseInt(id) } });
        if (count === 0)
            return res.status(404).json({ ok: false, reason: "No channel found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

groupRouter.post('/:id/delete', checkAuthToken, async (req, res) => {
    const { userId } = req.body;
    const { id } = req.params;

    if (!userId || !id) return res.status(400).json({ ok: false, reason: "Bad request." });

    const userGroup = await UserGroups.findOne({ where: { userId: parseInt(userId), groupId: parseInt(id) } });
    if (userGroup == null || !userGroup.isOwner)
        return res.status(403).json({ ok: false, reason: "Forbidden." });

    try {
        const destroyed = await Group.destroy({ where: { id: parseInt(id) } });
        if (destroyed === 0)
            return res.status(400).json({ ok: false, reason: "No group found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

export default groupRouter;