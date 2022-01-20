// модель пользователя

module.exports = class Account {
    // _id;         // Mongodb.ObjectId
    email;          // string, required
    name;           // string, required
    password;       // string, required 
    verified;       // boolean, required
    emailToken;     // string
    emailTokenExp;  // Date
    resetToken;     // string
    resetTokenExp;  // Date
    cartItems;      // [] of { productId: Mongodb.ObjectId - ref "Product", count: number} 
    orders;         // [] of { orderdId: Mongodb.ObjectId - ref "Order" }
    wishlist;       // [] of { productId: Mongodb.ObjectId - ref "Product" }

    constructor (email, name, password) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.verified = false;
    }
};