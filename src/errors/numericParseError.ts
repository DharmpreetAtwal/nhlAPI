export class IntegerParseError extends Error {
    constructor(message = "") {
        super(message);
        this.name = "IntegerParseError"
    }
}