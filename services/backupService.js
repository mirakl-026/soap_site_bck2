// TODO - сервис для управления бекапами (через cron)
const MetaService = require("../services/mongodb/metaService");
const CronJob = require('cron').CronJob;
const settings = require("../settings");
const fs = require("fs").promises;
const path = require("path");

const Account = require("../models/account");
const Collection = require("../models/collection");
const ImageFile = require("../models/imageFile");
const Meta = require("../models/meta");
const Order = require("../models/order");
const Product = require("../models/product");
const StaticPage = require("../models/staticPage");
const Stock = require("../models/stock");



const backupPath = path.join(settings.PROJECT_DIR, "/backup/");
const backupZipPath = path.join(backupPath,"backup_feellab.zip");

const tempPath = path.join(settings.PROJECT_DIR, "/backup/temp/");
const publicPath = path.join(settings.PROJECT_DIR, "/public/");

const tempModelsPath = path.join(settings.PROJECT_DIR, "/backup/temp/models/");
const tempLogsPath = path.join(settings.PROJECT_DIR, "/backup/temp/logs/");
const tempPublicPath = path.join(settings.PROJECT_DIR, "/backup/temp/public/");

// zip архиватор
const AdmZip = require("adm-zip");
const constants = require("constants");


// инициализация бэкапера (1 раз при запуске и чтении меты)
let backupJob;

module.exports.bcPath = backupZipPath;

module.exports.backupInit = function () {
    try {
        // '* * * * * *' - секунда
        // '* * * * *' - минута
        backupJob = new CronJob('* * * * *', this.updateBackup, null, true, 'Europe/Moscow');   // каждая минута
        backupJob.start();

        if (MetaService.isBackup()) {
            console.log("cron: [backup] launched");
            return true;
        } else {
            console.log("cron: [backup] sleep...");
            return false;
        }
    } catch (e) {
        console.log(e);
    }
}

// функция создания бэкапа, которая будет вызываться кроном (при условии из меты) либо по явному вызову
module.exports.updateBackup = async function () {
    try {
        if (MetaService.isBackup()) {
            // проверка путей
            const rp = await refreshPaths();
            if (rp) {
                // 1. считать данные по всем моделям из БД и добавить в JSON файлы
                await saveAllDbDataToTemp();

                // 2. считать логи - так-же добавить в JSON
                await saveAllLogsToTemp();

                // 3. считать все public данные
                await recSaveAllPublicToTemp(publicPath, "");

                // 4. всё полученное добавить в zip архив
                const result = await saveTempToZip();
                console.log("update backup...");
            } else {
                console.log("err creating path");
            }
        }
    } catch (e) {
        console.log(e);
    }
}



async function refreshPaths() {
    try {
        // проверить все пути
        const dir = await fs.opendir(settings.PROJECT_DIR);

        // все папки проекта
        let rootFolders = [];
        for await (const dirent of dir) {
            //console.log(dirent.name);
            rootFolders.push(dirent.name);
        }

        // создаём папки бэкапа
        if (rootFolders.indexOf("backup") < 0) {
            // папки бэкапа нет, создать все
            await fs.mkdir(backupPath);
            await fs.mkdir(tempPath);
            await fs.mkdir(tempModelsPath);
            await fs.mkdir(tempLogsPath);
            await fs.mkdir(tempPublicPath);

        } else {
            // папка бэкапа есть, проверяем дальше
            const bu_dir = await fs.opendir(backupPath);
            let backupFolders = [];
            for await (const dirent of bu_dir) {
                //console.log(dirent.name);
                backupFolders.push(dirent.name);
            }

            if (backupFolders.indexOf("temp") < 0) {
                await fs.mkdir(tempPath);
                await fs.mkdir(tempModelsPath);
                await fs.mkdir(tempLogsPath);
                await fs.mkdir(tempPublicPath);
            } else {
                // папка temp есть, проверяем дальше
                const temp_dir = await fs.opendir(tempPath);
                let tempFolders = [];
                for await (const dirent of temp_dir) {
                    //console.log(dirent.name);
                    tempFolders.push(dirent.name);
                }
                if (tempFolders.indexOf("models") < 0) {
                    await fs.mkdir(tempModelsPath);
                }
                if (tempFolders.indexOf("logs") < 0) {
                    await fs.mkdir(tempLogsPath);
                }
                if (tempFolders.indexOf("public") < 0) {
                    await fs.mkdir(tempPublicPath);
                }
            }
        }
        return true;

    } catch (e) {
        console.log(e);
    }
}


