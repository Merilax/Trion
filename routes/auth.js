import { compare, genSalt, hash, } from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as express from 'express';
const authRouter = express.Router();
import { User } from '../models/User.js';
import { Credentials } from '../models/Credentials.js';

authRouter.post('/register', (req, res) => {
    const payload = req.body;
    try {
        genSalt(10, (err, salt) => {
            if (err)
                return res.status(500).json({ ok: false, reason: err });

            hash(payload.password, salt, async (err, hash) => {
                if (err)
                    return res.status(500).json({ ok: false, reason: err });

                const [user, created] = await User.findOrCreate({ where: { username: payload.username }, defaults: { username: payload.username } });
                if (!created)
                    return res.status(404).json({ ok: false, reason: "Username already exists." });


                const creds = await Credentials.create({
                    userId: user.id,
                    password: hash,
                    salt: salt
                }).catch(error => {
                    user.destroy({ force: true });
                    return res.status(500).json({ ok: false, reason: "Internal server error." });
                });

                if (creds === null) {
                    user.destroy({ force: true });
                    return res.status(500).json({ ok: false, reason: "Credentials could not be created for user." });
                }

                const accessToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: "1d", subject: "" + user.id });

                /*res.cookie('authToken', accessToken, {
                    maxAge: 24 * 3600 * 1000, // hours
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true 
                });*/
                return res.status(200).json({
                    ok: true,
                    data: {
                        user: user.toJSON(),
                        token: accessToken,
                    },
                });
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: err });
    }
});

authRouter.post('/login', async (req, res) => {
    const payload = req.body;

    try {
        let user = await User.findOne({ where: { username: payload.username } });
        if (user === null)
            return res.status(400).json({ ok: false, reason: "Wrong username and password." });

        let creds = await user.getCredential();

        if (creds === null)
            return res.status(500).json({ ok: false, reason: "No credentials found for user." });

        compare(payload.password, creds.password, (err, same) => {
            if (err)
                return res.status(500).json({ ok: false, reason: err });

            if (!same) {
                return res.status(401).json({ ok: false, reason: "Wrong username or password." });
            } else {
                const accessToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1d', subject: "" + user.id });

                /*res.cookie('authToken', accessToken, {
                    maxAge: 24 * 3600 * 1000, // hours
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true
                });*/
                return res.status(200).json({
                    ok: true,
                    data: {
                        user: user.toJSON(),
                        token: accessToken,
                    },
                });
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ ok: false, reason: "Internal server error." });
    }
});

function checkAuthToken(req, res, next) {
    const body = req.body;

    try {
        const { authorization } = req.headers
        const token = authorization.substring('Bearer '.length);
        const { sub, exp } = jwt.verify(token, process.env.JWT_SECRET);

        if (exp < Date.now() / 1000) return res.status(401).json({ ok: false, reason: "Session expired. Login required." });

        if (parseInt(sub) != body.userId) return res.status(403).json({ ok: false, reason: "Forbidden." });

        next();
    } catch (error) {
        return res.status(401).json({ ok: false, reason: "Unauthorized." });
    }
}

export default authRouter;
export { checkAuthToken };