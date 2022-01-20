// модель товара

module.exports = class Product{
    name;           // string, required
    collectionId;   // Mongodb.ObjectId - ref "Collection"
    price;          // number, required
    description;    // string
    isActive;       // boolean
    sales;          // [] of { saleId: Mongodb.ObjectId - ref "Sale" }
    images;         // [] of { url: string, alt: string }
    constructor () {
        
    }
};



