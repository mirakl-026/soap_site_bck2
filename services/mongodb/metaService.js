// сервис управления meta моделью - всего сайта
const Meta = require("../../models/meta");
let ObjectId = require('mongoose').Types.ObjectId;

// === Область БД
// Meta является синглтоном и существует всегда, поэтому CRUD не нужен как бы
// Create
module.exports.createMetaInDB = async function (candidate) {
    try {
        const meta = new Meta({
            isEmails: candidate.isEmails,
            isLog: candidate.isLog,
            isBackup: candidate.isBackup
        });

        await meta.save();
        return meta;

    } catch (e) {
        throw e
    }
}

// Read - (синглтон)
module.exports.readMetaFromDB = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Meta.findById(id);
        } else {
            return null;
        }

    } catch (e) {
        throw e
    }
}

//Update - (синглтон)
module.exports.updateMetaInDB = async function (candidate) {
    try {
        const meta = await Meta.findById(candidate._id);
        if(meta) {
            meta.isEmails = candidate.isEmails;
            meta.isLog = candidate.isLog;
            meta.isBackup = candidate.isBackup;
            await meta.save();
            return meta;
        } else {
            return {};
        }
    } catch (e) {
        throw e
    }
}

// Delete
module.exports.deleteMetaFromDB = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Meta.deleteOne({_id: id});
        } else {
            return null;
        }

    } catch (e) {
        throw e
    }
}

// additional
// ViewModel
module.exports.getMetaDataFromDB = async function() {
    try {
        return await Meta.findOne({});
    } catch (e) {
        throw e;
    }
}

module.exports.createMetaDbViewModel = function (meta) {
    try {
        if (meta) {
            return {
                isEmails: meta.isEmails,
                isLog: meta.isLog,
                isBackup: meta.isBackup
            }

        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}

// инициализация объекта Meta
module.exports.metaInitInDB = async function () {
    try {
        let meta = new Meta({
            isEmails: true,
            isLog: true,
            isBackup: true
        });
        await meta.save();
        return meta;
    } catch (e) {
        throw e;
    }
}

module.exports.metaAllTrue = async function () {
    try {
        let meta = await Meta.findOne({});
        if (meta) {
            meta.isEmails = true;
            meta.isLog = true;
            meta.isBackup = true;
            await meta.save();

            return true;

        } else {
            return false;
        }

    } catch (e) {
        throw e;
    }
}

module.exports.metaEmailToFalse = async function () {
    try {
        let meta = await Meta.findOne({});
        if (meta) {
            meta.isEmails = false;
            meta.isLog = true;
            meta.isBackup = true;
            await meta.save();

            return true;

        } else {
            return false;
        }

    } catch (e) {
        throw e;
    }
}

module.exports.metaEmailToTrue = async function() {
    try {
        let meta = await Meta.findOne({});
        if (meta) {
            meta.isEmails = true;
            meta.isLog = false;
            meta.isBackup = false;
            await meta.save();

            return true;

        } else {
            return false;
        }

    } catch (e) {
        throw e;
    }
}


module.exports.metaAllFalse = async function() {
    try {
        let meta = await Meta.findOne({});
        if (meta) {
            meta.isEmails = false;
            meta.isLog = false;
            meta.isBackup = false;
            await meta.save();

            return true;

        } else {
            return false;
        }

    } catch (e) {
        throw e;
    }
}

// проверка - meta существует?
module.exports.isMetaExistsInDB = async function () {
    try {
        const meta = await Meta.findOne({})
        if (meta)
            return true;
        else
            return false;
    } catch (e) {
        throw e;
    }
}



// ======================== Область переменных
let metaIsEmails = false;
let metaIsLog = false;
let metaIsBackup = false;

// обновить переменные из БД
module.exports.refreshMetaVars = async function () {
    try {
        const meta = await Meta.findOne({});
        if (meta) {
            metaIsEmails = meta.isEmails;
            metaIsLog = meta.isLog;
            metaIsBackup = meta.isBackup;

            return true;
        } else {
            return false;
        }
    } catch (e) {
        throw e;
    }
}

module.exports.isEmails = function () {
    return metaIsEmails;
}

module.exports.isLog = function () {
    return metaIsLog;
}

module.exports.isBackup = function () {
    return metaIsBackup;
}


