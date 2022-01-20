// сервис по управлению удалёнными объектами (account | collection | order | product | sale)
const DeletedEntity = require("../../models/deletedEntity");
let ObjectId = require('mongoose').Types.ObjectId;

const Account = require("../../models/account");
const Collection = require("../../models/collection");
const Order = require("../../models/order");
const Product = require("../../models/product");
const Sale = require("../../models/sale");
/*
// CRUD
module.exports.createDeletedEntity = async function (candidate) {
    try {
        const de = new DeletedEntity({
            entityType: candidate.entityType,
            entityPropsJSON: candidate.entityPropsJSON
        });

        await de.save();
        return de;

    } catch (e) {
        throw e;
    }
}

module.exports.readDeletedEntity = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await DeletedEntity.findById(id);

        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}

module.exports.updateDeletedEntity = async function (candidate) {
    try {
        const de = await DeletedEntity.findById(candidate._id);
        if (de) {
            de.entityType = candidate.entityType;
            de.entityPropsJSON = candidate.entityPropsJSON;

            await de.save();
            return de;

        } else {
            return {};
        }

    } catch (e) {
        throw e;
    }
}

module.exports.deleteDeletedEntity = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await DeletedEntity.deleteOne({_id: id});
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}
*/

// Additional

// add entity to deleted
module.exports.addEntityToDeleted = async function(entityType, candidate) {
    try {
        //account | collection | order | product | sale
        if (entityType === "account" ||
            entityType === "collection" ||
            entityType === "order" ||
            entityType === "product" ||
            entityType === "sale"
        ) {
            let de = new DeletedEntity({
                entityType: entityType,
                deletedObjectId: candidate._id,
                entityPropsJSON: JSON.stringify(candidate)
            });

            await de.save();

            return de;

        } else {
            return {message: "wrong type!"};
        }
    } catch (e) {
        throw e;
    }
}

// read all
module.exports.readAllDeletedEntities = async function () {
    try {
        return await DeletedEntity.find({});
    } catch (e) {
        throw e;
    }
}


// recover entity
module.exports.recoverDeletedEntity = async function(entityId) {
    try {
        if (ObjectId.isValid(entityId)) {
            const de = await DeletedEntity.findById(entityId);
            if (de) {
                const result = await recoverEntity(de);
                if (!result.message) {
                    await DeletedEntity.deleteOne({_id: de._id});
                    return result;
                } else {
                    return result;
                }
            } else {
                return {message:"no deleted entity by id"};
            }
        } else {
            return {message:"wrong id"};
        }
    } catch (e) {
        throw e;
    }
}

// recover entity by ObjectId
module.exports.recoverDeletedEntityByObjectId = async function(objectId) {
    try {
        if (ObjectId.isValid(objectId)) {
            const de = await DeletedEntity.findOne( {deletedObjectId: objectId});
            if (de) {
                const result = await recoverEntity(de);
                if (!result.message) {
                    await DeletedEntity.deleteOne({_id: de._id});
                    return result;
                } else {
                    return result;
                }
            } else {
                return {message:"no deleted object by id"};
            }
        } else {
            return {message:"wrong id"};
        }
    } catch (e) {
        throw e;
    }
}

async function recoverEntity(deletedEntity) {
    try {
        if (deletedEntity.entityType){
            if (deletedEntity.entityType === "account") {
                await recoverAccount(deletedEntity.entityPropsJSON);
                return {status: "account recovered"};

            } else if (deletedEntity.entityType === "collection") {
                await recoverCollection(deletedEntity.entityPropsJSON);
                return {status: "collection recovered"};

            } else if (deletedEntity.entityType === "order") {
                await recoverOrder(deletedEntity.entityPropsJSON);
                return {status: "order recovered"};

            } else if (deletedEntity.entityType === "product") {
                await recoverProduct(deletedEntity.entityPropsJSON);
                return {status: "product recovered"};

            } else if (deletedEntity.entityType === "sale") {
                await recoverSale(deletedEntity.entityPropsJSON);
                return {status: "sale recovered"};

            } else {
                return {message: "wrong entityType in db"}
            }
        } else {
            return {message:"no entityType in db"}
        }
    } catch (e) {
        throw e;
    }
}

