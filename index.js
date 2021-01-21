// DEPENDENCIES
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

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
  init();
});

// Shows all employees
function showAllEmployees() {
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
        choices: ["Show all employees", "Quit"],
        message: "What would you like to do?",
        name: "userInput",
      },
    ])
    .then(({ userInput }) => {
      switch (userInput) {
        case "Show all employees":
          showAllEmployees();
          return;
        default:
          quit();
      }
    });
}
