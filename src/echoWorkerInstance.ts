import * as Comlink from 'comlink';
//import DummyWorker from 'web-worker:./workers/dummyWorker.ts';
import EchoSearchWorker from 'web-worker:./workers/echoSearchWorker.ts';
//import { Work } from './workers/dummyWorker';
import { EchoWorker } from './workers/echoSearchWorker';

//const worker2 = Comlink.wrap<Work>(new DummyWorker());
const echoWorkerComlink = Comlink.wrap<EchoWorker>(new EchoSearchWorker());
echoWorkerComlink.initialize(); //comment out to debug using vsCode locally
export const echoSearchWorker = echoWorkerComlink; //comment out to debug using vsCode locally

//comment in to Debug from VsCode (comment out echoWorkerComlink)
//NB - should always be commented out in production, only for local testing:
//export const echoSearchWorker = echoWorkerDebugDontUseThis;
//echoWorkerDebugDontUseThis.initialize();
//end NB - should always be commented out in production, only for local testing:
