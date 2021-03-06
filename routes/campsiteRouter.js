// file handles the GET, PUT, POST & DELETE endpoints for any path that begins with "/campsites"
// including those using route parameters to specify a particular campsite by its "id".

const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');

//  const { response } = require('express');

const campsiteRouter = express.Router();

                                                            //  // /campsite  //  //

campsiteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    //cors.cores: middleware
.get(cors.cors, (req, res, next) => {  // 'next' is passed in for error handling.
    Campsite.find() //queries the database for all the documents that were instantiated using the Campsite model.
    .populate('comments.author')
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.create(req.body) //mongoose automatically makes sure that it fits the Schema that was defined.
    .then(campsite => {
        console.log('Campsite Created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite); //send info about the posted document to the client
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {    //PUT isn't allowed on campsites path
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {   //requesting to delete ALL campsites.
    Campsite.deleteMany()       // Static method, empty params list resulting in every doc in campsites collection 
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);     // Sends the 'response' back.
    })
    .catch(err => next(err));
});

                                                            //  // :campsiteId  //  //

campsiteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)    //This campsiteId is getting parsed from the HTTP request from whatever the client/user typed in as the 'id' they want to access.
    .populate('comments.author')
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);     // Sends the 'response' back.
    })
    .catch(err => next(err));
})  
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)   //we want to pass this method the id of the campsite to delete: using the saved router parameter(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);     // Sends the 'response' back.
    })
    .catch(err => next(err));
});


//copied code below:

                                                            //  // /comments  //  //

campsiteRouter.route('/:campsiteId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if (campsite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments);
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {                      //verifyAdmin??? //written instructions
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            req.body.author = req.user._id; //when comment is saved, this will provide the user id who submitted the comment in the author field
            campsite.comments.push(req.body);
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            for (let i = (campsite.comments.length-1); i >= 0; i--) {
                campsite.comments.id(campsite.comments[i]._id).remove();
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

                                                            //  // :commentId  //  //

campsiteRouter.route('/:campsiteId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments.id(req.params.commentId));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {         //verifyAdmin?? //written instructions
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        const userComment = campsite.comments.id(req.params.commentId);
        if (campsite && userComment) {
            if (userComment.author._id.equals(req.user._id)) {
                if (req.body.rating) {
                    userComment.rating = req.body.rating;
                }
                if (req.body.text) {
                    userComment.text = req.body.text;
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error('You are not the authorized commenter');
                err.status = 403;
                return next(err);
            }
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {                    //verifyAdmin?? //written instructions
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        const userComment = campsite.comments.id(req.params.commentId); 
        if (campsite && userComment) {
            if (userComment.author._id.equals(req.user._id)) {
                userComment.remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error('You are not the authorized commenter');
                err.status = 403;
                return next(err);
            }
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

// Subdocument within database operation


module.exports = campsiteRouter;


//  Campsite.deleteMany()       // Static method, empty params list resulting in every doc in campsites collection



