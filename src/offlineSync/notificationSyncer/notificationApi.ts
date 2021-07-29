import { loggerFactory } from '../../logger';
import { ApiDataFetcher } from '../apiDataFetcher';
import { orEmpty, toDateOrThrowError } from '../stringUtils';
import { getApiBaseUrl } from '../syncSettings';
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

export interface FailureInformation {
    failureImpactId: string;
    failureImpact: string;
    failureModeGroupId: string;
    failureModeId: string;
    failureModeGroup: string;
    failureMode: string;
    failureMechanismGroupId: string;
    failureMechanismId: string;
    failureMechanismGroup: string;
    failureMechanism: string;
    detectionMethodGroupId: string;
    detectionMethodId: string;
    detectionMethodGroup: string;
    detectionMethod: string;
}

export interface ActiveStatusDetail {
    statusId: string;
    status: string;
    statusType: string;
}

export interface NotificationTagDetails {
    tagId: string;
    tag: string;
    maintenancePlantId: string;
    locationId: string;
    location: string;
    area: string;
    systemId: string;
    abcIndicatorId: string;
    catalogProfileId: string;
    parentFunctionalLocationId: string;
    parentTagId: string;
}

export interface NotificationDetails extends NotificationDb {
    longText: string;
    failureInformation: FailureInformation;
    activeStatusDetails: ActiveStatusDetail[];
    tagDetails: NotificationTagDetails;
}

const log = loggerFactory.notifications('Api');
const notificationsApiFetcher = new ApiDataFetcher(cleanupNotification);

export const notificationsApi = {
    openAndClosedForTagNo: getOpenClosedNotificationsForTagApi,
    notificationDetails: getNotificationDetailsApi,

    state: notificationsApiFetcher.state
};

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
    const url = `${getApiBaseUrl()}/${instCode}/maintenance-records/open?take=100000`;
    return notificationsApiFetcher.fetchAll(url, () => getMockedNotificationsString(0), abortSignal);
}

export async function apiUpdatedNotifications(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<NotificationDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${getApiBaseUrl()}/${instCode}/maintenance-records/open-and-closed?changedDateFrom=${date}&take=100000`;
    return notificationsApiFetcher.fetchAll(url, () => getMockedNotificationsString(50000), abortSignal);
}

async function getOpenClosedNotificationsForTagApi(
    instCode: string,
    tagNo: string,
    abortSignal: AbortSignal
): Promise<NotificationDb[]> {
    const url = `${getApiBaseUrl()}/${instCode}/tag/maintenance-records?includeCompleted=true&take=1000&tagNo=${encodeURIComponent(
        tagNo
    )}`;
    return notificationsApiFetcher.fetchAll(url, () => getMockedNotificationsString(50000), abortSignal);
}

async function getNotificationDetailsApi(
    id: string,
    includeFailureInformation: boolean,
    includeLongText: boolean,
    includeStatusDetails: boolean,
    includeTagDetails: boolean,
    abortSignal: AbortSignal
): Promise<NotificationDetails> {
    let url = `${getApiBaseUrl()}/maintenance-record/${id}`;

    let params = '';
    if (includeFailureInformation) params += '&includeFailureInformation=true';
    if (includeLongText) params += '&includeLongText=true';
    if (includeStatusDetails) params += '&includeStatusDetails=true';
    if (includeTagDetails) params += '&includeTagDetails=true';

    url += params.replace('&', '?');

    return await notificationsApiFetcher.fetchSingle<NotificationDetails>(
        url,
        abortSignal,
        (item) => item, //TODO cleanup
        () => '' //TODO mocked data
    );
}
