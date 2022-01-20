const {Router} = require("express");

const AccountsService = require("../../services/mongodb/accountService");
const CollectionService = require("../../services/mongodb/collectionService");
const OrderService = require("../../services/mongodb/orderService");
const ProductService = require("../../services/mongodb/productService");
const StaticPageService = require("../../services/mongodb/staticPageService");
const StockService = require("../../services/mongodb/stockService");
const ImageService = require("../../services/mongodb/imagesService");
const MetaService = require("../../services/mongodb/metaService");
const SaleService = require("../../services/mongodb/saleService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");

const adm_auth = require("../../middleware/checkAdmMW");
const assert = require("assert");




const router = Router();


// индекс
router.get("/index", adm_auth, (req, res) => {
    res.render("admin/index", {
        title: "Адм=панель"
    });
});





// =========================== Работа с аккаунтами ===========================================

// панель
router.get("/accountPanel", adm_auth, async (req, res) => {
    try {
        res.render("admin/accountPanel", {
            title: "Адм=ПанАкк"
        });

    } catch (e) {
        console.log(e);
    }
});

router.get("/addAccount", adm_auth, async (req, res) => {
    try {
        res.render("admin/addAccount", {
            title: "Адм+Акк"
        });

    } catch (e) {
        console.log(e);
    }
});

// работа с аккаунтами
router.get("/allAccounts", adm_auth, async (req, res) => {
    try {
        const accounts = await AccountsService.readAllAccounts();
        if (accounts) {
            const accountsViewModel = [];
            for (let account of accounts) {
                accountsViewModel.push(AccountsService.createAccountViewModel(account));
            }
            res.render("admin/allAccounts", {
                title: "Адм=Аккаунты",
                accountsViewModel
            });
        } else {
            res.render("admin/AllAccounts", {
                title: "Адм=Аккаунты"
            });
        }
    } catch (e) {
        console.log(e);
    }
});

router.get("/oneAccount/:id", adm_auth, async (req, res) => {
    try {
        const account = await AccountsService.readAccountById(req.params.id);
        if (account) {
            const accountViewModel = AccountsService.createAccountViewModel(account);
            res.render("admin/oneAccount", {
                title: "Адм=Аккаунт",
                accountViewModel
            });
        } else {
            res.redirect("/allAccounts");
        }
    } catch (e) {
        console.log(e);
    }
});

router.get("/editAccount/:id", adm_auth, async (req, res) => {
    try {
        const account = await AccountsService.readAccountById(req.params.id);
        const accountVM = AccountsService.createAccountViewModel(account);

        res.render("admin/editAccount", {
            title: "Адм#Акк",
            accountVM
        });

    } catch (e) {
        console.log(e);
    }
});



// =========================== Работа с коллекциями ===========================================

// страница - добавления коллекции
router.get("/addCollection", adm_auth, (req, res) => {

    res.render("admin/addCollection", {
        title: "Адм+Коллекция",
    });
});

// посмотреть все коллекции
router.get("/allCollections", adm_auth, async (req, res) => {
    try {
        const collections = await CollectionService.readAllCollections();
        if (collections) {
            const collectionsViewModel = [];
            for (let collection of collections) {
                collectionsViewModel.push(CollectionService.createViewModelFromCollection(collection));
            }
            res.render("admin/allCollections", {
                title: "Адм=Коллекции",
                collectionsViewModel
            });
        } else {
            res.render("admin/allCollections", {
                title: "Адм=Коллекции"
            });
        }
    } catch (e) {
        console.log(e);
    }
});


// изменение существующей коллекции
router.get("/editCollection/:id", adm_auth, async(req, res) => {
    try {
        const collection = await CollectionService.readCollectionById(req.params.id);

        if (collection) {
            const collectionViewModel = CollectionService.createViewModelFromCollection(collection);

            res.render("admin/editCollection", {
                title: "Адм#Коллекцию",
                collectionViewModel
            });
        } else {
            res.render("admin/index", {
                title: "Адм=панель"
            });
        }
    } catch (e) {
        console.log(e);
    }
});

// удаление существующей коллекции
router.get("/deleteCollection/:id", adm_auth, async(req, res) => {
    try {
        const collection = await CollectionService.readCollectionById(req.params.id);

        if (collection) {
            const collectionViewModel = CollectionService.createViewModelFromCollection(collection);

            res.render("admin/deleteCollection", {
                title: "АдмXКоллекцию",
                collectionViewModel
            });
        } else {
            res.render("admin/index", {
                title: "Адм=панель"
            });
        }
    } catch (e) {
        console.log(e);
    }
});



// =========================== Работа с заказами ===========================================

router.get("/ordersPanel", adm_auth, async (req, res) => {
    try {
        res.render("admin/ordersPanel", {
            title: "Адм=ПанельЗак",
        });
    } catch (e) {
        console.log(e);
    }
});

