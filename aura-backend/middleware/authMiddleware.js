const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aura_global_admin_secret_2026';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

      
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. Please login to continue.' 
            });
        }

        // 2. Extract the token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication token missing.' 
            });
        }

        // 3. Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

      
        req.adminId = decoded.id;

     
        next();

    } catch (err) {
        console.error('Auth Middleware Error:', err.message);

       
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Your session has expired. Please login again.' 
            });
        }

       
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token. Please login again.' 
        });
    }
};

module.exports = authMiddleware;
