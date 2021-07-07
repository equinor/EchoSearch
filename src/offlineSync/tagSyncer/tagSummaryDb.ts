export interface TagSummaryDb {
    readonly tagNo: string;
    readonly description: string;
    readonly tagCategoryDescription: string;
    readonly tagStatus: TagStatus;
    readonly tagType: string;
    readonly updatedDate: Date;
    readonly locationCode: string;
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
