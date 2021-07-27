import { loggerFactory } from '../../logger';
import { randomId } from '../Utils/stringUtils';

const log = loggerFactory.tags('Mock');
export function randomMockedTagsString(count: number): string {
    if (count === 0) return '';
    const items = range(count);
    const tagStrings = items.map(() => createMockedTag());

    const tagString = tagStrings.join(',');

    return tagString;
}

function createMockedTag(): string {
    return `{
      "tagNo": "${randomId(9)}",
      "description": "mocked ${randomId(9)} is description",
      "tagStatus": "ASBUILT",
      "tagCategoryDescription": "MAIN ${randomId(9)} EQUIPMENT",
      "tagType": "MA",
      "updatedDate": "2020-05-15T11:12:19"
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
        "updatedDate": "2020-05-15T11:12:19"
      },
      {
        "tagNo": "A-73MA001-B01 mocked",
        "description": null,
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": null,
        "tagType": null,
        "updatedDate": "2020-05-15T11:12:40"
      },
      {
        "tagNo": "A-73MA001-B02",
        "description": "mocked JUNCTION BOX MAIN WINCH 690VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:46"
      },
      {
        "tagNo": "A-73MA001-B03",
        "description": "mocked JUNCTION BOX MAIN WINCH 230VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:41"
      },
      {
        "tagNo": "A-73MA001-B04",
        "description": "mocked JUNCTION BOX LIGHT FIXTURES",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:47"
      },
      {
        "tagNo": "A-73MA001-B05",
        "description": "mocked JUNCTION BOX MAIN WINCH 690VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:43"
      },
      {
        "tagNo": "A-73MA001-B06",
        "description": "mocked JUNCTION BOX MAIN WINCH 230VAC",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:42"
      },
      {
        "tagNo": "A-73MA001-B07",
        "description": "mocked JUNCTION BOX LIGHT FIXTURES",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:44"
      },
      {
        "tagNo": "A-73MA001-B08",
        "description": "mocked JUNCTION BOX LIGHT FIXTURES",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:12:45"
      },
      {
        "tagNo": "A-73MA001-B09",
        "description": "mocked JUNCTION BOX F&G DAMPER",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:15:18"
      },
      {
        "tagNo": "A-73MA001-B10",
        "description": "mocked JUNCTION BOX F&G DAMPER",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:15:19"
      },
      {
        "tagNo": "A-73MA001-B11",
        "description": "mocked JUNCTION BOX F&G DAMPER",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "B",
        "updatedDate": "2020-05-15T11:15:20"
      },
      {
        "tagNo": "A-73MA001-E05",
        "description": "mocked FLOOD LIGHT LUFFING WINCH",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:35"
      },
      {
        "tagNo": "A-73MA001-E06",
        "description": "mocked ESCAPE LIGHT CABIN",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:38"
      },
      {
        "tagNo": "A-73MA001-E07",
        "description": "mocked ESCAPE LIGHT CABIN AIR LOCK",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:15:04"
      },
      {
        "tagNo": "A-73MA001-E08",
        "description": "mocked ESCAPE LIGHT E-ROOM AIB",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:37"
      },
      {
        "tagNo": "A-73MA001-E09",
        "description": "mocked ESCAPE LIGHT E-ROOM",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:41"
      },
      {
        "tagNo": "A-73MA001-E11",
        "description": "mocked HELI LIGHT A-FRAME",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:39"
      },
      {
        "tagNo": "A-73MA001-E12",
        "description": "mocked HELI LIGHT JIB",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:15:13"
      },
      {
        "tagNo": "A-73MA001-E13",
        "description": "mocked HELI LIGHT JIB",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:33"
      },
      {
        "tagNo": "A-73MA001-E14",
        "description": "mocked HELI LIGHT JIB TIP",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:40"
      },
      {
        "tagNo": "A-73MA001-E15",
        "description": "mocked FLOOD LIGHT MAIN WINCH",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:14:34"
      },
      {
        "tagNo": "A-73MA001-E16",
        "description": "mocked FLOOD LIGHT JIB TIP",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:15:16"
      },
      {
        "tagNo": "A-73MA001-E17",
        "description": "mocked FLOOD LIGHT JIB TIP",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:15:17"
      },
      {
        "tagNo": "A-73MA001-E18",
        "description": "mocked EMERGENCY LIGHT CABIN AIR LOCK",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:15:08"
      },
      {
        "tagNo": "A-73MA001-E19",
        "description": "mocked EMERGENCY LIGHT E-ROOM",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-05-15T11:15:10"
      },
      {
        "tagNo": "A-73MA001-E20",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:40"
      },
      {
        "tagNo": "A-73MA001-E21",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:42"
      },
      {
        "tagNo": "A-73MA001-E22",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:42"
      },
      {
        "tagNo": "A-73MA001-E23",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:43"
      },
      {
        "tagNo": "A-73MA001-E24",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:44"
      },
      {
        "tagNo": "A-73MA001-E25",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:45"
      },
      {
        "tagNo": "A-73MA001-E26",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:45"
      },
      {
        "tagNo": "A-73MA001-E27",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:46"
      },
      {
        "tagNo": "A-73MA001-E28",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:47"
      },
      {
        "tagNo": "A-73MA001-E29",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:48"
      },
      {
        "tagNo": "A-73MA001-E30",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:49"
      },
      {
        "tagNo": "A-73MA001-E31",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:49"
      },
      {
        "tagNo": "A-73MA001-E32",
        "description": "mocked EX LED LIGHT FIXTURE MAX LED 4500",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Electrical",
        "tagType": "E",
        "updatedDate": "2020-10-29T11:02:50"
      },
      {
        "tagNo": "A-73MA001-M01",
        "description": "mocked MAIN WINCH MOTOR 1",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T09:00:16"
      },
      {
        "tagNo": "A-73MA001-M02",
        "description": "mocked MAIN WINCH MOTOR 2",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T09:05:39"
      },
      {
        "tagNo": "A-73MA001-M03",
        "description": "mocked MAIN WINCH MOTOR 3",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T09:00:46"
      },
      {
        "tagNo": "A-73MA001-M04",
        "description": "mocked MAIN WINCH MOTOR 4",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T07:44:05"
      },
      {
        "tagNo": "A-73MA001-M05",
        "description": "mocked SLEWING MOTOR 1",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T08:58:38"
      },
      {
        "tagNo": "A-73MA001-M06",
        "description": "mocked SLEWING MOTOR 2",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T09:01:49"
      },
      {
        "tagNo": "A-73MA001-M07",
        "description": "mocked SLEWING MOTOR 3",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T07:47:37"
      },
      {
        "tagNo": "A-73MA001-M08",
        "description": "mocked SLEWING MOTOR 4",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T09:01:49"
      },
      {
        "tagNo": "A-73MA001-M09",
        "description": "mocked SLEWING MOTOR 5",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T09:00:47"
      },
      {
        "tagNo": "A-73MA001-M10",
        "description": "mocked SLEWING MOTOR 6",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T08:58:24"
      },
      {
        "tagNo": "A-73MA001-M11",
        "description": "mocked LUFFING WINCH MOTOR 1",
        "tagStatus": "AsBuilt",
        "tagCategoryDescription": "Main Equipment",
        "tagType": "M",
        "updatedDate": "2020-06-19T09:00:48"
      }
    ]`;
}
