// сервис для управления картинками в БД
// сервис управления картинками - БД быстрее FS
const ImageFile = require("../../models/imageFile");
const ImageAlt = require("../../models/imageAlt");
const Collection = require("../../models/collection");
const Product = require("../../models/product");
const settings = require("../../settings");
const fs = require("fs");
const path = require("path");
let ObjectId = require('mongoose').Types.ObjectId;

const productImagesPath = path.join(settings.PROJECT_DIR, "/public/images/products/");
const collectionImagesPath = path.join(settings.PROJECT_DIR, "/public/images/collections/");
const productImagesRoot = "/public/images/products/";
const collectionImagesRoot = "/public/images/collections/";

module.exports.productImagesPath = productImagesPath;
module.exports.collectionImagesPath = collectionImagesPath;
module.exports.productImagesRoot = productImagesRoot;
module.exports.collectionImagesRoot = collectionImagesRoot;

// GetImagesRoot
module.exports.getImagesRoot = function (i_type) {
    try {
        if (i_type === "product")
            return productImagesRoot;
        else if (i_type === "collection")
            return collectionImagesRoot;
        else
            return "";

    } catch (e) {
        throw e;
    }
}


// AddImage и Delete объеденены в refresh:
// RefreshImagesData
module.exports.refreshImagesData = async function () {
    try {
        // считать все картинки в папках images и добавить в БД
        let productImagesFiles = [];
        let collectionImagesFiles = [];

        // считываем файлы товаров
        let files = fs.readdirSync(productImagesPath);
        for(const file of files) {
            if(fs.lstatSync(path.join(productImagesPath, file)).isFile()) {
                productImagesFiles.push(file);
            }
        }
        files =  fs.readdirSync(collectionImagesPath);
        for (const file of files) {
            if (fs.lstatSync(path.join(collectionImagesPath, file)).isFile()) {
                collectionImagesFiles.push(file);
            }
        }


        // очистить коллекцию БД
        const result = await ImageFile.collection.drop();
        if (result) {
            // TODO можно ускорить
            // записываем в БД
            for (let productImageFile of productImagesFiles) {
                const publicPath = (productImagesRoot + productImageFile).substring(7);
                const imageFile = await ImageFile.create({
                    i_type: "product",
                    i_fileName: productImageFile,
                    i_path: publicPath
                });
                await imageFile.save();
            }

            for (let collectionImageFile of collectionImagesFiles) {
                const publicPath = (collectionImagesRoot + collectionImageFile).substring(7);
                const imageFile = await ImageFile.create({
                    i_type: "collection",
                    i_fileName: collectionImageFile,
                    i_path: publicPath
                });
                await imageFile.save();
            }

            // обновляем альты
            await this.refreshAltsInImagesCollectionsProducts();
            let newImagesResult = [];
            const allImgalts = await ImageFile.find({});
            for (let imgalt of allImgalts)
                newImagesResult.push(this.createImageFileViewModel(imgalt));

            return newImagesResult;
        } else {
            return [];
        }


    } catch (e) {
        throw e;
    }
}

// GetImages all
module.exports.getAllImages = async function () {
    try {
        return await ImageFile.find();

    } catch (e) {
        throw e;
    }
}

// GetImages by type
module.exports.getAllImagesByType = async function (imagesType) {
    try {
        return await ImageFile.find({i_type: imagesType});

    } catch (e) {
        throw e;
    }
}

// GetImage by fileName
module.exports.getImageByName = async function (name) {
    try {
        return await ImageFile.findOne({i_fileName: name});

    } catch (e) {
        throw e;
    }
}

// GetImage by fileName and type
module.exports.getImageByNameAndType = async function (name, type) {
    try {
        // {$and: [{collectionId: collection._id},{isActive:true}]}
        return await ImageFile.findOne({$and: [{i_fileName: name}, {i_type: type}]} );

    } catch (e) {
        throw e;
    }
}

module.exports.deleteImageFile = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await ImageFile.deleteOne({_id: id});
        } else {
            return null;
        }
    } catch (e) {
        throw e;
    }
}



// ========================= работа с альтами ==============================
module.exports.updateImageAlt = async function(candidate) {
    try {
        const imageAlt = await ImageAlt.findOne({i_path: candidate.i_path});
        if (imageAlt) {
            imageAlt.i_alt = candidate.i_alt;
            await imageAlt.save()
            return imageAlt;

        } else {
            const newImageAlt = new ImageAlt({
                i_path: candidate.i_path,
                i_alt: candidate.i_alt
            });

            await newImageAlt.save();
            return newImageAlt;
        }
    } catch (e) {
        throw e;
    }
}

module.exports.readImageAltByPath = async function(imagePath) {
    try {
        return await ImageAlt.findOne({i_path:imagePath});

    } catch (e) {
        throw e;
    }
}

