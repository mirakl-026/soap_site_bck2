const Product = require("../../models/product");
const Collection = require("../../models/collection");
const Sale = require("../../models/sale");
const keys = require("../../keys/keys");
const ImageAlt = require("../../models/imageAlt");
let ObjectId = require('mongoose').Types.ObjectId;


// Create
module.exports.createProduct = async function (candidate) {
    try {
        const product = new Product({
            name: candidate.name,
            collectionId: candidate.collectionId,
            price: candidate.price,
            description: candidate.description,
            isActive: candidate.isActive,
            sales: [],
            images: [],
        });

        if (candidate.sales && candidate.sales.length) {
            product.sales = candidate.sales.slice();
        }

        if (candidate.images && candidate.images.length) {
            for (let imageUrl of candidate.images) {
                let altV = "no alt";
                let alt = await ImageAlt.findOne({i_path: imageUrl});
                if (alt) {
                    altV = alt.i_alt;
                }
                product.images.push({
                    url: imageUrl,
                    alt: altV
                });
            }
        } else {
            let altV = "no alt";
            let alt = await ImageAlt.findOne({i_path: "/images/products/default/img_product_1.jpg"});
            if (alt) {
                altV = alt.i_alt;
            }
            product.images.push({
                url: "/images/products/default/img_product_1.jpg",
                alt: altV
            });
        }

        await product.save();

        return product;

    } catch (e) {
        throw e;
    }
}

// Read
module.exports.readProductById = async function(id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Product.findById(id);
        } else {
            return null;
        }

    } catch (e) {
        throw e;
    }
}


