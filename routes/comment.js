var express = require("express");
var router = express.Router();
var campgrounds = require("../v3/models/campground");
var comment = require("../v3/models/comment");
// =============================================================
// COMMENTS ROUTE
//==============================================================

// adding new comments
router.get("/campgrounds/:id/comment/new", isLoggedIn, function(req, res) {
    campgrounds.findById(req.params.id, function(err, foundCamp) {
        if (err) {
            console.log("error");
        } else {
            res.render("comments/new", { campgrounds: foundCamp });
        }
    });
});

router.post("/campgrounds/:id/comment", isLoggedIn, function(req, res) {
    // Look up campgrounds using its id
    campgrounds.findById(req.params.id, function(err, foundCamp) {
        if (err) {
            console.log("error");
            res.redirect("/campgrounds");
        } else {
            //premade comment object req.params.comment;
            comment.create(req.body.comment, function(err, comments) {
                if (err) {
                    console.log("error");
                } else {
                    //add username and id to comment
                    comments.author.username = req.user.username;
                    comments.author.id = req.user._id;
                    comments.save();
                    // Connect the comment to the campgrounds
                    foundCamp.comment.push(comments);
                    foundCamp.save();
                    // redirect
                    res.redirect("/campgrounds/" + foundCamp._id);
                }
            });
        }
    });
});
// Add in the comment edit function
router.get(
    "/campgrounds/:id/comment/:comment_id/edit",
    checkCommentOwnership,
    function(req, res) {
        comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                console.log(err);
                res.redirect("back");
            } else {
                res.render("comments/edit", {
                    campgroundId: req.params.id,
                    comment: foundComment
                });
            }
        });
    }
);
router.put(
    "/campgrounds/:id/comment/:comment_id",
    checkCommentOwnership,
    function(req, res) {
        comment.findByIdAndUpdate(
            req.params.comment_id,
            req.body.comment,
            function(err, updatedComment) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        );
    }
);

// Destroy comment
router.delete(
    "/campgrounds/:id/comment/:comment_id",
    checkCommentOwnership,
    function(req, res) {
        comment.findByIdAndRemove(req.params.comment_id, function(err) {
            if (err) {
                res.redirect("back");
            } else {
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
    }
);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // req.flash("error", "Please Login first");
    res.redirect("/login");
}
function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        comment.findById(req.params.comment_id, function(err, foundcomment) {
            if (err) {
                console.log(err);
                res.redirect("back");
            } else {
                if (foundcomment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}
module.exports = router;
//<%if(campgrounds.comment[i].author.id && campgrounds.comment[i].author.id.equals(currentUser._id)){%>
