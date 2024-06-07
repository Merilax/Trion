import { Router } from 'express';
import { Channel } from '../models/Channel';

export async function createChannel() {
    const payload = req.body;

    try {
        const channel = await Channel.create({ name: payload.name, groupId: payload.groupId });
        if (channel == null)
            return res.status(500).json({ ok: false, reason: "Channel could not be created." });

        return res.status(200).json({ ok: true, data: channel });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: err });
    }
}

export async function deleteChannel() {
    const payload = req.body;

    try {
        const channel = await Channel.destroy({ where: { id: payload.channelId } });
        if (channel === 0)
            return res.status(500).json({ ok: false, reason: "No group found." });

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: err });
    }
}

Router().post('/channel/create', createChannel);
Router().post('/channel/delete', deleteChannel);