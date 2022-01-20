// модель склада

module.exports = class Stock{
    products;   // [] of { productId: Mongodb.ObjectId - ref "Product", quantity: number }

    constructor() {
        
    }
};