async function recoverAccount(propsJSON) {
    try {
        const candidate = JSON.parse(propsJSON);
        let account = new Account({
            _id: candidate._id,
            email: candidate.email,
            name: candidate.name,
            password: candidate.password,
            verified: candidate.verified,
            emailToken: candidate.emailToken,
            emailTokenExp: candidate.emailTokenExp,
            resetToken: candidate.resetToken,
            resetTokenExp: candidate.resetTokenExp,
            cartItems: [],
            orders: [],
            wishlist: [],
        });

        if(candidate.cartItems && candidate.cartItems.length) {
            for (let cartItem of candidate.cartItems) {
                account.cartItems.push({
                    productId: cartItem.productId,
                    count: cartItem.count
                })
            }
        }

        if(candidate.orders && candidate.orders.length) {
            for (let order of candidate.orders) {
                account.orders.push({
                    orderId: order.orderId
                });
            }
        }

        if(candidate.wishlist && candidate.wishlist.length) {
            for (let wishlistItem of candidate.wishlist) {
                account.wishlist.push({
                    productId: wishlistItem.productId
                });
            }
        }

        await account.save();

        return account;
    } catch (e) {
        throw e;
    }
}


async function recoverCollection(propsJSON) {
    try {
        const candidate = JSON.parse(propsJSON);

        let collection = new Collection({
            _id: candidate._id,
            name: candidate.name,
            description: candidate.description,
            image: candidate.image,
            products: [],
            sales: [],
        });

        if (candidate.products && candidate.products.length) {
            for (let product of candidate.products) {
                collection.products.push({
                    productId: product.productId
                });
            }
        }

        if (candidate.sales && candidate.sales.length) {
            for (let sale of candidate.sales) {
                collection.sales.push({
                    saleId: sale.saleId
                });
            }
        }

        await collection.save();

        return collection;

    } catch (e) {
        throw e;
    }
}


async function recoverOrder(propsJSON) {
    try {
        const candidate = JSON.parse(propsJSON);

        let order = new Order({
            _id: candidate._id,
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            address: candidate.address,
            items: [],
            status: candidate.status,
            cancelled: candidate.cancelled,
            date: candidate.date
        });

        if (candidate.items && candidate.items.length) {
            for (let item of candidate.items) {
                order.items.push({
                    product: item.product,
                    count: item.count
                })
            }
        }

        await order.save();

        return order;

    } catch (e) {
        throw e;
    }
}


async function recoverProduct(propsJSON) {
    try {
        const candidate = JSON.parse(propsJSON);

        let product = new Product({
            _id: candidate._id,
            name: candidate.name,
            collectionId: candidate.collectionId,
            price: candidate.price,
            description: candidate.description,
            isActive: candidate.isActive,
            sales: [],
            images: [],
        });

        if (candidate.sales && candidate.sales.length) {
            for (let sale of candidate.sales) {
                product.sales.push({
                    saleId: sale.saleId
                })
            }
        }

        if (candidate.images && candidate.images.length) {
            for (let imageUrl of candidate.images) {
                product.images.push(imageUrl);
            }
        }

        await product.save();

        return product;

    } catch (e) {
        throw e;
    }
}


async function recoverSale(propsJSON) {
    try {
        const candidate = JSON.parse(propsJSON);

        let sale = new Sale({
            _id: candidate._id,
            saleType: candidate.saleType,
            saleValue: candidate.saleValue,
            saleName: candidate.saleName,
            saleDescription: candidate.saleDescription
        });

        await sale.save();

        return sale

    } catch (e) {
        throw e;
    }
}

module.exports.createDeletedEntityViewModel = function (de) {
    try {
        return {
            _id: de._id,
            entityType: de.entityType,
            deletedObjectId: de.deletedObjectId,
            entityPropsJSON: de.entityPropsJSON
        }
    } catch (e) {
        throw e;
    }
}

module.exports.createDeletedEntityObjectViewModel = function (de) {
    try {
        return {
            _id: de._id,
            entityType: de.entityType,
            deletedObjectId: de.deletedObjectId,
            deletedObjectBody: JSON.parse(de.entityPropsJSON)
        }
    } catch (e) {
        throw e;
    }
}

module.exports.findInDeletedByEntityId = async function(entityId) {
    try {
        if (ObjectId.isValid(entityId)) {
            return await DeletedEntity.findById(entityId);
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}

module.exports.findInDeletedByObjectId = async function(objectId) {
    try {
        if (ObjectId.isValid(objectId)) {
            return await DeletedEntity.findOne({deletedObjectId: objectId});
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}


module.exports.deleteEntityById = async function (entityId) {
    try {
        if (ObjectId.isValid(entityId)) {
            return await DeletedEntity.deleteOne({_id: entityId});
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}


module.exports.deleteAllEntities = async function () {
    try {
        return await DeletedEntity.deleteMany({});
    } catch (e) {
        throw e;
    }
}

