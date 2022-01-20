module.exports = function (req, res, next) {
    if (!req.session.isAccount) {
        return res.status(401).json({ message: "failed acc" });
    }

    next();
}