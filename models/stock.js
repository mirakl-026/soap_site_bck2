// модель склада
const {Schema, model} = require("mongoose");

const stockSchema = new Schema({
    products: [
        {
            _id: false,
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: Number
        }
    ]
});

module.exports = model("Stock", stockSchema);