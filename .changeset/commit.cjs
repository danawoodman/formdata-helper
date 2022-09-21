module.exports = {
	getAddMessage(changeset, options = {}) {
		const skipCI = options?.skipCI === "add" || options?.skipCI === true;
		return `${changeset.summary}${skipCI ? `\n\n[skip ci]\n` : ""}`;
	},
};
