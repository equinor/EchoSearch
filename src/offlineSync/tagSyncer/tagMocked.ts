import { loggerFactory } from '../../logger';
import { randomId, randomNumberId } from '../Utils/stringUtils';

const log = loggerFactory.tags('Mock');
export function randomMockedTagsString(count: number): string {
    if (count === 0) return '';
    const items = range(count);
    const tagStrings = items.map(() => createMockedTag());

    const tagString = tagStrings.join(',');

    return tagString;
}

export function createMockedTag(): string {
    return `{
      "tagNo": "${randomId(9)}",
      "description": "mocked ${randomId(9)} is description",
      "tagStatus": "ASBUILT",
      "tagCategoryDescription": "MAIN ${randomId(9)} EQUIPMENT",
      "tagType": "MA",
      "updatedDate": "2020-05-15T11:12:19",
      "locationCode": "AP6${randomNumberId(2)}",
      "poNo": "ER325",
      "projectCode": "L.O2${randomNumberId(2)}C.001",
      "system": "7${randomNumberId(1)}",
      "tagCategory": ${randomNumberId(1)},
      "xCoordinate": null,
      "yCoordinate": null,
      "zCoordinate": null,
    }`;
}

function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function getMockedTagsString(randomTagsCount: number): string {
    const performanceLog = log.performance();
    const result = getMockedTagsStringInternal(randomTagsCount);
    performanceLog.forceLog('Got random tags ' + randomTagsCount);
    return result;
}
export function getMockedTagsStringInternal(randomTagsCount: number): string {
    let randomTags = randomMockedTagsString(randomTagsCount);
    if (randomTags.length > 0) randomTags += ',';
    return `
    [ ${randomTags}     
      {
        "tagNo": "A-73MA001",
        "description": "mocked PEDESTAL CRANE P1 SOUTH",
        "tagStatus": "ASBUILT",
        "tagCategoryDescription": "MAIN EQUIPMENT",
        "tagType": "MA",
        "updatedDate": "2020-05-15T11:12:19",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": 1,
        "yCoordinate": 2,
        "zCoordinate": 3
      },
      {
        "tagNo": "A-73MA001-B01 mocked",
        "description": null,
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": null,
        "tagType": null,
        "updatedDate": "2020-05-15T11:12:40",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": 4,
        "yCoordinate": 5,
        "zCoordinate": 6
      },
      {
        "tagNo": "A-73MA001-B02",
        "description": "mocked JUNCTION BOX MAIN WINCH 690VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:46",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B03",
        "description": "mocked JUNCTION BOX MAIN WINCH 230VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:41",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B04",
        "description": "mocked JUNCTION BOX LIGHT FIXTURES",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:47",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B05",
        "description": "mocked JUNCTION BOX MAIN WINCH 690VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:43",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B06",
        "description": "mocked JUNCTION BOX MAIN WINCH 230VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:42",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B07",
        "description": "mocked JUNCTION BOX LIGHT FIXTURES",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:44",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B08",
        "description": "mocked JUNCTION BOX LIGHT FIXTURES",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:45",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B09",
        "description": "mocked JUNCTION BOX F&G DAMPER",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:15:18",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B10",
        "description": "mocked JUNCTION BOX F&G DAMPER",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:15:19",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.001",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-B11",
        "description": "mocked JUNCTION BOX F&G DAMPER",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:15:20",
        "locationCode": "AP610",
        "poNo": "ER325",
        "projectCode": "L.O265C.002",
        "system": "73",
        "tagCategory": 7,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      },
      {
        "tagNo": "A-73MA001-E05",
        "description": "mocked FLOOD LIGHT LUFFING WINCH",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:35",
        "locationCode": "AP611",
        "poNo": "ER326",
        "projectCode": "L.O265C.002",
        "system": "74",
        "tagCategory": 6,
        "xCoordinate": null,
        "yCoordinate": null,
        "zCoordinate": null
      }
    ]`;
}
