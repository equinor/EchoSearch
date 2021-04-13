export default class Node {
    word!: string;
    letter: string;
    children: {
        // eslint-disable-next-line @typescript-eslint/ban-types
        [key: string]: {};
    };
    leaf!: boolean;

    constructor(letter: string) {
        this.letter = letter;
        this.children = {};
    }
}
