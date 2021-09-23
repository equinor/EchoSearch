import { orEmpty, orThrow, toDateOrThrowError } from '../stringUtils';

export interface TagSummaryDb {
    readonly tagNo: string;
    readonly description: string;
    readonly tagCategoryDescription: string;
    readonly tagCategory: number;
    readonly tagStatus: TagStatus;
    readonly projectCode: string;
    readonly tagType: string;
    readonly updatedDate: Date;
    readonly locationCode: string;
    //readonly tagStatusDescription: string; //not available from stid!
    readonly system: string;
    readonly poNo: string;
    readonly xCoordinate?: number;
    readonly yCoordinate?: number;
    readonly zCoordinate?: number;
}

export enum TagStatus {
    UNKNOWN = 'Unknown',
    //Stid statuses
    AsBuilt = 'AsBuilt',
    Planned = 'Planned',
    Reserved = 'Reserved',
    Future = 'Future',
    Historic = 'Historic',
    OutOfService = 'OutOfService',
    Voided = 'Voided'
}

export function cleanupTag(tag: TagSummaryDb): TagSummaryDb {
    return {
        tagNo: tag.tagNo,
        description: orEmpty(tag.description),
        tagCategoryDescription: orEmpty(tag.tagCategoryDescription),
        tagStatus: tag.tagStatus,
        tagType: orEmpty(tag.tagType),
        locationCode: orEmpty(tag.locationCode),
        updatedDate: toDateOrThrowError(tag.updatedDate),
        tagCategory: orThrow(tag.tagCategory),
        projectCode: orEmpty(tag.projectCode),
        system: orEmpty(tag.system),
        poNo: orEmpty(tag.poNo),
        xCoordinate: tag.xCoordinate,
        yCoordinate: tag.yCoordinate,
        zCoordinate: tag.zCoordinate
    };
}
