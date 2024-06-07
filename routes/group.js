import { Router } from 'express';
import { Group } from '../models/Group';
import { UserGroups } from '../models/UserGroups';

export async function createGroup() {
    const payload = req.body;

    try {
        const group = await Group.create({ name: payload.name });
        if (group == null)
            return res.status(500).json({ ok: false, reason: "Group could not be created." });

        const userGroup = await UserGroups.create({ userId: payload.userId, groupId: payload.groupId });
        if (userGroup == null) {
            group.destroy({ force: true });
            return res.status(500).json({ ok: false, reason: "User could not be added to group." });
        }

        return res.status(200).json({ ok: true, data: group });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: err });
    }
}

export async function deleteGroup() {
    const payload = req.body;

    try {
        const group = await Group.destroy({ where: { id: payload.groupId } });
        if (group === 0)
            return res.status(500).json({ ok: false, reason: "No group found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: err });
    }
}

Router().post('/group/create', createGroup);
Router().post('/group/delete', deleteGroup);