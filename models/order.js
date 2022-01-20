// модель заказа

module.exports = class Order{
    //_id;      // Mongodb.ObjectId
    name;       // string 
    email;      // string, required
    phone;      // string required
    address;    // string
    items;      // [] of { product: { name: string, price: number }, count: number }
    status;     // string
    cancelled;  // boolean
    date;       // string, required

    constructor (name, email, phone, address, items, date) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.items = items.slice();
        this.date = date;
    }
};

