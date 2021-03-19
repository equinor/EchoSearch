/**
 * Mimics the c# using.
 * Always runs the specified 'thenOnDisposeRunFunc' after main function 'runMainFunc' has finished.
 * UseFull for cleaning up, or to make sure a flagState always are set back to default, even if there are exceptions.
 * @param runMainFunc The main function to run.
 * @param thenOnDisposeRunFunc The function to always run after the main function.
 */
export async function asyncUsing<T>(runMainFunc: () => Promise<T>, thenOnDisposeRunFunc: () => void): Promise<T> {
    try {
        return await runMainFunc();
    } finally {
        thenOnDisposeRunFunc();
    }
}
