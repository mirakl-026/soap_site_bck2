// модель скидки

module.exports = class Sale{
    saleType;       // string, проценты "percent" или константное число "number"

    saleValue;      // number, число, если процент - то от 1 до 99, если цифра - то больше 0

    saleName;       // string, название

    saleDescription;   // string,  описание

    constructor() {

    }
};