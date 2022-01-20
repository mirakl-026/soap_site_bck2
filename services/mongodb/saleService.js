// сервис работы со скидками
const Sale = require("../../models/sale");



let ObjectId = require("mongoose").Types.ObjectId;

// CRUD
// Create
module.exports.createSale = async function (candidate) {
    try {
        if (candidate.saleType) {
            if (
                (candidate.saleType === "percent" && (candidate.saleValue >= 1 && candidate.saleValue <= 99)) ||
                (candidate.saleType === "number" && candidate.saleValue > 0)
            ) {
                const sale = new Sale({
                    saleType: candidate.saleType,
                    saleValue: candidate.saleValue,
                    saleName: candidate.saleName,
                    saleDescription: candidate.saleDescription
                });
                await sale.save();
                return sale;

            } else {
                return { message: "sale error: wrong saleType or saleValue"}
            }
        } else {
            return { message: "sale error: no saleType"}
        }
    } catch (e) {
        throw e;
    }
}

// Read
module.exports.readSale = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Sale.findById(id);

        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}

// Update
module.exports.updateSale = async function (candidate) {
    try {
        let sale = await Sale.findById(candidate._id);
        if (sale) {
            if (candidate.saleType) {
                if (
                    (candidate.saleType === "percent" && (candidate.saleValue >= 1 && candidate.saleValue <= 99)) ||
                    (candidate.saleType === "number" && candidate.saleValue > 0)
                ) {

                    sale.saleType = candidate.saleType;
                    sale.saleValue = candidate.saleValue;
                    sale.saleName = candidate.saleName;
                    sale.saleDescription = candidate.saleDescription;

                    await sale.save();

                    return sale;
                } else {
                    return { message: "sale error: wrong saleType or saleValue"}
                }
            } else {
                return { message: "sale error: no saleType"}
            }
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}

// Delete
module.exports.deleteSale = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return Sale.deleteOne({_id: id});

        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}



// ======================================== Additional =================================
module.exports.createSaleViewModel = function (sale) {
    try {
        // ViewModel
        let isEmpty = true;
        // проверка на пустой объект
        for(let i in sale)
            isEmpty = false;   // не пустой

        if (sale && !isEmpty) {
            return {
                _id : sale._id,
                saleType : sale.saleType,
                saleValue : sale.saleValue,
                saleName: sale.saleName,
                saleDescription: sale.saleDescription
            };
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}

module.exports.readAllSales = async function() {
    try {
        return await Sale.find({});

    } catch (e) {
        throw e;
    }
}

