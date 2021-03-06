'use strict';

const express = require(`express`);
const csrf = require(`csurf`);
const controller = require(`../controllers/my`);
const {authAdmin} = require(`../jwt-auth`);
const {upload} = require(`../../utils`);

const myRouter = new express.Router();
const csrfProtection = csrf({cookie: true});

myRouter.get(`/`, [csrfProtection, authAdmin], controller.getArticles);
myRouter.get(`/comments`, [csrfProtection, authAdmin], controller.getComments);
myRouter.post(`/comments/:articleId/:commentId/delete`, upload.any(), [csrfProtection, authAdmin], controller.deleteComment);

module.exports = myRouter;
