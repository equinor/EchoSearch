import { randomMockedString } from '../Utils/mockedUtils';
import { randomId, randomNumberId } from '../Utils/stringUtils';

export function mockedOpenClosedRejectedPunches(): string {
    return mockedOpenClosedRejectedAndRandomPunches(0);
}

export function mockedOpenClosedRejectedAndRandomPunches(randomCount: number): string {
    let punches = '[' + openPunch() + ', ' + closedPunch() + ', ' + rejectedPunch();
    if (randomCount > 0) {
        punches += ', ' + randomMockedString(randomCount, () => randomPunch());
    }

    punches = punches + ']';
    return punches;
}

function randomPunch(): string {
    return `
      {        
        "id": ${randomNumberId(7)},
        "punchListItemNo": ${randomNumberId(7)},
        "tagNo": "${randomId(7)}",
        "tagDescription": "mocked ${randomId(7)}",
        "tagArea": "${randomId(5)}",
        "description": "${randomId(7)}",
        "url": "",
        "statusId": "PA",
        "updatedAt": "2021-04-04T02:13:37",
        "createdAt": "2019-12-23T01:27:29",
        "clearedAt": null,
        "rejectedAt": null,
        "mcPkgNo": "1111-${randomId(4)}",
        "commPkgNo": "1111-${randomId(3)}",
        "areaId": null,
        "systemId": "${randomId(2)}",
        "clearedByOrg": "Org1",
        "raisedByOrg": "Org2",
        "typeDescription": "${randomId(7)}",
        "priorityId": null
      }
  `;
}

function openPunch(): string {
    return `
      {        
        "id": 1234567,
        "punchListItemNo": 2234567,
        "tagNo": "A-73MA001",
        "tagDescription": "It's a crane",
        "tagArea": "AA000",
        "description": "mocked [MC] Defect cable on crane.",
        "url": "",
        "statusId": "PA",
        "updatedAt": "${new Date()}",
        "createdAt": "2019-12-23T01:27:29",
        "clearedAt": null,
        "rejectedAt": null,
        "mcPkgNo": "1111-E590",
        "commPkgNo": "1111-B61",
        "areaId": null,
        "systemId": "17",
        "clearedByOrg": "Org1",
        "raisedByOrg": "Org2",
        "typeDescription": "Wrong installation",
        "priorityId": null
      }
  `;
}

function closedPunch(): string {
    return `
      {        "id": 3234567,
      "punchListItemNo": 4234567,
      "tagNo": "A-73MA001",
      "tagDescription": "It's a crane",
      "tagArea": "AA000",
      "description": "mocked [MC] Defect cable on crane. CLOSED",
      "url": "",
      "statusId": "PA",
      "updatedAt": "2019-12-31T06:13:37",
      "createdAt": "2019-12-23T01:27:29",
      "clearedAt": "2020-12-29T08:50:04",
      "rejectedAt": null,
      "mcPkgNo": "1111-E590",
      "commPkgNo": "1111-B61",
      "areaId": null,
      "systemId": "17",
      "clearedByOrg": "Org1",
      "raisedByOrg": "Org2",
      "typeDescription": "Wrong installation",
      "priorityId": null
      }
  `;
}
function rejectedPunch(): string {
    return `
        {        "id": "5234567",
        "punchListItemNo": "6234567",
        "tagNo": "A-73MA001",
        "tagDescription": "It's a crane",
        "tagArea": "AA000",
        "description": "mocked [MC] Defect cable on crane REJECTED.",
        "url": "",
        "statusId": "PA",
        "updatedAt": "2019-12-31T06:13:37",
        "createdAt": "2019-12-23T01:27:29",
        "clearedAt": null,
        "rejectedAt": "2021-02-29T08:50:04",        
        "mcPkgNo": "1111-E590",
        "commPkgNo": "1111-B61",
        "areaId": null,
        "systemId": "17",
        "clearedByOrg": "Org1",
        "raisedByOrg": "Org2",
        "typeDescription": "Wrong installation",
        "priorityId": null
        }
    `;
}
