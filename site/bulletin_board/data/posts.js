var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./data/database.db');

var posts = {}

/**
 * Retrieve a single post.
 * {
 *   id: number,
 *   title: string,
 *   author: string,
 *   date: string,
 *   liked: boolean,
 *   url: string,
 *   body: string
 * }
 */
posts.retrieve = (id, userId, callback) => {
  var sql = `
    SELECT
      Posts.id AS id,
      Posts.title,
      Posts.timestamp,
      Author.username AS author,
      Posts.body AS body,
      PostUpvotes.post_id IS NOT NULL AS liked,
      '/posts/' + Posts.id AS url
    FROM
      Posts
      INNER JOIN Users AS Author ON Posts.user_id = Author.id
      LEFT OUTER JOIN PostUpvotes ON PostUpvotes.post_id = Posts.id AND PostUpvotes.user_id = ?
    WHERE
      Posts.id = ?
    ORDER BY
      timestamp DESC
  `;
  db.get(sql, [ userId, id ], (err, row) => {
    if (err || !row) {
      callback(null);
      return;
    }
    callback({
      id: row.id,
      title: row.title,
      author: row.author,
      liked: row.liked,
      url: "/posts/" + id,
      body: row.body,
      timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
    });
  });
};

/**
 * Retrieves a list of post excerpts for the most recent posts.
 * {
 *   title: string,
 *   author: string,
 *   date: string,
 *   liked: boolean,
 *   url: string,
 *   excerpt: string
 * }
 */
posts.recent = (userId, callback) => {
  var sql = `
    SELECT
      Posts.id AS id,
      Posts.title,
      Posts.timestamp,
      Author.username AS author,
      PostUpvotes.post_id IS NOT NULL AS liked,
      '/posts/' + Posts.id AS url,
      substr(Posts.body, 0, 140) AS excerpt
    FROM
      Posts
      INNER JOIN Users AS Author ON Posts.user_id = Author.id
      LEFT OUTER JOIN PostUpvotes ON PostUpvotes.post_id = Posts.id AND PostUpvotes.user_id = ?
    WHERE
      Posts.parent_post_id IS NULL
    ORDER BY
      Posts.id DESC
    LIMIT 100
  `;
  db.all(sql, [ userId ], (err, rows) => {
    if (err) {
      callback([]);
      return;
    }
    rows.forEach(e => e.timestamp = e.timestamp ? new Date(e.timestamp) : undefined);
    callback(rows);
  });
};

/**
 * Retrieves a list of post excerpts for the trending posts.
 * {
 *   title: string,
 *   author: string,
 *   date: string,
 *   liked: boolean,
 *   url: string,
 *   excerpt: string
 * }
 */
posts.trending = (userId, callback) => {
  // TODO: Implement trending sort
  var timestamp = new Date().getTime();
  var secondsPerMinute = 60;
  var minutesPerHour = 60;
  var hoursPerDay = 24;
  var thirtyDaysInSeconds = 30 * hoursPerDay * minutesPerHour * secondsPerMinute;
  var thirtyDaysInMilliSeconds = thirtyDaysInSeconds * 1000;
  var thirtyDaysAgo = (timestamp - thirtyDaysInMilliSeconds);
  var sql = `
    SELECT
      Posts.id AS id,
      Posts.title,
      Posts.timestamp,
      Author.username AS author,
      PostUpvotes.post_id IS NOT NULL AS liked,
      '/posts/' + Posts.id AS url,
      substr(Posts.body, 0, 140) AS excerpt
    FROM
      Posts
      INNER JOIN Users AS Author ON Posts.user_id = Author.id
      LEFT OUTER JOIN PostUpvotes ON PostUpvotes.post_id = Posts.id AND PostUpvotes.user_id = ?
    WHERE
      Posts.parent_post_id IS NULL AND timestamp > ?
    ORDER BY
      Posts.votes DESC
    LIMIT 100
  `;
  db.all(sql, [userId, thirtyDaysAgo], (err, rows) => {
    if (err) {
      callback([]);
      return;
    }
    rows.forEach(e => e.timestamp = e.timestamp ? new Date(e.timestamp) : undefined);
    callback(rows);
  });
};

/**
 * Creates a new Post with the given title and message.
 *
 * The callback takes a single parameter:
 * {
 *   success: boolean,
 *   post_id: number,
 *   error_message: string
 * }
 * redirect_uri will always be defined when success is true.
 * error_message will always be defined when success is false.
 * redirect_uri must only be used when success is true.
 */
posts.create = (post, user, callback) => {
  var success = true;
  var error_message = "";
  if (post.parent_post_id) {
    post.title = "Reply to:"
  } else if (post.title.trim().length < 10) {
     success = false;
    error_message = "A post title is required (minimum 10 characters).";
  } else if (post.message.trim().length < 20) {
     success = false;
    error_message = "A post message is required (minimum 20 characters).";
  }

  if (!success) {
    var result = {
      success: false,
      error_message: error_message
    };
    return callback(result);
  }

  // var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  // var date = new Date();
  var sql ='INSERT INTO posts (title, body, user_id, parent_post_id, timestamp) VALUES (?, ?, ?, ?, ?)'
  // var now = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  var timestamp = new Date().getTime();
  var params =[post.title, post.message, user.id, post.parent_post_id, timestamp]
  db.run(sql, params, function (err, result) {
    var success = !err;
    var result = {
      success: success,
      error_message: "An unknown error occurred.",
      post_id: this.lastID,
    };
    return callback(result);
  });
};

/**
 * Either upvotes or removes an upvote for the currently logged in user for the
 * Post being displayed.
 *
 * The callback takes no parameters.
 */
posts.upvote = (id, user, vote, callback) => {
  var success = true;
  var error_message = "";

  if (!success) {
    var result = {
      success: false,
      error_message: error_message
    };
    return callback(result);
  }

  var sql;
  if (vote) {
    sql ='INSERT INTO PostUpvotes (post_id, user_id) VALUES (?, ?)'
  } else {
    sql ='DELETE FROM PostUpvotes WHERE post_id = ? AND user_id = ?'
  }
  var params =[id, user.id]
  db.run(sql, params, function (err, result) {
    if (this.changes != 1) {
      return callback();
    }
    var operator = vote ? "+" : "-";
    sql ='UPDATE Posts SET vote = vote ' + operator + ' 1 WHERE post_id = ?'
    db.run(sql, [id], function (err, result) {
      callback();
    });
  });
};

module.exports = posts;

