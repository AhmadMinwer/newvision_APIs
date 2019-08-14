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
})

connection.connect(function (err) {
  if (err) throw err
  console.log('You are now connected to newvisoin database...')

  router.post('/fetch', function (req, res, next) {

    let stmt = 'SELECT * FROM student_group WHERE 1 '

    connection.query(stmt, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'Student did not added successfully',
          err,
        });
      }

      // console.log(results)
      return res.status(200).send({
        success: 'true',
        message: 'student added successfully',
        results,
      })
    })
  })


  router.get('/active_potential/fetch/', function (req, res, next) {

    let stmt = 'SELECT * FROM ' +
      '( SELECT ' +
      'student_id,' +
      'group_id, ' +
      'groups.status as group_status, ' +
      'student_group.status as student_status, ' +
      'mark1, ' +
      'mark2, ' +
      'mark3, ' +
      'certification ' +
      'FROM `student_group` ' +
      'JOIN groups ON groups.id = student_group.group_id ' +
      ') as T ' +
      'WHERE T.group_status=\'active\' OR T.group_status=\'potential\''

    connection.query(stmt, async (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'studentsGroups did not fetched successfully',
          err,
        });
      }


      results = results.map((row) => {

        return {
          studentId: row.student_id,
          groupId: row.group_id,
          exam1: row.mark1,
          exam2: row.mark2,
          exam3: row.mark3,
          status: row.student_status,
          certificationState: row.certification,
        }
      })


      // console.log(results)
      return res.status(200).send({
        success: 'true',
        message: 'studentsGroups fetched successfully',
        results,
      })
    })
  })



  router.post('/api/v1/add', function (req, res, next) {

    let link = req.body.link
    
    console.log(link)

    let stmt = `INSERT INTO student_group (student_id, group_id, status, mark1, mark2, mark3, certification) VALUES (?,?,?,?,?,?,?)`;
    let values = [
      link.studentId,
      link.groupId,
      link.status,
      link.mark1,
      link.mark2,
      link.mark3,
      link.certification
    ];

    connection.query(stmt, values, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'Student did not added to group successfully',
          err,
        });
      }

      stmt2 = 'select * from students'
      let value = connection.query(stmt2, (err, results, fields) => {
        return results
      })
      console.log(value)

      return res.status(200).send({
        success: 'true',
        message: 'student added to group successfully',
        link,
      })
    });
  })


  router.post('/api/v1/remove', function (req, res, next) {

    let ids = req.body.ids

    let stmt = `DELETE FROM student_group WHERE student_id = ? AND group_id = ?`
    let values = [
      ids.studentId,
      ids.groupId,
    ];

    // console.log(stmt)

    connection.query(stmt, values, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'Student did not removed from group successfully',
          err,
        });
      }
      return res.status(200).send({
        success: 'true',
        message: 'student removed from group successfully',
        ids,
      })
    });
  })


  router.post('/api/v1/update', function (req, res, next) {

    const mapValues = {
      status: 'status',
      mark1: 'mark1',
      mark2: 'mark2',
      mark3: 'mark3',
      certificationState: 'certification',
    }


    const data = req.body.data

    let stmt = 'UPDATE student_group SET ? = \'?\'  WHERE student_id = ? AND group_id = ?'
    let values = [
      mapValues[data.type],
      data.value,
      data.studentId,
      data.groupId,
    ];

    // console.log(stmt)

    connection.query(stmt, values, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'Student did not updated successfully',
          err,
        });
      }
      return res.status(200).send({
        success: 'true',
        message: 'student updated successfully',
        data,
      })
    });
  })

})
module.exports = router;
