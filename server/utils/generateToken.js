import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    // In cross-origin production (e.g. Vercel frontend + Render backend),
    // cookies MUST be SameSite=None + Secure, otherwise browsers silently block them.
    // We treat it as production if NODE_ENV is production OR FRONTEND_URL is a real domain.
    const isProduction =
        process.env.NODE_ENV === 'production' ||
        (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

    res.cookie('jwt', token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
        httpOnly: true,       // prevent XSS
        sameSite: isProduction ? 'none' : 'strict',
        secure: isProduction, // SameSite=None requires Secure=true
    });
};

export default generateTokenAndSetCookie;
