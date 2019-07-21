var express = require('express');
var mysql = require('mysql')
var router = express.Router();

var bodyParser = require('body-parser');
const app = express();
// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//DB connection settings 
//NOTE : typo in newvision
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'newvisoin'
})

connection.connect(function (err) {
  if (err) throw err
  console.log('You are now connected to newvisoin database...')


  //add group API
  router.post('/api/v1/groups/add', function (req, res, next) {

    const group = req.body.group
    console.log(req.body)


    // group.name is required
    if (group.name && group.name == '') {
      return res.status(400).send({
        success: 'false',
        message: 'group name is required'
      });
    }

    let stmt = `INSERT INTO groups (name, level, time, status, commited_lessons, starting_date, finishing_date, remarks, teacher1, teacher2 ) VALUES (?,?,?,?,?,DATE(?), DATE(?) ,?,?,?)`;
    let values = [group.name.toLowerCase(),
    group.level.toLowerCase(),
    group.time.toLowerCase(),
    group.status.toLowerCase(),
    group.numberOfLessons,
    group.startingDate,
    group.finishingDate,
    group.remarks.toLowerCase(),
    group.teacher1.toLowerCase(),
    group.teacher2.toLowerCase(),
    ];

    connection.query(stmt, values, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'group did not added successfully',
          err,
        });
      }

      console.log('resulsts = ' + results)

      group['id'] = results.insertId

      return res.status(200).send({
        success: 'true',
        message: 'group added successfully',
        group,
      })


    });
  })





  // fetch groups matching filters  
  router.get('/api/v1/groups/', function (req, res, next) {

    // const id = parseInt(req.params.id, 10);
    const filters = req.body

    console.log(req.body)

    let query = 'SELECT * FROM groups WHERE 1 '

    if (filters.id && filters.id != '') query += 'AND id=\'' + filters.id + '\''
    if (filters.name && filters.name != '') query += ' And name like \'%' + filters.name + '%\''
    if (filters.level && filters.level != '') query += ' And level like \'%' + filters.level + '%\''


    console.log(query)

    connection.query(query, function (err, results) {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'group does not exist',
        });
      }

      console.log(results)

      results = results.map((group) => {
        return {
          id: group.id,
          name: group.name,
          level: group.level,
          status: group.status,
          teacher: group.teacher1,
          teacher2: group.teacher2,
          startDate: group.starting_date,
          endDate: group.finishing_date,
          time: group.time,
          commitLessons: group.commited_lessons,
          accumulatedLessons:0
        }
      })

      return res.status(200).send({
        success: 'true',
        message: 'group retrieved successfully',
        results,
      })

    })
  })

  
  // fetch active and potential groups filters  
  router.get('/active_potential/fetch/', function (req, res, next) {

    
    let query = 'SELECT * FROM groups WHERE status=\'active\' OR status=\'potential\''

    connection.query(query, function (err, results) {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'group does not exist',
        });
      }

      results = results.map((group) => {
        return {
          id: group.id,
          name: group.name,
          level: group.level,
          status: group.status,
          teacher: group.teacher1,
          teacher2: group.teacher2,
          startDate: group.starting_date,
          endDate: group.finishing_date,
          time: group.time,
          commitLessons: group.commited_lessons,
          accumulatedLessons:0,
          remarks: group.remarks,
        }
      })

      return res.status(200).send({
        success: 'true',
        message: 'group retrieved successfully',
        results,
      })

    })
  })



})
module.exports = router;
