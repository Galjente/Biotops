"use strict";
import * as os from 'os';
import * as fs from "fs";
import * as path from "path";
import {Cell, CellRichTextValue, Row, ValueType, Workbook, Worksheet} from "exceljs";
import PlaceCategory from "../../Domain/Entity/PlaceCategory/index";
import {CRUDDao} from "../../../system/CRUDDao";
import PlaceCategoryDao from '../../Domain/Dao/PlaceCategoryDao/index';
import Place from "../../Domain/Entity/Place/index";
import * as winston from "winston";
import PlaceDao from "../../Domain/Dao/PlaceDao/index";
import {IConnection} from "mysql";

interface WorkbookCallback {
    (workbook: Workbook):void;
}

export interface ExcelParseResult {
    inserted: number;
    ignored: number
}

export default class PlaceExcelService {

    private placeCategoryDao: PlaceCategoryDao;
    private placeDao: PlaceDao;

    constructor(services: Map<string, any>, daos: Map<string, CRUDDao<any>>) {
        this.placeCategoryDao = <PlaceCategoryDao>daos.get('placeCategoryDao');
        this.placeDao = <PlaceDao>daos.get('placeDao');
    }

    parseExcelFile(buffer: Buffer): Promise<ExcelParseResult> {
        return new Promise((resolve, reject) => {
            let filePath = path.normalize(os.tmpdir() + '/tmp_xlsx.xlsx');
            fs.writeFileSync(filePath, buffer);

            let workbook:Workbook = new Workbook();
            workbook.xlsx.readFile(filePath)
                .then(
                    () => {
                        this.processWorkbook(workbook).then(
                            () => {
                                fs.unlinkSync(filePath);
                                winston.info('Workbook processed');
                                resolve(null);
                            },
                            (error) => {
                                fs.unlinkSync(filePath);
                                winston.error(`Failed process workbook: ${error}`);
                                reject(error);
                            }
                        ).catch((error) => {
                            fs.unlinkSync(filePath);
                            winston.error(`Failed process workbook: ${error}`);
                            reject(error);
                        });
                    },
                    (error) => {
                        fs.unlinkSync(filePath);
                        winston.error(`Failed open workbook: ${error}`);
                        reject(error);
                    }
                )
                .catch((error) => {
                    fs.unlinkSync(filePath);
                    winston.error(`Failed open workbook: ${error}`);
                    reject(error);
                });
        });
    }

    processWorkbook(workbook: Workbook): Promise<void> {
        return new Promise((resolve, reject) => {
            this.placeDao.getConnection().then(
                    (connection) => {
                    this.processPlaceCategory(connection, workbook.getWorksheet('Kategorijas'))
                        .then(
                            (categoryMap) => {
                                this.processPlace(connection, categoryMap, workbook.getWorksheet('Final'))
                                    .then(
                                        (places) => {
                                            connection.release();
                                            resolve();
                                        },
                                        (error) => {
                                            connection.release();
                                            reject(error);
                                        }
                                    ).catch((error) => {
                                        connection.release();
                                        reject(error);
                                    });
                            },
                            (error) => {
                                connection.release();
                                reject(error);
                            }
                        ).catch((error) => {
                            connection.release();
                            reject(error);
                        });
                },
                reject
            ).catch(reject);
        });
    }

    getPlaceCategoryFromRow(connection: IConnection, worksheet: Worksheet, rowNumber: number): Promise<PlaceCategory> {
        let nameCell: Cell = worksheet.getCell('B' + rowNumber);
        let categoryName = nameCell && nameCell.value ? (<string>nameCell.value).trim() : null;
        if (categoryName == null || categoryName == '') {
            return null;
        }

        return new Promise((resolve, reject) => {
            let criteria: Map<string, any> = new Map();
            criteria.set('name', categoryName);
            this.placeCategoryDao.findOneByCriteria(connection, criteria)
                .then(
                    (category) => {
                        if (category) {
                            resolve(category);
                        } else {
                            category = new PlaceCategory();
                            category.name = categoryName;
                            category.published = false;
                            this.placeCategoryDao.saveEntity(connection, category)
                                .then(
                                    resolve,
                                    (error) => {
                                        reject(error);
                                    }
                                )
                                .catch((error) => {
                                    reject(error);
                                });
                        }
                    },
                    reject
                )
                .catch(reject);
        });
    }

