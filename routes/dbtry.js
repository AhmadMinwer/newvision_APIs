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
  database: 'newvisoin',
  multipleStatements: true,   // addition #1
})

connection.connect(function (err) {
  if (err) throw err
  console.log('You are now connected to newvisoin database...')



  router.get('/try', function (req, res, next) {


    //query to fetch all active students

    // let query = 'SELECT * ' +
    //   'FROM ((student_group ' +
    //   'INNER JOIN groups ON student_group.group_id = groups.id) ' +
    //   'INNER JOIN students ON student_group.student_id = students.id) ' +
    //   'WHERE student_group.status = \'active\' '

    let query = 'select * from students; select * from Groups'

    connection.query(query, async function (err, results) {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'data retrieved successfully',
        });
      }

      console.log(results[0])
      console.log(results[1])
      

      return res.status(200).send({
        success: 'true',
        message: 'student retrieved successfully',
        results,
      })
    })
  })

})

