export type StructuredFormValue =
	| string
	| boolean
	| number
	| File
	| StructuredFormValue[];

export type StructuredFormData = Record<string, StructuredFormValue>;

export function parseFormData(
	data?: FormData,
	defaultData?: StructuredFormData
) {
	// TODO: throw or return empty object/undefined/null?
	if (!data || !(data instanceof FormData)) return {};

	const initial = { ...defaultData } as StructuredFormData;

	return [...data.entries()].reduce((data, [k, v]) => {
		let value: StructuredFormValue = v;
		if (v === "true") value = true;
		if (v === "false") value = false;
		if (!isNaN(Number(v))) value = Number(v);

		// For grouped fields like multi-selects and checkboxes, we need to
		// store the values in an array.
		if (k in data) {
			const val = data[k];
			value = Array.isArray(val) ? [...val, value] : [val, value];
		}

		data[k] = value;

		return data;
	}, initial);
}
