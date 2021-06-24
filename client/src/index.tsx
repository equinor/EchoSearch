import EchoCore from '@equinor/echo-core';
import { echoSearchWorker, logger, OfflineSystem, Search, Syncer } from '@equinor/echo-search';
import React from 'react';
import ReactDOM from 'react-dom';

let count = 0;
const log = logger('Main');

export enum ErrorType {
    ApiNotFound = 'ApiNotFound'
}

export interface ErrorForTesting {
    type: ErrorType;
    name?: string;
    message?: string;
    stack?: string;
    httpStatusCode?: number;
    url?: string;
    properties?: Record<string, unknown>;
}

async function newSearch(): Promise<void> {
    await Syncer.changePlantAsync('JSV');

    await Syncer.runSyncAsync(Syncer.OfflineSystem.Tags);
    const result = await Search.searchTagsAsync('a-73ma001', 10);
    console.log('------------------------------- tag search result', result);
}

const SearchEngineDemo: React.FC = (): JSX.Element => {
    const isAuthenticated = EchoCore.useEchoSetup({} as any);

    async function handlePlant() {
        await Syncer.changePlantAsync('JSV');
    }

    async function handleSearch() {
        try {
            const tags = await Search.searchTagsAsync('a73 pedes cran', 5);
            if (tags.isSuccess) {
                console.log(
                    'found tags:',
                    tags.data.map((i) => i.tagNo)
                );
            } else {
                console.log('tags search error', tags.error);
            }
        } catch (e) {
            console.log('caught in main', JSON.parse(JSON.stringify(e)));
        }

        const mcPacks = await Search.searchMcPacksAsync('0001-A01', 2);
        if (mcPacks.isSuccess) {
            console.log(
                'mc packs search',
                mcPacks.data.map((item) =>
                    [item.description, item.commPkgNo, item.mcPkgNo, item.projectName, item.updatedAt].join(' ')
                )
            );
        } else {
            console.log('mc packs search ', mcPacks.error?.message?.toString());
        }

        const punches = await Search.searchPunchesAsync('A-73MA001', 2);
        if (punches.isSuccess) {
            console.log(
                'punches search',
                punches.data.map((item) =>
                    [item.id, item.description, item.tagNo, item.commPkgNo, item.mcPkgNo, item.updatedAt].join(' ')
                )
            );
        } else {
            console.log('punches search ', punches.error?.message?.toString());
        }
    }

    async function handleCameraSearch() {
        const similarTag = 'A73MAO0l';
        const tag = await Search.closestTagSearchAsync(similarTag);
        console.log(similarTag, 'camera search: found tag', tag);
    }

    async function handleRunSyn() {
        const result = await Syncer.runSyncAsync(OfflineSystem.Tags);
        log.info(result);
        log.info('with pretext', result);
    }

    async function handleRunSyncMcPacks() {
        const mcPackSync = Syncer.runSyncAsync(OfflineSystem.McPack);
        const punchesSync = Syncer.runSyncAsync(OfflineSystem.Punches);
        const results = await Promise.all([mcPackSync, punchesSync]);
        for (const result of results) {
            log.info('Sync result main:', result);
            if (!result.isSuccess) log.info({ ...result.error });
        }
    }

    async function handleSetMcPackEnabled(isEnabled: boolean): Promise<void> {
        await Syncer.setEnabledAsync(OfflineSystem.McPack, isEnabled);
        await Syncer.setEnabledAsync(OfflineSystem.Punches, isEnabled);
    }

    async function handleDoStuffBtn2() {
        log.info('-- this is from the new logger, doStuffBtn2Clicked');
        await echoSearchWorker.doStuff2();
    }

    async function handleExpensive() {
        log.info('ExpensiveBtnClicked', count++);
        const result = echoSearchWorker.runExpensive();
        log.info(result);
    }

    async function handleToggleMockData() {
        await echoSearchWorker.toggleMockDataClicked();
    }

    async function handleCommReturnTypes(): Promise<void> {
        const result = (await echoSearchWorker.testCommReturnTypes()) as ErrorForTesting;
        log.info('in main', result);
        console.log({ ...result });
    }

    async function handleStart(): Promise<void> {
        newSearch();
    }

    async function handleCancel() {
        log.info('CancelBtnClicked', count++);

        echoSearchWorker.cancelSync(OfflineSystem.Tags);
        echoSearchWorker.cancelSync(OfflineSystem.McPack);
        echoSearchWorker.cancelSync(OfflineSystem.Punches);
    }

    return (
        <div className="centered">
            <div>
                <img src="./ee.png" width="250" alt="EchoSearch" />
                <div>Example</div>
                <h1 className="header">Echo Search</h1>
                <br />
                {isAuthenticated ? (
                    <div>
                        <p>Please look at your developer console.</p>
                        <button onClick={handleStart}>Start A test</button>
                        <button onClick={handlePlant}>Change Plant (delete)</button>
                        <button onClick={handleSearch}>Search</button>
                        <button onClick={handleCameraSearch}>Camera Search</button>
                        <button onClick={handleRunSyn}>Run Sync</button>
                        <button onClick={handleRunSyncMcPacks}>Run McPacks Sync</button>
                        <button onClick={() => handleSetMcPackEnabled(true)}>McPacks Enable</button>
                        <button onClick={() => handleSetMcPackEnabled(false)}>McPack Disable</button>

                        <button onClick={handleDoStuffBtn2}>doStuffBtn2</button>
                        <button onClick={handleCancel}>Cancel</button>
                        <button onClick={handleExpensive}>Expensive</button>

                        <button onClick={handleToggleMockData}>toggle Use Mock Data</button>
                        <button onClick={handleCommReturnTypes}>test Comm return types</button>
                    </div>
                ) : (
                    <p>Please Autenticate to use this module.</p>
                )}
            </div>
        </div>
    );
};

if (!(window !== window.parent && !window.opener)) {
    ReactDOM.render(<SearchEngineDemo />, document.getElementById('root'));
}

EchoCore.EchoAuthProvider.handleLogin();
