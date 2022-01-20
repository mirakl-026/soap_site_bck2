// модель коллекции / категории

module.exports = class Collection{
    // _id;         // Mongodb.ObjectId
    name;           // string, required
    description;    // string
    isActive;       // boolean, required
    parentId;       // Mongodb.ObjectId - ref "Collection"
    childIds;       // [] of { childId: Mongodb.ObjectId - ref "Collection" }
    image;          // { url: string, alt: string }
    products;       // [] of { productId: Mongodb.ObjectId - ref "Product" }
    sales;          // [] of { saleId: Mongodb.ObjectId - ref "Sale" }

    constructor (name, description, isActive, parentId, image) {
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.parentId = parentId;
        this.image = {
            url: image.url,
            alt: image.alt
        };
    };
};
