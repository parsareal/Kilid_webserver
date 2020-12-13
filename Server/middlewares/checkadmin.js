var {User} = require('./../models/user')

var checkadmin = (req, res, next) => {
    if (req.user.userType == "admin") {
        next();
    } else {
        res.status(401).send('BAD REQUEST')
    }
//     let token = req.header('x-auth');
//     User.findBytoken(token).then((user) => {
//         if (!user) {
//             return Promise.reject()
//         }
//         req.user = user;
//         req.token = token;
//         next();
//     }).catch((e) => {
//         res.status(401).send('BAD REQUEST')
//     })
}

module.exports = {checkadmin};