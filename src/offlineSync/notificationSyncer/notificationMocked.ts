import { logPerformance } from '../../logger';
import { randomId, randomNumberId } from '../Utils/stringUtils';

function randomMockedNotificationsString(count: number) {
    if (count === 0) return '';
    const items = range(count);
    const itemsAsStrings = items.map(() => createdMocked());

    const tagString = itemsAsStrings.join(',');

    return tagString;
}

function createdMocked(): string {
    return `{
      "NotifNo": "${randomId(9)}",
      "NotificationType": "M2",
      "PlanningPlant": "1901",
      "PlanningPlantTxt": "Sverdrup ${randomId(9)}",
      "MaintPlant": "1901",
      "MaintPlantTxt": "Sverdrup",
      "DateLastChange": "2021-04-30T21:19:14",
      "FailureImp": "U",
      "FailureImpTxt": "Unwell (InF)",
      "RequiredEndDate": "2022-09-15T10:24:43",
      "NotifDate": "2020-01-26T09:51:49",
      "NotifTime": "09:51:49",
      "DateCreated": "2019-01-26T10:25:31",
      "TimeCreated": "10:25:31",
      "DateNotifCompletion": "2021-07-30T21:19:13",
      "TimeNotifCompletion": "21:19:13",
      "ReferenceDate": "2022-07-30T21:19:11",
      "ReferenceTime": "21:19:11",
      "OrderNumber": "000034567890",
      "Priority": "U",
      "Description": "1901-A-73MA001 Oljeprøve og ${randomId(9)}",
      "PlannerGroup": "PPM",
      "WorkCtr": "10023456",
      "WorkCenter": "A workcenter",
      "WorkCtrPlant": "1901",
      "WorkCtrPlantTxt": "Sverdrup",
      "BreakdownInd": "",
      "BreakdownDur": 0,
      "DateMalfunctStart": "2021-01-26T10:23:59",
      "TimeMalfunctStart": "10:23:59",
      "DateMalfunctEnd": null,
      "TimeMalfunctEnd": "00:00:00",
      "UnsafeFail": "0",
      "PlannerGroupTxt": "Platform PV",
      "Longtxt": "Opps this is a random failed text ${randomId(9)} ${randomId(
        9
    )}\\nAnd some more text. Handle linebreaks in ui",
      "FailMode": "OTH",
      "FailModeTxt": "ISO Other",
      "FailMech": "1.0",
      "FailMechTxt": "ISO General",
      "ObjPartCode": "1",
      "CodeGroupDetectionMode": "PMDM-005",
      "SystemStatus": "NOCO ORAS",
      "UserStatus": "RIVE",
      "System": "73",
      "FunctLoc": "1901-A-73MA00${randomNumberId(1)}",
      "FunctLocDescr": "PEDESTAL CRANE P1 SOUTH",
      "Location": "AB101",
      "ABCInd": "3",
      "MaintConcept": "CM0135",
      "MaintConceptTxt": null,
      "CatalogProf": "PM-060",
      "CatalogProfTxt": "ME-Cranes",
      "Equipment": "000000000012258344",
      "EquipmentDescr": "PEDESTAL CRANE",
      "MNGRP": "PM-ACB-1",
      "Mncods": "A122",
      "CodeGrpText": null,
      "CodingCodeTxt": null,
      "PlantForMaterial": "",
      "RefQualityCost": 0,
      "QualityCost": 0,
      "LFAnumber": "",
      "VendorName": null,
      "VendorCity": null,
      "DeptNameCreatedBy": "123459",
      "PurchasingDoc": "",
      "AgreementNo": "",
      "ReportedBy": "John Doe ${randomNumberId(1)}"
    }`;
}

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedNotificationsString(randomItemsToCreateCount: number): string {
    const performanceLog = logPerformance();
    const result = getMockedStringInternal(randomItemsToCreateCount);
    performanceLog.forceLog('Got random Notifications ' + randomItemsToCreateCount);
    return result;
}

function getMockedStringInternal(randomItemsToCreateCount: number): string {
    if (randomItemsToCreateCount === 0) {
        return `
        [ ${getRealMockDataString()}
        ]`;
    }

    return `
    [ ${randomMockedNotificationsString(randomItemsToCreateCount)}
    ]`;
}

function getRealMockDataString(): string {
    return `{
      "NotifNo": "00001234567",
      "NotificationType": "M2",
      "PlanningPlant": "1901",
      "PlanningPlantTxt": "Johan Sverdrup P1 Platform",
      "MaintPlant": "1901",
      "MaintPlantTxt": "Johan Sverdrup P1 Platform",
      "DateLastChange": "2021-04-30T21:19:14",
      "FailureImp": "U",
      "FailureImpTxt": "Unwell (InF)",
      "RequiredEndDate": "2022-09-15T10:24:43",
      "NotifDate": "2020-01-26T09:51:49",
      "NotifTime": "09:51:49",
      "DateCreated": "2019-01-26T10:25:31",
      "TimeCreated": "10:25:31",
      "DateNotifCompletion": "2021-07-30T21:19:13",
      "TimeNotifCompletion": "21:19:13",
      "ReferenceDate": "2022-07-30T21:19:11",
      "ReferenceTime": "21:19:11",
      "OrderNumber": "000034567890",
      "Priority": "U",
      "Description": "1901-A-73MA001 Oljeprøve og Oljeskift",
      "PlannerGroup": "PPM",
      "WorkCtr": "10023456",
      "WorkCenter": "A workcenter",
      "WorkCtrPlant": "1901",
      "WorkCtrPlantTxt": "Johan Sverdrup P1 Platform",
      "BreakdownInd": "",
      "BreakdownDur": 0,
      "DateMalfunctStart": "2021-01-26T10:23:59",
      "TimeMalfunctStart": "10:23:59",
      "DateMalfunctEnd": null,
      "TimeMalfunctEnd": "00:00:00",
      "UnsafeFail": "0",
      "PlannerGroupTxt": "Platform PV",
      "Longtxt": "Opps this is a random failed text\\nAnd some more text. Handle linebreaks in ui",
      "FailMode": "OTH",
      "FailModeTxt": "ISO Other",
      "FailMech": "1.0",
      "FailMechTxt": "ISO General",
      "ObjPartCode": "1",
      "CodeGroupDetectionMode": "PMDM-005",
      "SystemStatus": "NOCO ORAS",
      "UserStatus": "RIVE",
      "System": "73",
      "FunctLoc": "1901-A-73MA001",
      "FunctLocDescr": "PEDESTAL CRANE P1 SOUTH",
      "Location": "AB101",
      "ABCInd": "3",
      "MaintConcept": "CM0135",
      "MaintConceptTxt": null,
      "CatalogProf": "PM-060",
      "CatalogProfTxt": "ME-Cranes",
      "Equipment": "000000000012258344",
      "EquipmentDescr": "PEDESTAL CRANE",
      "MNGRP": "PM-ACB-1",
      "Mncods": "A122",
      "CodeGrpText": null,
      "CodingCodeTxt": null,
      "PlantForMaterial": "",
      "RefQualityCost": 0,
      "QualityCost": 0,
      "LFAnumber": "",
      "VendorName": null,
      "VendorCity": null,
      "DeptNameCreatedBy": "123459",
      "PurchasingDoc": "",
      "AgreementNo": "",
      "ReportedBy": "John Doe"
    }`;
}
