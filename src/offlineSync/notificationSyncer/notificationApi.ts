import { loggerFactory } from '../../logger';
import { apiFetchJsonToArray } from '../../service/workerFetch';
import { orEmpty, toDateOrThrowError } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { ToggleState } from '../toggleState';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedNotificationsString } from './notificationMocked';

const _mock = new ToggleState(false);

export class NumberState {
    private _value: number;
    constructor(isEnabled: number) {
        this._value = isEnabled;
    }

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = value;
    }
}

export const notificationRandomApiErrorPercentage = new NumberState(0);
export const notificationsMock = _mock;

// maintenance record properties
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
    const performanceLogger = log.performance();
    const items: NotificationDb[] = _mock.isEnabled
        ? JSON.parse(getMockedNotificationsString(0))
        : await getAllNotificationsFromApi(instCode, abortSignal);
    performanceLogger.forceLogDelta(_mock.isEnabled ? 'Got mocked data' : ' Got api data');

    const results = items.map((item) => cleanupNotification(item));
    performanceLogger.forceLogDelta('Cleanup');
    return results;
}

export async function apiUpdatedNotifications(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<NotificationDb[]> {
    const items: NotificationDb[] = _mock.isEnabled
        ? JSON.parse(getMockedNotificationsString(50000))
        : await syncOpenAndClosedNotificationsData(instCode, fromDate, abortSignal);

    return items.map((item) => cleanupNotification(item));
}

async function getAllNotificationsFromApi(instCode: string, abortSignal: AbortSignal): Promise<NotificationDb[]> {
    const url = `${baseApiUrl}/${instCode}/maintenance-records/open?take=100000`;
    return await apiFetchJsonToArray<NotificationDb>(urlOrFakeError(url), abortSignal);
}

async function syncOpenAndClosedNotificationsData(
    instCode: string,
    updatedSince: Date,
    abortSignal: AbortSignal
): Promise<NotificationDb[]> {
    const date = dateAsApiString(updatedSince);
    const url = `${baseApiUrl}/${instCode}/maintenance-records/open-and-closed?changedDateFrom=${date}&top=100000`;
    return await apiFetchJsonToArray<NotificationDb>(urlOrFakeError(url), abortSignal);
}
export function urlOrFakeError(url: string, httpStatusCode = 403, errorMessage = 'errorMessage'): string {
    const chanceValue = randomInt(0, 100);
    const isFailure = chanceValue < notificationRandomApiErrorPercentage.value;
    log.trace('Failure roll:', chanceValue, notificationRandomApiErrorPercentage.value, isFailure);
    if (!isFailure) return url;
    return `${baseApiUrl}/TroubleShooting/FakeError?httpStatusCode=${httpStatusCode}&message=${errorMessage}`;
}

function randomInt(minIncluded: number, maxIncluded: number): number {
    return Math.floor(Math.random() * (maxIncluded - minIncluded + 1) + minIncluded);
}
