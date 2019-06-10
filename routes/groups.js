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

    const group = req.body
    console.log(req.body)


    // group.name is required
    if (group.name && group.name == '') {
      return res.status(400).send({
        success: 'false',
        message: 'group name is required'
      });
    }

    let stmt = `INSERT INTO groups (name, level, commited_lessons) VALUES (?,?,?)`;
    let values = [group.name, group.level, group.commited_lessons];

    connection.query(stmt, values, (err, results, fields) => {

      // // get inserted id
      // console.log('student Id:' + results.insertId);

      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'group did not added successfully',
          err,
        });
      }

      console.log('resulsts = ' + results)

      return res.status(200).send({
        success: 'true',
        message: 'group added successfully',
        results,
      })


    });
  })





  // fetch groups matching filters  
  router.post('/api/v1/groups/', function (req, res, next) {

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

      console.log('resulsts = ' + results)

      return res.status(200).send({
        success: 'true',
        message: 'group retrieved successfully',
        results,
      })

    })
  })


})
module.exports = router;
