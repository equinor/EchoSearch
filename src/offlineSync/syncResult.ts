export interface SyncResult {
    isSuccess: boolean;
    error?: Error | string;
}

export interface InternalSyncResult extends SyncResult {
    newestItemDate?: Date;
    itemsSyncedCount: number;
}

export const createSuccess = (): SyncResult => {
    return { isSuccess: true } as SyncResult;
};

export const createError = (error: Error | string): SyncResult => {
    return { isSuccess: false, error } as SyncResult;
};
