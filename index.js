const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const path = require("path");
const keys = require("./keys/keys");

const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const varMiddleware = require("./middleware/variables");
const csurf = require("csurf");
const compression = require('compression')

// TODO доделать все API

// роуты API
const accountRoutes = require("./routes/api/accountRouter");
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

const homeRoutes = require("./routes/homeRouter");
const admin_panelRoutes = require("./routes/admin/adminPanelRouter");

// сервис изначальной инициализации
const backInit = require("./init");






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

// подключение сессии
// объект mongo
const store =  new MongoStore({
    collection: "sessions",
    uri: keys.MONGODB_URI
});

app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use("/api/image", imageRoutes);
app.use(csurf()); // *
app.use(varMiddleware);

// подключаем роуты в конвейер
app.use("/admin/", admin_panelRoutes);
app.use("/auth", authRoutes);
app.use("/backup", backupRouter);


app.use("/api/account", accountRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/product", productRoutes);
app.use("/api/staticPage", staticPageRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/sale", saleRoutes);
app.use("/api/deletedEntity",deletedRoutes);
app.use("/api/search", searchRouter);

app.use("/", homeRoutes);


// порт и запуск сервера
const PORT = process.env.PORT || 3000;
// запуск express + mongoose
async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            // useFindAndModify: false
        });

        // инициализация всего
        await backInit.init();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}...`);
        });

    } catch (error) {
        console.log(error);
    }
}

start();
