// сервис управления содержимым стат.страниц
const StaticPage = require("../../models/staticPage");
let ObjectId = require('mongoose').Types.ObjectId;

/*
    Статические страницы - синглтоны - я реализую CRUD, но на самом деле от него используется
    лишь Create - на этапе инициализации и Update - для изменения контента
 */


// CRUD (но он не будет использоваться, все значимые методы после)
// Create
module.exports.createStaticPage = async function (candidate) {
    try {
        const staticPage = new StaticPage({
            pageName: candidate.pageName,
            content: candidate.content
        });
        await staticPage.save();
        return staticPage;

    } catch (e) {
        throw e;
    }
}


// Read
module.exports.readStaticPage = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await StaticPage.findById(id);
        } else {
            return null;
        }

    } catch (e) {
        throw e;
    }
}


module.exports.updateStaticPage = async function (candidate) {
    try {
        const staticPage = await StaticPage.findById(candidate._id);
        if(staticPage) {
            staticPage.pageName = candidate.pageName;
            staticPage.content = candidate.content;
            await staticPage.save();

            return staticPage;

        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}


module.exports.deleteStaticPage = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await StaticPage.deleteOne({_id: id});
        } else {
            return null;
        }

    } catch (e) {
        throw e;
    }
}




// Additional (в зависимости от содержимого и модели)
// этап инициализации - созданию с нуля с шаблоном и без
module.exports.createStaticPageViaData = async function (pageName, html_data) {
    try {
        const staticPage = new StaticPage({
            pageName: pageName,
            content: html_data
        });
        await staticPage.save();

        return staticPage;

    } catch (e) {
        throw e;
    }
}


// страница существет в БД? - нужно при инициализации
module.exports.isStaticPageExists = async function (pageName) {
    try {
        const staticPage = await StaticPage.findOne({pageName: pageName});
        if (staticPage)
            return true;
        else
            return false;

    } catch (e) {
        throw e;
    }
}


module.exports.createStaticPageViewModel = function(staticPage) {
    try {
        if (staticPage) {
            return {
                pageName: staticPage.pageName,
                content: staticPage.content
            };
        } else {
            return {};
        }

    } catch (e) {
        throw e;
    }
}


module.exports.createStaticPageViaName = async function (pageName) {
    try {
        let baseContent = "";
        // about, delivery, contacts, partnership, qasection, sertificates
        if (pageName === "about") {
            baseContent =
                `<h1>О нас</h1>
                <div>Мы самые лучшие!</div>`;
        }
        else if (pageName === "delivery") {
            baseContent =
                `<h1>Доставка</h1>
                <div>Мы доставляем туда-сюда, налево и направо!</div>`;
        }
        else if (pageName === "contacts") {
            baseContent =
                `<h1>Контакты</h1>
                <div>Телефоны, явки, пароли</div>`;
        }
        else if (pageName === "partnership") {
            baseContent =
                `<h1>Партнерство</h1>
                <div>Мы сотрудничаем только с достойнейшими!</div>`;
        }
        else if (pageName === "qasection") {
            baseContent =
                `<h1>Вопрос-ответ</h1>
                <div>Кто не понял - тот поймёт</div>`;
        }
        else if (pageName === "sertificates") {
            baseContent =
                `<h1>Сертификаты</h1>
                <div>Во какие!</div>`;
        }
        else {
            return {};
        }

        const staticPage = new StaticPage({
            pageName: pageName,
            content: baseContent
        });
        await staticPage.save();

        return staticPage;

    } catch (e) {
        throw e;
    }
}


// получение контента (зависит от модели - методов может быть больше)
module.exports.readStaticPageContentByName = async function (pageName) {
    try {
        const staticPage = await StaticPage.findOne({pageName: pageName});
        return staticPage.content;

    } catch (e) {
        throw e;
    }
}

module.exports.readAllStaticPages = async function() {
    try {
        return await StaticPage.find({});

    } catch (e) {
        throw e;
    }
}


// редактирование контента
module.exports.editStaticPageContent = async function(pageName, content) {
    try {
        const staticPage = await StaticPage.findOne({pageName: pageName});
        if (staticPage) {
            staticPage.content = content;
            await staticPage.save();
            return {
                edited: true
            };

        } else {
            return {
                edited: false
            };
        }

    } catch (e) {
        throw e;
    }
}


// удаление страницы (единственной)
module.exports.deleteStaticPageByName = async function(pageName) {
    try {
        return await StaticPage.deleteOne({pageName: pageName});
    } catch (e) {
        throw e;
    }
}