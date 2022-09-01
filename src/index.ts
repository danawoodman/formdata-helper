export type StructuredFormValue =
	| string
	| boolean
	| number
	| File
	| StructuredFormValue[];

export type StructuredFormData = Record<string, StructuredFormValue>;

export interface Configuration<T> {
	/**
	 * Can be a partial object of `T` type.
	 *
	 * This is useful if you want to always guarantee that certain fields are
	 * present in the output.
	 */
	defaults?: Partial<T>;

	/**
	 * What values to use when determining a "falsy" value to coerce to `false`.
	 *
	 * Examples:
	 * - `["false", "no", "n", "0"]`
	 *
	 * Default is `"false"`
	 */
	falsy?: string | string[];

	/**
	 * What values to use when determining a "truthy" value to coerce to `true`.
	 *
	 * Examples:
	 * - `["true", "yes", "y", "1"]`
	 *
	 * Default is `"true"`
	 */
	truthy?: string | string[];
}

export function parseFormData<T extends StructuredFormData>(
	data?: FormData,
	configuration?: Configuration<T>
): Partial<T> {
	// TODO: throw or return empty object/undefined/null?
	if (!data || !(data instanceof FormData)) return {};

	const config = {
		truthy: "true",
		falsy: "false",
		defaults: {},
		...configuration,
	} as Required<Configuration<T>>;
	const truthy = toArray(config.truthy);
	const falsy = toArray(config.falsy);
	const defaults = config.defaults;

	return [...data.entries()].reduce(
		(data, [k, v]) => {
			/**
			 * Coerce the values to their primitive types.
			 *
			 * Start with booleans before we
			 */
			let value: StructuredFormValue = v;

			const isString = typeof v === "string";

			if (isString && truthy.includes(v)) value = true;
			else if (isString && falsy.includes(v)) value = false;
			// if (v === "true") value = true;
			// if (v === "false") value = false;
			else if (!isNaN(Number(v))) value = Number(v);

			if (k in data) {
				/**
				 * If the key exists in the defaults object, we check to see if
				 * it is not an array value because we don't want to accidentally
				 * create an array of values when the expectation is it will return
				 * a single value.
				 *
				 * For example, this call:
				 *  const data = new FormData();
				 * 	data.append("a", "foo");
				 * 	parseFormData(data, { defaults: { a: "bar" } })
				 *
				 * Should result in this output:
				 * 	{ a: "foo" }
				 *
				 * Not:
				 * 	{ a: ["foo", "bar"] }
				 */
				if (k in defaults && !Array.isArray(defaults[k])) {
					data[k] = value;
				} else {
					/**
					 * For grouped fields like multi-selects and checkboxes, we need to
					 * store the values in an array.
					 *
					 * For example, this call:
					 *  const data = new FormData();
					 * 	data.append("a", "foo");
					 * 	data.append("a", "bar");
					 * 	parseFormData(data)
					 *
					 * Should result in this output:
					 * 	{ a: ["foo", "bar"] }
					 *
					 * Not:
					 * 	{ a: "foo" } or { a: "bar" }
					 */
					const val = data[k];
					value = Array.isArray(val) ? [...val, value] : [val, value];
				}
			}

			data[k] = value;

			return data;
		},
		{ ...defaults }
	);
}

function toArray(val: string | string[]): string[] {
	return Array.isArray(val) ? val : [val];
}
