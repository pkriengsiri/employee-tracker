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

function init() {
  inquirer
    .prompt([
      {
        type: "list",
        choices: ["View employees by department", "Quit"],
        message: "What would you like to do?",
        name: "userInput",
      },
    ])
    .then(({ userinput }) => {
      switch (userInput) {
      }
    });
}
