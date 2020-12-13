const express = require('express');
var bodyParser = require('body-parser')
var {mongoose} = require('./db/mongoose.js')
var {User} = require('./models/user.js')
var {House} = require('./models/house.js')
var {Comment} = require('./models/comment.js')


var {authenticate} = require('./middlewares/authenticate')
var {checkadmin} = require('./middlewares/checkadmin')

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb (null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb (null, new Date().toISOString() + file.originalname);
    }
})

// const upload = multer({dest: 'uploads/'});
const upload = multer({storage: storage});


var cors = require('cors');
// var busboy = require('connect-busboy');
let _ = require('lodash');
var app = express();

var corsOptions = {
    allowedHeaders: ['myauth, Content-Type, Accept, houseId, locationentered, housetitle'], // some legacy browsers (IE11, various SmartTVs) choke on 204
    exposedHeaders: ['myauth, Content-Type, Accept, houseId, locationentered, housetitle']
}

app.use(express.static('uploads'))
app.use(cors(corsOptions))
app.use(bodyParser.json())
// app.use(busboy())


app.post('/register', (req, res) => {
    body = _.pick(req.body.data, ['username', 'password', 'phone', 'userType'])    
    let newUser = new User(body)
    newUser.save().then(() => {
        let token = newUser.generateAuthToken();
        res.header('myauth', token).send(newUser)
    }).catch((e) => {
        res.status(400).send('BAD REQUEST')
    })
})

app.post('/login', async (req, res) => {
    console.log(req.body.data);
    body = _.pick(req.body.data, ['username', 'password'])
    let user = await User.findByCredentials(body.username, body.password);
    if (!user) {
        res.status(400).send('BAD REQUEST')
    }
    else {
        let token = user.generateAuthToken();
        // res.header('myauth', token).send(user);
        res.header('myauth', token).send(user.userType);        
        // res.send(user);
    }
})

app.post('/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((e) => {
        res.status(400).send();
    })
})


app.post('/user/addEmail', authenticate, async (req, res) => {
    // console.log(req.body);
    let user = await req.user.addEmail(req.body.data.email);
    if (!user) {
        res.send(400).send()
    } else {
        res.send(user)
    }
})

app.post('/user/addHouse', authenticate, async (req, res) => {
    let houseProp = _.pick(req.body.data, ['title', 'price', 'houseType', 'bedrooms', 'area', 'location', 'phone', 'parkings', 'pics'])
    houseProp.estate = req.user.username
    // image = {}
    // image.pic = req.body.data.file
    // image.contentType = 'image/png'
    // houseProp.pics = []
    // houseProp.pics.push(image)
    console.log(houseProp);
    let house = new House(houseProp)
    try {
        let newHouse = await house.save();
        res.send(newHouse)
    } catch (error) {
        res.status(400).send()
    }
})

app.get('/user/getHouses', authenticate, async (req, res) => {
    try {
        let houses;
        if (req.user.userType == "normal") {
            houses = await House.find({estate: req.user.username})
        }
        else {
            houses = await House.find()
        }
        res.send(houses)    
    } catch (error) {        
        res.status(400).send()
    }
})

app.post('/user/addBookmark', authenticate, async (req, res) => {
    try {
        let house;
        if (req.user.userType == "normal") {
            house = await House.findOneAndUpdate({estate: req.user.username, title: req.body.data.title}, {star: true})
        } else {
            house = await House.findOneAndUpdate({title: req.body.data.title}, {star: true})
        }
        if (!house) {
            res.status(400).send()
        }
        else {
            res.send(house)    
        }
    } catch (error) {        
        res.status(400).send()
    }
})

app.get('/user/getBookmarks', authenticate, async (req, res) => {
    try {
        let houses = await House.find({estate: req.user.username, star: true})
        res.send(houses)
    } catch (error) {        
        res.status(400).send()
    }
})


app.get('/getHouses', async (req, res) => {
    try {
        let houses = await House.find()
        res.send(houses)    
    } catch (error) {        
        res.status(400).send()
    }
})

