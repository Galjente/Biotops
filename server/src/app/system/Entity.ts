"use strict";

export interface ManyToManyProperty {
    table: string;
    parentKey: string;
    childKey: string;
}

export interface Entity {

    getIdFieldName(): string;
    getTableName(): string;
    getFieldsMapping(): Map<string, string>;
    getFieldsRelation(): Array<string>;
    getFieldsManyToMany(): Map<string, ManyToManyProperty>;

}