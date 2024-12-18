
const config = {
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
    ACCESS_TOKEN_EXPIRY: '2h',
    REFRESH_TOKEN_EXPIRY: '15d',

    HTTP_STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    },

};

export default config;