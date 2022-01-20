// роутер управления картинками
// Он же роутер, он же и сервис, так как не удобно перебрасывать объекты в функции
const express = require("express");
const multer = require("multer");
const adm_auth = require("../../middleware/checkAdmMW");
const settings = require("../../settings");
const fs = require("fs");
const ImageService = require("../../services/mongodb/imagesService");
const path = require("path");
const csurf = require("csurf");

const LoggerService = require("../../services/loggerService");

const router = express.Router();

/*
// создаём объект логгера
let imagesLogger = LoggerService.createCustomLogger("/logs/images.log");

// функция записи в этот логгер
function imagesLoggerWrite (type, message) {
    try {
        // Логгер будет записывать только если в meta isLog установлено true
        if (MetaService.isLog()) {
            if (type === "info")
                imagesLogger.info(message);
            else if (type === "error")
                imagesLogger.error(message);
        }
    } catch (e) {
        console.log(e);
    }
}
*/


function convertLetter(letter) {
    if ((letter >= '0' && letter <= '9') ||
        (letter >= 'a' && letter <= 'z') ||
        (letter == '.')
    ) {
        return letter;
    } else {
        switch (letter) {
            case 'а': return "a";
            case 'б': return "b";
            case 'в': return "v";
            case 'г': return "g";
            case 'д': return "d";
            case 'е': return "e";
            case 'ё': return "e";
            case 'ж': return "zh";
            case 'з': return "z";
            case 'и': return "i";
            case 'й': return "iy";
            case 'к': return "k";
            case 'л': return "l";
            case 'м': return "m";
            case 'н': return "n";
            case 'о': return "o";
            case 'п': return "p";
            case 'р': return "r";
            case 'с': return "s";
            case 'т': return "t";
            case 'у': return "u";
            case 'ф': return "f";
            case 'х': return "h";
            case 'ц': return "c";
            case 'ч': return "ch";
            case 'ш': return "sh";
            case 'щ': return "sch";
            case 'ъ': return "";
            case 'ы': return "y";
            case 'ь': return "";
            case 'э': return "e";
            case 'ю': return "u";
            case 'я': return "ya";
            default: return "_";
        }
    }
}

function convertName(name) {
    let convertedName = "";
    let originalName = String(name).toLowerCase();
    for (let letter of originalName) {
        convertedName += convertLetter(letter);
    }
    return convertedName;
}

// куда и как сохранять файлы
const storageImgProduct = multer.diskStorage({
    // функции над файлами

    // куда складывать файлы
    destination(req, file, cb) {
        cb(null, path.join(settings.PROJECT_DIR, "/public/images/products"));
    },
    // как назвать файл
    filename(req, file, cb) {
        const convertedName = convertName(file.originalname);
        //console.log(convertedName);
        cb(null, convertedName);    // file.originalname +  convertedName + code
    }
});

const storageImgCollection = multer.diskStorage({
    // функции над файлами

    // куда складывать файлы
    destination(req, file, cb) {
        cb(null, path.join(settings.PROJECT_DIR, "/public/images/collections"));
    },
    // как назвать файл
    filename(req, file, cb) {
        const convertedName = convertName(file.originalname);
        //console.log(convertedName);
        cb(null, convertedName);    // file.originalname +  convertedName + code
    }
});

// валидация для файлов
// проверка на то, что это изображение
const allowedTypes = ["image/png", "image/jpeg", "image/jpeg"]  // "image/jfif"

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}


const uploadImgProduct = multer({
    // конфигурация
    storage: storageImgProduct,
    fileFilter: fileFilter
});


const uploadImgCollection = multer({
    // конфигурация
    storage: storageImgCollection,
    fileFilter: fileFilter
});


















