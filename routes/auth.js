import { User } from '../models/User';
import { Credentials } from '../models/Credentials';
import { compare, genSalt, hash, } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

export async function register(req, res) {
    const payload = req.body;
    try {
        genSalt(saltRounds, (err, salt) => {
            if (err)
                return res.status(500).json({ ok: false, reason: err });

            hash(payload.password, salt, async (err, hash) => {
                if (err)
                    return res.status(500).json({ ok: false, reason: err });

                const user = await User.create({ username: payload.username });
                if (user == null)
                    return res.status(500).json({ ok: false, reason: err });

                const creds = await Credentials.create({
                    userId: user.id,
                    password: hash,
                    salt: salt
                });
                if (creds == null) {
                    user.destroy({ force: true });
                    return res.status(500).json({ ok: false, reason: err });
                }

                const accessToken = jwt.sign({ username: payload.username, userId: user.id });

                return res.status(200).json({
                    ok: true,
                    data: {
                        user: user.toJSON(),
                        token: accessToken,
                    },
                });
            });
        }).catch((err) => {
            return res.status(500).json({ ok: false, reason: err, });
        });
    } catch (err) {
        return res.status(500).json({ ok: false, reason: err });
    }
}

export async function login(req, res) {
    const payload = req.body;

    try {
        const user = await User.findOne({ where: { username: payload.username } });
        if (user == null)
            return res.status(500).json({ ok: false, reason: "No user matches the given username." });

        const creds = await Credentials.findOne({ where: { userId: user.userId } });
        if (creds == null)
            return res.status(500).json({ ok: false, reason: "No credentials found for user." });

        compare(payload.password, creds.password, (err, same) => {
            if (err)
                return res.status(500).json({ ok: false, reason: err });

            if (!same) {
                return res.status(400).json({ ok: false, reason: "Incorrect password." });
            } else {
                const accessToken = generateAccessToken(payload.username, user.id);

                return res.status(200).json({
                    ok: true,
                    data: {
                        user: user.toJSON(),
                        token: accessToken,
                    },
                });
            }
        });
    } catch (error) {
        return res.status(500).json({ ok: false, reason: err });
    }
}

Router().post("/auth/register", register);
Router().post("/auth/login", login);