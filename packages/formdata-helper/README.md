# formdata-helper

> Parse FormData into a structured JavaScript object with coerced primitives

```ts
// Optional: Add TypeScript typing to the response values.
type SignUp = {
  email: string;
  password: string;
  age: number;
  terms: boolean;
  favorites: string[];
  resume: File;
};

// Create some FormData. You likely will just pass form data
// and not manually create it like this.
const formData = new FormData();
formData.append("email", "hi@example.com");
formData.append("password", "s3kret!");
formData.append("age", "29");
formData.append("terms", "true");
formData.append("favorites", "TypeScript");
formData.append("favorites", "Svelte");
formData.append(
  "resume",
  new File(["Did lots of stuff"], "resume.txt", { type: "text/plain" })
);
const data = parseForm<SignUp>(formData);

// Returns the following structured data:
data.email; // "hi@example.com"
data.password; // "s3kret!"
data.age; // 29
data.terms; // true
data.favorites; // ["TypeScript", "Svelte"]
data.resume; // File { name: "resume.txt", type: "text/plain" }
```

## Purpose

Sometimes, working with `FormData` can be a pain in the bum, especially when working with large forms or when lots of form data needs to be coerced.

This simple tool takes an instance of `FormData` and returns a structured JavaScript object with coerced values of primitive types (`boolean`, `number`) and creates `Array`s for grouped fields like multi-selects and multiple checkboxes. `FormData` is used in a lot of places where you may need to interact with its values:

- `new FormData(document.querySelector("form"))`
- WebWorker
- SvelteKit `+server` or `+page.server` responses
- Etc...

This library _should_ work in all these cases, if it doesn't, please open an issue!

## Features

- Coerces various common value types into an `Object`:
  - `"on"` (for checkboxes), and `"true"` and `"false"` are coerced to `boolean`s which is the value a `type="checkbox"` or `type="radio"` field will return.
  - Numbers strings are converted to numbers (e.g. `"1.5"` becomes `1.5`)
    - Strings with numbers will not (e.g. `"hello1"`, `"1hello"` or `"he11o"` will be `string`s)
  - Grouped fields like multi `<select>`s or `<input type="checkbox">` are turned into `Array`s (like `"favorites": [ "TypeScript", "svelte" ]`).
- Works in the browser, Node or most other environments (exports CommonJS and ESM modules)
- Has decent TypeScript support
  - Can declare a return type which the form `defaults` value is checked against
    (see below).
- No dependencies! ✨
- Tiny: about [~617B gzipped](https://bundlephobia.com/package/formdata-helper)

And some things that are beyond the scope of this library:

- Doesn't validate the incoming data. For that, checkout [Zod](https://github.com/colinhacks/zod), [Yup](https://github.com/jquense/yup), [io-ts](https://github.com/gcanti/io-ts), [Runtypes](https://github.com/pelotom/runtypes) or [joi](https://joi.dev/)
- Doesn't look at what field types you have an intelligently parse them. Since `FormData` doesn't give us this type of information, there is nothing we can know about the data in it, so we just do a naive parsing of the data. If you need something more robust, look elsewhere!
- Since we don't know the types of the data, if a field is empty, it will always
  be resolved to an empty string. Keep this in mind when working with the data.

## Install

```shell
npm i -D formdata-helper
```

## Usage

Assuming the following form data:

```html
<form>
  <input type="text" name="name" value="Jane Doe" />
  <input type="checkbox" name="favoriteFruits" value="Banana" checked />
  <input type="checkbox" name="favoriteFruits" value="Mango" checked />
</form>
```

`parseFormData` will return a structured JavaScript object:

```ts
import { parseFormData } from "formdata-helper";

const formData = new FormData(document.querySelector("form"));
const data = parseFormData(formData);
```

`data` becomes:

```js
{
  name: "Jane Doe",
  favoriteFruits: [ "Banana", "Mango" ],
}
```

### Configuration

Passing custom configuration options (all are shown below):

```ts

const formData = new FormData()
formData.append("email": "hi@example.com")
formData.append("likesTypeScript": "yes") // will coerce to `true` with the below `truthy` option.
// `name` will get automatically set with `defaults` option.

parseFormData(formData, {
  defaults: { name: "Guest" },
  falsy: ["false", "f"],
  truthy: ["yes", "y"],
});
```

### TypeScript usage

```ts
/**
 * Define a return type for the data.
 * Note that return value is actually Partial<MyFormData> because
 * we cannot guarantee the presence of any values in the provided `FormData`
 * so all return values are possibly `undefined`.
 */
type MyFormData = {
  username: string;
  age: number;
  // Any multi-select or group of checkboxes can be either a
  // single string or an array of strings.
  interests: string | string[];
  admin: boolean;
};

// With all options:
parseFormData<MyFormData>(formData, {
  defaults: {
    username: "guest",
    interests: ["TypeScript"],
    admin: false,
  },
});
```

Please note that if you want to use an `interface` instead of a `type`, you have
to `extend` from `StructuredFormData` type exported from this package:

```ts
import { StructuredFormData } from "formdata-helper";

interface MyFormData extends StructuredFormData {
  username: string;
  age: number;
  interests: string[];
  admin: boolean;
}
```

### SvelteKit usage

You can use this helper in your `+server` and `+page.server` files to parse
incoming form data from form submissions in your Svelte pages.

```ts
import subscribeUser from "./subscribe-user";
import { parseFormData } from "formdata-helper";
import type { RequestHandler } from "./$types";

type RequestData = {
  email: string;
  subscribe: boolean;
};

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const data = parseFormData<RequestData>(formData);

  if (data.subscribe && data.email) {
    await subscribeUser(data.email);
  }

  return new Response(JSON.stringify(data));
};
```

## API

Type signatures:

```ts
type StructuredFormValue =
  | string
  | boolean
  | number
  | File
  | StructuredFormValue[];

type StructuredFormData = Record<string, StructuredFormValue>;

interface Configuration<T> {
  defaults?: Partial<T>;
  falsy?: string | string[];
  truthy?: string | string[];
}

parseFormData<T>(data: FormData, configuration?: Configuration)
```

## Development

- Tests are run with `npm test` using [Vitest](https://vitest.dev/)
- Code is written in [TypeScript](https://www.typescriptlang.org/)
- Build tool is [tsup](https://tsup.egoist.dev) (see `tsup.config.ts`)
- Releases are done using [changesets](https://github.com/changesets/changesets)

## License

MIT

## Credits

Created by [Dana Woodman](https://danawoodman.com)
