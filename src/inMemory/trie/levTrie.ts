import Node from './node';

export interface TrieResult {
    word: string;
    cost: number;
}
//based on: https://github.com/equinor/infield/blob/master/webApp/client/src/levTrie.js
// and https://github.com/jedwards1211/js-levenshtein-trie
export class LevTrie {
    result: TrieResult | undefined = undefined;
    lowest: number | undefined;
    rootNode: Node;
    defaultCost = 5;
    constructor() {
        this.rootNode = new Node('');
    }

    addWord(word: string): void {
        let node = this.rootNode;

        for (const letter of word) {
            if (!node.children.hasOwnProperty(letter)) {
                node.children[letter] = new Node(letter);
            }
            node = node.children[letter] as Node;
        }

        node.word = word;
        node.leaf = true;
    }

    getSubstituteCost(fromValue: string, toValue: string): number {
        function swap(x: string, y: string): boolean {
            return (fromValue === x && toValue === y) || (fromValue === y && toValue === x);
        }
        if (swap('O', '0')) {
            return 1;
        }
        if (swap('l', '1')) {
            return 1;
        }
        if (swap('I', '1')) {
            return 1;
        }
        if (swap('l', 'I')) {
            return 1;
        }
        if (swap('1', 'T')) {
            return 2;
        }
        if (swap('O', 'Q')) {
            return 2;
        }
        if (swap('Q', '0')) {
            return 2;
        }
        if (swap('G', '6')) {
            return 2;
        }
        if (swap('S', '5')) {
            return 2;
        }
        if (swap('8', 'B')) {
            return 2;
        }
        if (swap('0', 'e')) {
            return 3;
        }
        if (swap('0', 'b')) {
            return 3;
        }
        return this.defaultCost;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    closestRecursive(this: any, node: Node, letter: string, word: string, previousRow: Array<number>): void {
        const currentRow = [previousRow[0] + this.defaultCost];

        const col: number[] = [];
        for (let i = 1; i < word.length + 1; i++) {
            col.push(i);
        }

        for (let i = 0; i < col.length; i++) {
            const insertCost = currentRow[col[i] - 1] + this.defaultCost;
            const deleteCost = previousRow[col[i]] + this.defaultCost;
            let replaceCost;
            if (word[col[i] - 1] === letter) {
                replaceCost = previousRow[col[i] - 1];
            } else {
                const index = col[i] - 1;
                replaceCost = previousRow[index] + this.getSubstituteCost(letter, word[index]);
            }
            const cost = Math.min(insertCost, Math.min(deleteCost, replaceCost));
            //// Lets keep this commented code for debugging later
            // console.log(
            //     cost,
            //     'insert',
            //     insertCost,
            //     'delete',
            //     deleteCost,
            //     'replace',
            //     replaceCost,
            //     'substituteCost',
            //     substituteCost,
            //     'compare',
            //     word[col[i] - 1],
            //     letter,
            //     'prev',
            //     word.slice(0, col[i] - 1),
            //     'full',
            //     word.slice(0, col[i]),
            //     previousRow,
            // );
            currentRow.push(cost);
        }

        if (currentRow[currentRow.length - 1] < this.lowest && node.word != null) {
            this.lowest = currentRow[currentRow.length - 1];
            this.result = {
                word: node.word,
                cost: this.lowest
            };
        }

        for (let i = 0; i < currentRow.length; i++) {
            if (currentRow[i] < this.lowest) {
                for (const childLetter in node.children) {
                    this.closestRecursive(
                        node.children[childLetter] as Node,
                        childLetter,
                        word,
                        currentRow,
                        this.result,
                        this.lowest
                    );
                }
                break;
            }
        }
    }

    closest(word: string, maxCost: number, overWriteMaxCost = false): TrieResult | undefined {
        this.result = undefined;
        this.lowest = overWriteMaxCost ? maxCost + 1 : Math.min(word.length + 2, maxCost + 1);

        const currentRow: number[] = [];
        for (let i = 0; i < word.length + 1; i++) {
            currentRow.push(i * this.defaultCost);
        }
        for (const letter in this.rootNode.children) {
            this.closestRecursive(this.rootNode.children[letter] as Node, letter, word, currentRow);
        }
        return this.result;
    }

    addChildObj(char: string): Node {
        const newNode = new Node(char);
        this.rootNode.children[char] = newNode;
        return newNode;
    }
}
