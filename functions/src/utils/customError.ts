/** CustomError class to explicitly define types  */
class CustomError extends Error {
	title: string;
	errors: string[];
	status?: number;

	constructor(
		message: string,
		title: string,
		errors: string[],
		status?: number
	) {
		super(message);
		this.title = title;
		this.errors = errors;
		this.status = status;
	}
}

export default CustomError;
