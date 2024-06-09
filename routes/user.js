import * as express from 'express';
const authRouter = express.Router();
import { Group } from '../models/Group.js';
import { UserGroups } from '../models/UserGroups.js';
import { checkAuthToken } from './auth.js';

authRouter.get('/:id/groups', checkAuthToken, async (req, res) => {
    const body = req.body;
    const params = req.params;

    const groups = await UserGroups.findAll({ where: { userId: parseInt(params.id) }, include: Group });
    return res.status(200).json({ ok: true, data: groups });
});

export default authRouter;