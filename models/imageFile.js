const {Schema, model} = require("mongoose");

const imageFileSchema = new Schema({
    i_type: String,

    i_fileName: String,

    i_path: String,

    i_alt: String,
});

module.exports = model("ImageFile", imageFileSchema);