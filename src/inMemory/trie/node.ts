export default class Node {
    word!: string;
    letter: string;
    children: {
        [key: string]: {};
    };
    leaf!: boolean;

    constructor(letter: string) {
        this.letter = letter;
        this.children = {};
    }
}
