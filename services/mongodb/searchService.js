// сервис поиска
const Search = require("../../models/search");

const Product = require("../../models/product");
const Collection = require("../../models/collection");
let ObjectId = require('mongoose').Types.ObjectId;




// поиск по всему
module.exports.find = async function (userInput) {
    try {
        let userInputLC = userInput.toLowerCase();
        const allSearches = await Search.find({});
        let findResult = [];
        for (let search of allSearches) {
            if (search.keywords.indexOf(userInputLC) >= 0) {
                findResult.push(search);
            }
        }
        return findResult;

    } catch (e) {
        throw e;
    }
}

// поиск только по именам
module.exports.findInNames = async function (userInput) {
    try {
        let userInputLC = userInput.toLowerCase();
        const allSearches = await Search.find({});
        let findResult = [];
        for (let search of allSearches) {
            if (search.name.indexOf(userInputLC) >= 0) {
                findResult.push(search);
            }
        }
        return findResult;

    } catch (e) {
        throw e;
    }
}


module.exports.searchResultToJSON = function (foundedItems) {
    try {
        if (foundedItems && foundedItems.length > 0) {
            let jsonResult = [];
            for(let item of foundedItems) {
                let ref;
                if (item.searchObjectType === "collection")
                    ref = item.collectionId;
                else if (item.searchObjectType === "product")
                    ref = item.productId;
                else
                    continue;

                jsonResult.push({
                    name: item.name,
                    type: item.searchObjectType,
                    ref: ref
                });
            }
            return jsonResult;
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}




// обновить поисковые данные (полностью)
module.exports.refreshSearchData = async function () {
    try {
        // удалить все поисковые данные
        const result = await Search.deleteMany({});
        if (result) {
            // считать все товары и коллекции
            const collections = await Collection.find({});
            for (let collection of collections) {
                await this.updateSearchDataFromCollection(collection);
            }

            const products = await Product.find({});
            for (let product of products) {
                await this.updateSearchDataFromProduct(product);
            }

            return {status: "search data updated"};

        } else {
            return {message: "error in deleteMany of searches"};
        }
    } catch (e) {
        throw e;
    }
}


// добавление поисковых данных от коллекции
module.exports.updateSearchDataFromCollection = async function (collection) {
    try {
        if (collection.name && collection.name.length > 1) {
            if (collection.description && collection.description.length > 1) {

                const unitedNameAndDescription = collection.name + " " + collection.description;
                let collectionKeywords = unitedNameAndDescription.split(" ").filter(word => word.length > 3).map(word => word.toLowerCase());
                collectionKeywords = new Set(collectionKeywords);   // превращение в Set, чтобы получить только уникальные слова
                collectionKeywords = Array.from(collectionKeywords).join(" ");    // превращение в массив и объединение в строку

                // проверка на то, что searchData по этой коллекции уже есть
                const search = await Search.findOne({collectionId: collection._id});
                if (search) {
                    // изменить
                    search.name = collection.name.toLowerCase();
                    search.keywords = collectionKeywords;
                    await search.save();
                    return {status: "search data updated"};

                } else {
                    // добавить
                    const searchItem = new Search({
                        name: collection.name.toLowerCase(),
                        searchObjectType: "collection",
                        collectionId: collection._id,
                        productId: undefined,
                        keywords: collectionKeywords
                    });
                    await searchItem.save();
                    return {status: "search data updated"};

                }
            } else {
                return {message: "search: collection have no description"};
            }
        } else {
            return {message: "search: collection have no name"};
        }
    } catch (e) {
        throw e;
    }
}


// добавление поисковых данных от товара
module.exports.updateSearchDataFromProduct = async function (product) {
    try {
        if (product.isActive && product.isActive === true) {
            if (product.name && product.name.length > 1) {
                if (product.description && product.description.length > 1) {

                    const unitedNameAndDescription = product.name + " " + product.description;

                    let productKeywords = unitedNameAndDescription.split(" ").filter(word => word.length > 3).map(word => word.toLowerCase());
                    productKeywords = new Set(productKeywords);   // превращение в Set, чтобы получить только уникальные слова
                    productKeywords = Array.from(productKeywords).join(" ");    // превращение в массив и объединение в строку

                    // проверка на то, что searchData по этому товару уже есть
                    const search = await Search.findOne({productId: product._id});
                    if (search) {
                        // изменить
                        search.name = product.name.toLowerCase();
                        search.keywords = productKeywords;
                        await search.save();
                        return {status: "search data updated"};

                    } else {
                        // добавить
                        const searchItem = new Search({
                            name: product.name.toLowerCase(),
                            searchObjectType: "product",
                            collectionId: undefined,
                            productId: product._id,
                            keywords: productKeywords
                        });
                        await searchItem.save();
                        return {status: "search data updated"};

                    }
                } else {
                    return {message: "search: product have no description"};
                }
            } else {
                return {message: "search: product have no name"};
            }
        } else {
            const deactivatedProduct = await Search.findOne({productId: product._id});
            if (deactivatedProduct){
                // если товар есть, но он не активен - удалить поисковую информацию
                await Search.deleteOne({productId: deactivatedProduct._id});
            }
            return {message: "search: product not active"};
        }
    } catch (e) {
        throw e;
    }
}


// удаление поисковых данных категории
module.exports.deleteSearchDataByCollectionId = async function (collectionId) {
    try {
        if (ObjectId.isValid(collectionId)) {
            return await Search.deleteOne({collectionId: collectionId});
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}

// удаление поисковых данных товара
module.exports.deleteSearchDataByProductId = async function (productId) {
    try {
        if (ObjectId.isValid(productId)) {
            return await Search.deleteOne({productId: productId});
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}


