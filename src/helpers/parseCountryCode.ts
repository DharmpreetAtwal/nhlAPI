import * as QueryString from "qs"
import { CountryCodeParseError } from "../errors/countryCodeParseError"

export function parseCountryCode(
    value: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[] | undefined, 
    paramName: string): string {
        
    if(value === undefined) {
        throw new CountryCodeParseError(`The parameter ${paramName} cannot be undefined.`)
    }

    if (typeof value !== "string") {
        throw new CountryCodeParseError(`The ${paramName} parameter must be a string.`)
    }

    if(value.trim() === "") {
        throw new CountryCodeParseError(`The ${paramName} parameter cannot be empty`)
    }

    if (!value.match(/^[A-Za-z]{3}$/)) {
        throw new CountryCodeParseError(`The parameter nation='${value}' must be 3 letters`)
    }

    return value.toUpperCase()
}