import { loggerFactory } from '../logger';
import { asAlphaNumeric } from '../offlineSync/Utils/util';
import { LevTrie } from './trie/levTrie';

const log = loggerFactory.tags('InMemory.LevTrie');

let _levTrie: LevTrie = new LevTrie();
let _hasTagsInLevTrie = false;

function instance(): LevTrie {
    return _levTrie;
}

const isReady = (): boolean => _hasTagsInLevTrie;

function clearAll(): void {
    _levTrie = new LevTrie();
    _hasTagsInLevTrie = false;
}

async function populateWithTags(tagNos: string[]): Promise<void> {
    const performance = log.performance('LevTrie');
    tagNos.forEach((tagNo) => {
        const cleanedTagNo = asAlphaNumeric(tagNo);
        if (cleanedTagNo.length > 3) {
            _levTrie.addWord(cleanedTagNo);
        }
    });
    _hasTagsInLevTrie = _hasTagsInLevTrie || tagNos.length > 0;

    performance.forceLog('Camera tags ready: ' + tagNos.length + ' of ' + tagNos.length);
}

export const tagsLevTrie = {
    isReady,
    instance,
    clearAll,
    populateWithTags
};