// Update
module.exports.updateProduct = async function (candidate) {
    try {
        let product = await Product.findById(candidate._id);
        if (product) {
            product.name = candidate.name;
            product.collectionId = candidate.collectionId;
            product.price = candidate.price;
            product.description = candidate.description;
            product.isActive = candidate.isActive;

            if (candidate.sales && candidate.sales.length)
                product.sales = candidate.sales.slice();

            if (candidate.images && candidate.images.length) {
                product.images = [];
                for (let imageUrl of candidate.images) {
                    let altV = "no alt";
                    let alt = await ImageAlt.findOne({i_path: imageUrl});
                    if (alt) {
                        altV = alt.i_alt;
                    }
                    product.images.push({
                        url: imageUrl,
                        alt: altV
                    });
                }
            }

            await product.save();

            return product;
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}

// Delete
module.exports.deleteProductById = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return Product.deleteOne({_id: id});
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}







//=================== Additional ===============================

// Read all
module.exports.readAllProducts = async function() {
    try {
        return await Product.find({});

    } catch (e) {
        throw e;
    }
}

module.exports.readAllActivatedProducts = async function() {
    try {
        return await Product.find({isActive: true});

    } catch (e) {
        throw e;
    }
}

// Read by Name
module.exports.readProductByName = async function (name) {
    try {
        return await Product.findOne({name: name});

    } catch (e) {
        throw e;
    }
}

// Delete all
module.exports.dropProducts = async function () {
    try {
        return await Product.deleteMany({});
    } catch (e) {
        throw e;
    }
}

module.exports.getProductsByCollectionName = async function(name) {
    try {
        const collection = await Collection.findOne({name: name});
        return await Product.find({collectionId: collection._id});

    } catch (e) {
        throw e;
    }
}

module.exports.getProductsByCollectionId = async function(id) {
    try {
        if (ObjectId.isValid(id)) {
            const collection = await Collection.findById(id);
            if (collection) {
                return await Product.find({collectionId: collection._id});
            } else {
                return [];
            }
        } else {
            return [];
        }

    } catch (e) {
        throw e;
    }
}

module.exports.getActivatedProductsByCollectionName = async function(name) {
    try {
        const collection = await Collection.findOne({name: name});
        if (collection) {
            return await Product.find({$and: [{collectionId: collection._id},{isActive:true}]});
        } else {
            return [];
        }
    } catch (e) {
        throw e;
    }
}

module.exports.getActivatedProductsByCollectionId = async function(id) {
    try {
        if (ObjectId.isValid(id)) {
            const collection = await Collection.findById(id);
            if (collection) {
                return await Product.find({$and: [{collectionId: collection._id},{isActive:true}]});
            } else {
                return [];
            }
        } else {
            return [];
        }
    } catch (e) {
        throw e;
    }
}


// Create ViewModel
module.exports.createViewModelFromProduct = function (product) {
    try {
        // ViewModel
        let isEmpty = true;
        // проверка на пустой объект
        for(let i in product)
            isEmpty = false;   // не пустой

        if (product && !isEmpty) {
            let productVM = {
                _id : product._id,
                name : product.name,
                collectionId : product.collectionId,
                price : product.price,
                description : product.description,
                isActive: product.isActive,
                sales : [],
                images : [],
            }

            if (product.sales && product.sales.length) {
                for (let sale of product.sales) {
                    productVM.sales.push({
                        saleId: sale.saleId
                    });
                }
            }

            if (product.images && product.images.length) {
                for (let imgObj of product.images) {
                    productVM.images.push({
                        url: imgObj.url,
                        alt: imgObj.alt
                    });
                }
            }

            return productVM;
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}


// Activate
module.exports.activateProduct = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            let product = await Product.findById(id);
            if (product) {
                if (product.isActive === false) {
                    product.isActive = true;
                    await product.save();
                }
                return {
                    activated: true
                }
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

// Deactivate
module.exports.deactivateProduct = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            let product = await Product.findById(id);
            if (product) {
                if (product.isActive === true) {
                    product.isActive = false;
                    await product.save();
                }
                return {
                    deactivated: true
                }
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

// проверка на имя товара в БД
module.exports.checkForProductInDb = async function (name) {
    try {
        const product = await Product.findOne({name: name});
        if (product)
            return true;
        else
            return false;
    } catch (e) {
        throw e;
    }
}


// получение множества товаров по массиву Id
module.exports.getProductsByArrayIds = async function(arrIds) {
    try {
        // проверка id на валидность
        for (let id of arrIds) {
            if (!ObjectId.isValid(id)) {
                return { message: "wrong id in array"};
            }
        }

        // результат
       return await Product.find({ '_id': { $in: arrIds } });

    } catch (e) {
        throw e;
    }
}


// добавление скидки (акции) к товару
module.exports.addSaleToProduct = async function(productId, saleId) {
    try {
        if (ObjectId.isValid(productId) && ObjectId.isValid(saleId)) {
            // получить товар
            let product = await Product.findById(productId);
            if (product) {
                // получить скидку
                const sale = await Sale.findById(saleId);
                if (sale) {
                    if (!product.sales)
                        product.sales = [];

                    const idx = product.sales.map( (sid) => {
                        if (sid.saleId) {
                            return sid.saleId.toString()
                        }
                    }).indexOf(saleId.toString());

                    if (idx === -1) {
                        product.sales.push({ saleId: sale._id});
                    }
                    await product.save();

                    return {
                        sales: product.sales
                    };

                } else {
                    return { message: "no sale by id" };
                }
            } else {
                return { message: "no product by id" };
            }
        } else {
            return { message: "wrong productId or saleId" };
        }
    } catch (e) {
        throw e;
    }
}

// удаление скидки из товара
module.exports.removeSaleFromProduct = async function (productId, saleId) {
    try {
        if (ObjectId.isValid(productId) && ObjectId.isValid(saleId)) {
            // получить товар
            let product = await Product.findById(productId);
            if (product) {
                // получить скидку
                const sale = await Sale.findById(saleId);
                if (sale) {
                    if (!product.sales)
                        product.sales = [];

                    const idx = product.sales.map( (sid) => {
                        if (sid.saleId) {
                            return sid.saleId.toString()
                        }
                    }).indexOf(saleId.toString());

                    if (idx !== -1) {
                        product.sales = product.sales.filter( sid => sid.saleId.toString() !== saleId.toString());
                    }
                    await product.save();

                    return {
                        sales: product.sales
                    };

                } else {
                    return { message: "no sale by id" };
                }
            } else {
                return { message: "no product by id" };
            }
        } else {
            return { message: "wrong productId or saleId" };
        }
    } catch (e) {
        throw e;
    }
}


// получение всех товаров по скдике (id)
// module.exports.getProductsBySaleId = async function(saleId) {
//     try {
//         return await Product.find({sales: [saleId]});
//
//     } catch (e) {
//         throw e;
//     }
// }
//
// module.exports.getActivatedProductsBySaleId = async function (saleId) {
//     try {
//         return await Product.find({$and: [{sales: [saleId]},{isActive:true}]});
//
//     } catch (e) {
//         throw e;
//     }
// }
