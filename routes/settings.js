var express = require('express');
var router = express.Router();

let settings = {
    studentStatus: ['Active', 'Finish', 'Freez'],
    studentSpecialty :['IT', 'Medicine', 'Journalism'],
    certificationStatus: ['given', 'not yet',],
    groupStatus: ['Potential','Active', 'Finish',],
    groupLevel: ['א', 'ב', 'ג', 'ד'],
    groupTime: ['morning', 'noon', 'evening'],
    groupTeacher: ['Shoshi', 'Mira', 'Zeev'],
}

router.get('/', function(req, res, next) {
    res.send(settings);
});
module.exports = router;