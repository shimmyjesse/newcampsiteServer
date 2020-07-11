// file handles the GET, PUT, POST & DELETE endpoints for any path that begins with "/campsites"
// including those using route parameters to specify a particular campsite by its "id".

const express = require('express');
const bodyParser = require('body-parser');
const Campsite = require('../models/campsite');
const { response } = require('express');

const campsiteRouter = express.Router();

campsiteRouter.use(bodyParser.json());

campsiteRouter.route('/')
.get((req, res, next) => {  // 'next' is passed in for error handling.
    Campsite.find() //queries the database for all the documents that were instantiated using the Campsite model.
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsites);
    })
    .catch(err => next(err));
})
.post((req, res, next) => {
    Campsite.create(req.body) //mongoose automatically makes sure that it fits the Schema that was defined.
    .then(campsite => {
        console.log('Campsite Created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite); //send info about the posted document to the client
    })
    .catch(err => next(err));
})
.put((req, res) => {    //PUT isn't allowed on campsites path
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})
.delete((req, res, next) => {   //requesting to delete ALL campsites.
    Campsite.deleteMany()       // Static method, empty params list resulting in every doc in campsites collection 
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);     // Sends the 'response' back.
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)    //This campsiteId is getting parsed from the HTTP request from whatever the client/user typed in as the 'id' they want to access.
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);     // Sends the 'response' back.
    })
    .catch(err => next(err));
})  
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
})
.put((req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, {     // 1st argument we've passed in the campsiteId.
        $set: req.body                                  //'$set' : update operator. //data in request body.
    }, { new: true })                                       // 3rd argument: object: so we get back info about the updated doc as the result of this method.
    .then(campsite => {         // when it's updated, we'll get these status code and header info, sending back to client and handle any errors.
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);     // Sends the 'response' back.
    })
    .catch(err => next(err));    
})
.delete((req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)   //we want to pass this method the id of the campsite to delete: using the saved router parameter(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);     // Sends the 'response' back.
    })
    .catch(err => next(err));
});


module.exports = campsiteRouter;