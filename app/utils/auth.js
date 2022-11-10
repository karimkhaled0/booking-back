import jwt from 'jsonwebtoken'
import { config } from '../config/dev'
import { User } from '../src/user/user.model'
import { validateLoginInput } from '../validation/login'
import { validateRegisterInput } from '../validation/register'



export const newToken = user => {
    return jwt.sign({ id: user.id }, config.secrets.jwtSecret, {
        expiresIn: config.secrets.jwtExp
    })
}


export const verifyToken = token => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secrets.jwtSecret, (err, payload) => {
            if (err) {
                return reject(err);
            }

            resolve(payload)
        })
    })
}


export const signup = async (req, res) => {

    try {

        const { errors, isValid } = await validateRegisterInput(req.body);

        if (!isValid) {
            return res.status(400).json({ errors })
        }

        const user = await User.create(req.body);

        return res.status(201).send({ user })

    } catch (e) {
        console.error(e);
        return res.status(400).end()
    }

}

export const signin = async (req, res) => {

    const { errors, isValid } = await validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json({ errors })
    }



    try {
        const user = await User.findOne({ loginId: req.body.loginId })
            .exec()

        const token = newToken(user);
        if (!token) {
            return res.status(400).end();
        }
        console.log(user)
        return res.status(201).json({ token })



    } catch (e) {
        console.error(e);
        res.status(400).end();
    }

}

export const protect = async (req, res, next) => {
    try {

        if (!req.headers.authorization) {
            return res.status(401).json({ error: "Not authorized!" });
        }

        let token = req.headers.authorization.split('Bearer ')[1];


        if (!token) {
            return res.status(400).end();
        }

        const payload = await verifyToken(token);
        console.log(payload);

        if (!payload) {
            return res.status(401).json({ error: "Not authorized" });
        }

        const user = await User.findById(payload.id)
            .select('-password')
            .lean()
            .exec()

        if (!user) {
            return res.status(400).end()
        }
        console.log("user here", user)
        req.user = user;
        next()



    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "Not Authorized" })
    }


}