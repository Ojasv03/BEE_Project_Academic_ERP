const jwt = require("jsonwebtoken");
const User = require("../model/User");

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user)
            return res.status(401).json({ message: "Not authorized" });

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Not authorized" });
    }
};

module.exports = protect;
