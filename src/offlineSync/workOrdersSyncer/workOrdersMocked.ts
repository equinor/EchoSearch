import { loggerFactory } from '../../logger';
import { randomNumberId } from '../Utils/stringUtils';

const log = loggerFactory.workOrders('Mock');

function randomMockedWorkOrdersString(count: number) {
    if (count === 0) return '';
    const items = range(count);
    const itemsAsStrings = items.map(() => createdMocked());

    const tagString = itemsAsStrings.join(',');

    return tagString;
}

function createdMocked(): string {
    const id = randomNumberId(1);
    const year = randomNumberId(1);
    return `  {
      "workOrderId": "0000${randomNumberId(1)}",
      "orderTypeId": "PM0${randomNumberId(1)}",
      "planningPlantId": "1901",
      "title": "01M FV-LOG PEDESTAL CRANE",
      "phaseId": "3",
      "activeStatusIds": [
        "TECO",
        "PCNF",
        "PRT",
        "MANC",
        "NMAT",
        "PRC",
        "SETC",
        "RDOP",
        "PLAN",
        "NTWR",
        "MLTI"
      ],
      "plannerGroupId": "POM",
      "workCenterId": "POMLOG",
      "maintenanceRecordId": "",
      "basicStartDateTime": "2019-04-30T07:00:00Z",
      "basicFinishDateTime": "2019-05-14T19:00:00Z",
      "revisionId": "",
      "tagPlantId": "1901",
      "tagId": "A-73MA00${id}",
      "functionalLocationId": "1901-A-73MA00${id}",
      "createdDateTime": "201${year}-03-10T22:09:36Z",
      "changedDateTime": "201${year}-05-12T13:20:13Z",
      "maintenancePlantId": "1901",
      "maintenancePlanDate": "201${year}-05-01T00:00:00Z"
    }`;
}

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedWorkOrdersString(randomItemsToCreateCount: number): string {
    const performanceLog = log.performance();
    const result = getMockedStringInternal(randomItemsToCreateCount);
    performanceLog.forceLog('Got random WorkOrders ' + randomItemsToCreateCount);
    return result;
}

function getMockedStringInternal(randomItemsToCreateCount: number): string {
    if (randomItemsToCreateCount === 0) {
        return `
        [ ${getRealMockDataString()}
        ]`;
    }

    return `
    [ ${randomMockedWorkOrdersString(randomItemsToCreateCount)}
    ]`;
}

function getRealMockDataString(): string {
    return `  {
      "workOrderId": "000024737588",
      "orderTypeId": "PM02",
      "planningPlantId": "1901",
      "title": "01M FV-LOG PEDESTAL CRANE",
      "phaseId": "3",
      "activeStatusIds": [
        "TECO",
        "PCNF",
        "PRT",
        "MANC",
        "NMAT",
        "PRC",
        "SETC",
        "RDOP",
        "PLAN",
        "NTWR",
        "MLTI"
      ],
      "plannerGroupId": "POM",
      "workCenterId": "POMLOG",
      "maintenanceRecordId": "",
      "basicStartDateTime": "2019-04-30T07:00:00Z",
      "basicFinishDateTime": "2019-05-14T19:00:00Z",
      "revisionId": "",
      "tagPlantId": "1901",
      "tagId": "A-73MA001",
      "functionalLocationId": "1901-A-73MA001",
      "createdDateTime": "2019-03-10T22:09:36Z",
      "changedDateTime": "2019-05-12T13:20:13Z",
      "maintenancePlantId": "1901",
      "maintenancePlanDate": "2019-05-01T00:00:00Z"
    }`;
}
