"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationHelper {
    static isValid(validationModel) {
        return this.validateObject(validationModel);
    }
    static validateArray(validationArray) {
        let valid = true;
        validationArray.forEach((elem) => {
            if (Array.isArray(elem)) {
                valid = valid && this.validateArray(elem);
            }
            else if (typeof elem === "object") {
                valid = valid && this.validateObject(elem);
            }
            else {
                valid = valid && ((typeof elem === 'undefined') || elem === "");
            }
        });
        return valid;
    }
    static validateObject(validationObject) {
        let valid = true;
        for (let key in validationObject) {
            if (Array.isArray(validationObject[key])) {
                valid = valid && this.validateArray(validationObject[key]);
            }
            else if (typeof validationObject[key] === "object") {
                valid = valid && this.validateObject(validationObject[key]);
            }
            else {
                valid = valid && ((typeof validationObject[key] === 'undefined')
                    || validationObject[key] === ""
                    || validationObject[key] === true);
            }
        }
        return valid;
    }
}
exports.default = ValidationHelper;
//# sourceMappingURL=ValidationHelper.js.map