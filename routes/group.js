import * as express from 'express';
const groupRouter = express.Router();
import { Channel } from '../models/Channel.js';
import { Group } from '../models/Group.js';
import { UserGroups } from '../models/UserGroups.js';
import { checkAuthToken } from './auth.js';

groupRouter.post('/:id(\d+)', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    const group = await UserGroups.findOne({ where: { userId: body.userId, groupId: parseInt(params.id) }, include: Group });
    if (group)
        return res.status(200).json({ ok: true, data: group });
    else
        return res.status(404).json({ ok: false, reason: "Group not found." });
});

groupRouter.post('/:id(\d+)/channels', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    const channels = await Channel.findAll({ where: { groupId: parseInt(params.id) } });
    if (channels)
        return res.status(200).json({ ok: true, data: channels });
    else
        return res.status(404).json({ ok: false, reason: "Group not found." });
});

groupRouter.post('/create', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        const group = await Group.create({ name: body.name });
        if (group == null)
            return res.status(400).json({ ok: false, reason: "Group could not be created." });

        const userGroup = await UserGroups.create({ userId: body.userId, groupId: group.id, isOwner: true });
        if (userGroup == null) {
            group.destroy({ force: true });
            return res.status(400).json({ ok: false, reason: "User could not be added to group." });
        }

        return res.status(200).json({ ok: true, data: group });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

groupRouter.post('/:id(\d+)/delete', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        const group = await Group.destroy({ where: { id: parseInt(params.id) } });
        if (group === 0)
            return res.status(400).json({ ok: false, reason: "No group found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

export default groupRouter;