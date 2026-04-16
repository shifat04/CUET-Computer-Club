const notFound = (req, res, next) => {
    res.status(404);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction && statusCode >= 500 ? 'Internal server error' : err.message;

    if (isProduction && statusCode >= 500) {
        console.error('Server error:', err);
    }

    res.status(statusCode).json({
        message,
    });
};

module.exports = { notFound, errorHandler };
