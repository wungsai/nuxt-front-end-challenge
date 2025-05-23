const User = required('../models/User')

var user = new User({
  id : req.body.id,
  first_name : req.body.first_name,
  last_name : req.body.last_name,
  email : req.body.email,
  avatar : req.body.avatar
})

module.exports.user = function(req,res){
  res.json({user: decoded})
}
