"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerStatus = exports.DonationStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["ORGANIZATION_DONOR"] = "ORGANIZATION_DONOR";
    Role["INDIVIDUAL_DONOR"] = "INDIVIDUAL_DONOR";
    Role["VOLUNTEER"] = "VOLUNTEER";
    Role["NGO"] = "NGO";
})(Role || (exports.Role = Role = {}));
var DonationStatus;
(function (DonationStatus) {
    DonationStatus["PENDING"] = "PENDING";
    DonationStatus["ACCEPTED"] = "ACCEPTED";
    DonationStatus["ASSIGNED"] = "ASSIGNED";
    DonationStatus["PICKED_UP"] = "PICKED_UP";
    DonationStatus["DELIVERED"] = "DELIVERED";
    DonationStatus["VERIFIED"] = "VERIFIED";
    DonationStatus["CANCELLED"] = "CANCELLED";
})(DonationStatus || (exports.DonationStatus = DonationStatus = {}));
var VolunteerStatus;
(function (VolunteerStatus) {
    VolunteerStatus["AVAILABLE"] = "AVAILABLE";
    VolunteerStatus["ASSIGNED"] = "ASSIGNED";
    VolunteerStatus["ON_THE_WAY"] = "ON_THE_WAY";
    VolunteerStatus["ARRIVED_AT_PICKUP"] = "ARRIVED_AT_PICKUP";
    VolunteerStatus["FOOD_PICKED_UP"] = "FOOD_PICKED_UP";
    VolunteerStatus["DELIVERING"] = "DELIVERING";
    VolunteerStatus["DELIVERED"] = "DELIVERED";
})(VolunteerStatus || (exports.VolunteerStatus = VolunteerStatus = {}));
