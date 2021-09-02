/* eslint-disable @typescript-eslint/no-empty-interface */
import { ChecklistDb } from '../offlineSync/checklistsSyncer/checklistsApi';
import { CommPackDb } from '../offlineSync/commPacksSyncer/commPacksApi';
import { DocumentSummaryDb } from '../offlineSync/documentsSyncer/documentDb';
import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { NotificationDb } from '../offlineSync/notificationSyncer/notificationApi';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { WorkOrderDb } from '../offlineSync/workOrdersSyncer/workOrdersApi';

//Export as Dto in case we want to change the internal dexie db interface

export interface TagSummaryDto extends TagSummaryDb {}
export interface DocumentSummaryDto extends DocumentSummaryDb {}
export interface McPackDto extends McPackDb {}
export interface CommPackDto extends CommPackDb {}

export interface ChecklistDto extends ChecklistDb {}

export interface NotificationDto extends NotificationDb {}

export interface PunchDto extends PunchDb {}
export interface WorkOrderDto extends WorkOrderDb {}
