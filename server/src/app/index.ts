import * as path from 'path';
import * as mysql from "mysql";
import * as winston from 'winston';
import * as express from 'express';
import * as favicon from 'serve-favicon';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as expresshbs from 'express-handlebars';
import * as methodOverride from 'method-override';
import * as SessionFileStore from 'session-file-store';
import * as schedule from 'node-schedule';
import * as nconf from 'nconf';
import * as hbsHelpers from 'handlebars-helpers';

import {Controller} from "./system/Controller";
import {CRUDDao} from "./system/CRUDDao";
import {CronJob} from "./system/CronJob";
import MigrationDao from "./migration/domain/dao/MigrationDao";
import HomeController from "./home/Controller";
import ErrorController from "./error/Controller";
import UserController from "./user/Controller/UserController";
import BadgeController from "./badge/Controller";
import AdminHomeController from "./adminhome/Controller";
import BadgeService from "./badge/Service/BadgeService";
import BadgeDao from "./badge/Domain/DAO/BadgeDao";
import PlaceDao from "./place/Domain/Dao/PlaceDao";
import PlaceService from "./place/Service/PlaceService";
import PlaceCategoryDao from "./place/Domain/Dao/PlaceCategoryDao";
import PlaceCategoryService from "./place/Service/PlaceCategoryService";
import ImageDao from "./storage/Domain/DAO/ImageDao";
import StorageService from "./storage/Service/StorageService";
import StorageController from "./storage/Controller";
import UserDao from "./user/Domain/DAO/UserDao";
import UserService from "./user/Service/UserService";
import UserAchievedBadgeDao from "./badge/Domain/DAO/UserAchievedBadgeDao";
import UserVisitedPlaceDao from "./place/Domain/Dao/UserVisitedPlaceDao";
import GeoLocationService from "./geolocation/Service/GeoLocationService";
import PlaceController from "./place/Controller/PlaceController";
import PlaceCategoryController from "./place/Controller/PlaceCategoryController";
import PlaceAPIController from "./place/Controller/PlaceAPIController";
import PlaceCategoryAPIController from "./place/Controller/PlaceCategoryAPIController";
import PlaceExcelService from "./place/Service/PlaceExcelService";
import UserAPIController from "./user/Controller/UserAPIController";
import DeviceErrorDao from "./error/Domain/Dao/DeviceErrorDao/index";
import DeviceErrorService from "./error/Service/DeviceErrorService/index";
import ErrorApiController from "./error/Controller/ErrorApiController/index";
import BadgeAchievementService from "./badge/Service/BadgeAchievementService/index";
import UserLoginDao from "./user/Domain/DAO/UserLoginDao/index";

const hbsHelperComparison = hbsHelpers.comparison();

export const mysqlPoolConfig:mysql.IPoolConfig = {
    connectionLimit:    100,
    host:               '192.168.10.10',
    user:               'biotops',
    password:           'biotops_test_password',
    database:           'biotops'
};

// Creates and configures an ExpressJS web server.
export class App {

    public express: express.Application;
    private router: express.Router;
    private connectionPool:mysql.IPool;
    private migrationDao: MigrationDao = MigrationDao.getInstance();

    private notifierCount: number = 7;
    private executedNotifier: number = 0;
    private cronJobs: Map<string, CronJob> = new Map();
    private daos: Map<string, CRUDDao<any>> = new Map();
    private services: Map<string, any> = new Map();
    private controllers: Map<string, Controller> = new Map();