// app.get('/test1', async (req, res) => {
    // console.log(req);
    // let houseId = req.headers.houseId
    // console.log(houseId);
    // try {
    //     let house = await House.findById(houseId)
    //     res.send(house)    
    // } catch (error) {        
    //     res.status(400).send()
    // }
// })

app.get('/admin/getUsers', authenticate, checkadmin, async (req, res) => {
    try {
        let users = await User.find({userType: "normal"})
        res.send(users)    
    } catch (error) {        
        res.status(400).send()
    }
})

app.post('/admin/deleteUser', authenticate, checkadmin, async (req, res) => {
    console.log(req.body.data);
    try {
        let deletedUser = await User.findOneAndRemove({username: req.body.data.username})
        if (!deletedUser) {
            res.status(404).send()            
        } else {
            res.send(deletedUser)
        }     
    } catch (error) {
        res.status(400).send()
    }
})

app.post('/admin/upgradeUser', authenticate, checkadmin, async (req, res) => {
    try {
        // console.log(req.body.data.username);
        let upgradedUser = await User.findOneAndUpdate({username: req.body.data.username}, {
            $set: {
                userType: "admin"
            }
        })
        if (!upgradedUser){
            res.status(404).send()            
        } else {
            res.send(upgradedUser)
        }
    } catch (error) {
        res.status(400).send()        
    }
})

app.get('/getHouse', async (req, res) => {
    console.log(req);
    // console.log(req.body.data);
    let houseId = req.headers.houseid
    console.log(houseId);
    try {
        let house = await House.findById(houseId)
        if (!house) {
            res.status(400).send()
        } else {
            res.send(house)
        }
    } catch (error) {        
        res.status(400).send()
    }
})

app.post('/comment', async (req, res) => {
    // console.log(req);
    // console.log(req.body.data);
    // let houseId = req.headers.houseid
    let commentBody = _.pick(req.body.data, ['statement', 'houseid'])
    console.log(commentBody);
    // console.log(houseId);
    let comment = new Comment(commentBody)
    try {
        let newComment = await comment.save();
        res.send(newComment)
    } catch (error) {
        res.status(400).send()
    }
})

app.get('/getComments', async (req, res) => {
    // console.log(req);
    // console.log(req.body.data);
    let houseId = req.headers.houseid;
    console.log(houseId);
    // let comment = new Comment(commentBody)
    let comments;
    try {
        comments = await Comment.find({houseid: houseId})
        // console.log(comments);
        res.send(comments)
    } catch (error) {
        res.status(400).send()
    }
})

app.post('/search', async (req, res) => {
    // console.log(req);
    // console.log(req.body.data);
    let location = req.body.data.locationentered;
    console.log(location);
    // let comment = new Comment(commentBody)
    let houses;
    try {
        houses = await House.find({location: location})
        console.log(houses);
        res.send(houses)
    } catch (error) {
        res.status(400).send()
    }
})


app.post('/user/upload', authenticate, upload.single('houseImage'), async (req, res) => {
    let houseId = req.headers.houseid;
    // console.log(req.file);
    // console.log(houseId);

    if (!req.file) {
        res.status(400).send()
    } else {
        let house = await House.findById(houseId)
        let filteredPath = req.file.path.replace('uploads/', '')
        house.pics.push(filteredPath)
        let newHouse = house.save()
        res.send(newHouse)
    }
})


app.post('/user/getSpecialHouse', authenticate, async (req, res) => {
    // let houseId = req.headers.houseid;
    // console.log(req.file);
    // console.log(houseId);
    try {
        let house = await House.findOne({estate: req.user.username, title: req.body.data.housetitle})
        if (!house) {
            res.status(400).send()
        } else {
            res.send(house._id)
        }
    } catch (error) {
        res.status(400).send()        
    }
})

app.listen(3000, (e) => {
    console.log('Started on port 3000...');
});