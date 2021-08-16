import { loggerFactory } from '../../logger';
import { randomId, randomNumberId } from '../Utils/stringUtils';

const log = loggerFactory.checklists('Mock');

function randomMockedChecklistsString(count: number) {
    if (count === 0) return '';
    const items = range(count);
    const itemsAsStrings = items.map(() => createdMocked());

    const tagString = itemsAsStrings.join(',');

    return tagString;
}

function createdMocked(): string {
    return `
    {
      "id": ${randomNumberId(8)},
      "formType": "ELE03.1",
      "formStatus": "PB",
      "commPackNo": "7${randomNumberId(2)}2-A${randomNumberId(2)}",
      "formResponsibleId": "KSPI",
      "formUpdatedAt": "200${randomNumberId(1)}-01-2${randomNumberId(1)}T1${randomNumberId(1)}:06:38",
      "formGroupDescription": "Mechanical Completion Check Record",
      "tagNo": "A-7${randomNumberId(1)}MA${randomNumberId(3)}",
      "mcPackNo": "7${randomNumberId(1)}02-R${randomNumberId(3)}",
      "formTypeDescription": "Mocked Check List for Electrical Cables",
      "url": "https://www.wikipedia.org/",
      "tagDescription": "CRANE",
      "tagRegisterId": "MAIN_EQUIPMENT",
      "tagProjectName": "L.O26${randomNumberId(1)}C.${randomNumberId(3)}",
      "signedByFullName": "${randomId(2)}",
      "signedByUserName": "${randomNumberId(2)}@mocked.com",
      "signedAt": "201${randomNumberId(1)}-1${randomNumberId(1)}-2${randomNumberId(1)}T1${randomNumberId(1)}:06:38",
      "verifiedByFullName": null,
      "verifiedByUserName": null,
      "verifiedAt": null,
      "comment": "mocked checklist for crane",
      "attachmentCount": 0
    }`;
}

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedChecklistsString(randomItemsToCreateCount: number): string {
    const performanceLog = log.performance();
    const result = getMockedStringInternal(randomItemsToCreateCount);
    performanceLog.forceLog('Got random Checklists ' + randomItemsToCreateCount);
    return result;
}

function getMockedStringInternal(randomItemsToCreateCount: number): string {
    return `[ ${getRealMockDataString()}, ${randomMockedChecklistsString(randomItemsToCreateCount)} ]`;
}

function getRealMockDataString(): string {
    return `{
      "id": 23456789,
      "formType": "ELE03.1",
      "formStatus": "OK",
      "commPackNo": "7302-A01",
      "formResponsibleId": "KSPI",
      "formUpdatedAt": "2017-01-23T12:06:38",
      "formGroupDescription": "Mechanical Completion Check Record",
      "tagNo": "A-73MA001",
      "mcPackNo": "7302-R001",
      "formTypeDescription": "Mocked Check List for Electrical Cables",
      "url": "https://www.wikipedia.org/",
      "tagDescription": "PEDESTAL CRANE P1 SOUTH",
      "tagRegisterId": "MAIN_EQUIPMENT",
      "tagProjectName": "L.O265C.001",
      "signedByFullName": "Tom",
      "signedByUserName": "Tom@Tom.com",
      "signedAt": "2018-01-23T12:06:38",
      "verifiedByFullName": null,
      "verifiedByUserName": null,
      "verifiedAt": null,
      "comment": "mocked checklist for crane",
      "attachmentCount": 0
    },
    {
      "id": 12345678,
      "formType": "MEC-60",
      "formStatus": "PB",
      "commPackNo": "mocked2",
      "formResponsibleId": "bb",
      "formUpdatedAt": "2017-02-04T11:09:56",
      "formGroupDescription": "Commissioning Preparatory Check List",
      "tagNo": "A-73MA001",
      "mcPackNo": "7302-R002",
      "formTypeDescription": "Mocked Pow. Hoists, Trolleys & Transv. Cranes",
      "url": "https://www.wikipedia.org/",
      "tagDescription": "PEDESTAL CRANE P1 SOUTH",
      "tagRegisterId": "MAIN_EQUIPMENT",
      "tagProjectName": "L.O265C.002",
      "signedByFullName": "bb",
      "signedByUserName": "bb@bb.com",
      "signedAt": "2017-03-02T11:09:56",
      "verifiedByFullName": null,
      "verifiedByUserName": null,
      "verifiedAt": null,
      "comment": null,
      "attachmentCount": 0
    }`;
}
