const {Schema, model} = require("mongoose");

const imageAltSchema = new Schema({
    i_path: String,

    i_alt: String,
});

module.exports = model("ImageAlt", imageAltSchema);