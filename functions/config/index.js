module.exports = {
	environment: process.env.NODE_ENV || "development",
	port: process.env.PORT || 5000,
	jwtConfig: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN,
	},
	googleMaps: {
		key: process.env.MAPS_API_KEY,
	},
};
