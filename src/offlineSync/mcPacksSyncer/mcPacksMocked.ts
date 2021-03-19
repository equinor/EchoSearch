import { logPerformance } from '../../logger';
import { randomId, randomNumberId } from '../Utils/stringUtils';

export function randomMockedMcPacksString(count: number) {
    if (count === 0) return '';
    var items = range(count);
    var itemsAsStrings = items.map((_) => createdMocked());

    var tagString = itemsAsStrings.join(',');

    return tagString;
}

function createdMocked(): string {
    return `{
      "id": ${randomNumberId(18)},
      "projectName": "L.O265C.001",
      "commPkgNo": "0001-A01",
      "description": "this ${randomId(9)} is description",
      "mcPkgNo": "0001-A001",
      "updatedAt": "2017-12-11T12:47:24"
    }`;
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedMcPacksString(randomItemsToCreateCount: number): string {
    const performanceLog = logPerformance();
    const result = getMockedStringInternal(randomItemsToCreateCount);
    performanceLog.forceLog('Got random McPacks ' + randomItemsToCreateCount);
    return result;
}

function getMockedStringInternal(randomItemsToCreateCount: number): string {
    if (randomItemsToCreateCount === 0) {
        return `
        [ ${getRealMockDataString()}
        ]`;
    }

    return `
    [ ${randomMockedMcPacksString(randomItemsToCreateCount)}
    ]`;
}

function getRealMockDataString(): string {
    return `{
            "id": 105971470,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-A01",
            "description": null,
            "mcPkgNo": "0001-A001",
            "updatedAt": "2017-12-11T12:47:24",
            "strangeDataWeDontNeed": "garbageData",
            "aNullField": null
          },
          {
            "id": 105971602,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-L01",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A002",
            "updatedAt": "2018-02-15T13:32:25"
          },
          {
            "id": 105971648,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-R01",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A003",
            "updatedAt": "2017-11-24T10:31:37"
          },
          {
            "id": 105972242,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-D01",
            "description": "LCI-1 Deliverable (excl. PO No. ER325)",
            "mcPkgNo": "0001-A004",
            "updatedAt": "2017-12-07T11:08:12"
          },
          {
            "id": 106135888,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-R00",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A005",
            "updatedAt": "2017-12-14T14:02:37"
          },
          {
            "id": 106175812,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-D00",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A006",
            "updatedAt": "2017-12-19T11:10:39"
          },
          {
            "id": 106245458,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-A00",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A007",
            "updatedAt": "2018-02-09T14:39:53"
          },
          {
            "id": 106256376,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-L00",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A008",
            "updatedAt": "2018-06-14T11:24:47"
          },
          {
            "id": 106461038,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-R02",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A009",
            "updatedAt": "2017-11-30T13:28:33"
          },
          {
            "id": 106461042,
            "projectName": "L.O265C.001",
            "commPkgNo": "0001-R03",
            "description": "LCI-1 Deliverable",
            "mcPkgNo": "0001-A010",
            "updatedAt": "2017-12-04T13:46:44"
          }`;
}