    //Run configuration methods on the Express instance.
    constructor() {
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
            mysqlPoolConfig.host = nconf.get('db_host') || 'localhost';
            mysqlPoolConfig.user = nconf.get('db_login') ;
            mysqlPoolConfig.password = nconf.get('db_pass') ;
            mysqlPoolConfig.database = nconf.get('db_name') ;
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

    public isDevelopmentMode(): boolean {
        return this.express.get('env') === 'development';
    }

    private notifyAboutInitialization() {
        this.executedNotifier++;
        if (this.executedNotifier >= this.notifierCount) {
            this.controllers.forEach((controller) => {
                controller.postInitialization();
            });
        }
    }

    private createLinks():void {
        this.daos.set('imageDao', new ImageDao());
        this.daos.set('badgeDao', new BadgeDao(this.daos)); // Depend of ImageDao
        this.daos.set('placeCategoryDao', new PlaceCategoryDao(this.daos)); // Depend of ImageDao
        this.daos.set('placeDao', new PlaceDao(this.daos)); // Depend of PlaceCategoryDao
        this.daos.set('userDao', new UserDao());
        this.daos.set('userLoginDao', new UserLoginDao(this.daos)); // Depend of UserDao
        this.daos.set('deviceErrorDao', new DeviceErrorDao(this.daos)); // Depend of UserDao
        this.daos.set('userAchievedBadgeDao', new UserAchievedBadgeDao());
        this.daos.set('userVisitedPlaceDao', new UserVisitedPlaceDao());

        this.services.set('geoLocationService', new GeoLocationService());
        this.services.set('storageService', new StorageService(this.daos));
        this.services.set('userService', new UserService(this.daos));
        this.services.set('badgeService', new BadgeService(this.services, this.daos));
        this.services.set('placeCategoryService', new PlaceCategoryService(this.services, this.daos));
        this.services.set('placeService', new PlaceService(this.services, this.daos));
        this.services.set('placeExcelService', new PlaceExcelService(this.services, this.daos));
        this.services.set('deviceErrorService', new DeviceErrorService(this.services, this.daos));
        this.services.set('badgeAchievementService', new BadgeAchievementService(this.services, this.daos));

        this.controllers.set('errorController', new ErrorController());
        this.controllers.set('userController', new UserController(this.services));
        this.controllers.set('homeController', new HomeController());
        this.controllers.set('adminHomeController', new AdminHomeController(this.services));
        this.controllers.set('badgeController', new BadgeController(this.services));
        this.controllers.set('storageController', new StorageController(this.services));

        this.controllers.set('userAPIController', new UserAPIController(this.services));
        this.controllers.set('placeAPIController', new PlaceAPIController(this.services));
        this.controllers.set('placeCategoryAPIController', new PlaceCategoryAPIController(this.services));
        this.controllers.set('placeCategoryController', new PlaceCategoryController(this.services));
        this.controllers.set('placeController', new PlaceController(this.services));
        this.controllers.set('errorApiController', new ErrorApiController(this.services));

        this.notifyAboutInitialization();
    }

    private configureDB(): void {
        winston.debug('Configuring DB');
        this.connectionPool = mysql.createPool(mysqlPoolConfig);
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
    private middleware(): void {
        let self = this;
        winston.debug('Configuring middleware');
        const FileStore = SessionFileStore(session);
        const sessionStore = new FileStore({
            path:       path.normalize(__dirname + '/../session_store'),
            retries:    1,
            logFn:      winston.debug
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
            store:  sessionStore,
            name:   'biotops.sid',
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
                __: function(key, context) {
                    let translate = context.data.root.__(key);
                    return translate ? translate : '';
                },
                length: function(array) {
                    return array.length;
                },
                toJson: function(array) {
                    return JSON.stringify(array);
                },
                isMenuActive(menuKey, context) {
                  return menuKey == context.data.root.menuKey ? 'active' : '';
                },
                isSubMenuActive(subMenuKey, context) {
                    return subMenuKey == context.data.root.subMenuKey ? 'active' : '';
                },
                isProductionMode: function(context) {
                    if (self.isDevelopmentMode()) {
                        context.inverse(this);
                    } else {
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
    private routes(): void {
        winston.debug('Configuring router');
        let router: express.Router = express.Router();
        this.router = router;
        this.express.use(router);

        this.controllers.forEach((controller) => {
            controller.router(router);
        });
        this.notifyAboutInitialization();
    }

    private configureLogger() {
        winston.debug('Configuring logger');
        // let logger = winston.loggers.get('');
        // this.logger = expressWinston.errorLogger(logger);
        //
        // this.express.use(this.logger);
        this.notifyAboutInitialization();
    }

    private configureErrorHandlers() {
        winston.debug('Configuring error handler');

        // catch 404 and forward to error handler
        this.express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            winston.debug(`Page not found: "${req.url}"`);
            res.redirect("/404")
        });

        // development error handler
        // will print stacktrace
        if (this.isDevelopmentMode()) {
            this.express.use((err, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

    configureCronJob(): void {
        this.cronJobs.forEach((cronJob) => {
            let job = schedule.scheduleJob(cronJob.getRule(), () => {cronJob.execute()});
            cronJob.setJob(job);
        });

        this.notifyAboutInitialization();
    }
}
