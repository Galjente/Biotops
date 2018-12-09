"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDDao_1 = require("../../../../system/CRUDDao");
const UserAchievedBadge_1 = require("../../Entity/UserAchievedBadge");
class UserAchievedBadgeDao extends CRUDDao_1.CRUDDao {
    constructor() {
        super(UserAchievedBadge_1.default.tableName);
    }
    migrate(migrationDao) { }
    createEntity() {
        return new UserAchievedBadge_1.default();
    }
}
exports.default = UserAchievedBadgeDao;
//# sourceMappingURL=index.js.map