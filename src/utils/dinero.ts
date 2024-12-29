import { Dinero, toDecimal, Transformer } from 'dinero.js'

function createFormatter(transformer: Transformer<number, string, string>) {
	return function formatter(dineroObject: Dinero<number>) {
		return toDecimal(dineroObject, transformer)
	}
}

export const dineroFormat = createFormatter(({ value, currency }) => `${value}`)
