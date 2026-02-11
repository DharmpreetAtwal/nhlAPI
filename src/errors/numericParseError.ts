import { BadRequestError } from "./httpClientErrors";

export class IntegerParseError extends BadRequestError {
    constructor(message = "") {
        super(message);
        this.name = "IntegerParseError"
    }
}