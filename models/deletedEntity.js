// удалённая сущность (account | collection | order | product | sale)

module.exports = class DeletedEntity{
    entityType;         // string - account | collection | order | product | sale
    deletedObjectId;    // Mongodb.Objectid
    entityPropsJSON;    // string, для разворачивания - JSON.parse
};
