import { ChecklistDb } from '../offlineSync/checklistsSyncer/checklistsApi';
import { CommPackDb } from '../offlineSync/commPacksSyncer/commPacksApi';
import { DocumentSummaryDb } from '../offlineSync/documentsSyncer/documentDb';
import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { NotificationDb } from '../offlineSync/notificationSyncer/notificationApi';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { WorkOrderDb } from '../offlineSync/workOrdersSyncer/workOrdersApi';

export type TagSummaryDto = TagSummaryDb;
export type DocumentSummaryDto = DocumentSummaryDb;
export type McPackDto = McPackDb;
export type CommPackDto = CommPackDb;

export type ChecklistDto = ChecklistDb;

// export type NotificationDto = Readonly<NotificationDb>; //TODO ask Chris

export interface NotificationDto extends NotificationDb {
    //TODO Ove fix dto
    dummy?: number;
}

export type PunchDto = PunchDb;
export type WorkOrderDto = WorkOrderDb;
