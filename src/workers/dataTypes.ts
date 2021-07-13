import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { NotificationDb } from '../offlineSync/notificationSyncer/notificationApi';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';

export type TagSummaryDto = TagSummaryDb;
export type McPackDto = McPackDb;

export interface NotificationDto extends NotificationDb {
    //TODO Ove fix dto
    dummy?: number;
}
//export type NotificationDto = NotificationDb;
export type PunchDto = PunchDb;
