var express = require('express');
var router = express.Router();

var datasource = require('../data/users.js')

/**
 * The "Login" endpoint.
 *
 * {
 *   username: string,
 *   password: string
 * }
 *
 * {
 *   success: boolean,
 *   redirect_uri: string,
 *   error_message: string
 * }
 */
router.post('/login', function (req, res, next) {
  var credentials = req.body;

  datasource.login(credentials, function (result) {
    if (!result || !result.success) {
      result = {
        success: false,
        error_message: result ? result.error_message : "Database error"
      }
      return res.status(403).send(result);
    }

    req.login({ id: result.user.id, username: result.user.username }, function (err) {
      if (err) {
        result = {
          success: false,
          error_message: err
        }
        return res.status(403).send(result);
      }

      result = {
        success: true,
        redirect_uri: "/posts/recent"
      }
      return res.send(result);
    });
  });
});

/**
 * The "Sign Up" endpoint.
 *
 * {
 *   username: string,
 *   password: string
 * }
 *
 * {
 *   success: boolean,
 *   redirect_uri: string,
 *   error_message: string
 * }
 */
router.post('/', (req, res, next) => {
  var credentials = req.body;

  datasource.signup(credentials, (result) => {
    if (!result.success) {
      result = {
        success: false,
        error_message: result.error_message
      }
      return res.status(400).send(result);
    }

    req.login(result.user, function (err) {
      if (err) { return next(err); }
      result = {
        success: true,
        redirect_uri: "/posts/recent"
      };
      res.send(result);
    });
  });
});

/*
 * The "Edit profile" endpoint.
 *
 * {
 *   firstname: string,
 *   lastname: string,
 *   birthdate: string,
 *   bio: string,
 * }
 *
 * {
 *   success: boolean,
 *   redirect_uri: string,
 * }
 */

router.post('/edit', (req, res, next) => {
  var profileInfo = req.body;
  datasource.setProfile(profileInfo, req.user, (success) => {
    res.send(success)
  })
});


// EJS edit profile page 
router.get('/edit', (req, res, next) => {
  datasource.profile(req.user.username, (user) => {
    res.render('edit_profile', { user: user });
  })
});

module.exports = router;
