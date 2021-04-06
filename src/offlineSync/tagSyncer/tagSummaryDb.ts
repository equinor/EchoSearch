export interface TagSummaryDb {
    description: string;
    tagCategoryDescription: string;
    tagNo: string;
    tagStatus: TagStatus;
    tagType: string;
    updatedDate: Date;
    locationCode: string;
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
