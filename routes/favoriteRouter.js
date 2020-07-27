const express = require('express');
const bodyParser = require("body-parser");
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .populate('favorites.user' && 'favorites.campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            if (favorite.campsites.indexOf(favorite._id) === -1) {
                favorite.campsites.push(favorite._id);
            }
            favorite
            .save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
        })
        .catch((err) => next(err));
        } else {
        Favorite.create({
            user: req.user._id,
            campsites: req.body
        })
        .then((favorite) => {
            console.log("Favorite Has been Created: ", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
        })
        .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}/favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
      user: req.user._id,
    })
      .then((favorite) => {
        if (favorite) {
          if (favorite.campsites.includes(req.params.campsiteId)) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            favorite.campsites.splice(index, 1);
            favorite
              .save()
              .then((response) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
              })
              .catch((err) => next(err));
          } else {
            res.end("There are no favorites to delete from this user");
          }
        }
      })
      .catch((err) => next(err));
});

//  /favorites/:campsiteId

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favoriteRouter');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/plain");
              res.send("That campsite is already a favorite!");
            } else {
                favorite.campasites.push(req.params.campsiteId);
                favorite
                .save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })
                .catch((err) => next(err));
            }
        } else {
            Favorite.create({
                user: req.user._id,
                campsites: req.body
            })
            .then((favorite) => {
                console.log("Favorite Campsite Created ", favorite);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}/favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                const index = favorite.campsites.indexOf(req.params.campsiteId);
                favorite.campsites
                    .splice(index, 1)
                    favorite.save()
                    .then((response) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(response);     // Sends the 'response' back.
                    })
                    .catch((err) => next(err));
            } else {
                res.end("Favorites Page is empty!");
            }
        }
    })
    .catch(err => next(err));
});


module.exports = favoriteRouter;