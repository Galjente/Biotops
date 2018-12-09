"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
class ErrorApiController {
    constructor(services) {
        this.userService = services.get('userService');
        this.deviceErrorService = services.get('deviceErrorService');
    }
    init(express) { }
    router(router) {
        router.post('/api/device/error', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.saveDeviceError(request, response); });
    }
    postInitialization() { }
    saveDeviceError(request, response) {
        this.deviceErrorService.createModel(request)
            .then((model) => {
            this.deviceErrorService.validate(model, request)
                .then((validation) => {
                if (validation.valid) {
                    this.deviceErrorService.save(model)
                        .then((deviceError) => {
                        response.status(200).json(deviceError);
                    }, (error) => {
                        winston.error('Failed save device error', error);
                        response.status(500).json();
                    }).catch((error) => {
                        winston.error('Failed save device error', error);
                        response.status(500).json();
                    });
                }
                else {
                    response.status(400).json();
                }
            }, (error) => {
                winston.error('Failed validate device error model', error);
                response.status(500).json();
            })
                .catch((error) => {
                winston.error('Failed validate device error model', error);
                response.status(500).json();
            });
        }, (error) => {
            winston.error('Failed create device error model', error);
            response.status(500).json();
        }).catch((error) => {
            winston.error('Failed create device error model', error);
            response.status(500).json();
        });
    }
}
exports.default = ErrorApiController;
//# sourceMappingURL=index.js.map