// считать все данные по моделям и записать в JSON файлы
async function saveAllDbDataToTemp () {
    try {
        let tempData = {};

        // accounts
        tempData = await Account.find({});
        await saveDataToJSON(tempData, "account.json", tempModelsPath);

        // collection
        tempData = await Collection.find({});
        await saveDataToJSON(tempData, "collection.json", tempModelsPath);

        // imageFile
        tempData = await ImageFile.find({});
        await saveDataToJSON(tempData, "imageFile.json", tempModelsPath);

        // meta
        tempData = await Meta.find({});
        await saveDataToJSON(tempData, "meta.json", tempModelsPath);

        // order
        tempData = await Order.find({});
        await saveDataToJSON(tempData, "order.json", tempModelsPath);

        // product
        tempData = await Product.find({});
        await saveDataToJSON(tempData, "product.json", tempModelsPath);

        // staticPage
        tempData = await StaticPage.find({});
        await saveDataToJSON(tempData, "staticPage.json", tempModelsPath);

        // stock
        tempData = await Stock.find({});
        await saveDataToJSON(tempData, "stock.json", tempModelsPath);

        return true;

    } catch (e) {
        console.log(e);
    }
}

// считать все логи и запись в JSON файлы
async function saveAllLogsToTemp(dbData) {
    try {
        // асинхронное чтение
        const logData = await fs.readFile(path.join(settings.PROJECT_DIR, "/logs/server.log"), "utf8");
        const logDataJson = { server_log_data: logData };
        await saveDataToJSON(logDataJson, "server_log.json", tempLogsPath);

        return true;

    } catch (e) {
        console.log(e);
    }
}

async function saveDataToJSON(data, fileName, filePath) {
    const jsonData = JSON.stringify(data);
    //console.log(jsonData);
    await fs.writeFile(path.join(filePath, fileName), jsonData);
}


// рекурсивное сохранение public в temp
async function recSaveAllPublicToTemp(rec_path, addPath) {
    try {

        // получить содержимое папки public
        const public_dir = await fs.opendir(rec_path);
        for await (const dirent of public_dir) {
            if (dirent.isFile()) {
                // это файл копируем по пути с добавкой
                const fileToCopyPath = path.join(rec_path, dirent.name);
                await fs.copyFile(fileToCopyPath, path.join(tempPublicPath, addPath, dirent.name));
            }
            else {
                // это папка, проверяем есть ли в temp - такая-же
                const dir = await fs.opendir(path.join(tempPublicPath, addPath));
                let dirFolders = [];
                for await (const dirent of dir) {
                    dirFolders.push(dirent.name);
                }

                // такой-же папки нет в temp -создаём, запускаем рекурсию
                if (dirFolders.indexOf(dirent.name) < 0) {
                    await fs.mkdir(path.join(tempPublicPath, addPath, dirent.name));
                    await recSaveAllPublicToTemp(path.join(rec_path, dirent.name), path.join(addPath, dirent.name));
                } else {
                    // такая папка есть в temp - запускаем рекурсию
                    await recSaveAllPublicToTemp(path.join(rec_path, dirent.name), path.join(addPath, dirent.name));
                }
            }
        }
        return {};

    } catch (e) {
        console.log(e);
    }
}



// записать всё в zip архив
async function saveTempToZip() {
    try {
        // проверить на наличие бэкапа - удалить, создать заново
        const dir = await fs.opendir(backupPath);
        let backupFoldersAndFiles = [];
        for await (const dirent of dir) {
            backupFoldersAndFiles.push(dirent.name);
        }

        // создаём папки бэкапа
        if (backupFoldersAndFiles.indexOf("backup.zip") >= 0)
            await fs.unlink(backupZipPath);


        let zip = new AdmZip();
        zip.addLocalFolder(tempPath);
        await zip.writeZipPromise(backupZipPath, {});
        return true;

    } catch (e) {
        console.log(e);
    }
}



// функция развёртывания из бэкапа в БД и т.д.
module.exports.releaseFromBackup = function () {
    try {
        // 1. Получить доступ к zip архиву - распаковать во временный буффер

        // 2. развернуть логи - сохранить в logs

        // 3. развернуть все JSON объекты - превратить в объекты подходящие для записи в БД

        // 4. записать все объекты в БД*

        console.log("release from backup!");

    } catch (e) {
        console.log(e);
    }
}

// функция возвращающая VM бэкапа для админа
module.exports.createBackUpViewModel = function () {
    try {
        // компактное представление файловой иерархии , которое будет в бэкапе (содержимое?)
        return {
            backup: "hello from backup"
        }
    } catch (e) {
        console.log(e);
    }
}
