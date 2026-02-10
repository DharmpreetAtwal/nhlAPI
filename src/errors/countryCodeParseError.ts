export class CountryCodeParseError extends Error {
    constructor(message = "") {
        super(message);
        this.message = message
    }
}