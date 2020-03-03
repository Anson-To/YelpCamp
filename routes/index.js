var express = require("express");
var router = express.Router();
var user = require("../v3/models/user");
var passport = require("passport");

router.get("/", function(req, res) {
    res.render("landing");
});
// ====================================
// AUTH ROUTE
// ====================================
router.get("/register", function(req, res) {
    res.render("register");
});
// handling sign up
router.post("/register", function(req, res) {
    user.register(
        new user({ username: req.body.username }),
        req.body.password,
        function(err, user) {
            if (err) {
                console.log(err);
                console.log("error shit");
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function() {
                res.redirect("/campgrounds");
            });
        }
    );
});

// Login
// Render login in form
router.get("/login", function(req, res) {
    res.render("login");
});
// Login logic
// middleware
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureREdirect: "/login"
    }),
    function(req, res) {}
);

// log out route
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
module.exports = router;