router.get("/orderConfirm", adm_auth, async (req, res) => {
    try {
        res.render("admin/orderConfirm", {
            title: "Адм=ОформЗак",
        });
    } catch (e) {
        console.log(e);
    }
});

router.get("/allOrders", adm_auth, async (req, res) => {
    try {
        const orders = await OrderService.readAllOrders();
        let ordersVM = [];
        for (let order of orders)
            ordersVM.push(OrderService.createOrderViewModel(order));

        res.render("admin/allOrders", {
            title: "Адм=ВсеЗаказы",
            ordersVM
        });
    } catch (e) {
        console.log(e);
    }
});

router.get("/deleteOrder/:id", adm_auth, async (req, res) => {
    try {
        const order = await OrderService.readOrder(req.params.id);
        if (order) {
            const orderVM = OrderService.createOrderViewModel(order);
            res.render("admin/deleteOrder", {
                title: "АдмXКоллекцию",
                orderVM
            });
        } else {
            res.render("admin/index", {
                title: "Адм=панель"
            });
        }

    } catch (e) {
        console.log(e);
    }
});




// =========================== Работа с товарами ===========================================


// страница - добавления товара
router.get("/addProduct", adm_auth, async(req, res) => {
    try {
        // получение списка имён коллекций, для возможности привязки к коллекции
        const collections = await CollectionService.readAllCollections();
        if (collections) {
            let collectionsVM = [];
            for (let collection of collections) {
                collectionsVM.push(CollectionService.createViewModelFromCollection(collection));
            }

            res.render("admin/addProduct", {
                title: "Адм+Товар",
                collectionsVM
            });
        } else {
            res.render("admin/addProduct", {
                title: "Адм+Товар",
            });
        }
    } catch (e) {
        console.log(e);
    }
});

// посмотреть все товары
router.get("/allProducts", adm_auth, async (req, res) => {
    try {
        const products = await ProductService.readAllProducts();
        if (products) {
            const productsViewModel = [];
            for (let product of products) {
                productsViewModel.push(ProductService.createViewModelFromProduct(product));
            }

            res.render("admin/allProducts", {
                title: "Адм=Товары",
                productsViewModel
            });
        } else {
            res.render("admin/allProducts", {
                title: "Адм=Товары",
            });
        }
    } catch (e) {
        console.log(e);
    }
});

// изменение существующего товара
router.get("/editProduct/:id", adm_auth, async(req, res) => {
    try {
        const product = await ProductService.readProductById(req.params.id);

        if (product) {
            const collection = await CollectionService.readCollectionById(product.collectionId);
            const productVM = ProductService.createViewModelFromProduct(product);

            if (collection)
                productVM.collectionName = collection.name;
            else
                productVM.collectionName = "";

            const collectionsVM = [];
            const collections = await CollectionService.readAllCollections();
            for (let col of collections) {
                collectionsVM.push({
                    collectionName: col.name,
                    collectionId: col._id
                });
            }

            const avm = {
                productVM, collectionsVM
            }

            res.render("admin/editProduct", {
                title: "Адм#Товар",
                avm
            });
        } else {
            res.render("admin/index", {
                title: "Адм=панель"
            });
        }
    } catch (e) {
        console.log(e);
    }
});


// удаление существующего товара
router.get("/deleteProduct/:id", adm_auth, async(req, res) => {
    try {
        const product = await ProductService.readProductById(req.params.id);

        if (product) {
            const productViewModel = ProductService.createViewModelFromProduct(product);

            res.render("admin/deleteProduct", {
                title: "АдмXТовар",
                productViewModel
            });
        } else {
            res.render("admin/index", {
                title: "Адм=панель"
            });
        }
    } catch (e) {
        console.log(e);
    }
});

// =========================== Работа со скидками ============================================

// страница - добавления скидки
router.get("/addSale", adm_auth, async(req, res) => {
    try {
        res.render("admin/addSale", {
            title: "Адм+Скидка",
        });
    } catch (e) {
        console.log(e);
    }
});

// посмотреть все скидки (акции)
router.get("/allSales", adm_auth, async (req, res) => {
    try {
        const sales = await SaleService.readAllSales();
        if (sales) {
            const salesViewModel = [];
            for (let sale of sales) {
                salesViewModel.push(SaleService.createSaleViewModel(sale));
            }

            res.render("admin/allSales", {
                title: "Адм=Скидки",
                salesViewModel
            });
        } else {
            res.render("admin/allSales", {
                title: "Адм=Скидки",
            });
        }
    } catch (e) {
        console.log(e);
    }
});

