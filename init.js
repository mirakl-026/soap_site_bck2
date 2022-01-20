// сервис для инциализации сервера - все предстартовые операции
const MetaService = require("./services/mongodb/metaService");
const StockService = require("./services/mongodb/stockService");
const StaticPageService = require("./services/mongodb/staticPageService");
const ImagesService = require("./services/mongodb/imagesService");
const BackupService = require("./services/backupService");
const LoggerService = require("./services/loggerService");
const CollectionService = require("./services/mongodb/collectionService");
const EmailService = require("./services/emailService");
const SearchService = require("./services/mongodb/searchService");


module.exports.init = async function () {

    // инициализация объекта Meta
    await metaInit();

    // инициализация склада
    await stockInit();

    // инициализация страниц
    await staticPagesInit();

    // обновление картинок в БД
    await imagesInit();

    // инициализация логгера сервера (не кастомного)
    serverLoggerInit();

    // инициализация объекта бэкапа
    backupInit();

    // инициализация почтовика
    emailInit();

    // обновление isActive в старых коллекциях, когда этого не было
    await updateIsActiveInCollections();

    // обновление товаров в коллекциях
    await updateProductsInCollections();

    // обновление поисковой информации
    await updateSearch();
}

async function metaInit() {
    try {
        const isMeta = await MetaService.isMetaExistsInDB();
        if (!isMeta) {
            await MetaService.metaInitInDB();
        }

        //await MetaService.metaAllTrue();  // установить true во всю мету
        //await MetaService.metaEmailToFalse();
        await MetaService.metaAllFalse();
        //await MetaService.metaEmailToTrue();

        await MetaService.refreshMetaVars();
    } catch (e) {
        console.log(e);
    }
}

async function stockInit() {
    try {
        const isStock = await StockService.isStockExists();
        if (!isStock) {
            await StockService.initStock();
        }
    } catch (e) {
        console.log(e);
    }
}

// инициализация страниц со статическим контентом
async function staticPagesInit() {
    try {
        const isAbout = await StaticPageService.isStaticPageExists("about");
        if (!isAbout) {
            await StaticPageService.createStaticPageViaName("about");
        }

        const isContacts = await StaticPageService.isStaticPageExists("contacts");
        if (!isContacts) {
            await StaticPageService.createStaticPageViaName("contacts");
        }

        const isDelivery = await StaticPageService.isStaticPageExists("delivery");
        if (!isDelivery) {
            await StaticPageService.createStaticPageViaName("delivery");
        }

        const isPartnership = await StaticPageService.isStaticPageExists("partnership");
        if (!isPartnership) {
            await StaticPageService.createStaticPageViaName("partnership");
        }

        const isQasection = await StaticPageService.isStaticPageExists("qasection");
        if (!isQasection) {
            await StaticPageService.createStaticPageViaName("qasection");
        }

        const isSertificates = await StaticPageService.isStaticPageExists("sertificates");
        if (!isSertificates) {
            await StaticPageService.createStaticPageViaName("sertificates");
        }
    } catch (e) {
        console.log(e);
    }
}

async function imagesInit() {
    try {
        await ImagesService.refreshImagesData();
    } catch (e) {
        console.log(e);
    }
}


function serverLoggerInit() {
    try {
        LoggerService.serverLoggerInit();
    } catch (e) {
        console.log(e);
    }
}


function backupInit() {
    try {
        BackupService.backupInit();
    } catch (e) {
        console.log(e);
    }
}


function emailInit() {
    try {
        EmailService.initEmailTransport();
    } catch (e) {
        console.log(e);
    }
}


async function updateIsActiveInCollections() {
    try {
        await CollectionService.updateIsActiveFields();
    } catch (e) {
        console.log(e);
    }
}

async function updateProductsInCollections () {
    try {
        await CollectionService.refreshProductsInCollections();
    } catch (e) {
        console.log(e);
    }
}

async function updateSearch() {
    try {
        await SearchService.refreshSearchData();
    } catch (e) {
        console.log(e);
    }
}


