export class NumericParseError extends Error {
    constructor(message = "") {
        super(message);
        this.message = message
    }
}