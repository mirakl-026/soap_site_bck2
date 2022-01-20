// модель для хранения данных для поиска
const {Schema, model} = require("mongoose")

const searchSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    searchObjectType: {
        type: String,   // может быть либо collection либо product
        required: true
    },

    // если type = collection, то должно быть поле collectionId, а поле productId пустое (желательно вообще нет)
    collectionId: {
        type: Schema.Types.ObjectId,
        ref: "Collection",
    },

    // если type = product, то должно быть поле productId, а поле collectionId пустое (желательно вообще нет)
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },

    keywords: {
        type: String
    },
});

module.exports = model("Search", searchSchema);