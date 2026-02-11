import { BadRequestError } from "./httpClientErrors";

export class CountryCodeParseError extends BadRequestError {
    constructor(message = "") {
        super(message);
        this.message = message
    }
}