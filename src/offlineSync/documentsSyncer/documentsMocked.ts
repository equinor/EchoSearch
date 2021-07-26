import { loggerFactory } from '../../logger';
import { randomNumberId } from '../Utils/stringUtils';

const log = loggerFactory.documents('Mock');

function randomMockedDocumentString(count: number) {
    if (count === 0) return '';
    const items = range(count);
    const itemsAsStrings = items.map(() => createdMocked());

    return itemsAsStrings.join(',');
}

function createdMocked(): string {
    return `
    {
      "instCode": "JSV",
      "docNo": "1${randomNumberId(8)}",
      "docTitle": "Mocked USER MANUAL ${randomNumberId(5)} ${randomNumberId(9)} ${randomNumberId(4)}",
      "docClass": "INTERNAL",
      "projectCode": "L.O265C.00${randomNumberId(1)}",
      "poNo": "ED000_L${randomNumberId(2)}",
      "system": "1${randomNumberId(1)}",
      "locationCode": "DA0${randomNumberId(2)}",
      "disciplineCode": "R",
      "docCategory": "SUP-DOC",
      "docType": "MA",
      "contrCode": "AI",
      "revNo": "5",
      "revDate": "201${randomNumberId(1)}-1${randomNumberId(1)}-07T00:00:00",
      "revStatus": "OF",
      "revisionProject": "L.O265C.001",
      "reasonForIssue": "ACCEPTED",
      "remark": null,
      "tagNoMedia": null,
      "insertedDate": "200${randomNumberId(1)}-04-03T09:16:22",
      "updatedDate": "201${randomNumberId(1)}-10-23T12:33:41",
      "files": [
        {
          "id": 3${randomNumberId(6)},
          "instCode": "JSV",
          "fileName": "1019${randomNumberId(4)}_5_1.PDF",
          "objectType": "FILE",
          "description": null,
          "fileOrder": 1,
          "prodViewCode": "V",
          "insertedDate": "201${randomNumberId(1)}-11-21T17:13:25",
          "thumbnail": null,
          "fileSize": 1${randomNumberId(9)}
        },
        {
          "id": 3${randomNumberId(6)},
          "instCode": "JSV",
          "fileName": "1019${randomNumberId(4)}_5_1.PDF",
          "objectType": "FILE",
          "description": null,
          "fileOrder": 1,
          "prodViewCode": "V",
          "insertedDate": "201${randomNumberId(1)}-11-21T17:13:25",
          "thumbnail": null,
          "fileSize": 1${randomNumberId(9)}
        }
      ]
    }`;
}

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedDocumentString(randomItemsToCreateCount: number): string {
    const performanceLog = log.performance();
    const result = getMockedStringInternal(randomItemsToCreateCount);
    performanceLog.forceLog('Got random Document ' + randomItemsToCreateCount);
    return result;
}

function getMockedStringInternal(randomItemsToCreateCount: number): string {
    if (randomItemsToCreateCount === 0) {
        return `
        [ ${getRealMockDataString()}
        ]`;
    }

    return `
    [ ${randomMockedDocumentString(randomItemsToCreateCount)}
    ]`;
}

function getRealMockDataString(): string {
    return `{
      "instCode": "JSV",
      "docNo": "101934656",
      "docTitle": "Mocked USER MANUAL - EMERSON VALVE ASSEMBLY",
      "docClass": "INTERNAL",
      "projectCode": "L.O265C.001",
      "poNo": "ED000_L7653",
      "system": "11",
      "locationCode": "DA000",
      "disciplineCode": "R",
      "docCategory": "SUP-DOC",
      "docType": "MA",
      "contrCode": "AI",
      "revNo": "5",
      "revDate": "2018-11-07T00:00:00",
      "revStatus": "OF",
      "revisionProject": "L.O265C.001",
      "reasonForIssue": "ACCEPTED",
      "remark": null,
      "tagNoMedia": "A-73MA001",
      "insertedDate": "2018-04-03T09:16:22",
      "updatedDate": "2020-10-23T12:33:41",
      "files": [
        {
          "id": 3951158,
          "instCode": "JSV",
          "fileName": "101934656_5_1.JPG",
          "objectType": "FILE",
          "description": null,
          "fileOrder": 1,
          "prodViewCode": "V",
          "insertedDate": "2018-11-21T17:13:25",
          "thumbnail": null,
          "fileSize": 19314943
        },
        {
          "id": 3951159,
          "instCode": "JSV",
          "fileName": "101934656_5_2.PDF",
          "objectType": "FILE",
          "description": "MARKUP CODE 1",
          "fileOrder": 2,
          "prodViewCode": "V",
          "insertedDate": "2018-11-21T17:13:25",
          "thumbnail": null,
          "fileSize": 19376768
        }
      ]
    }`;
}
