"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitType = exports.LimitPeriod = exports.LimitStatus = void 0;
var LimitStatus;
(function (LimitStatus) {
    LimitStatus["ACTIVE"] = "ACTIVE";
    LimitStatus["CANCELED"] = "CANCELED";
    LimitStatus["FUTURE"] = "FUTURE";
    LimitStatus["IN_COOLDOWN"] = "IN_COOLDOWN";
})(LimitStatus || (exports.LimitStatus = LimitStatus = {}));
var LimitPeriod;
(function (LimitPeriod) {
    LimitPeriod["CALENDAR_DAY"] = "CALENDAR_DAY";
    LimitPeriod["CALENDAR_WEEK"] = "CALENDAR_WEEK";
    LimitPeriod["CALENDAR_MONTH"] = "CALENDAR_MONTH";
    LimitPeriod["DAY"] = "DAY";
    LimitPeriod["INDEFINITE"] = "INDEFINITE";
    LimitPeriod["INSTANCE"] = "INSTANCE";
    LimitPeriod["WEEK"] = "WEEK";
    LimitPeriod["MONTH"] = "MONTH";
})(LimitPeriod || (exports.LimitPeriod = LimitPeriod = {}));
var LimitType;
(function (LimitType) {
    LimitType["BALANCE"] = "BALANCE";
    LimitType["BET"] = "BET";
    LimitType["DEPOSIT"] = "DEPOSIT";
    LimitType["LOSS"] = "LOSS";
    LimitType["SESSION"] = "SESSION";
})(LimitType || (exports.LimitType = LimitType = {}));