// изменение существующей скидки
router.get("/editSale/:id", adm_auth, async(req, res) => {
    try {
        const sale = await SaleService.readSale(req.params.id);
        if (sale) {
            const saleViewModel = SaleService.createSaleViewModel(sale);
            res.render("admin/editSale", {
                title: "Адм#Скидка",
                saleViewModel
            });
        } else {
            res.render("admin/index", {
                title: "Адм=панель"
            });
        }
    } catch (e) {
        console.log(e);
    }
});


// удаление существующей скидки (акции)
router.get("/deleteSale/:id", adm_auth, async(req, res) => {
    try {
        const sale = await SaleService.readSale(req.params.id);

        if (sale) {
            const saleViewModel = SaleService.createSaleViewModel(sale);

            res.render("admin/deleteSale", {
                title: "АдмXСкидка",
                saleViewModel
            });
        } else {
            res.render("admin/index", {
                title: "Адм=панель"
            });
        }
    } catch (e) {
        console.log(e);
    }
});




// =========================== Работа с статическими страницами ===========================================

// изменение статических страниц
router.get("/editStaticPages", adm_auth, async (req, res) => {
    try {
        const pages = await StaticPageService.readAllStaticPages();

        let pvm = [];
        for (let page of pages) {
            pvm.push(StaticPageService.createStaticPageViewModel(page));
        }

        res.render("admin/editStaticPages", {
            title: "Адм<>СтатСтр",
            pvm
        });
    } catch (e) {
        console.log(e);
    }
});




// =========================== Работа со складом ===========================================

// панель управления складом
router.get("/stockPanel", adm_auth, async (req, res) => {
    try {
        const stock = await StockService.readStock();
        const stockViewModel = StockService.createStockViewModel(stock);

        res.render("admin/stockPanel", {
            title:"Адм@Склад",
            stockViewModel
        })
    } catch (e) {
        console.log(e);
    }
});

// ============================= Работа с картинками ========================================

// панель управления картинками
router.get("/imagesPanel", adm_auth, async (req, res) => {
    try {
        const imagesVM = {
            collections: [],
            products:[]
        }
        const collectionImages = await ImageService.getAllImagesByType("collection");
        for (let image of collectionImages) {
            imagesVM.collections.push(image.i_fileName);
        }
        const productImages = await ImageService.getAllImagesByType("product");
        for (let image of productImages) {
            imagesVM.products.push(image.i_fileName);
        }

        res.render("admin/imagesPanel", {
            title: "Адм@Картин",
            imagesVM
        });
    } catch (e) {
        console.log(e);
    }
});

// панель управления альтами
router.get("/imagesAltPanel", adm_auth, async (req, res) => {
    try {
        res.render("admin/imagesAltPanel", {
            title: "Адм@КартинАльт",
        });
    } catch (e) {
        console.log(e);
    }
});


// ========================== Работа с мета-дата =============================================

// панель управления meta-датой
router.get("/metaDataPanel", adm_auth, async (req, res) => {
    try {
        const meta = await MetaService.getMetaDataFromDB();
        const metaVM = MetaService.createMetaDbViewModel(meta);

        res.render("admin/metaDataPanel", {
            title: "Адм@МЕТА",
            metaVM
        });

    } catch (e) {
        console.log(e);
    }
})


// =========================== Логи =========================================================
router.get("/logPanel", adm_auth, async (req, res) => {
    try {
        const logData = await LoggerService.readLogFromFile();
        res.render("admin/logPanel", {
            title: "Адм=Лог",
            logData
        });

    } catch (e) {
        console.log(e);
    }
});



// ============================ Работа с удалёнными объектами =====================================
router.get("/allDeleted", adm_auth, async (req, res) => {
    try {
        const allDes = await DeleteService.readAllDeletedEntities();
        let allDesVM = [];
        for(let de of allDes) {
            allDesVM.push(DeleteService.createDeletedEntityViewModel(de));
        }

        res.render("admin/allDeleted", {
            title: "Адм@DEL",
            allDesVM
        });

    } catch (e) {
        console.log(e);
    }
});


router.get("/recoverDeleted/:id", adm_auth, async (req, res) => {
    try {
        let de = await DeleteService.findInDeletedByEntityId(req.params.id);
        let deVM = {};
        if (de) {
            deVM = DeleteService.createDeletedEntityViewModel(de);
        }
        res.render("admin/recoverDeleted", {
            title: "Адм@RDEL",
            deVM
        });
    } catch (e) {
        console.log(e);
    }
});


router.get("/deleteDeleted/:id", adm_auth, async (req, res) => {
    try {
        let de = await DeleteService.findInDeletedByEntityId(req.params.id);
        let deVM = {};
        if (de) {
            deVM = DeleteService.createDeletedEntityViewModel(de);
        }
        res.render("admin/deleteDeleted", {
            title: "Адм@DELDEL",
            deVM
        });
    } catch (e) {
        console.log(e);
    }
});


module.exports = router;