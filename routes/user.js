import * as express from 'express';
const authRouter = express.Router();
import { checkAuthToken } from './auth.js';
import { Group } from '../models/Group.js';
import { UserGroups } from '../models/UserGroups.js';

authRouter.post('/:id/groups', checkAuthToken, async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ ok: false, reason: "Bad request." });

    const groups = await UserGroups.findAll({ where: { userId: parseInt(id) }, include: Group });
    return res.status(200).json({ ok: true, data: groups });
});

export default authRouter;