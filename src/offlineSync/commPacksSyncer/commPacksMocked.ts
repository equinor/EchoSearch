import { loggerFactory } from '../../logger';
import { randomNumberId } from '../Utils/stringUtils';

const log = loggerFactory.commPacks('Mock');

function randomMockedCommPacksString(count: number) {
    if (count === 0) return '';
    const items = range(count);
    const itemsAsStrings = items.map(() => createdMocked());

    const tagString = itemsAsStrings.join(',');

    return tagString;
}

function createdMocked(): string {
    return `
    {
      "operationHandoverStatus": 4,
      "id": ${randomNumberId(9)},
      "description": "mocked Pedestal Crane A-73MA001",
      "projectName": "L.O265C.00${randomNumberId(1)}",
      "commPkgNo": "7${randomNumberId(2)}0-A0${randomNumberId(1)}",
      "commissioningHandoverStatus": 4,
      "updatedAt": "2020-05-1${randomNumberId(1)}T10:55:20"
    }`;
}

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedCommPacksString(randomItemsToCreateCount: number): string {
    const performanceLog = log.performance();
    const result = getMockedStringInternal(randomItemsToCreateCount);
    performanceLog.forceLog('Got random CommPacks ' + randomItemsToCreateCount);
    return result;
}

function getMockedStringInternal(randomItemsToCreateCount: number): string {
    if (randomItemsToCreateCount === 0) {
        return `
        [ ${getRealMockDataString()}
        ]`;
    }

    return `
    [ ${randomMockedCommPacksString(randomItemsToCreateCount)}
    ]`;
}

function getRealMockDataString(): string {
    return `{
      "operationHandoverStatus": 2,
      "id": 109692395,
      "description": "mocked Pedestal Crane A-73MA002",
      "projectName": "L.O265C.001",
      "commPkgNo": "1101-A24",
      "commissioningHandoverStatus": 2,
      "updatedAt": "2019-05-16T10:55:20"
    },
    {
      "operationHandoverStatus": 0,
      "id": 116178898,
      "description": "mocked DEL I: P1 SØR - Kran A-73MA001: Skifte kranstol A-73MZ004",
      "projectName": "T.O265C.DA.3102",
      "commPkgNo": "1103-C04",
      "commissioningHandoverStatus": 0,
      "updatedAt": "2020-06-30T12:46:42"
    },
    {
      "operationHandoverStatus": 4,
      "id": 114644308,
      "description": "mocked HVAC mod. Deck Crane South A-73MA001",
      "projectName": "L.O265C.001",
      "commPkgNo": "1102-A04",
      "commissioningHandoverStatus": 4,
      "updatedAt": "2021-02-29T12:27:37"
    },
    {
      "operationHandoverStatus": 4,
      "id": 106298252,
      "description": "mocked Area Completion - S/C Crane & Pedestal (A-73MA001)",
      "projectName": "L.O265C.001",
      "commPkgNo": "1101-A24",
      "commissioningHandoverStatus": 4,
      "updatedAt": "2018-05-14T12:18:46"
    }`;
}
