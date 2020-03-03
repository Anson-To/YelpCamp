var express = require("express");
var router = express.Router();
var campgrounds = require("../v3/models/campground");
var methodOverride = require("method-override");

//index
router.get("/campgrounds", function(req, res) {
    campgrounds.find({}, function(err, Allcampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {
                campgrounds: Allcampgrounds,
                currentUser: req.user
            });
        }
    });
    // res.render("camp", { campgrounds: campgrounds });
});

//create
router.post("/campgrounds", isLoggedIn, function(req, res) {
    //get data from form and add it to the array
    var name = req.body.name;
    var image = req.body.imageUrl;
    var des = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCamp = {
        name: name,
        image: image,
        description: des,
        author: author
    };
    //Save the newCamp into DB instead
    campgrounds.create(newCamp, function(err, newcampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
    //redirect to its page
});
//new
router.get("/campgrounds/new", isLoggedIn, function(req, res) {
    res.render("campgrounds/form");
});
//show.ejs
//find campgrounds with its id
router.get("/campgrounds/:id", function(req, res) {
    campgrounds
        .findById(req.params.id)
        .populate("comment")
        .exec(function(err, foundCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                // render shoe yemplate with that campgrounds
                res.render("campgrounds/show", {
                    campgrounds: foundCampgrounds
                });
            }
        });
});

// edit
router.get("/campgrounds/:id/edit", checkcampgroundsOwnership, function(
    req,
    res
) {
    campgrounds.findById(req.params.id, function(err, foundcampgrounds) {
        if (foundcampgrounds.author.id.equals(req.user._id)) {
            res.render("campgrounds/edit", {
                campgrounds: foundcampgrounds
            });
        }
    });
});
// update
router.put("/campgrounds/:id", checkcampgroundsOwnership, function(req, res) {
    campgrounds.findByIdAndUpdate(req.params.id, req.body.campgrounds, function(
        err,
        updatedCamp
    ) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});
// destroy campground route
router.delete("/campgrounds/:id", checkcampgroundsOwnership, function(
    req,
    res
) {
    campgrounds.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        }
        res.redirect("/campgrounds");
    });
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkcampgroundsOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        campgrounds.findById(req.params.id, function(err, foundcampgrounds) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundcampgrounds.author.id.equals(req.user._id)) {
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
