module.exports = function (req, res, next) {
    if (!req.session.isAdmin) {
        return res.status(401).json({ message: "failed adm" });
    }

    next();
}