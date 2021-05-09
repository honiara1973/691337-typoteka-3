'use strict';

const axios = require(`axios`);
const {getData, renderError, changeDateView} = require(`../../utils`);
const {URL} = require(`../../constants`);
const {getLogger} = require(`../../logger`);

const logger = getLogger();

module.exports.getArticles = async (req, res) => {
  try {
    const currentPage = req.query.page;
    const categories = await getData(`${URL}/categories`);
    const data = await getData(`${URL}/articles/?page=${currentPage}`);
    data.articles.forEach((it) => {
      it.createdDate = changeDateView(it.createdDate);
    });
    const {avatar, userName, role} = req.cookies;
    return res.render(`main/main`, {
      articles: data.articles,
      view: data.pagesToView,
      current: data.currentPage,
      categories,
      user: {
        avatar,
        userName,
        role
      },
    });
  } catch (err) {
    return renderError(err.response.status, res);
  }
};

module.exports.getMatchedArticles = async (req, res) => {
  try {
    const searchString = req.query.search;
    const matchedArticles = await getData(`${URL}/search?query=${encodeURI(searchString)}`);
    matchedArticles.forEach((it) => {
      it.createdDate = changeDateView(it.createdDate);
    });
    return res.render(`main/search`, {data: matchedArticles, query: searchString});
  } catch (err) {
    return renderError(err.response.status, res);
  }
};

module.exports.getRegisterForm = async (req, res) => {
  try {
    return res.render(`main/sign-up`, {
      data: {},
      csrf: req.csrfToken(),
    });
  } catch (err) {
    return renderError(err.response.status, res);
  }
};

module.exports.getLoginForm = async (req, res) => {
  try {
    return res.render(`main/login`, {
      data: {},
      csrf: req.csrfToken(),
    });
  } catch (err) {
    return renderError(err.response.status, res);
  }
};

module.exports.addNewReader = async (req, res) => {
  const reader = {
    email: req.body.email,
    firstname: req.body.name,
    lastname: req.body.surname,
    pass: req.body.password,
    repeatPass: req.body[`repeat-password`],
    avatar: req.file ? req.file.filename : ``
  };

  try {
    await axios.post(`${URL}/user`, reader);
    return res.redirect(`/login`);
  } catch (err) {
    logger.error(`Error: ${err}`);
    const errorsList = err.response.data;
    return res.render(`main/sign-up`, {
      errorsList,
      data: reader
    });
  }
};

module.exports.authenticateReader = async (req, res) => {
  const reader = {
    email: req.body.email,
    pass: req.body.password
  };

  try {
    const response = await axios.post(`${URL}/user/login`, reader);
    const {accessToken, refreshToken} = response.data;
    const {id, role, firstname, lastname, avatar} = response.data.reader;
    await res.cookie(`accessToken`, `${accessToken}`);
    await res.cookie(`refreshToken`, `${refreshToken}`);
    await res.cookie(`role`, `${role}`);
    await res.cookie(`readerId`, `${id}`);

    if (role === `reader`) {
      await res.cookie(`userName`, `${firstname} ${lastname}`);
      await res.cookie(`avatar`, `${avatar}`);
    }

    return res.redirect(`/`);
  } catch (err) {
    logger.error(`Error: ${err}`);
    const loginError = err.response.data[0].loginError;
    const passError = err.response.data[0].passError;
    return res.render(`main/login`, {
      loginError,
      passError,
      data: reader
    });
  }
};

module.exports.logout = async (req, res) => {
  const {refreshToken} = req.cookies;

  try {
    await axios.post(`${URL}/user/logout`, {refreshToken});
    await res.clearCookie(`accessToken`);
    await res.clearCookie(`refreshToken`);
    await res.clearCookie(`role`);
    await res.clearCookie(`id`);
    await res.clearCookie(`avatar`);
    await res.clearCookie(`userName`);
    return res.redirect(`/login`);
  } catch (err) {
    return renderError(err.response.status, res);
  }
};
