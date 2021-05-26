export default class Node {
    word!: string;
    letter: string;
    children: {
        [key: string]: Node;
    };
    leaf!: boolean;

    constructor(letter: string) {
        this.letter = letter;
        this.children = {};
    }
}