    processPlaceCategory(connection: IConnection, worksheet: Worksheet): Promise<Map<string, PlaceCategory>> {
        return new Promise((resolve, reject) => {
            let promises: Array<Promise<PlaceCategory>> = [];
            let cellNumber:number = 2; // cells starts from 1 number, at 1 position located header
            let finishProcessing = false;
            while(!finishProcessing) {
                let rowPromise = this.getPlaceCategoryFromRow(connection, worksheet, cellNumber++);
                if (rowPromise) {
                    promises.push(rowPromise);
                } else {
                    finishProcessing = true;
                }
            }

            Promise.all(promises)
                .then(
                    (parsedPlaceCategories) => {
                        this.placeCategoryDao.findAll(connection)
                            .then(
                                (categories) => {
                                    let categoryMap: Map<string, PlaceCategory> = new Map();
                                    categories.forEach((category) => {
                                        categoryMap.set(category.name, category);
                                    });
                                    resolve(categoryMap);
                                },
                                reject
                            )
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    getTextFromCell(cell:Cell): string {
        if (cell.type == ValueType.RichText) {
            return (<CellRichTextValue>cell.value).richText.map((reachText) => {return reachText.text}).join('');
        }

        return cell.value ? <string>cell.value : '';
    }

    getPlaceCategoriesFromCell(placeCategories: Map<string, PlaceCategory>, cell:Cell): Array<PlaceCategory> {
        let rawCategories = <string>cell.value;
        let categoryNames = rawCategories.slice(0, rawCategories.lastIndexOf('.')).split('.');
        let categoryMap = categoryNames.map((name) => {
            let category = placeCategories.get(name.trim());
            if (!category) {
                winston.warn(`Can't find place category with name "${name.trim()}", Category will be ignored!`);
            }
            return category;
        });
        return categoryMap.filter((category) => {return category ? true : false;});
    }

    getPlaceFromRow(connection: IConnection, worksheet: Worksheet, rowNumber: number, placeCategories: Map<string, PlaceCategory>):Promise<Place> {
        let idCell = worksheet.getCell('A' + rowNumber);
        let nameCell = worksheet.getCell('B' + rowNumber);
        let addressCell = worksheet.getCell('C' + rowNumber);
        let regionCell = worksheet.getCell('D' + rowNumber);
        let latitudeCell = worksheet.getCell('E' + rowNumber);
        let longitudeCell = worksheet.getCell('F' + rowNumber);
        let categoriesCell = worksheet.getCell('G' + rowNumber);
        let entreeFeeCell = worksheet.getCell('H' + rowNumber);
        let noteCell = worksheet.getCell('I' + rowNumber);
        let shortDescriptionCell = worksheet.getCell('J' + rowNumber);
        let descriptionCell = worksheet.getCell('K' + rowNumber);

        if (idCell == null || idCell.value == null) {
            return null;
        }

        return new Promise((resolve, reject) => {
            this.placeDao.findById(connection, <number>idCell.value).then(
                (place) => {
                    if (!place) {
                        place = new Place();
                        //place.id = <number>idCell.value;
                    }

                    place.name = this.getTextFromCell(nameCell);
                    place.address = this.getTextFromCell(addressCell);
                    place.region = this.getTextFromCell(regionCell);
                    place.latitude = <number>latitudeCell.value;
                    place.longitude = <number>longitudeCell.value;
                    place.categories = this.getPlaceCategoriesFromCell(placeCategories, categoriesCell);
                    place.entranceFee = <string>entreeFeeCell.value === 'Bezmaksas' ? 0 : 1;
                    place.note = this.getTextFromCell(noteCell);
                    place.shortDescription = this.getTextFromCell(shortDescriptionCell);
                    place.description = this.getTextFromCell(descriptionCell);

                    this.placeDao.saveEntity(connection, place)
                        .then(
                            resolve,
                            (error) => {
                                winston.warn(`Failed save place(${place.name})`);
                                resolve(null);
                            }
                        )
                        .catch((error) => {
                            winston.warn(`Failed save place(${place.name})`);
                            resolve(null);
                        });
                },
                reject
            )
            .catch(reject);
        });
    }

    processPlace(connection: IConnection, placeCategories: Map<string, PlaceCategory>, worksheet: Worksheet):Promise<Array<Place>> {
        return new Promise((resolve, reject) => {
            let rowNumber: number = 2;
            let finishProcessing = false;
            let promises: Array<Promise<Place>> = [];
            while (!finishProcessing) {
                let placePromise = this.getPlaceFromRow(connection, worksheet, rowNumber++, placeCategories);
                if (placePromise == null) {
                    finishProcessing = true;
                } else {
                    promises.push(placePromise);
                }
            }
            Promise.all(promises)
                .then(resolve, reject)
                .catch(reject);
        });
    }
}