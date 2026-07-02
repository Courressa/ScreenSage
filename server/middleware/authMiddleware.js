export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${process.env.MY_SECRET_TOKEN}`) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    next();
}
