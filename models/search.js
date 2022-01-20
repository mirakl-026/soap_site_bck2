// модель для хранения данных для поиска

module.exports = class Search{
    name;  // string, required

    searchObjectType;  // string, required, может быть либо collection либо product

    // если type = collection, то должно быть поле collectionId, а поле productId пустое (желательно вообще нет)
    collectionId;  // Mongodb.ObjectId - ref "Collection"

    // если type = product, то должно быть поле productId, а поле collectionId пустое (желательно вообще нет)
    productId;  // Mongodb.ObjectId - ref "Product"

    keywords;  // string

    constructor() {
        
    }
};