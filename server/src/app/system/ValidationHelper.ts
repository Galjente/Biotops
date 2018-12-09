"use strict";

export default class ValidationHelper {

    static isValid(validationModel): boolean {
        return this.validateObject(validationModel);
    }

    private static validateArray(validationArray: Array<any>): boolean {
        let valid:boolean = true;
        validationArray.forEach((elem) => {
            if (Array.isArray(elem)) {
                valid = valid && this.validateArray(elem);
            } else if (typeof elem === "object") {
                valid = valid && this.validateObject(elem);
            } else {
                valid = valid && ((typeof elem === 'undefined') || elem === "");
            }
        });
        return valid;
    }

    private static validateObject(validationObject: Object): boolean {
        let valid:boolean = true;
        for (let key in validationObject) {
            if (Array.isArray(validationObject[key])) {
                valid = valid && this.validateArray(validationObject[key]);
            } else if (typeof validationObject[key] === "object") {
                valid = valid && this.validateObject(validationObject[key]);
            } else {
                valid = valid && ((typeof validationObject[key] === 'undefined')
                    || validationObject[key] === ""
                    || validationObject[key] === true);
            }
        }
        return valid;
    }
}