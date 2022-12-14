import { File } from "node-fetch";
import { describe, expect, test } from "vitest";
import { Configuration, parseFormData } from "./index";

function createFormData(data?: {}): FormData {
	const formData = new FormData();

	if (!data || !Object.keys(data).length) return formData;

	for (const [key, val] of Object.entries(data)) {
		if (Array.isArray(val)) {
			for (const v of val) {
				formData.append(key, v instanceof File ? v : String(v));
			}
		} else {
			formData.append(key, val instanceof File ? val : String(val));
		}
	}
	return formData;
}

const f = createFormData;

describe("parseFormData", () => {
	const tests: {
		name: string;
		formdata?: any;
		config?: Configuration<any>;
		expected: any;
	}[] = [
		// Ensure sane fallback behavior for passing in weird values.
		{ name: "handles undefined", formdata: undefined, expected: {} },
		{ name: "handles null", formdata: null, expected: {} },
		{ name: "handles empty string", formdata: "", expected: {} },
		{ name: "handles number", formdata: 32.5, expected: {} },

		// Ensure that we can parse a simple form.
		{ name: "handles empty form data", formdata: f(), expected: {} },
		{
			name: "empty values",
			formdata: f({ search: "" }),
			expected: { search: "" },
		},
		{
			name: "simple text only form",
			formdata: f({ name: "Jane Doe" }),
			expected: { name: "Jane Doe" },
		},
		{
			name: "coerce numbers",
			formdata: f({ age: 35, height: 6.1 }),
			expected: { age: 35, height: 6.1 },
		},
		{
			name: "coerce booleans",
			formdata: f({ admin: true, active: false }),
			expected: { admin: true, active: false },
		},
		{
			name: "coerces grouped fields",
			formdata: f({ favoriteFruits: ["Banana", "Mango"] }),
			expected: { favoriteFruits: ["Banana", "Mango"] },
		},
		{
			name: "coerces grouped fields (numeric)",
			formdata: f({ radioStations: [147.9, 102.1] }),
			expected: { radioStations: [147.9, 102.1] },
		},

		// Check passing in default
		{
			name: "empty form data with default data",
			formdata: f(),
			config: { defaults: { a: true } },
			expected: { a: true },
		},
		{
			name: "form defaults",
			formdata: f({ a: false }),
			config: { defaults: { a: true, b: 12 } },
			expected: { a: false, b: 12 },
		},
		{
			name: "array defaults",
			formdata: f({ a: true, b: [1, 2, 3] }),
			config: { defaults: { b: [100] } },
			expected: { a: true, b: [1, 2, 3] },
		},

		// Custom truthy matchers
		{
			name: "custom truthy/false matchers",
			formdata: f({ a: "yes", b: "0", c: "y", d: "false" }),
			config: {
				truthy: ["yes", "y", "1"],
				falsy: ["no", "n", "0"],
			},
			expected: { a: true, b: false, c: true, d: "false" },
		},
	];

	for (const t of tests) {
		test(t.name, () => {
			expect(parseFormData(t.formdata, t.config)).toEqual(t.expected);
		});
	}

	describe("type interface", () => {
		test("happy path", () => {
			const data = { name: "Jane Doe", age: 36 };
			type T = { name: string; age: number };
			const resp = parseFormData<T>(f(data));
			expect(resp).toEqual(data);
		});

		test("works with defaults", () => {
			const defaults = { age: 36 };
			type T = { name: string; age: number };
			const resp = parseFormData<T>(f(), { defaults });
			expect(resp.name).toBeUndefined();
			expect(resp.age).toBe(36);
		});

		// TODO: how to test TS errors?
		// test("generates TS error with mismatched types", () => {
		// 	type Foo = { username: string; age: number };
		// 	const resp = parseFormData<Foo>(f({ admin: false}));
		// 	expect(resp.admin).toBeUndefined();
		// 	expect(resp.username).toBeUndefined();
		// });

		// test("generates TS error with mismatched types", () => {
		// 	const defaults = { admin: true };
		// 	type Foo = { username: string };
		// 	const resp = parseFormData<Foo>(f(), { defaults });
		// 	expect(resp.username).toBeUndefined();
		// 	expect(resp.admin).toBeUndefined();
		// });

		// test("generates TS error with mismatched types", () => {
		// 	const defaults = { admin: true };
		// 	type Foo = { username: string, [key: string]: any };
		// 	const resp = parseFormData<Foo>(f(), { defaults });
		// 	expect(resp.username).toBeUndefined();
		// 	expect(resp.admin).toBeUndefined();
		// });
	});

	describe("files", () => {
		test("returns files passed in", async () => {
			const resume = new File(["Did lots of stuff"], "resume.txt", {
				type: "text/plain",
			});
			const data = f({ resume });
			expect(parseFormData(data)).toEqual({ resume });
		});
	});
});
