var express = require('express');
var router = express.Router();

var datasource = require('../data/posts.js');

/** EJS: A list of the recent posts on the Bulletin Board. */
router.get('/recent', (req, res, next) => {
  datasource.recent(req.user.id, (posts) => {
    res.render('post_list', { id: 'recent', title: 'Recent Posts', posts: posts });
  });
});

/** EJS: A list of the trending posts on the Bulletin Board. */
router.get('/trending', (req, res, next) => {
  datasource.trending(req.user.id, (posts) => {
    res.render('post_list', { id: 'trending', title: 'Trending Posts', posts: posts });
  });
});

/** EJS: Form for creating a new post on the Bulletin Board. */
router.get('/create', (req, res, next) => {
  res.render('create_post');
});

/** EJS: The detailed view of a single post. */
router.get('/:id', (req, res, next) => {
  datasource.retrieve(req.params['id'], req.user.id, (post) => {
    datasource.replies(req.params['id'], (posts) => {
      res.render('view_post', { title: post.title, post: post,posts:posts });
    });
  });
});

/**
 * The "Create Post" endpoint which accepts JSON to create a post.
 *
 * {
 *   title: string,
 *   message: string
 * }
 *
 * {
 *   success: boolean,
 *   redirect_uri: string,
 *   error_message: string
 * }
 */
router.post('/', function(req, res, next) {
  var post = req.body;

  datasource.create(post, req.user, (result) => {
    if (!result.success) {
      res.status(400);
    }
    var result = {
      success: result.success,
      redirect_uri: "/posts/" + result.post_id,
      error_message: result.error_message
    };
    res.send(result);
  });
});

/**
 * The "Upvote" endpoint which accepts JSON to either "Upvote" or "De-upvote" a post.
 *
 * {
 *   upvoted: boolean
 * }
 */
router.post('/:id/upvotes/', (req, res, next) => {
  var vote = req.body;

  datasource.upvote(req.params['id'], req.user, vote, () => {
    res.send();
  });
});

module.exports = router;
