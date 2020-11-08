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
