const {Schema, model} = require("mongoose");

const staticPageSchema = new Schema({
    pageName: String,
    content: String
});

module.exports = model("StaticPage", staticPageSchema);