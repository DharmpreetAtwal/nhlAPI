import { IntegerParseError } from "../errors/numericParseError"
import * as QueryString from "qs"

export function parseIntegerUndefinedParam(value: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[] | undefined, paramName: string): number | undefined {
    if(value === undefined) {
        return undefined
    }

    if (typeof value !== "string") {
        throw new IntegerParseError(`The ${paramName} parameter must be passed as a string.`)
    }

    if(value.trim() === "") {
        throw new IntegerParseError(`The ${paramName} parameter cannot be empty`)
    }

    let num = Number(value)
    if(num < 0 || !Number.isInteger(num)) {
        throw new IntegerParseError(`The ${paramName}='${value}' parameter must evaluate to a positive integer.`)
    }

    return num
}