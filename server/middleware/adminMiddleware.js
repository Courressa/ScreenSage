export function adminMiddleware(req, res, next) {
    if (req.userData?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access only" });
    }
    next();
}