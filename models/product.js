const {Schema, model} = require("mongoose");

const productSchema = new Schema({
    name: {
        type: String,
    },
    collectionId: {
        type: Schema.Types.ObjectId,
        ref: "Collection"
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean
    },
    sales: [
        {
            _id: false,
            saleId: {
                type: Schema.Types.ObjectId,
                ref: "Sale"
            }
        }
    ],
    images: [
        {
            _id: false,
            url: String,
            alt: String
        }
    ]
});

module.exports = model("Product", productSchema);


