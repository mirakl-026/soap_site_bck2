// панель управления администратора
module.exports.adminPanel = function (req, res) {
    try {
        res.render("adminPanel", {
            title: "Адм=панель"
        });
    } catch (e) {
        console.log(e);

    }
}