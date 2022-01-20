module.exports = function (req, res, next) {
    res.locals.isAcc = req.session.isAccount;
    res.locals.isAdm = req.session.isAdmin;

    res.locals.csrf = req.csrfToken();    //*
    
    next();
}