const winston = require('winston');

const FileLogger = new winston.transports.File({
    filename: process.env.NODE_PATH + "/log/" + (process.env.NODE_ENV || "dev") + ".log",
    handleExceptions: true,
    timestamp: true,
    json: true,
    colorize:false
});

const ConsoleLogger = new winston.transports.Console({
    handleExceptions: true,
    timestamp: true,
    json: false,
    colorize:true
});

let transports = process.env.NODE_ENV == "dev" ? [FileLogger, ConsoleLogger] : [FileLogger];

let logger = new winston.Logger({
    transports: transports,
    exitOnError: false
});

module.exports = logger;
