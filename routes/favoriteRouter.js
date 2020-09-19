const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

var authenticate = require('../authenticate');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .populate('dishes.comments.author')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites.length==0? null: favorites[0]);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorites) => {
        if(favorites.length != 0){
            let newDishes = [];
            req.body.forEach(el => {
                if(favorites[0].dishes.indexOf(Object.keys(el)[0]) == -1)
                    newDishes.push(Object.keys(el)[0]);
            })
            favorites[0].dishes =  [...(favorites[0].dishes), ...newDishes];
            favorites[0].save();

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites[0]);
        } else {
            let fav = {};
            fav.user = req.user;
            fav.dishes = Object.values(req.body)
            Favorites.create(fav)
            .then((fav) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorites) => {
        if(favorites.length != 0){
            console.log(favorites);
            favorites[0].dishes = [...(favorites[0].dishes), ...([req.params.dishId].filter(el => (favorites[0].dishes).indexOf(el) == -1))];
            favorites[0].save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites[0]);
        } else {
            let fav = {};
            fav.user = req.user;
            fav.dishes = [req.params.dishId];
            Favorites.create(fav)
            .then((fav) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorites) => {
        if(favorites){
            favorites[0].dishes = favorites[0].dishes.filter( dish => dish._id != req.params.dishId);
            favorites[0].save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites[0]);
        } else {
            var err = new Error("Can't find dish to be deleted");
            next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;