const express = require("express");
const router = express.Router();
const AppError = require("../AppError");
const {isLoggedIn} = require("../config/database");
const {body, validationResult} = require("express-validator")

module.exports = (Comment, Shelter, User) => {

//Route to post a comment
router.post("/:shelterId", isLoggedIn, [body("comment").trim().escape().notEmpty().withMessage("Comment field can not be empty!")], async (req, res) => {
    const errors = validationResult(req);
    const { shelterId } = req.params;

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Send error response and exit
    }

    const { comment } = req.body;

    let commentObj = {
        postedBy: req.user._id,
        shelterId: shelterId,
        text: comment,
        parentComment: null,
        replies: []
    };

    try {
        await new Comment(commentObj).save();
        //res.json({ message: "Comment posted successfully" }); // Send success response
        res.redirect(`/shelters/${shelterId}`); // Redirect to the shelter page after posting the comment
    } catch (er) {
        console.log(er.message);
        res.status(500).json({ message: "Failed to post comment" }); // Handle server error
    }
});


// Route to post a reply in a particular comment
router.post(
  "/:commentId/reply/:shelterId",
  isLoggedIn,
  [body("reply").trim().escape().notEmpty().withMessage("Reply text cannot be empty!")],
  async (req, res) => {
    const { commentId, shelterId } = req.params;
    const errors = validationResult(req);
    const { reply } = req.body;

    if (errors.isEmpty()) {
      const replyObj = {
        postedBy: req.user._id,
        shelterId: shelterId,
        text: reply,
        parentComment: commentId,
      };

      try {
        const newReply = await new Comment(replyObj).save();
        await Comment.findOneAndUpdate(
          { _id: commentId, shelterId },
          { $push: { replies: newReply._id } }
        );
        // res.json({
        //   message: "Reply posted successfully",
        //   commentId: commentId,
        //   shelterId: shelterId,
        // });
        res.redirect(`/shelters/${shelterId}`); // Redirect to the shelter page after posting the reply
      } catch (er) {
        console.error(er.message);
        res.status(500).json({ message: "Failed to post reply" });
      }
    } else {
      res.status(400).json({ errors: errors.array() });
    }
  }
);




//function to delete comment recursively
const deleteCommentRecursively = async (commentId) => {
  // Find the comment first
  const comment = await Comment.findById(commentId);

  if (!comment) return;

  // For each reply of this comment
  for (const reply of comment.replies) {
    // Recursively delete replies of this reply
    await deleteCommentRecursively(reply._id);
  }

  // Delete this comment after all replies are deleted
  await Comment.deleteOne({ _id: commentId });
}



//Route to delete comment
router.delete("/:commentId/delete/:shelterId", isLoggedIn, async(req,res)=>{
    const {commentId, shelterId} = req.params;
try{
    const comment = await Comment.findOne({_id:commentId, shelterId}).lean()
 if(comment && comment.postedBy.toString() === req.user._id.toString()){
            // delete comment and all its replies recursively
      await deleteCommentRecursively(commentId);
    }else{
        res.json({message:"failed to delete comment"})
    }
    res.json({message:"Comment deleted successfully"})
}catch(er){
    console.log(er.message)
}

});


//get all comments with replies for a specific shelter
function buildCommentTree(comments, parentId = null) {
  return comments
    .filter(c => (c.parentComment ? c.parentComment.toString() : null) === (parentId ? parentId.toString() : null))
    .map(c => ({
      ...c, 
      replies: buildCommentTree(comments, c._id)
    }));
}

// Route to get all comments for a specific shelter
router.get("/:shelterId", async (req, res) => {
  const { shelterId } = req.params;

  try {
        // Find comments for the shelter and populate the 'postedBy' field
    const comments = await Comment.find({ shelterId })
      .populate("postedBy", "firstName email") // Populate 'postedBy' with 'firstName' and 'email' fields from the User model
      .lean();
    const commentTree = buildCommentTree(comments);
    res.json(commentTree);
    //res.render("comments.ejs", { comments: commentTree });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to retrieve comments" });
  }
});




  return router;
};