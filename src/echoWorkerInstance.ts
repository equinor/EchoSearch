import * as Comlink from 'comlink';
import EchoSearchWorker from 'web-worker:./workers/echoSearchWorker.ts';
import { EchoWorker } from './workers/echoSearchWorker';

const echoWorkerComlink = Comlink.wrap<EchoWorker>(new EchoSearchWorker());
echoWorkerComlink.initialize(); //comment out to debug using vsCode locally
export const echoSearchWorker = echoWorkerComlink; //comment out to debug using vsCode locally

//comment in to Debug from VsCode (comment out echoWorkerComlink)
//NB - should always be commented out in production, only for local testing:
//export const echoSearchWorker = echoWorkerDebugDontUseThis;
//echoWorkerDebugDontUseThis.initialize();
//end NB - should always be commented out in production, only for local testing:
