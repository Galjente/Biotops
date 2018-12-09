"use strict";
import {CRUDDao} from "../../../../system/CRUDDao";
import UserVisitedPlace from "../../Entity/UserVisitedPlace";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import {IConnection} from "mysql";

export default class UserVisitedPlaceDao extends CRUDDao<UserVisitedPlace> {

    constructor() {
        super(UserVisitedPlace.TABLE_NAME);
    }

    migrate(migrationDao: MigrationDao): void {}

    createEntity(): UserVisitedPlace {
        return new UserVisitedPlace();
    }

    countUserVisitedPlaces(connection: IConnection, userId: number):Promise<number> {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT COUNT(*) as count FROM \`${UserVisitedPlace.TABLE_NAME}\` WHERE user_fk=?`, [userId], (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results && results.length) {
                    resolve(results[0].count);
                } else {
                    resolve(0);
                }
            });
        });
    }

    maxUserVisitedPlacesInOneDay(connection: IConnection, userId: number):Promise<number> {
        return new Promise((resolve, reject) => {
            let sql = `SELECT COUNT(uvp.id) as count, date(uvp.creation_date) as visit_date FROM \`${UserVisitedPlace.TABLE_NAME}\` as uvp WHERE user_fk = ? GROUP BY visit_date ORDER BY count DESC LIMIT 0,1`;
            connection.query(sql, [userId], (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results && results.length) {
                    resolve(results[0].count);
                } else {
                    resolve(0);
                }
            });
        });
    }

    countVisitedPlacesInTimeBetween(connection: IConnection, userId: number, startTime: string, endTime: string):Promise<number> {
        return new Promise((resolve, reject) => {
            let sql = `SELECT COUNT(uvp.id) as count FROM \`${UserVisitedPlace.TABLE_NAME}\` as uvp WHERE user_fk = ? AND TIME(uvp.creation_date) BETWEEN TIME(?) AND TIME(?) LIMIT 0,1`;
            connection.query(sql, [userId, startTime, endTime], (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results && results.length) {
                    resolve(results[0].count);
                } else {
                    resolve(0);
                }
            });
        });
    }

    countVisitedPlaceByCategory(connection: IConnection, userId: number, categoryId: number):Promise<number> {
        return new Promise((resolve, reject) => {
            let sql = `SELECT COUNT(uvp.id) as \`count\` FROM \`${UserVisitedPlace.TABLE_NAME}\` as uvp LEFT JOIN \`place_place_category\` as ppc ON ppc.place_fk = uvp.place_fk WHERE user_fk = ? AND ppc. place_category_fk = ?`;
            connection.query(sql, [userId, categoryId], (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results && results.length) {
                    resolve(results[0].count);
                } else {
                    resolve(0);
                }
            });
        });
    }

    maxFriendsCounInOnePLace(connection: IConnection, userId: number):Promise<number> {
        return new Promise((resolve, reject) => {
            let sql = `SELECT COUNT(uvp.id) as \`count\` FROM \`user_visited_place\` as uvp WHERE user_fk IN (SELECT uf.friend_fk FROM \`user_friend\` as uf WHERE uf.user_fk = ?) GROUP BY uvp.place_fk ORDER BY \`count\` DESC LIMIT 0,1`;
            connection.query(sql, [userId], (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results && results.length) {
                    resolve(results[0].count);
                } else {
                    resolve(0);
                }
            });
        });
    }
}