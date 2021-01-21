// DEPENDENCIES
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
const welcomeMessage = require("./utils/asciiArt")

// MAKE CONNECTION TO THE DATABASE
const connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "beagle",
  database: "employeeDB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  console.log(welcomeMessage);
  init();
});

// Shows all employees
function viewAllEmployees() {
  const queryString = `SELECT e.first_name as 'First Name', e.last_name 'Last Name', r.title as 'Role', r.salary as 'Salary', m.first_name as 'Manager First Name', m.last_name as 'Manager Last Name'
    FROM employee e
    INNER JOIN employee m
        on e.id = m.id
    INNER JOIN role r
        on r.id = e.role_id;
    `;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    console.table(data);
    init();
  });
}

//  Shows all employees by department
function viewAllEmployeesByDepartment() {
  const queryString = `SELECT * FROM department;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    const departmentsArray = data.map((department) => {
      return { name: department.name, value: department.id };
    });
    // console.log(departmentsArray);
    inquirer
      .prompt([
        {
          type: "list",
          choices: departmentsArray,
          message: "Please select a department",
          name: "departmentId",
        },
      ])
      .then(({ departmentId }) => {
        const queryString = `SELECT e.first_name as 'First Name', e.last_name as 'Last Name', d.name as 'Department'
                FROM employee e, role r, department d
                WHERE e.role_id = r.id AND r.department_id = ? AND d.id = ?;`;
        connection.query(
          queryString,
          [departmentId, departmentId],
          (err, data) => {
            if (err) throw err;
            console.table(data);
            init();
          }
        );
      });
  });
}

// Shows all employees by manager
function viewAllEmployeesByManager() {
  const queryString = `SELECT CONCAT(e.first_name," ", e.last_name) as 'Employee', r.title as 'Title', IFNULL(CONCAT(m.first_name," ", m.last_name),'No Manager') as 'Manager', d.name as 'Department'
    FROM employee e
    LEFT JOIN employee m
        on m.id = e.manager_id
    INNER JOIN role r
        on e.role_id = r.id
    INNER JOIN department d
        on r.department_id = d.id;
    `;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    console.table(data);
    init();
  });
}

// Adds an employee
function addEmployee() {
  const queryString = `SELECT * FROM role;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    const rolesArray = data.map((role) => {
      return { name: role.title, value: role.id };
    });
    const queryString = `SELECT * FROM employee;`;
    connection.query(queryString, (err, data) => {
      if (err) throw err;
      const employeeArray = data.map((employee) => {
        return {
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        };
      });
      const noneOption = { name: "None", value: null };
      employeeArray.unshift(noneOption);
      inquirer
        .prompt([
          {
            type: "input",
            message: "What is the employee's first name?",
            name: "firstName",
          },
          {
            type: "input",
            message: "What is the employee's last name?",
            name: "lastName",
          },
          {
            type: "list",
            message: "Please select the employee's role",
            choices: rolesArray,
            name: "role",
          },
          {
            type: "list",
            message: "Please select the employee's manager",
            choices: employeeArray,
            name: "manager",
          },
        ])
        .then(({ firstName, lastName, role, manager }) => {
          const queryString = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
          VALUE (?, ?, ?,?);`;
          connection.query(queryString, [firstName, lastName, role, manager],(err, data) => {
            if (err) throw err;
            console.log("The employee has been added!");
            init();
          });
        });
    });
  });
}

// View list of departments
function getDepartments() {
  const queryString = `SELECT * FROM department;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    const departmentsArray = data.map((department) => {
      return { name: department.name, value: department.id };
    });
    return departmentsArray;
  });
}

// Add a function to add a department
// Add a function to add a role
// Add a function to view departments
// Add a function to view roles
// Add a function to update employee role
// Add a function to remove an employee
// Add a function to remove an department
// Add a function to remove an role
// Add a function to update employee manager
// Reorder columns in "View all employees by manager" query
// Concat names


// Exits the application
function quit() {
  console.log("Goodbye.\nHave a nice day.");
  connection.end();
}

// Starts the application
function init() {
  inquirer
    .prompt([
      {
        type: "list",
        choices: [
          "View all employees",
          "View all employees by department",
          "View all employees by manager",
          "Add an employee",
          "Quit",
        ],
        message: "What would you like to do?",
        name: "userInput",
      },
    ])
    .then(({ userInput }) => {
      switch (userInput) {
        case "View all employees":
          viewAllEmployees();
          return;
        case "View all employees by department":
          viewAllEmployeesByDepartment();
          return;
        case "View all employees by manager":
          viewAllEmployeesByManager();
          return;
        case "Add an employee":
          addEmployee();
          return;
        default:
          quit();
      }
    });
}
