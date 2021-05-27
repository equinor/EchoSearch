//import { EchoEnv } from '@equinor/echo-core';
import { TagStatus, TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import {
    clearAndInitInMemoryTags,
    clearInMemoryTags,
    getInMemoryTagsSorted,
    isInMemoryTagsReady,
    updateInMemoryTags
} from './inMemoryTags';

const globalPerformanceMethod = global.performance;
beforeAll(() => {
    const mockedPerformance = { now: jest.fn() } as unknown;
    global.performance = mockedPerformance as Performance;
});

afterAll(() => {
    global.performance = globalPerformanceMethod;
});

// jest.mock('@equinor/echo-core', () => {
//     return {
//         EchoEnv: jest.fn(() => {
//             return {
//                 env: jest.fn(() => {
//                     return {
//                         GENERATE_SOURCEMAP: false,
//                         REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY: '3456',
//                         REACT_APP_API_CLIENT_ID: '1',
//                         REACT_APP_API_URL: 'url',
//                         REACT_APP_AZURE_AD_CLIENT_ID: '1',
//                         REACT_APP_AZURE_AD_TENNANT: '2',
//                         REACT_APP_AZURE_AD_TENNANT_ID: '3',
//                         REACT_APP_AZURE_BUILD_NUMBER: '0.7',
//                         REACT_APP_DEFAULT_CACHE_LOCATION: 'localStorage',
//                         REACT_APP_LOGGER_ACTIVE: false
//                     };
//                 })
//             };
//         })
//     };
// });

// beforeAll(() => {
//     EchoEnv.isDevelopment = jest.fn();
// });

describe('inMemoryTags', () => {
    it('should return sorted in memory tags', () => {
        clearInMemoryTags();
        clearAndInitInMemoryTags(getMockedTags());
        const expected = getMockedResult();
        const actual = getInMemoryTagsSorted();
        expect(actual.map((tag) => tag.tagNo)).toEqual(expected.map((tag) => tag.tagNo));
    });

    it('should return sorted in memory tags after update', () => {
        clearInMemoryTags();
        clearAndInitInMemoryTags(getMockedTags());
        updateInMemoryTags(getMockedUpdatedTags());
        const expected = getMockedUpdatedTagsResult();
        const actual = getInMemoryTagsSorted();
        expect(actual.map((tag) => tag.tagNo)).toEqual(expected.map((tag) => tag.tagNo));
    });

    it('isInMemoryTagsReady should return false after clear', () => {
        clearInMemoryTags();
        clearAndInitInMemoryTags(getMockedTags());
        expect(isInMemoryTagsReady()).toEqual(true);

        clearInMemoryTags();
        expect(isInMemoryTagsReady()).toEqual(false);
    });

    it('should return empty after clear', () => {
        clearInMemoryTags();
        clearAndInitInMemoryTags(getMockedTags());
        const initData = getInMemoryTagsSorted();
        expect(initData.length).toBeGreaterThan(0);

        clearInMemoryTags();

        const tags = getInMemoryTagsSorted();
        expect(tags.length).toEqual(0);
    });
});

function getMockedTags(): TagSummaryDb[] {
    return mockTags(['tag5', 'tag1', 'tag2', 'tag4', 'tag3', 'tag7', 'tag6']);
}
function getMockedResult(): TagSummaryDb[] {
    return mockTags(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7']);
}

function getMockedUpdatedTags(): TagSummaryDb[] {
    return mockTags(['tag8', 'tag0', 'tag2']);
}
function getMockedUpdatedTagsResult(): TagSummaryDb[] {
    return mockTags(['tag0', 'tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8']);
}

function mockTags(tags: string[]): TagSummaryDb[] {
    return tags.map((tagNo) => {
        return {
            tagNo: tagNo,
            description: 'description',
            tagCategoryDescription: 'A',
            tagStatus: TagStatus.AsBuilt,
            tagType: 'C',
            locationCode: 'A00',
            updatedDate: new Date(2021, 1, 1)
        };
    });
}
