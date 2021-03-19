/**
 * Rollup Worker Type
 */
declare module 'web-worker:*' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}
