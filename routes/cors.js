const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
//check whitelist
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    //check whatever's in the value of the request header called 'Origin'
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

// returns a middleware function configured to set a "cors" header of Access-Control-Allow-Origin on a response object 
// with a wild card as its value (allow cors for all origins).
exports.cors = cors();
// once again, cors() returns a middleware function, but this checks to see if the incoming request belongs to one of the 
// whitelisted origins and, if true, will return the cors response header, Access-Control-Allow-Origin, with the whitelisted origin as the value.
// if false, doesn't include any cors header in the response (If there's a REST API endpoint only accepting Cross Origin Requests from 'whitelist',
// we'll apply middleware to its endpoint)
exports.corsWithOptions = cors(corsOptionsDelegate);