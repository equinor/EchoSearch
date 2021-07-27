import { loggerFactory } from '../../logger';
import { randomNumberId } from '../Utils/stringUtils';

const log = loggerFactory.notifications('Mock');

function randomMockedNotificationsString(count: number) {
    if (count === 0) return '';
    const items = range(count);
    const itemsAsStrings = items.map(() => createdMocked());

    const tagString = itemsAsStrings.join(',');

    return tagString;
}

function createdMocked(): string {
    const id = randomNumberId(1);
    const year2 = randomNumberId(1);
    return `
    {
      "maintenanceRecordId": "0000${randomNumberId(9)}",
      "recordTypeId": "M${randomNumberId(1)}",
      "recordType": "Activity report",
      "tagId": "A-73MA00${id}",
      "tagPlantId": "1901",
      "equipmentId": "0000000000234567${randomNumberId(2)}",
      "title": "mocked INSP; WH05 Baseline",
      "createdDateTime": "201${year2}-09-19T15:24:50Z",
      "activeStatusIds": [
        "OSNO",
        "CRTE",
        "RECO"
      ],
      "workOrderId": "",
      "functionalLocation": "1901-A-73MA00${id}",
      "maintenancePlantId": "1901",
      "maintenancePlant": "Johan Sverdrup DP Platform",
      "planningPlantId": "1901",
      "planningPlant": "Johan Sverdrup P1 Platform",
      "plannerGroupId": "SIP",
      "plannerGroup": "Inspeksjon land",
      "mainWorkCenterId": "POMISP",
      "mainWorkCenter": "Equinor - Inspeksjon stat. prosessutstyr",
      "mainWorkCenterPlantId": "1901",
      "mainWorkCenterPlant": "Johan Sverdrup P1 Platform",
      "notificationDateTime": "201${year2}-09-19T15:23:36Z",
      "requiredEndDateTime": null,
      "originalRequiredEndDate": null,
      "referenceCompletedDateTime": "201${year2}-09-19T15:23:36Z",
      "completedDateTime": null,
      "changedDateTime": "201${year2}-10-22T12:30:23Z",
      "priorityId": "",
      "priority": null,
      "referenceNotificationId": "",
      "personalResponsible": null,
      "customUserField": "",
      "wbsId": "L.O265C.001.17A01A12B",
      "wbs": "hei",
      "phaseId": "1"
    }`;
}

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedNotificationsString(randomItemsToCreateCount: number): string {
    const performanceLog = log.performance();
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
    return `  {
      "maintenanceRecordId": "0000123456789",
      "recordTypeId": "M3",
      "recordType": "Activity report",
      "tagId": "A-73MA001",
      "tagPlantId": "1901",
      "equipmentId": "000000000023456789",
      "title": "mocked INSP; WH05 Baseline",
      "createdDateTime": "2019-09-19T15:24:50Z",
      "activeStatusIds": [
        "OSNO",
        "CRTE",
        "RECO"
      ],
      "workOrderId": "",
      "functionalLocation": "1901-A-73MA001",
      "maintenancePlantId": "1901",
      "maintenancePlant": "Johan Sverdrup DP Platform",
      "planningPlantId": "1901",
      "planningPlant": "Johan Sverdrup P1 Platform",
      "plannerGroupId": "SIP",
      "plannerGroup": "Inspeksjon land",
      "mainWorkCenterId": "POMISP",
      "mainWorkCenter": "Equinor - Inspeksjon stat. prosessutstyr",
      "mainWorkCenterPlantId": "1901",
      "mainWorkCenterPlant": "Johan Sverdrup P1 Platform",
      "notificationDateTime": "2019-09-19T15:23:36Z",
      "requiredEndDateTime": null,
      "originalRequiredEndDate": null,
      "referenceCompletedDateTime": "2019-09-19T15:23:36Z",
      "completedDateTime": null,
      "changedDateTime": "2019-10-22T12:30:23Z",
      "priorityId": "",
      "priority": null,
      "referenceNotificationId": "",
      "personalResponsible": null,
      "customUserField": "",
      "wbsId": "L.O265C.001.17A01A12B",
      "wbs": "JS oper assur offshore Plan/Maint",
      "phaseId": "1"
    }`;
}
