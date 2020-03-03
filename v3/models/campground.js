var mongoose = require("mongoose");
//Schema Setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    author: {
        username: String,
        id: { type: mongoose.Schema.Types.ObjectId, ref: "ueser" }
    },
    comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }]
});
module.exports = mongoose.model("campgrounds", campgroundSchema);
// var campgrounds
