// модель пользователя

const {Schema, model} = require("mongoose");

const accountSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        required: true
    },
    emailToken: String,
    emailTokenExp: Date,
    resetToken: String,
    resetTokenExp: Date,
    cartItems: [
        {
            _id: false,
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
            count: {
                type: Number,
            }
        }
    ],
    orders: [
        {
            _id: false,
            orderId: {
                type: Schema.Types.ObjectId,
                ref: "Order"
            }
        }
    ],
    wishlist: [
        {
            _id: false,
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            }
        }
    ]
});

module.exports = model("Account", accountSchema);