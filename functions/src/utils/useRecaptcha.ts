import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

let cachedClient: RecaptchaEnterpriseServiceClient | null = null;

/**
 * Create an assessment to analyze the risk of a UI action.
 *
 * projectID: Your Google Cloud Project ID.
 * recaptchaSiteKey: The reCAPTCHA key associated with the site/app
 * token: The generated token obtained from the client.
 * recaptchaAction: Action name corresponding to the token.
 */
async function createAssessment({
	projectID = process.env.FB_PROJECT_ID,
	recaptchaKey = process.env.FB_RECAPTCHA_KEY,
	token,
	recaptchaAction,
}: {
	projectID?: string;
	recaptchaKey?: string;
	token: string;
	recaptchaAction?: string;
}) {
	console.log(
		projectID,
		recaptchaKey,
		token,
		recaptchaAction,
		"createAssessment params"
	);
	// Create the reCAPTCHA client.
	if (!cachedClient) {
		cachedClient = new RecaptchaEnterpriseServiceClient();
	}

	const client = cachedClient;
	const projectPath = client.projectPath(projectID as string);

	// Build the assessment request.
	const request = {
		assessment: {
			event: {
				token: token,
				siteKey: recaptchaKey,
			},
		},
		parent: projectPath,
	};

	const [response] = await client.createAssessment(request);

	// Check if the token is valid.
	if (response.tokenProperties && !response.tokenProperties.valid) {
		console.log(
			`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`
		);
		return null;
	}

	// Check if the expected action was executed.
	// The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
	if (
		response.tokenProperties &&
		response.tokenProperties.action === recaptchaAction
	) {
		// Get the risk score and the reason(s).
		// For more information on interpreting the assessment, see:
		// https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
		if (response.riskAnalysis) {
			console.log(
				`The reCAPTCHA score is: ${response.riskAnalysis.score}`
			);
			response.riskAnalysis.reasons?.forEach((reason) => {
				console.log(reason);
			});
			return response.riskAnalysis.score;
		} else {
			console.log("No risk analysis available.");
			return null;
		}
	} else {
		console.log(
			"The action attribute in your reCAPTCHA tag does not match the action you are expecting to score"
		);
		return null;
	}
}

export default createAssessment;
