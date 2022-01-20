const Collection = require("../../models/collection");
const Product = require("../../models/product");
const Sale = require("../../models/sale");
const ImageAlt = require("../../models/imageAlt");
let ObjectId = require('mongoose').Types.ObjectId;

// Create +
module.exports.createCollection = async function (candidate) {
    try {
        // создание объекта коллекции
        const collection = new Collection({
            name: candidate.name,
            description: candidate.description,
            isActive: candidate.isActive,
            image: {}
        });

        if(candidate.parentId && ObjectId.isValid(candidate.parentId)) {
            collection.parentId = candidate.parentId;
        } else {
            collection.parentId = null;
        }


        if (candidate.sales && candidate.sales.length) {
            collection.sales = candidate.sales.slice();
        } else {
            collection.sales = [];
        }

        if (candidate.image) {
            collection.image.url = candidate.image;
        } else {
            collection.image.url = "/images/collections/default/img_collection.jpg";
        }

        const alt = await ImageAlt.findOne({i_path: collection.image.url});
        if (alt) {
            collection.image.alt = alt.i_alt;
        } else {
            collection.image.alt = "no alt";
        }

        await collection.save();    // уже в монгу сохраняет
        return collection;

    } catch (e) {
        throw e;
    }
}

// Read +
module.exports.readCollectionById = async function(id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Collection.findById(id);
        } else {
            return null;
        }

    } catch (e) {
        throw e;
    }
}

// Update (by entity (id)) +
module.exports.updateCollection = async function (candidate) {
    try {
        const collection = await Collection.findById(candidate._id);
        if (collection) {
            collection.name = candidate.name;
            collection.description = candidate.description;
            collection.isActive = candidate.isActive;

            if(candidate.parentId && ObjectId.isValid(candidate.parentId)) {
                collection.parentId = candidate.parentId;
            } else {
                collection.parentId = null;
            }

            if (candidate.image)
                collection.image.url = candidate.image;

            const alt = await ImageAlt.findOne({i_path: collection.image.url});
            if (alt) {
                collection.image.alt = alt.i_alt;
            } else {
                collection.image.alt = "no alt";
            }


            if (candidate.sales && candidate.sales.length)
                collection.sales = candidate.sales.slice();

            // а вот тут надо обновить товары
            let products = await Product.find({collectionId: collection._id});

            collection.products = [];
            for (let product of products) {
                collection.products.push({
                    productId: product._id,
                });
            }

            await collection.save();

            return collection;
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}

// Delete +
module.exports.deleteCollectionById = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return Collection.deleteOne({_id: id});
        } else {
            return null;
        }

    } catch (e) {
        throw e;
    }
}






//======= Additional ====================
// Read All collections names +
module.exports.readAllCollectionNames = async function () {
    try {
        const collections = await Collection.find({});
        return collections.map(c => c.name);

    } catch (e) {
        throw e;
    }
}

// Read All activated collections names +
module.exports.readAllActivatedCollectionNames = async function () {
    try {
        const collections = await Collection.find({isActive: true});
        return collections.map(c => c.name);

    } catch (e) {
        throw e;
    }
}

// Read All +
module.exports.readAllCollections = async function () {
    try {
        return await Collection.find({});
    } catch (e) {
        throw e;
    }
}

// Read all activated
module.exports.readAllActivatedCollections = async function () {
    try {
        return await Collection.find({isActive: true});
    } catch (e) {
        throw e;
    }
}

// Read By Name
module.exports.readCollectionByName = async function(name) {
    try {
        return await Collection.findOne({name: name});

    } catch (e) {
        throw e;
    }
}

// Read Activated By Name
module.exports.readActivatedCollectionByName = async function(name) {
    try {
        return await Collection.findOne({name: name, isActive:true});

    } catch (e) {
        throw e;
    }
}

// Delete all
module.exports.dropCollections = async function () {
    try {
        return await Collection.deleteMany({});
    } catch (e) {
        throw e;
    }
}


// update isActive fields in old collections
module.exports.updateIsActiveFields = async function() {
    try {
        let collections = await Collection.find({});
        for (let collection of collections) {
            if (collection.isActive === undefined) {
                collection.isActive = true;
                await collection.save();
            }
        }
    } catch (e) {
        throw e;
    }
}

// обновление полей child в коллекциях
module.exports.updateCollectionsChilds = async function () {
    try {
        let collections = await Collection.find({});

        if (collections && collections.length) {
            // проверка родителей
            for (let i = 0; i < collections.length; i++) {
                const currentParentId = collections[i].parentId;
                if (currentParentId) {
                    let existedId = false;
                    for (let j = 0; j < collections.length; j++) {
                        if (i !== j) {
                            if (currentParentId.toString() === collections[j]._id.toString()) {
                                existedId = true
                                break;
                            }
                        }
                    }
                    if (!existedId) {
                        collections[i].parentId = null;
                        await collections[i].save();
                    }
                }
            }

            // обнуление детей
            for (let collection of collections) {
                collection.childIds = [];
                await collection.save();
            }

            // обход
            for (let i = 0; i < collections.length; i++) {
                for (let j = 0; j < collections.length; j++) {
                    if (i !== j) {
                        if (collections[j].parentId) {
                            if (collections[j].parentId.toString() === collections[i]._id.toString()) {
                                collections[i].childIds.push({
                                    childId: collections[j]._id,
                                });
                                await collections[i].save();
                            }
                        }
                    }
                }
            }
        }

    } catch (e) {
        throw e;
    }
}


