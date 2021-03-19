import { logPerformance } from '../../logger';
import { orEmpty } from '../stringUtils';
import { getMockedMcPacksString } from './mcPacksMocked';

export interface McPackDb {
    id: number;
    commPkgNo: string;
    description: string;
    mcPkgNo: string;
    projectName: string;
    updatedAt: Date;
}

function cleanupMcPack(mcPack: McPackDb): McPackDb {
    return {
        id: mcPack.id,
        commPkgNo: orEmpty(mcPack.commPkgNo),
        description: orEmpty(mcPack.description),
        mcPkgNo: orEmpty(mcPack.mcPkgNo),
        projectName: orEmpty(mcPack.projectName),
        updatedAt: mcPack.updatedAt
    };
}

export async function apiAllMcPacks(): Promise<McPackDb[]> {
    const data = getMockedMcPacksString(0);
    const items: McPackDb[] = JSON.parse(data);
    return items.map((item) => cleanupMcPack(item));
}

export async function apiUpdatedMcPacks(fromDate: Date): Promise<McPackDb[]> {
    const randomCount = 50000;
    const data = getMockedMcPacksString(randomCount);
    const p = logPerformance();
    const items: McPackDb[] = JSON.parse(data);
    p.forceLog('json parse ' + items.length);
    return items.map((item) => cleanupMcPack(item));
}
