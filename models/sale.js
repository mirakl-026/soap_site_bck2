// модель скидки
const {Schema, model} = require("mongoose");

const saleSchema = new Schema({
    saleType: {
        type: String    // проценты "percent" или константное число "number"
    },

    saleValue: {
        type: Number    // число, если процент - то от 1 до 99, если цифра - то больше 0
    },

    saleName: {
        type: String    // название
    },
    saleDescription: {
        type: String    // описание
    }
});

module.exports = model("Sale", saleSchema);