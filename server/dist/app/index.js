"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const mysql = require("mysql");
const winston = require("winston");
const express = require("express");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expresshbs = require("express-handlebars");
const methodOverride = require("method-override");
const SessionFileStore = require("session-file-store");
const schedule = require("node-schedule");
const nconf = require("nconf");
const hbsHelpers = require("handlebars-helpers");
const MigrationDao_1 = require("./migration/domain/dao/MigrationDao");
const Controller_1 = require("./home/Controller");
const Controller_2 = require("./error/Controller");
const UserController_1 = require("./user/Controller/UserController");
const Controller_3 = require("./badge/Controller");
const Controller_4 = require("./adminhome/Controller");
const BadgeService_1 = require("./badge/Service/BadgeService");
const BadgeDao_1 = require("./badge/Domain/DAO/BadgeDao");
const PlaceDao_1 = require("./place/Domain/Dao/PlaceDao");
const PlaceService_1 = require("./place/Service/PlaceService");
const PlaceCategoryDao_1 = require("./place/Domain/Dao/PlaceCategoryDao");
const PlaceCategoryService_1 = require("./place/Service/PlaceCategoryService");
const ImageDao_1 = require("./storage/Domain/DAO/ImageDao");
const StorageService_1 = require("./storage/Service/StorageService");
const Controller_5 = require("./storage/Controller");
const UserDao_1 = require("./user/Domain/DAO/UserDao");
const UserService_1 = require("./user/Service/UserService");
const UserAchievedBadgeDao_1 = require("./badge/Domain/DAO/UserAchievedBadgeDao");
const UserVisitedPlaceDao_1 = require("./place/Domain/Dao/UserVisitedPlaceDao");
const GeoLocationService_1 = require("./geolocation/Service/GeoLocationService");
const PlaceController_1 = require("./place/Controller/PlaceController");
const PlaceCategoryController_1 = require("./place/Controller/PlaceCategoryController");
const PlaceAPIController_1 = require("./place/Controller/PlaceAPIController");
const PlaceCategoryAPIController_1 = require("./place/Controller/PlaceCategoryAPIController");
const PlaceExcelService_1 = require("./place/Service/PlaceExcelService");
const UserAPIController_1 = require("./user/Controller/UserAPIController");
const index_1 = require("./error/Domain/Dao/DeviceErrorDao/index");
const index_2 = require("./error/Service/DeviceErrorService/index");
const index_3 = require("./error/Controller/ErrorApiController/index");
const index_4 = require("./badge/Service/BadgeAchievementService/index");
const index_5 = require("./user/Domain/DAO/UserLoginDao/index");
const hbsHelperComparison = hbsHelpers.comparison();
exports.mysqlPoolConfig = {
    connectionLimit: 100,
    host: '192.168.10.10',
    user: 'biotops',
    password: 'biotops_test_password',
    database: 'biotops'
};
// Creates and configures an ExpressJS web server.
class App {
    //Run configuration methods on the Express instance.
    constructor() {
        this.migrationDao = MigrationDao_1.default.getInstance();
        this.notifierCount = 7;
        this.executedNotifier = 0;
        this.cronJobs = new Map();
        this.daos = new Map();
        this.services = new Map();
        this.controllers = new Map();
        this.express = express();
        nconf.file(path.normalize('/home/biotops/biotops.conf.json'));
        let winstonConsoleTransport = new winston.transports.Console();
        winstonConsoleTransport.timestamp = true;
        winstonConsoleTransport.colorize = true;
        winstonConsoleTransport.prettyPrint = true;
        winston.configure({
            level: this.isDevelopmentMode() ? 'debug' : 'info',
            exitOnError: false,
            transports: [
                winstonConsoleTransport
                // TODO in future configure also logging in file
                // new (winston.transports.File)({ filename: 'somefile.log' })
            ],
        });
        if (!this.isDevelopmentMode()) {
            exports.mysqlPoolConfig.host = nconf.get('db_host') || 'localhost';
            exports.mysqlPoolConfig.user = nconf.get('db_login');
            exports.mysqlPoolConfig.password = nconf.get('db_pass');
            exports.mysqlPoolConfig.database = nconf.get('db_name');
        }
        this.createLinks();
        this.configureDB();
        this.middleware();
        this.routes();
        this.configureLogger();
        this.configureErrorHandlers();
        this.configureCronJob();
        winston.info(`Application started: ${new Date()}`);
    }
    isDevelopmentMode() {
        return this.express.get('env') === 'development';
    }
    notifyAboutInitialization() {
        this.executedNotifier++;
        if (this.executedNotifier >= this.notifierCount) {
            this.controllers.forEach((controller) => {
                controller.postInitialization();
            });
        }
    }
    createLinks() {
        this.daos.set('imageDao', new ImageDao_1.default());
        this.daos.set('badgeDao', new BadgeDao_1.default(this.daos)); // Depend of ImageDao
        this.daos.set('placeCategoryDao', new PlaceCategoryDao_1.default(this.daos)); // Depend of ImageDao
        this.daos.set('placeDao', new PlaceDao_1.default(this.daos)); // Depend of PlaceCategoryDao
        this.daos.set('userDao', new UserDao_1.default());
        this.daos.set('userLoginDao', new index_5.default(this.daos)); // Depend of UserDao
        this.daos.set('deviceErrorDao', new index_1.default(this.daos)); // Depend of UserDao
        this.daos.set('userAchievedBadgeDao', new UserAchievedBadgeDao_1.default());
        this.daos.set('userVisitedPlaceDao', new UserVisitedPlaceDao_1.default());
        this.services.set('geoLocationService', new GeoLocationService_1.default());
        this.services.set('storageService', new StorageService_1.default(this.daos));
        this.services.set('userService', new UserService_1.default(this.daos));
        this.services.set('badgeService', new BadgeService_1.default(this.services, this.daos));
        this.services.set('placeCategoryService', new PlaceCategoryService_1.default(this.services, this.daos));
        this.services.set('placeService', new PlaceService_1.default(this.services, this.daos));
        this.services.set('placeExcelService', new PlaceExcelService_1.default(this.services, this.daos));
        this.services.set('deviceErrorService', new index_2.default(this.services, this.daos));
        this.services.set('badgeAchievementService', new index_4.default(this.services, this.daos));
        this.controllers.set('errorController', new Controller_2.default());
        this.controllers.set('userController', new UserController_1.default(this.services));
        this.controllers.set('homeController', new Controller_1.default());
        this.controllers.set('adminHomeController', new Controller_4.default(this.services));
        this.controllers.set('badgeController', new Controller_3.default(this.services));
        this.controllers.set('storageController', new Controller_5.default(this.services));
        this.controllers.set('userAPIController', new UserAPIController_1.default(this.services));
        this.controllers.set('placeAPIController', new PlaceAPIController_1.default(this.services));
        this.controllers.set('placeCategoryAPIController', new PlaceCategoryAPIController_1.default(this.services));
        this.controllers.set('placeCategoryController', new PlaceCategoryController_1.default(this.services));
        this.controllers.set('placeController', new PlaceController_1.default(this.services));
        this.controllers.set('errorApiController', new index_3.default(this.services));
        this.notifyAboutInitialization();
    }
    configureDB() {
        winston.debug('Configuring DB');
        this.connectionPool = mysql.createPool(exports.mysqlPoolConfig);
        this.connectionPool.on('acquire', (connection) => {
            winston.debug(`Connection ${connection.threadId} acquired`);
        });
        this.connectionPool.on('enqueue', function () {
            winston.debug('Waiting for available connection slot');
        });
        this.connectionPool.on('release', (connection) => {
            winston.debug(`Connection ${connection.threadId} released`);
        });
        this.migrationDao.init(this.connectionPool).then(() => {
            winston.debug("Migration dao inited successfully");
            this.migrationDao.startMigration(this.daos).then(() => {
                winston.debug("Migration finished successfully");
                this.daos.forEach((dao, key, map) => {
                    dao.init(this.connectionPool);
                });
                this.notifyAboutInitialization();
            }, (err) => {
                winston.error("Failed to migrate generic SQL", err);
                this.notifyAboutInitialization();
            }).catch((err) => {
                winston.error("Failed to migrate generic SQL", err);
                this.notifyAboutInitialization();
            });
        }, (err) => {
            winston.error("Failed to initialize migration tool!", err);
            this.notifyAboutInitialization();
        }).catch((err) => {
            winston.error("Failed to initialize migration tool!", err);
            this.notifyAboutInitialization();
        });
    }
    // Configure Express middleware.
    middleware() {
        let self = this;
        winston.debug('Configuring middleware');
        const FileStore = SessionFileStore(session);
        const sessionStore = new FileStore({
            path: path.normalize(__dirname + '/../session_store'),
            retries: 1,
            logFn: winston.debug
        });
        this.express.use(favicon(path.normalize(__dirname + '/../public/img/favicon16x16.png')));
        this.express.use(express.static(path.normalize(__dirname + '/../public')));
        this.express.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
        //this.express.use(i18n.init);
        this.express.use(cookieParser());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        this.express.use(session({
            secret: 'Biotops secret',
            store: sessionStore,
            name: 'biotops.sid',
            saveUninitialized: false,
            resave: false
        }));
        this.controllers.forEach((controller) => {
            controller.init(this.express);
        });
        this.express.set('views', path.join(__dirname));
        this.express.engine('.hbs', expresshbs({
            defaultLayout: 'system/template/internal-layout',
            extname: '.hbs',
            helpers: {
                __: function (key, context) {
                    let translate = context.data.root.__(key);
                    return translate ? translate : '';
                },
                length: function (array) {
                    return array.length;
                },
                toJson: function (array) {
                    return JSON.stringify(array);
                },
                isMenuActive(menuKey, context) {
                    return menuKey == context.data.root.menuKey ? 'active' : '';
                },
                isSubMenuActive(subMenuKey, context) {
                    return subMenuKey == context.data.root.subMenuKey ? 'active' : '';
                },
                isProductionMode: function (context) {
                    if (self.isDevelopmentMode()) {
                        context.inverse(this);
                    }
                    else {
                        context.fn(this);
                    }
                },
                compare: hbsHelperComparison.compare
            },
            layoutsDir: path.join(__dirname),
            partialsDir: path.join(__dirname)
        }));
        this.express.set('view engine', '.hbs');
        this.notifyAboutInitialization();
    }
    // Configure API endpoints.
    routes() {
        winston.debug('Configuring router');
        let router = express.Router();
        this.router = router;
        this.express.use(router);
        this.controllers.forEach((controller) => {
            controller.router(router);
        });
        this.notifyAboutInitialization();
    }
    configureLogger() {
        winston.debug('Configuring logger');
        // let logger = winston.loggers.get('');
        // this.logger = expressWinston.errorLogger(logger);
        //
        // this.express.use(this.logger);
        this.notifyAboutInitialization();
    }
    configureErrorHandlers() {
        winston.debug('Configuring error handler');
        // catch 404 and forward to error handler
        this.express.use((req, res, next) => {
            winston.debug(`Page not found: "${req.url}"`);
            res.redirect("/404");
        });
        // development error handler
        // will print stacktrace
        if (this.isDevelopmentMode()) {
            this.express.use((err, req, res, next) => {
                winston.error(err);
                res.status(500);
                res.json({
                    message: err.message,
                    stack: err.stack
                });
                // res.render('error', {
                //     message: err.message,
                //     error: err
                // });
            });
        }
        this.notifyAboutInitialization();
    }
    configureCronJob() {
        this.cronJobs.forEach((cronJob) => {
            let job = schedule.scheduleJob(cronJob.getRule(), () => { cronJob.execute(); });
            cronJob.setJob(job);
        });
        this.notifyAboutInitialization();
    }
}
exports.App = App;
//# sourceMappingURL=index.js.map