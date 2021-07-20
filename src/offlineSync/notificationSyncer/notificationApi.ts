import { loggerFactory } from '../../logger';
import { ApiDataFetcher } from '../apiDataFetcher';
import { orEmpty, toDateOrThrowError } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedNotificationsString } from './notificationMocked';

export interface NotificationDb {
    maintenanceRecordId: string;
    recordTypeId: string;
    recordType: string;
    tagId?: string;
    equipmentId: string;
    title: string;
    createdDateTime: Date;
    activeStatusIds: string[];
    workOrderId: string;
    functionalLocation: string;
    maintenancePlantId: string;
    plannerGroupId: string;
    plannerGroup: string;
    mainWorkCenterId: string;
    notificationDateTime?: Date;
    requiredEndDateTime?: Date;
    originalRequiredEndDate?: Date;
    referenceCompletedDateTime?: Date;
    completedDateTime?: Date;
    changedDateTime?: Date;
    priorityId: string;
    priority: string;
    personalResponsible: string;
    customUserField: string;
    wbsId: string;
    wbs: string;
}

const log = loggerFactory.notifications('Api');
export const notificationsApi = new ApiDataFetcher(cleanupNotification);

function cleanupNotification(notification: NotificationDb): NotificationDb {
    if (!notification.createdDateTime) log.warn('Undefined date', notification);
    return {
        maintenanceRecordId: orEmpty(notification.maintenanceRecordId),
        recordTypeId: orEmpty(notification.recordTypeId),
        recordType: orEmpty(notification.recordType),
        tagId: orEmpty(notification.tagId),
        equipmentId: orEmpty(notification.equipmentId),
        title: orEmpty(notification.title),
        createdDateTime: toDateOrThrowError(notification.createdDateTime),
        activeStatusIds: notification.activeStatusIds ?? [],
        workOrderId: orEmpty(notification.workOrderId),
        functionalLocation: orEmpty(notification.functionalLocation),
        maintenancePlantId: orEmpty(notification.maintenancePlantId),
        plannerGroupId: orEmpty(notification.plannerGroupId),
        plannerGroup: orEmpty(notification.plannerGroup),
        mainWorkCenterId: orEmpty(notification.mainWorkCenterId),
        notificationDateTime: notification.notificationDateTime,
        requiredEndDateTime: notification.requiredEndDateTime,
        originalRequiredEndDate: notification.originalRequiredEndDate,
        referenceCompletedDateTime: notification.referenceCompletedDateTime,
        completedDateTime: notification.completedDateTime,
        changedDateTime: notification.changedDateTime,
        priorityId: orEmpty(notification.priorityId),
        priority: orEmpty(notification.priority),
        personalResponsible: orEmpty(notification.personalResponsible),
        customUserField: orEmpty(notification.customUserField),
        wbsId: orEmpty(notification.wbsId),
        wbs: orEmpty(notification.wbs)
    };
}

export async function apiAllNotifications(instCode: string, abortSignal: AbortSignal): Promise<NotificationDb[]> {
    const url = `${baseApiUrl}/${instCode}/maintenance-records/open?take=100000`;
    return notificationsApi.fetchAll(url, abortSignal, () => getMockedNotificationsString(0));
}

export async function apiUpdatedNotifications(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<NotificationDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${baseApiUrl}/${instCode}/maintenance-records/open-and-closed?changedDateFrom=${date}&take=100000`;
    return notificationsApi.fetchAll(url, abortSignal, () => getMockedNotificationsString(50000));
}
