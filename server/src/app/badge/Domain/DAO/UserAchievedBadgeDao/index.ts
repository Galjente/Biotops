"use strict";
import {CRUDDao} from "../../../../system/CRUDDao";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import UserAchievedBadge from "../../Entity/UserAchievedBadge";
import * as winston from "winston";

export default class UserAchievedBadgeDao extends CRUDDao<UserAchievedBadge> {

    constructor() {
        super(UserAchievedBadge.tableName);
    }

    migrate(migrationDao: MigrationDao): void {}

    createEntity(): UserAchievedBadge {
        return new UserAchievedBadge();
    }
}