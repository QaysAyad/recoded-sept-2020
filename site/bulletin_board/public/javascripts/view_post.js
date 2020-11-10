// UI Elements

var thumbs_up_on = $("#thumbs_up_on");
var thumbs_up_off = $("#thumbs_up_off");

/**
 * When the "Thumbs Up - ON" button is pressed, we call into application logic
 * to remove the upvote. We assume this call succeeds.
 */
thumbs_up_on.on("click", function(event){
  thumbs_up_off.show();
  thumbs_up_on.hide();

  var id = event.originalEvent.currentTarget.getAttribute("data-postid");
  upvote(id, false);

  event.preventDefault();
});

/**
 * When the "Thumbs Up - OFF" button is pressed, we call into application logic
 * to add an upvote. We assume this call succeeds.
 */
thumbs_up_off.on("click", function(event){
  thumbs_up_off.hide();
  thumbs_up_on.show();

  var id = event.originalEvent.currentTarget.getAttribute("data-postid");
  upvote(id, true);

  event.preventDefault();
});


// UI Elements
var alert = $("#alert");
var alert_heading = $("alert_heading");
var alert_message = $("alert_message");

var reply_form = $("#reply_form");
var post_reply = $("#post_reply");
var reply_error = $("#reply_error");
var reply_error_message = $("#reply_error_message");
/**
 * When the "Reply Post" form is submitted we call into our application logic
 * to reply the post, and then we reload the page
 */
reply_form.submit((event) => {
  var message = post_reply.val();

  var parent_post_id = event.originalEvent.currentTarget.getAttribute("data-postid");

  // Hide any previous error
  reply_error.hide();

  create_post(undefined, message, parent_post_id, function(result){
    if (result.success) {
      document.location = document.location;
    } else {
      reply_error_message.text(result.error_message);
      reply_error.show();
    }
  });

  event.preventDefault();
});