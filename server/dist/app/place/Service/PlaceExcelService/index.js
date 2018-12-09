"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const fs = require("fs");
const path = require("path");
const exceljs_1 = require("exceljs");
const index_1 = require("../../Domain/Entity/PlaceCategory/index");
const index_2 = require("../../Domain/Entity/Place/index");
const winston = require("winston");
class PlaceExcelService {
    constructor(services, daos) {
        this.placeCategoryDao = daos.get('placeCategoryDao');
        this.placeDao = daos.get('placeDao');
    }
    parseExcelFile(buffer) {
        return new Promise((resolve, reject) => {
            let filePath = path.normalize(os.tmpdir() + '/tmp_xlsx.xlsx');
            fs.writeFileSync(filePath, buffer);
            let workbook = new exceljs_1.Workbook();
            workbook.xlsx.readFile(filePath)
                .then(() => {
                this.processWorkbook(workbook).then(() => {
                    fs.unlinkSync(filePath);
                    winston.info('Workbook processed');
                    resolve(null);
                }, (error) => {
                    fs.unlinkSync(filePath);
                    winston.error(`Failed process workbook: ${error}`);
                    reject(error);
                }).catch((error) => {
                    fs.unlinkSync(filePath);
                    winston.error(`Failed process workbook: ${error}`);
                    reject(error);
                });
            }, (error) => {
                fs.unlinkSync(filePath);
                winston.error(`Failed open workbook: ${error}`);
                reject(error);
            })
                .catch((error) => {
                fs.unlinkSync(filePath);
                winston.error(`Failed open workbook: ${error}`);
                reject(error);
            });
        });
    }
    processWorkbook(workbook) {
        return new Promise((resolve, reject) => {
            this.placeDao.getConnection().then((connection) => {
                this.processPlaceCategory(connection, workbook.getWorksheet('Kategorijas'))
                    .then((categoryMap) => {
                    this.processPlace(connection, categoryMap, workbook.getWorksheet('Final'))
                        .then((places) => {
                        connection.release();
                        resolve();
                    }, (error) => {
                        connection.release();
                        reject(error);
                    }).catch((error) => {
                        connection.release();
                        reject(error);
                    });
                }, (error) => {
                    connection.release();
                    reject(error);
                }).catch((error) => {
                    connection.release();
                    reject(error);
                });
            }, reject).catch(reject);
        });
    }
    getPlaceCategoryFromRow(connection, worksheet, rowNumber) {
        let nameCell = worksheet.getCell('B' + rowNumber);
        let categoryName = nameCell && nameCell.value ? nameCell.value.trim() : null;
        if (categoryName == null || categoryName == '') {
            return null;
        }
        return new Promise((resolve, reject) => {
            let criteria = new Map();
            criteria.set('name', categoryName);
            this.placeCategoryDao.findOneByCriteria(connection, criteria)
                .then((category) => {
                if (category) {
                    resolve(category);
                }
                else {
                    category = new index_1.default();
                    category.name = categoryName;
                    category.published = false;
                    this.placeCategoryDao.saveEntity(connection, category)
                        .then(resolve, (error) => {
                        reject(error);
                    })
                        .catch((error) => {
                        reject(error);
                    });
                }
            }, reject)
                .catch(reject);
        });
    }
    processPlaceCategory(connection, worksheet) {
        return new Promise((resolve, reject) => {
            let promises = [];
            let cellNumber = 2; // cells starts from 1 number, at 1 position located header
            let finishProcessing = false;
            while (!finishProcessing) {
                let rowPromise = this.getPlaceCategoryFromRow(connection, worksheet, cellNumber++);
                if (rowPromise) {
                    promises.push(rowPromise);
                }
                else {
                    finishProcessing = true;
                }
            }
            Promise.all(promises)
                .then((parsedPlaceCategories) => {
                this.placeCategoryDao.findAll(connection)
                    .then((categories) => {
                    let categoryMap = new Map();
                    categories.forEach((category) => {
                        categoryMap.set(category.name, category);
                    });
                    resolve(categoryMap);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    getTextFromCell(cell) {
        if (cell.type == 8 /* RichText */) {
            return cell.value.richText.map((reachText) => { return reachText.text; }).join('');
        }
        return cell.value ? cell.value : '';
    }
    getPlaceCategoriesFromCell(placeCategories, cell) {
        let rawCategories = cell.value;
        let categoryNames = rawCategories.slice(0, rawCategories.lastIndexOf('.')).split('.');
        let categoryMap = categoryNames.map((name) => {
            let category = placeCategories.get(name.trim());
            if (!category) {
                winston.warn(`Can't find place category with name "${name.trim()}", Category will be ignored!`);
            }
            return category;
        });
        return categoryMap.filter((category) => { return category ? true : false; });
    }
    getPlaceFromRow(connection, worksheet, rowNumber, placeCategories) {
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
            this.placeDao.findById(connection, idCell.value).then((place) => {
                if (!place) {
                    place = new index_2.default();
                    //place.id = <number>idCell.value;
                }
                place.name = this.getTextFromCell(nameCell);
                place.address = this.getTextFromCell(addressCell);
                place.region = this.getTextFromCell(regionCell);
                place.latitude = latitudeCell.value;
                place.longitude = longitudeCell.value;
                place.categories = this.getPlaceCategoriesFromCell(placeCategories, categoriesCell);
                place.entranceFee = entreeFeeCell.value === 'Bezmaksas' ? 0 : 1;
                place.note = this.getTextFromCell(noteCell);
                place.shortDescription = this.getTextFromCell(shortDescriptionCell);
                place.description = this.getTextFromCell(descriptionCell);
                this.placeDao.saveEntity(connection, place)
                    .then(resolve, (error) => {
                    winston.warn(`Failed save place(${place.name})`);
                    resolve(null);
                })
                    .catch((error) => {
                    winston.warn(`Failed save place(${place.name})`);
                    resolve(null);
                });
            }, reject)
                .catch(reject);
        });
    }
    processPlace(connection, placeCategories, worksheet) {
        return new Promise((resolve, reject) => {
            let rowNumber = 2;
            let finishProcessing = false;
            let promises = [];
            while (!finishProcessing) {
                let placePromise = this.getPlaceFromRow(connection, worksheet, rowNumber++, placeCategories);
                if (placePromise == null) {
                    finishProcessing = true;
                }
                else {
                    promises.push(placePromise);
                }
            }
            Promise.all(promises)
                .then(resolve, reject)
                .catch(reject);
        });
    }
}
exports.default = PlaceExcelService;
//# sourceMappingURL=index.js.map