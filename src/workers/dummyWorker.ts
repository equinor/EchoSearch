import * as Comlink from 'comlink';
import ctx from '../setup/setup';
let a: Data[] = [];

const dummyWorker: Work = {
    howOld(data: Data): string {
        if (a.length === data.num && a[0].name === data.name) a; //return JSON.stringify(a);
        a = [];
        for (let num = 0; num < data.num; num++) {
            a.push({ ...data, num });
        }

        const ages = a.filter((i) => i.num % 1000);
        a = ages.filter((i) => i.num / 3.14 > 100 % 3.14);
        return JSON.stringify(a);
    }
};

export interface Work {
    howOld: (name: Data) => void;
}

interface Data {
    name: string;
    num: number;
}

Comlink.expose(dummyWorker, ctx);
