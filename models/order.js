const {Schema, model} = require("mongoose");

const orderSchema = new Schema({
    name: {
        type: String
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String
    },

    items:  [
            {
                _id: false,
                product: {
                    name: String,
                    price: Number,
                },
                count: {
                    type: Number,
                }
            }
        ],

    status: {
        type: String
    },

    cancelled: {
        type: Boolean
    },

    date: {
        type: String,
        required:true
    },
});

module.exports = model("Order", orderSchema);