module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"google",
		"plugin:@typescript-eslint/recommended",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ["./tsconfig.json", "./tsconfig.dev.json"],
		sourceType: "module",
	},
	ignorePatterns: [
		"/lib/**/*", // Ignore built files.
	],
	plugins: ["@typescript-eslint", "import"],
	rules: {
		quotes: ["error", "double"],
		"import/no-unresolved": 0,
		indent: "off",
		"no-tabs": 0,
		"object-curly-spacing": [2, "always"],
		arraysInObjects: 0,
		"quote-props": 0,
		"require-jsdoc": 0,
		"new-cap": 0,
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-unused-vars": 0,
		"max-len": 0,
	},
};
