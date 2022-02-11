// мета-настройки работы сайта, так-же как и склад - скинглтон
const {Schema, model} = require("mongoose");

const metaSchema = new Schema({
    isEmails: Boolean,

    isLog: Boolean,

    isBackup: Boolean
});

module.exports = model("Meta", metaSchema);

