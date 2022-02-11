// удалённая сущность (account | collection | order | product | sale)
const {Schema, model} = require("mongoose");

const deletedEntitySchema = new Schema({
    entityType: {
        type: String,   //account | collection | order | product | sale
    },
    deletedObjectId: {
        type: Schema.Types.ObjectId
    },
    entityPropsJSON: {
        type: String,   // для разворачивания - JSON.parse
    },
});

module.exports = model("DeletedEntity", deletedEntitySchema);