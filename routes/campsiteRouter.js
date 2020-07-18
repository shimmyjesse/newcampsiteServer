// file handles the GET, PUT, POST & DELETE endpoints for any path that begins with "/campsites"
// including those using route parameters to specify a particular campsite by its "id".

const express = require('express');
const bodyParser = require('body-parser');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

//  const { response } = require('express');

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
.post(authenticate.verifyUser, (req, res, next) => {
    Campsite.create(req.body) //mongoose automatically makes sure that it fits the Schema that was defined.
    .then(campsite => {
        console.log('Campsite Created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite); //send info about the posted document to the client
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {    //PUT isn't allowed on campsites path
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})
.delete(authenticate.verifyUser, (req, res, next) => {   //requesting to delete ALL campsites.
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
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
})
.put(authenticate.verifyUser, (req, res, next) => {
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
.delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)   //we want to pass this method the id of the campsite to delete: using the saved router parameter(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);     // Sends the 'response' back.
    })
    .catch(err => next(err));
});

//copied code below:

campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
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
.post(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
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
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(authenticate.verifyUser, (req, res, next) => {
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

campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
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
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            if (req.body.rating) {
                campsite.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.text) {
                campsite.comments.id(req.params.commentId).text = req.body.text;
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
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
.delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            campsite.comments.id(req.params.commentId).remove();
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
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



 ///////////////////////////////// Not copied / self-typed code below ///////////////////////////////////////////

// campsiteRouter.route('/:campsiteId/comments')
// .get((req, res, next) => {  // 'next' is passed in for error handling.
//     Campsite.findById(req.params.campsiteId) //queries the database for only a SINGLE campsite
//     .then(campsite => {
//         if (campsite) {
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(campsite.comments);
//         } else {
//             err = new Error(`Campsite ${req.params.campsiteId} not found`);
//             err.status = 404;
//             return next(err);   //next(err) passes the error to the Express error handling mechanism
//         }
//     })
//     .catch(err => next(err));
// })
// .post((req, res, next) => {
//     Campsite.findById(req.params.campsiteId) //queries the database for only a SINGLE campsite
//     .then(campsite => {
//         if (campsite) {
//             campsite.comments.push(req.body);
//             campsite.save()
//             .then(campsite => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(campsite);
//             })
//             .catch(err => next(err));
//         } else {
//             err = new Error(`Campsite ${req.params.campsiteId} not found`);
//             err.status = 404;
//             return next(err);   //next(err) passes the error to the Express error handling mechanism
//         }
//     })
//     .catch(err => next(err));
// })                                                              
// .put((req, res) => {    //PUT isn't allowed on campsites path
//     res.statusCode = 403;
//     res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
// })
// .delete((req, res, next) => {   //requesting to delete ALL campsites.
//     Campsite.findById(req.params.campsiteId) //queries the database for only a SINGLE campsite
//     .then(campsite => {
//         if (campsite) {
//             for (let i = (campsite.comments.length-1); i >= 0; i--) {
//                 campsite.comments.id(campsite.comments[i]._id).remove();
//             }
//             campsite.save()
//             .then(campsite => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(campsite);
//             })
//             .catch(err => next(err));
//         } else {
//             err = new Error(`Campsite ${req.params.campsiteId} not found`);
//             err.status = 404;
//             return next(err);   //next(err) passes the error to the Express error handling mechanism
//         }     // Sends the 'response' back.
//     })
//     .catch(err => next(err));
// });


//     // GET did not respond how it was shown in the video //

// campsiteRouter.route('/:campsiteId/comments/:commentId')
// .get((req, res, next) => {  // 'next' is passed in for error handling.
//     Campsite.findById(req.params.campsiteId) //queries the database for only a SINGLE campsite
//     .then(campsite => {
//         if (campsite && campsite.comments.id(req.params.commentId)) {   //checks if this is a non-null, truthy value
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(campsite.comments.id(req.params.commentsId));
//         } else if (!campsite) {
//             err = new Error(`Campsite ${req.params.campsiteId} not found`);
//             err.status = 404;
//             return next(err);
//         } else {
//             err = new Error(`Comment ${req.params.commentId} not found`);
//             err.status = 404;
//             return next(err);   //next(err) passes the error to the Express error handling mechanism
//         }
//     })
//     .catch(err => next(err));
// })
// .post((req, res) => {
//     res.statusCode = 403
//     res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`)
// })                                                              
// .put((req, res, next) => {
//     Campsite.findById(req.params.campsiteId) //queries the database for only a SINGLE campsite
//     .then(campsite => {
//         if (campsite && campsite.comments.id(req.params.commentId)) {             //checks if this is a non-null, truthy value
//             if (req.body.rating) {
//                 campsite.comments.id(req.params.commentId).rating = req.body.rating;
//             }
//             if (req.body.text) {
//                 campsite.comments.id(req.params.commentId).text = req.body.text;
//             }
//             campsite.save()
//             .then(campsite => {
//                 res.statusCode = 200;
//                 res.setHeader = ('Content-Type', 'application/json');
//                 res.json(campsite);
//             })
//             .catch(err => next(err));
//         } else if (!campsite) {
//             err = new Error(`Campsite ${req.params.campsiteId} not found`);
//             err.status = 404;
//             return next(err);
//         } else {
//             err = new Error(`Comment ${req.params.commentId} not found`);
//             err.status = 404;
//             return next(err);   //next(err) passes the error to the Express error handling mechanism
//         }
//     })
//     .catch(err => next(err));
// })
// .delete((req, res, next) => {   //requesting to delete ALL campsites.
//     Campsite.findById(req.params.campsiteId) //queries the database for only a SINGLE campsite
//     .then(campsite => {
//         if (campsite && campsite.comments.id(req.params.commentId)) {             //checks if this is a non-null, truthy value
//             campsite.comments.id(req.params.commentId).remove();
//             campsite.save()
//             .then(campsite => {
//                 res.statusCode = 200;
//                 res.setHeader = ('Content-Type', 'application/json');
//                 res.json(campsite);
//             })
//             .catch(err => next(err));
//         } else if (!campsite) {
//             err = new Error(`Campsite ${req.params.campsiteId} not found`);
//             err.status = 404;
//             return next(err);
//         } else {
//             err = new Error(`Comment ${req.params.commentId} not found`);
//             err.status = 404;
//             return next(err);   //next(err) passes the error to the Express error handling mechanism
//         }     // Sends the 'response' back.
//     })
//     .catch(err => next(err));
// });