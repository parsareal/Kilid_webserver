var {User} = require('./../models/user')

var authenticate = (req, res, next) => {
    // let token = req.header('myauth');
    // console.log(req.rawHeaders.myauth);
    // let token = req.body.headers.myauth;
    console.log(req);    
    let token = req.headers.myauth;
    User.findBytoken(token).then((user) => {
        if (!user) {
            return Promise.reject()
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send('BAD REQUEST')
    })
}

module.exports = {authenticate};