const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const path = require("path");
const compression = require('compression')

// TODO доделать все API
// роуты API
const collectionRoutes = require("./routes/api/collectionRouter");
const orderRoutes = require("./routes/api/orderRouter");
const productRoutes = require("./routes/api/productRouter");
const staticPageRoutes = require("./routes/api/staticPageRouter");
const stockRoutes = require("./routes/api/stockRouter");
const metaRoutes = require("./routes/api/metaRouter");
const saleRoutes = require("./routes/api/saleRouter");
const deletedRoutes = require("./routes/api/deletedEntitiyRouter");
const backupRouter = require("./routes/backupRouter");
const searchRouter = require("./routes/api/searchRouter");

// роуты страниц и админа
const authRoutes = require("./routes/authRouter");
const imageRoutes = require("./routes/api/imagesRouter");
const homeRoutes = require("./routes/pages/homeRouter");
const adminRoutes = require("./routes/pages/adminPanelRouter");
// сервис изначальной инициализации
const backInit = require("./init");

const settings = require("./settings");



// регистрация приложения
const app = express();

// сжатие для всех ответов
app.use(compression())

// настройка handlebars, папки представлений и шаблонов
app.engine("hbs", exphbs({
    defaultLayout: "main",
    extname: "hbs"
}));
app.set('view engine', "hbs");
app.set("views", "views");

// регистрация папки public как статической
app.use(express.static(path.join(__dirname, "public")));

// позволяет декодировать http запросы и получать из body. элементы
app.use(express.urlencoded({extended: true}));

// подключаем роуты в конвейер
app.use("/auth", authRoutes);
app.use("/backup", backupRouter);
app.use("/api/image", imageRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/product", productRoutes);
app.use("/api/staticPage", staticPageRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/sale", saleRoutes);
app.use("/api/deletedEntity",deletedRoutes);
app.use("/api/search", searchRouter);

// страницы hbs
app.use("/", adminRoutes);
app.use("/", homeRoutes);


// порт и запуск сервера
// запуск express + mongoose
async function start() {
    try {
        await mongoose.connect(settings.MONGODB_URI, {
            useNewUrlParser: true,
            // useFindAndModify: false
        });

        // инициализация всего
        await backInit.init();

        app.listen(settings.NEXT_PUBLIC_PORT, () => {
            console.log(`Server running on port ${settings.NEXT_PUBLIC_PORT}...`);
        });

    } catch (error) {
        console.log(error);
    }
}

start();
