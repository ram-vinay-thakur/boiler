function generateCookieOption(httpOnly, sameSite, maxAge, additionalOptions = {}) {
    return {
        httpOnly,
        secure: process.env.NODE_ENV === 'production',
        sameSite: sameSite || 'Strict',
        maxAge: maxAge || 7 * 24 * 60 * 60 * 1000,
        ...additionalOptions
    };
}

export default generateCookieOption;
