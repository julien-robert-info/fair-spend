import { Dinero, toDecimal, Transformer } from 'dinero.js'

function createFormatter(
	transformer: Transformer<number, string, string>,
	absTransformer: Transformer<number, string, string>
) {
	return function formatter(dineroObject: Dinero<number>, abs?: boolean) {
		return toDecimal(dineroObject, abs ? absTransformer : transformer)
	}
}

export const dineroFormat = createFormatter(
	({ value, currency }) => `${value}`,
	({ value, currency }) => `${value.replace('-', '')}`
)
