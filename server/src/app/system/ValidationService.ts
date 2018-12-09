"use strict";
import {Request} from "express";
import {RequestWithLocale} from "./RequestWithLocale";

export interface ModelValidation {
    valid: boolean;
}

export interface ValidationService<TModel> {

    createModel(request: Request & RequestWithLocale): Promise<TModel>;
    validate(model: TModel, request: Request & RequestWithLocale): Promise<ModelValidation>;

}