module.exports.readAllImagesAlts = async function() {
    try {
        return await ImageAlt.find({});
    } catch (e) {
        throw e;
    }
}

module.exports.removeImageAlt = async function(imagePath) {
    try {
        return await ImageAlt.deleteOne({i_path: imagePath});
    } catch (e) {
        throw e;
    }
}


// обновить альты в БД
// module.exports.refreshImagesAlts = async function() {
//     try {
//         let allAlts = await ImageAlt.find({});
//         let allPathsInAlts = [];
//         for (let alt of allAlts)
//             allPathsInAlts.push(alt.i_path);
//
//         let allImages = await ImageFile.find({});
//         for (let oneImage of allImages) {
//             let idx = allPathsInAlts.indexOf(oneImage.i_path);
//             if (idx >= 0) {
//                 oneImage.i_alt = allAlts[idx].i_alt;
//                 await oneImage.save();
//             } else {
//                 oneImage.i_alt = "no alt";
//                 await oneImage.save();
//             }
//         }
//     } catch (e) {
//         throw e;
//     }
// }
//
// module.exports.refreshAltsInCollections = async function() {
//     try {
//         let alts = await ImageAlt.find({});
//         let allPathsInAlts = [];
//         for (let alt of alts)
//             allPathsInAlts.push(alt.i_path);
//
//         let collections = await Collection.find({});
//         for (let collection of collections) {
//             if (collection.image) {
//                 let idx = allPathsInAlts.indexOf(collection.image.url);
//                 if (idx >= 0) {
//                     collection.image.alt = alts[idx].i_alt;
//                     await collection.save();
//                 } else {
//                     collection.image.alt = "no alt";
//                     await collection.save();
//                 }
//             }
//         }
//     } catch (e) {
//         throw e;
//     }
// }
//
//
// module.exports.refreshAltsInProducts = async function() {
//     try {
//         let alts = await ImageAlt.find({});
//         let allPathsInAlts = [];
//         for (let alt of alts)
//             allPathsInAlts.push(alt.i_path);
//
//         let products = await Product.find({});
//         for (let product of products) {
//             if (product.images && product.images.length) {
//                 for (let i = 0; i < product.images.length; i++) {
//                     let idx = allPathsInAlts.indexOf(product.images[0].url);
//                     if (idx >= 0) {
//                         product.images[0].alt = alts[idx].i_alt;
//                         await product.save();
//                     } else {
//                         product.images[0].alt = "no alt";
//                         await product.save();
//                     }
//                 }
//             }
//         }
//     } catch (e) {
//         throw e;
//     }
// }

module.exports.refreshAltsInImagesCollectionsProducts = async function() {
    try {
        let alts = await ImageAlt.find({});
        let allPathsInAlts = [];
        for (let alt of alts)
            allPathsInAlts.push(alt.i_path);

        // обновляем альты в картинках
        let allImages = await ImageFile.find({});
        for (let oneImage of allImages) {
            let idx = allPathsInAlts.indexOf(oneImage.i_path);
            if (idx >= 0) {
                oneImage.i_alt = alts[idx].i_alt;
                await oneImage.save();
            } else {
                oneImage.i_alt = "no alt";
                await oneImage.save();
            }
        }

        // обновляем альты в категориях
        let collections = await Collection.find({});
        for (let collection of collections) {
            if (collection.image) {
                let idx = allPathsInAlts.indexOf(collection.image.url);
                if (idx >= 0) {
                    collection.image.alt = alts[idx].i_alt;
                    await collection.save();
                } else {
                    collection.image.alt = "no alt";
                    await collection.save();
                }
            }
        }

        // обновляем альты в товарах
        let products = await Product.find({});
        for (let product of products) {
            if (product.images && product.images.length) {
                for (let i = 0; i < product.images.length; i++) {
                    let idx = allPathsInAlts.indexOf(product.images[i].url);
                    if (idx >= 0) {
                        product.images[i].alt = alts[idx].i_alt;
                        await product.save();
                    } else {
                        product.images[i].alt = "no alt";
                        await product.save();
                    }
                }
            }
        }
    } catch (e) {
        throw e;
    }
}



module.exports.createImageAltViewModel = function (m_imageAlt) {
    try {
        if (m_imageAlt) {
            return {
                i_path: m_imageAlt.i_path,
                i_alt: m_imageAlt.i_alt
            }
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}








// create ViewModel
module.exports.createImageFileViewModel = function (m_imageFile) {
    try {
        if (m_imageFile) {
            return {
                i_type: m_imageFile.i_type,
                i_fileName: m_imageFile.i_fileName,
                i_path: m_imageFile.i_path,
                i_alt: m_imageFile.i_alt
            }
        } else {
            return {};
        }
    } catch (e) {
        throw e;
    }
}