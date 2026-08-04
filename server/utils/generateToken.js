import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    res.cookie('jwt', token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: process.env.NODE_ENV === "development" ? "strict" : "none", // Required for cross-origin cookies
        secure: process.env.NODE_ENV !== "development", // HTTPS in production required for sameSite none
    });
};

export default generateTokenAndSetCookie;
