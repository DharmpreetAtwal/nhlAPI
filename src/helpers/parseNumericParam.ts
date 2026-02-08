import { NumericParseError } from "../errors/numericParseError"

export function parseNumericParam(value: string | undefined, paramName: string): number | undefined {
    if(value === undefined) {
        return undefined
    }

    if(value.trim() === "") {
        throw new NumericParseError(`The ${paramName} parameter cannot be empty`)
    }

    const num = Number(value)
    if(isNaN(num)) {
        throw new NumericParseError(`The ${paramName}='${value}' parameter is an invalid number.`)
    }

    return num
}