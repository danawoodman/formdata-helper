import { parseFormData } from "formdata-helper";
import "./style.css";

type FormStructure = {
	"text-field"?: string;
	number?: boolean;
	"checkbox-group"?: string | string[];
	checkbox?: boolean;
	"fav-fruit"?: string | string[];
	avatar?: File;
};

const form = document.querySelector<HTMLFormElement>("form");
const pre = document.querySelector<HTMLPreElement>("pre");

form?.addEventListener("submit", handleSubmit);

function handleSubmit(event?: SubmitEvent) {
	// Prevent the form from submitting.
	event?.preventDefault();

	if (!form) return;

	// Create a FormData object from the form.
	const formData = new FormData(form);

	// Parse the FormData object.
	const data = parseFormData<FormStructure>(formData);

	console.log(data.avatar);

	// Display the parsed data.
	if (!pre) return;
	pre.innerHTML = JSON.stringify(data, null, 2);
	pre.style.display = "block";
}

// Submit the form when the page loads.
handleSubmit();