// Create ViewModel
module.exports.createViewModelFromCollection = function (collection) {
    try {
        let isEmpty = true;
        // проверка на пустой объект
        for(let i in collection)
            isEmpty = false;   // не пустой

        if (collection && !isEmpty) {
            let collectionVM = {
                _id: collection._id,
                name: collection.name,
                description: collection.description,
                isActive: collection.isActive,
                parentId: null,
                childIds: [],
                image: {
                    url: "",
                    alt: "",
                },
                products: [],
                sales: []
            };

            if (collection.parentId) {
                collectionVM.parentId = collection.parentId;
            }

            if (collection.childIds && collection.childIds.length) {
                for (let childId of collection.childIds) {
                    collectionVM.childIds.push({
                        childId: childId
                    });
                }
            }

            if (collection.image && collection.image.url)
                collectionVM.image.url = collection.image.url;

            if (collection.image && collection.image.alt)
                collectionVM.image.alt = collection.image.alt;

            for (let product of collection.products) {
                collectionVM.products.push({
                    productId: product.productId
                });
            }

            if (collection.sales && collection.sales.length) {
                for (let sale of collection.sales) {
                    collectionVM.sales.push({
                        saleId: sale.saleId
                    });
                }
            }

            return collectionVM;

        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}

// Refresh products list in collection
module.exports.refreshProductsInCollectionById = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            const collection = await Collection.findById(id);

            if (collection) {
                // получаем товары, у которых collectionId равен _id коллекции
                let products = await Product.find({collectionId: collection._id});

                collection.products = [];
                for (let product of products) {
                    collection.products.push({
                        productId: product._id,
                    });
                }

                await collection.save();
                return collection;

            } else {
                return {};
            }
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}

module.exports.refreshProductsInCollectionByName = async function (name) {
    try {
        const collection = await Collection.findOne({name: name});
        if (collection) {
            let products = await Product.find({collectionId: collection._id});

            collection.products = [];
            for (let product of products) {
                collection.products.push({
                    productId: product._id,
                });
            }

            await collection.save();
            return collection;

        } else {
            return {};
        }

    } catch (e) {
        throw e;
    }
}

module.exports.refreshProductsInCollections = async function () {
    try {
        // получаем все товары
        const products = await Product.find({});

        // получаем все коллекции
        const collections = await Collection.find({});

        for(let collection of collections) {
            const currentProducts = products.filter(p => p.collectionId.toString() === collection._id.toString());

            collection.products = [];
            for (let product of currentProducts) {
                collection.products.push({
                    productId: product._id,
                });
            }

            await collection.save();
        }

    } catch(e) {
        throw e;
    }
}

module.exports.getCollectionImageRef = async function(id) {
    try {
        if (ObjectId.isValid(id)) {
            const collection = await Collection.findById(id);
            return collection.image;
        } else {
            return "";
        }

    } catch (e) {
        throw e;
    }
}

module.exports.getCollectionImageRefByName = async function(name) {
    try {
        const collection = await Collection.findOne({name: name});
        return collection.image;

    } catch (e) {
        throw e;
    }
}

// проверка на имя такой-же коллекции в БД
module.exports.checkForCollectionInDb = async function (name) {
    try {
        const collection = await Collection.findOne({name: name});
        if (collection)
            return true;
        else
            return false;
    } catch (e) {
        throw e;
    }
}


// добавление скидки (акции) к коллекции
module.exports.addSaleToCollection = async function(collectionId, saleId) {
    try {
        if (ObjectId.isValid(collectionId) && ObjectId.isValid(saleId)) {
            // получить коллекцию
            let collection = await Collection.findById(collectionId);
            if (collection) {
                // получить скидку
                const sale = await Sale.findById(saleId);
                if (sale) {
                    if (!collection.sales)
                        collection.sales = [];

                    const idx = collection.sales.map( (sid) => {
                        if (sid.saleId) {
                            return sid.saleId.toString()
                        }
                    }).indexOf(saleId.toString());

                    if (idx === -1) {
                        collection.sales.push({ saleId: sale._id});
                    }
                    await collection.save();

                    return {
                        sales: collection.sales
                    };

                } else {
                    return { message: "no sale by id" };
                }
            } else {
                return { message: "no collection by id" };
            }
        } else {
            return { message: "wrong collectionId or saleId" };
        }
    } catch (e) {
        throw e;
    }
}

// удаление скидки из товара
module.exports.removeSaleFromCollection = async function (collectionId, saleId) {
    try {
        if (ObjectId.isValid(collectionId) && ObjectId.isValid(saleId)) {
            // получить товар
            let collection = await Collection.findById(collectionId);
            if (collection) {
                // получить скидку
                const sale = await Sale.findById(saleId);
                if (sale) {
                    if (!collection.sales)
                        collection.sales = [];

                    const idx = collection.sales.map( (sid) => {
                        if (sid.saleId) {
                            return sid.saleId.toString()
                        }
                    }).indexOf(saleId.toString());

                    if (idx !== -1) {
                        collection.sales = collection.sales.filter( sid => sid.saleId.toString() !== saleId.toString());
                    }
                    await collection.save();

                    return {
                        sales: collection.sales
                    };

                } else {
                    return { message: "no sale by id" };
                }
            } else {
                return { message: "no collection by id" };
            }
        } else {
            return { message: "wrong collectionId or saleId" };
        }
    } catch (e) {
        throw e;
    }
}


// получение всех коллекций по скдике (id)
// module.exports.getProductsBySaleId = async function(saleId) {
//     try {
//         return await Collection.find({sales: [saleId]});
//
//     } catch (e) {
//         throw e;
//     }
// }
//
// module.exports.getActivatedProductsBySaleId = async function (saleId) {
//     try {
//         return await Collection.find({$and: [{sales: [saleId]},{isActive:true}]});
//
//     } catch (e) {
//         throw e;
//     }
// }