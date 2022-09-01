import { parseFormData, type StructuredFormData } from "./index";
import { describe, expect, test } from "vitest";

function createFormData(data: {}): FormData {
	const formData = new FormData();
	for (const [key, val] of Object.entries(data)) {
		if (Array.isArray(val)) {
			for (const v of val) {
				formData.append(key, String(v));
			}
		} else {
			formData.append(key, String(val));
		}
	}
	return formData;
}

const c = createFormData;

describe("parseFormData", () => {
	const tests: {
		name: string;
		formdata?: any;
		defaultData?: StructuredFormData;
		expected: any;
	}[] = [
		// Ensure sane fallback behavior for passing in weird values.
		{ name: "undefined", formdata: undefined, expected: {} },
		{ name: "null", formdata: null, expected: {} },
		{ name: "empty string", formdata: "", expected: {} },
		{ name: "number", formdata: 32.5, expected: {} },

		// Ensure that we can parse a simple form.
		{ name: "empty form data", formdata: new FormData(), expected: {} },
		{
			name: "simple text only form",
			formdata: c({ name: "Jane Doe" }),
			expected: { name: "Jane Doe" },
		},
		{
			name: "coerce numbers",
			formdata: c({ age: 35, height: 6.1 }),
			expected: { age: 35, height: 6.1 },
		},
		{
			name: "coerce booleans",
			formdata: c({ admin: true, active: false }),
			expected: { admin: true, active: false },
		},
		{
			name: "coerce grouped fields",
			formdata: c({ favoriteFruits: ["Banana", "Mango"] }),
			expected: { favoriteFruits: ["Banana", "Mango"] },
		},
		{
			name: "coerce grouped fields (numeric)",
			formdata: c({ radioStations: [147.9, 102.1] }),
			expected: { radioStations: [147.9, 102.1] },
		},

		// Check passing in default object
		{
			name: "empty form data with default data",
			formdata: new FormData(),
			defaultData: { a: true },
			expected: { a: true },
		},
	];

	for (const t of tests) {
		test(t.name, () => {
			expect(parseFormData(t.formdata, t.defaultData)).toEqual(t.expected);
		});
	}
});
