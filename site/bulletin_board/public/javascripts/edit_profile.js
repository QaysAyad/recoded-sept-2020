// UI Elements

var edit_form = $("#edit_form");
var edit_firstname = $("#inputfirstname");
var edit_lastname = $("#inputlastname");
var edit_birthdate = $("#inputbirthdate");
var edit_bio = $("#inputbio");
var edit_success = $("#edit_message");
var edit_danger = $("#edit_danger");

// edit profile
edit_form.submit((event) => {
  var firstname = edit_firstname.val();
  var lastname = edit_lastname.val();
  var birthdate = new Date(edit_birthdate.val()).getTime();
  var bio = edit_bio.val();

  put_user(firstname, lastname, birthdate, bio, function (result) {
    if (result.success) {
      edit_success.show();
      setTimeout(function () {
        edit_success.hide();
      }, 3000);
      return;
    }
    edit_danger.show();
    setTimeout(function () {
      edit_danger.hide();
    }, 3000);
  });

  event.preventDefault();
});

var password_modal = $('#password_modal');
var password_form = $("#password_form");
var input_current_password = $("#input_current_password");
var input_new_password = $("#input_new_password");
var input_confirm_new_password = $("#input_confirm_new_password");
var password_danger = $("#password_danger");


// edit password 
password_form.submit((event) => {
  var current_password = input_current_password.val();
  var new_password = input_new_password.val();
  var confirm_new_password = input_confirm_new_password.val();
  if (new_password !== confirm_new_password) {
    show_password_error('Make sure to write the new passwords fileds match')
  } else {
    change_password(current_password, new_password, function (result) {
      if (result.success) {
        password_form.trigger("reset");
        password_modal.modal('hide')
        edit_success.show();
        setTimeout(function () {
          edit_success.hide();
        }, 3000);
        return;
      }
      show_password_error(result.error_message)
 
    });
  }
  event.preventDefault();
});

function show_password_error(text) {
  password_danger.text(text);
  password_danger.show();
  setTimeout(function () {
    password_danger.hide();
    password_danger.text('Error');
  }, 3000);
}