// AddImage (file): json_result
// загрузка картинки на сервер
router.post("/product/addImage", adm_auth, uploadImgProduct.single('imageFile'), csurf(), async (req, res) => {
    try {
        let imageFile;      // файл картинки из формы

        imageFile = req.file;
        if (imageFile) {
            const result = await ImageService.refreshImagesData();
            if (result && result.length) {
                LoggerService.serverLoggerWrite("info", "api/image/product/addImage/[POST] - img file uploaded");
                res.status(200).json({
                    message: "product img file uploaded"
                });
            } else {
                LoggerService.serverLoggerWrite("info", "api/image/product/addImage/[POST] - cant refresh");
                res.status(200).json({
                    message: "cant refresh"
                });
            }

        } else {
            LoggerService.serverLoggerWrite("info", "api/image/product/addImage/[POST] - no file uploaded");
            res.status(200).json({
                message: "no file uploaded"
            });
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/product/addImage/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.post("/collection/addImage", adm_auth, uploadImgCollection.single('imageFile'), csurf(), async (req, res) => {
    try {
        let imageFile;      // файл картинки из формы

        imageFile = req.file;
        if (imageFile) {
            const result = await ImageService.refreshImagesData();
            if (result && result.length) {
                LoggerService.serverLoggerWrite("info", "api/image/collection/addImage/[POST] - img file uploaded");
                res.status(200).json({
                    message: "collection img file uploaded"
                });
            } else {
                LoggerService.serverLoggerWrite("info", "api/image/collection/addImage/[POST] - cant refresh");
                res.status(200).json({
                    message: "cant refresh"
                });
            }

        } else {
            LoggerService.serverLoggerWrite("info", "api/image/collection/addImage/[POST] - no file uploaded");
            res.status(200).json({
                message: "no file uploaded"
            });
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/collection/addImage/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});










// для картинок товаров и для картинок коллекций
// getImagesRoot: string
router.get("/getProductImagesRoot", (req, res) => {
    try {
        res.status(200).json({
            productImagesRoot: ImageService.productImagesRoot
        })
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/getProductImagesRoot/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.get("/getCollectionImagesRoot", (req, res) => {
    try {
        res.status(200).json({
            collectionImagesRoot: ImageService.collectionImagesRoot
        })
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/getCollectionImagesRoot/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// GetImages: string[]
router.get("/", async (req, res) => {
    try {
        const images = await ImageService.getAllImages();
        let imagesVM = [];
        if (images && images.length) {
            for (let image of images) {
                imagesVM.push(ImageService.createImageFileViewModel(image));
            }
        }
        res.status(200).json(imagesVM);
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.get("/product", async (req, res) => {
    try {
        const images = await ImageService.getAllImagesByType("product");
        let imagesVM = [];
        if (images && images.length) {
            for (let image of images) {
                imagesVM.push(ImageService.createImageFileViewModel(image));
            }
        }
        res.status(200).json(imagesVM);
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/product/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.get("/collection", async (req, res) => {
    try {
        const images = await ImageService.getAllImagesByType("collection");
        let imagesVM = [];
        if (images && images.length) {
            for (let image of images) {
                imagesVM.push(ImageService.createImageFileViewModel(image));
            }
        }
        res.status(200).json(imagesVM);
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/collection/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// GetImage(fileName) : string
router.get("/name/:name", async (req, res) => {
    try {
        const image = await ImageService.getImageByName(req.params.name);
        res.status(200).json(ImageService.createImageFileViewModel(image));
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/name/:name[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// DeleteProductImage(fileName): json_result
router.post("/delete", adm_auth, uploadImgCollection.none(), csurf(), uploadImgProduct.none(), async (req, res) => {
    try {
        // получить объект картинки
        const imageFile = await ImageService.getImageByName(req.body.fileName);
        if (imageFile) {
            // удаление в папке
            fs.unlinkSync(path.join(settings.PROJECT_DIR, "public", imageFile.i_path));

            // удаление в БД
            await ImageService.deleteImageFile(imageFile._id);

            LoggerService.serverLoggerWrite("info", `api/image/delete/[POST] - image ${req.body.fileName} deleted;`);
            res.status(200).json({
                message: "deleted:" + imageFile.i_fileName,
            })

        } else {
            LoggerService.serverLoggerWrite("info", `api/image/delete/[POST] - no image to delete - ${req.body.fileName};`);
            res.status(200).json({
                message: "no image"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/delete/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.post("/delete/product", adm_auth, uploadImgProduct.none(), csurf(), async (req, res) => {
    try {
        const imageFile = await ImageService.getImageByNameAndType(req.body.fileName, "product");
        if (imageFile) {
            fs.unlinkSync(path.join(settings.PROJECT_DIR, "public", imageFile.i_path));

            await ImageService.deleteImageFile(imageFile._id);

            LoggerService.serverLoggerWrite("info", `api/image/delete/product/[POST] - image ${req.body.fileName} deleted;`);
            res.status(200).json({
                message: "deleted:" + imageFile.i_fileName,
            })

        } else {
            LoggerService.serverLoggerWrite("info", `api/image/delete/product/[POST] - no image to delete - ${req.body.fileName};`);
            res.status(200).json({
                message: "no image"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/delete/product/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// DeleteCollectionImage(fileName): json_result
router.post("/delete/collection", adm_auth, uploadImgCollection.none(), csurf(), async (req, res) => {
    try {
        const imageFile = await ImageService.getImageByNameAndType(req.body.fileName, "collection");
        if (imageFile) {
            fs.unlinkSync(path.join(settings.PROJECT_DIR, "public", imageFile.i_path));

            await ImageService.deleteImageFile(imageFile._id);
            LoggerService.serverLoggerWrite("info", `api/image/delete/collection/[POST] - image ${req.body.fileName} deleted;`);
            res.status(200).json({
                message: "deleted:" + imageFile.i_fileName,
            })

        } else {
            LoggerService.serverLoggerWrite("info", `api/image/delete/collection/[POST] - no image to delete - ${req.body.fileName};`);
            res.status(200).json({
                message: "no image"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/delete/collection/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});









// работа с альтами
router.post("/updateAlt", adm_auth, async (req, res) => {
    try {
        const {i_path, i_alt} = req.body;
        const candidate = {
            i_path: i_path,
            i_alt: i_alt
        };

        const result = await ImageService.updateImageAlt(candidate);
        // await ImageService.refreshImagesAlts();
        // await ImageService.refreshAltsInCollections();
        // await ImageService.refreshAltsInProducts();
        await ImageService.refreshAltsInImagesCollectionsProducts();

        res.status(200).json(ImageService.createImageAltViewModel(result));

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/updateAlt[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.post("/removeAlt", adm_auth, async (req, res) => {
    try {
        const {i_path} = req.body;

        await ImageService.removeImageAlt(i_path);
        // await ImageService.refreshImagesAlts();
        // await ImageService.refreshAltsInCollections();
        // await ImageService.refreshAltsInProducts();
        await ImageService.refreshAltsInImagesCollectionsProducts();

        res.status(200).json({status: "alt removed"});


    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/image/removeAlt[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


module.exports = router;