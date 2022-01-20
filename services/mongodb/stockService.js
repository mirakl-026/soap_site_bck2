// сервис управаления складом
const Stock = require("../../models/stock");
const Product = require("../../models/product");
let ObjectId = require('mongoose').Types.ObjectId;

/*
    Склад является синглтоном и существует всегда, поэтому CRUD не нужен,
    но я всё равно реализую его для полноты картины
 */
// Create
module.exports.createStock = async function (candidate) {
    try {
        const stock = new Stock({});
        if (candidate.products && candidate.products.length) {
            for (let product of candidate.products) {
                stock.products.push({
                    productId: product.productId,
                    quantity: product.quantity
                });
            }
        }
        await stock.save();
        return stock;

    } catch (e) {
        throw e
    }
}

// Read - (синглтон)
module.exports.readStock = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Stock.findById(id);
        } else {
            return null;
        }

    } catch (e) {
        throw e
    }
}

//Update - (синглтон)
module.exports.updateStock = async function (candidate) {
    try {
        const stock = await Stock.findById(candidate._id);
        if(stock) {
            stock.products = [];
            if (candidate.products && candidate.products.length) {
                for (let product of candidate.products) {
                    stock.products.push({
                        productId: product.productId,
                        quantity: product.quantity
                    });
                }
            };
            await stock.save();
            return stock;
        } else {
            return {};
        }
    } catch (e) {
        throw e
    }
}

// Delete
module.exports.deleteStock = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Stock.deleteOne({_id: id});
        } else {
            return null;
        }

    } catch (e) {
        throw e
    }
}






// Additional - основные (и используемые) функции для работы со складом
// создать склад - при инициализации
module.exports.initStock = async function() {
    try {
        // создание объекта склада
        let stock = new Stock({
            products: []
        });

        // все товары
        const products = await Product.find({});

        for (let product of products) {
            stock.products.push({
                productId: product._id,
                quantity: 0
            });
        }
        await stock.save();

        return stock;

    } catch (e) {
        throw e;
    }
}


// считать весь склад
module.exports.readStock = async function() {
    try {
        return await Stock.findOne({});

    } catch (e) {
        throw e;
    }
}

// создать ViewModel для склада
module.exports.createStockViewModel =  function (stock) {
    try {
        // ViewModel
        let isEmpty = true;
        // проверка на пустой объект
        for(let i in stock)
            isEmpty = false;   // не пустой

        if (stock && !isEmpty) {
            let stockVM = {
                products: []
            };

            for (let product of stock.products) {
                stockVM.products.push({
                    productId: product.productId,
                    quantity: product.quantity
                });
            }

            return stockVM;

        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}


// проверить существет ли склад?
module.exports.isStockExists = async function () {
    try {
        const stock = await Stock.findOne({});
        if (stock)
            return true;
        else
            return false;

    } catch (e) {
        throw e;
    }
}

// обновить stock
module.exports.refreshStock = async function() {
    try {
        // считать текущий склад
        const currentStock = await Stock.findOne({});

        // считать все товары
        const products = await Product.find({});

        // собрать id товаров из текущего склада и товаров вместе:
        // добавляем все существующие товары
        const allProductIds = new Set( products.map(p => p._id.toString()) );
        // добавляем товары из склада (добавятся лишь уникальные)
        for (let product of currentStock.products) {
            allProductIds.add(product.productId.toString());
        }

        let newStockProducts = [];
        let idx_p = 0;
        let idx_s = 0;
        for (let id of allProductIds) {
            idx_p = products.map(p => p._id.toString()).indexOf(id);
            idx_s = currentStock.products.map(p => p.productId.toString()).indexOf(id);

            // если товар есть в складе и в товарах - оставить с текущей цифрой
            if (idx_p >= 0 && idx_s >= 0) {
                newStockProducts.push({
                    productId: currentStock.products[idx_s].productId,
                    quantity: currentStock.products[idx_s].quantity
                });
            }
            // если товара нет в складе, но есть в товарах - добавить с 0
            else if (idx_p >= 0 && idx_s < 0) {
                newStockProducts.push({
                    productId: products[idx_p]._id,
                    quantity: 0
                });
            }
            // если товара нет в товарах, но есть в складе - удалить (не добавлять)
            // если товара нет в товарах и в складе - его не будет в этом списке =)
        }

        // заменяем значения в складе
        currentStock.products = [];
        for (let product of newStockProducts) {
            currentStock.products.push({
                productId: product.productId,
                quantity: product.quantity
            });
        }

        await currentStock.save();


    } catch (e) {
        throw e;
    }
}



module.exports.readStockProduct = async function(id) {
    try {
        if (ObjectId.isValid(id)) {
            const stock = await Stock.findOne({});

            if (stock && stock.products.length) {

                const idx = stock.products.map(p => p.productId.toString()).indexOf(id.toString());

                if (idx >= 0) {
                    return {
                        productId: id,
                        quantity: stock.products[idx].quantity
                    };
                } else {
                    return {
                        productId: id,
                        quantity: -1
                    };
                }
            } else {
                return {};
            }
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}


// установить кол-во товаров
module.exports.setStock = async function (productId, value) {
    try {
        if (ObjectId.isValid(productId)) {
            let stock = await Stock.findOne({});

            if (stock) {
                const idx = stock.products.map(p => p.productId.toString()).indexOf(productId.toString());
                if (idx >= 0) {
                    stock.products[idx].quantity = value;
                } else {
                    stock.products.push({
                        productId: productId,
                        quantity: value
                    });
                }
                await stock.save();

                return {
                    productId: productId,
                    quantity: value
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

// добавить кол-во товаров
module.exports.increaseStockBy1 = async function (productId) {
    try {
        if (ObjectId.isValid(productId)) {
            let stock = await Stock.findOne({});
            if (stock) {
                const idx = stock.products.map(p => p.productId.toString()).indexOf(productId.toString());
                if (idx >= 0) {
                    stock.products[idx].quantity++;
                }
                await stock.save();
            }
        }
    } catch (e) {
        throw e
    }
}

module.exports.increaseStockByValue = async function (productId, value) {
    try {
        if (ObjectId.isValid(productId)) {
            let stock = await Stock.findOne({});
            if (stock) {
                const idx = stock.products.map(p => p.productId.toString()).indexOf(productId.toString());
                if (idx >= 0) {
                    stock.products[idx].quantity += value;
                }
                await stock.save();
            }
        }
    } catch (e) {
        throw e
    }
}

// убавить кол-во товаров
module.exports.decreaseStockBy1 = async function (productId) {
    try {
        if (ObjectId.isValid(productId)) {
            let stock = await Stock.findOne({});
            if (stock) {
                const idx = stock.products.map(p => p.productId.toString()).indexOf(productId.toString());
                if (idx >= 0) {
                    stock.products[idx].quantity--;
                }
                await stock.save();
            }
        }

    } catch (e) {
        throw e
    }
}

module.exports.decreaseStockByValue = async function(productId, value) {
    try {
        if (ObjectId.isValid(productId)) {
            let stock = await Stock.findOne({});
            if (stock) {
                const idx = stock.products.map(p => p.productId.toString()).indexOf(productId.toString());
                if (idx >= 0) {
                    stock.products[idx].quantity -= value;
                }
                await stock.save();
            }
        }
    } catch (e) {
        throw e
    }
}




