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


  // router.get('/api/v1/students/:id', function (req, res, next) {

  //   const id = parseInt(req.params.id, 10);

  //   connection.query('SELECT * FROM students WHERE id =\' ' + id + '\'', function (err, results) {
  //     if (err) {
  //       return res.status(404).send({
  //         success: 'false',
  //         message: 'Student does not exist',
  //       });
  //     }

  //     student={
  //       id: results[0].id,
  //       name: results[0].name,
  //       balance: results[0].balance,
  //       cpa: results[0].cpa,
  //     }
  //     return res.status(200).send({
  //       success: 'true',
  //       message: 'student retrieved successfully',
  //       student,
  //     })      

  //   })
  // })


  router.post('/api/v1/students/fetch', function (req, res, next) {

    let filters = req.body.filters

    console.log(filters)

    let stmt = 'SELECT * '+
    'FROM students '+
    'LEFT JOIN student_group ON students.id = student_group.student_id '

    if (filters.filtersGroupId && filters.filtersGroupId != '') stmt += 'AND student_group.group_id = \''+ filters.filtersGroupId + '\' ' + 
    'WHERE (student_group.group_id !=  \''+ filters.filtersGroupId + '\' ' + 'OR student_group.group_id is NULL) '
    else 
    'WHERE (student_group.group_id is NULL) '

      if (filters.filtersId && filters.filtersId != '') stmt += 'AND students.id=\'' + filters.filtersId + '\''
      if (filters.filtersName && filters.filtersName != '') stmt += ' And students.name like \'%' + filters.filtersName + '%\''
      if (filters.filtersPhone && filters.filtersPhone != '') stmt += ' AND students.phone =\'' + filters.filtersPhone + '\''
      if (filters.filtersDate && filters.filtersDate != '') stmt += ' And students.signup_date >= \'' + filters.filtersDate + '\''


    console.log('stmt = ' + stmt)
    connection.query(stmt, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'Students did not fetch successfully',
          err,
        });
      }

      console.log(results)
      return res.status(200).send({
        success: 'true',
        message: 'student fetched successfully',
        results,
      })
    })
  })

  router.post('/api/v1/students/add', function (req, res, next) {

    let student = req.body.student


    // student.name is required
    if (student.name && student.name == '') {
      return res.status(400).send({
        success: 'false',
        message: 'student name is required'
      });
    }

    // student.phone is required
    if (student.phone && student.phone == '') {
      return res.status(400).send({
        success: 'false',
        message: 'student phone is required'
      });
    }


    console.log(student)
    let stmt = `INSERT INTO students (name, phone, phone2, specialty, remarks, terms, cpa, signup_date) VALUES (?,?,?,?,?,?,?,now())`;
    let values = [student.name.toLowerCase(),
    student.phone1,
    student.phone2,
    student.specialty.toLowerCase(),
    student.remarks.toLowerCase(),
    student.terms.toLowerCase(),
    student.CPA
    ];

    connection.query(stmt, values, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'Student did not added successfully',
          err,
        });
      }

      student['id'] = results.insertId
      console.log(student)

      return res.status(200).send({
        success: 'true',
        message: 'student added successfully',
        student,
      })
    });
  })


  router.get('/api/v1/students/active', function (req, res, next) {


    //query to fetch all active students

    // let query = 'SELECT * ' +
    //   'FROM ((student_group ' +
    //   'INNER JOIN groups ON student_group.group_id = groups.id) ' +
    //   'INNER JOIN students ON student_group.student_id = students.id) ' +
    //   'WHERE student_group.status = \'active\' '

    //query to fetch all students related to active and potential groups
    let query = 'SELECT * ' +
      'FROM ( ' +
      'SELECT students.id as id, ' +
      'students.cpa, ' +
      'students.balance, ' +
      'students.name, ' +
      'student_group.status as student_status, ' +
      'groups.status as group_status, ' +
      'students.specialty, ' +
      'students.phone, ' +
      'students.phone2, ' +
      'students.signup_date, ' +
      'students.remarks, ' +
      'students.terms ' +
      'FROM `students` ' +
      'JOIN student_group ON students.id = student_group.student_id JOIN groups ON groups.id = student_group.group_id ' +
      ') as T WHERE T.group_status=\'active\' OR T.group_status=\'potential\' ' +
      ' GROUP BY id'

    connection.query(query, async function (err, results) {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'active students did not retrieved successfully',
        });
      }


      results = results.map((student) => {
        return {
          id: student.id,
          name: student.name,
          CPA: student.cpa,
          creationDate: student.signup_date,
          specialty: student.specialty,
          CPABalance: student.balance,
          phone: student.phone,
          phone2: student.phone2,
          // lastLevel: ,
          // lastDate: '',
          terms: student.terms,
          remarks: student.remarks,
        }
      })

      return res.status(200).send({
        success: 'true',
        message: 'student retrieved successfully',
        results,
      })
    })
  })


  router.post('/api/v1/students/', function (req, res, next) {

    // const id = parseInt(req.params.id, 10);
    const filters = req.body

    console.log(req.body)

    let query = 'SELECT * FROM students WHERE 1 '

    if (filters.id && filters.id != '') query += 'AND id=\'' + filters.id + '\''
    if (filters.cpa && filters.cpa != '') query += ' AND cpa =\'' + filters.cpa + '\''
    if (filters.name && filters.name != '') query += ' And name like \'%' + filters.name + '%\''


    console.log(query)

    connection.query(query, function (err, results) {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'Student does not exist',
        });
      }
      formatedResults = results.map(student => {

        let query = 'SELECT * FROM `student_group` WHERE student_id = ' + student.student_id
        let groups = []

        connection.query(query, function (err, results) {
          if (err) {
            return res.status(404).send({
              success: 'false',
              message: 'groups which student_id = ' + student.student_id + ' did not retrieved successfully',
            });
          }

          groups = results.map(group => {
            return {
              id: group.group_id,
              exam1: group.mark1,
              exam2: group.mark2,
              exam3: group.mark3,
              status: group.status,
              certificationState: group.certification,
              attendance: '',

            }
          })

        })

        return {
          id: student.student_id,
          name: student.name,
          CPA: student.cpa,
          createDate: student.signup_date,
          specialty: student.specialty,
          CPABalance: student.balance,
          phone: student.phone,
          phone2: student.phone2,
          lastLevel: '',
          lastDate: '',
          terms: student.terms,
          remarks: student.remarks,
          groups: groups,
        }
      }
      )


      console.log('resulsts = ' + formatedResults)

      return res.status(200).send({
        success: 'true',
        message: 'student retrieved successfully',
        formatedResults,
      })

    })
  })

})
module.exports = router;
