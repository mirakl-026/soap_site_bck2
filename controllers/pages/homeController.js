// домашняя страница
module.exports.index = function (req, res) {
    try {
        return res.render("index", {
            title: "Главная страница",
            isHome: true
        });
    } catch (e) {
        console.log(e);

    }
}