# formdata-parser

> Parse FormData into a structured JSON object

- Coerces various common value types into an `Object`:
  - `"true"` and `"false"` are coerced to `boolean`s
  - Numbers strings are converted to numbers (e.g. `"1.5"` becomes `1.5`)
  - Grouped fields like multi `<select>`s or `<input type="checkbox">` are
    turned into `Array`s

## Install

```shell
npm i -D formdata-parser
```

## Usage

```ts
import { parseFormData } from "formdata-parser";

/*
Assuming the following form data:

<form>
	<input type="text" name="name" value="Jane Doe" />
	<input type="checkbox" name="favoriteFruits" value="Banana" checked />
	<input type="checkbox" name="favoriteFruits" value="Mango" checked />
</form>
*/
const formData = new FormData(document.querySelector("form"));
const data = parseFormData(formData);

/*
`data` becomes:

{
 	name: "Jane Doe",
	favoriteFruits: [ "Banana", "Mango" ],
}
*/

console.log(data.name); // "Jane Doe"
```
