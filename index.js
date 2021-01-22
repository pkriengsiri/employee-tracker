// DEPENDENCIES
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
const { welcomeMessage, addEmployeeMessage } = require("./utils/asciiArt");

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
  const queryString = `
  SELECT CONCAT(e.first_name," ",e.last_name) as 'Employee Name', r.title as 'Role', r.salary as 'Salary', IFNULL(CONCAT(m.first_name," ",m.last_name),'No Manager') as 'Manager Name'
    FROM employee e
    LEFT JOIN employee m
        on e.manager_id = m.id
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
  const queryString = `SELECT CONCAT(e.first_name," ", e.last_name) as 'Employee', r.title as 'Title', d.name as 'Department', IFNULL(CONCAT(m.first_name," ", m.last_name),'No Manager') as 'Manager' 
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
  //console.log(addEmployeeMessage);
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
          const queryString = `
          INSERT INTO employee (first_name, last_name, role_id, manager_id)
          VALUE (?, ?, ?,?);`;
          connection.query(
            queryString,
            [firstName, lastName, role, manager],
            (err, data) => {
              if (err) throw err;
              console.log("The employee has been added!");
              init();
            }
          );
        });
    });
  });
}

// Delete an employee
function deleteEmployee() {
  const queryString = `SELECT * FROM employee;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    const employeeArray = data.map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      };
    });
    console.log(employeeArray);
    inquirer
      .prompt([
        {
          type: "list",
          message: "Please select the employee's manager",
          choices: employeeArray,
          name: "employee",
        },
      ])
      .then(({ employee }) => {
        const queryString = `
        DELETE FROM employee
        WHERE id = ?;`;
        connection.query(queryString, [employee], (err, data) => {
          if (err) throw err;
          console.log("Successfully deleted the employee");
          init();
        });
      });
  });
}

// Update an employees' role
function updateEmployeeRole() {
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
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employee",
            choices: employeeArray,
          },
          {
            type: "list",
            message: "Which role would you like to assign the employee?",
            name: "role",
            choices: rolesArray,
          },
        ])
        .then(({ employee, role }) => {
          const queryString = `UPDATE employee
          SET role_id = ?
          WHERE id = ?;`;
          connection.query(queryString, [role, employee], (err, data) => {
            if (err) throw err;
            console.log("The employee's role has been updated!");
            init();
          });
        });
    });
  });
}

// Update an employee's manager
function updateManager() {
  const queryString = `SELECT * FROM employee;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    const employeeArray = data.map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      };
    });
    inquirer.prompt(
        [
            {
                type: "list",
                choices: employeeArray,
                message: "Choose and employee to update:",
                name: "employee"
            },
            {
                type: "list",
                choices: employeeArray,
                message: "Select the employee's new manager:",
                name: "manager"
            }
        ]
    ).then(({employee, manager}) => {
        const queryString = `UPDATE employee
          SET manager_id = ?
          WHERE id = ?;`;
        connection.query(queryString,[manager, employee], (err, data) => {
            if (err) throw err;
            console.log("The employee has been updated.")
            init();
        })
    });
  });
}

// View all departments
function viewDepartments() {
  const queryString = `SELECT * FROM department;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    console.table(data);
    init();
  });
}

// Add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter the name of the department to create",
        name: "department",
      },
    ])
    .then(({ department }) => {
      const queryString = `
            INSERT INTO department (name)
            VALUE (?);`;
      connection.query(queryString, [department], (err, data) => {
        if (err) throw err;
        console.log("Your department has been created.");
        init();
      });
    });
}

// View all roles
function viewRoles() {
  const queryString = `
  SELECT r.id, r.title, r.salary, d.name as 'Department'
  FROM role r
  LEFT JOIN department d
      on r.department_id = d.id;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    console.table(data);
    init();
  });
}

// Add a role
function addRole() {
  const queryString = `SELECT * FROM department;`;
  connection.query(queryString, (err, data) => {
    if (err) throw err;
    const departmentsArray = data.map((department) => {
      return { name: department.name, value: department.id };
    });
    inquirer
      .prompt([
        {
          type: "input",
          message: "Please enter the role title:",
          name: "title",
        },
        {
          type: "input",
          message: "Please enter the role salary:",
          name: "salary",
        },
        {
          type: "list",
          choices: departmentsArray,
          message: "Please select a department:",
          name: "department_id",
        },
      ])
      .then(({ title, salary, department_id }) => {
        const queryString = `
      INSERT INTO role (title, salary, department_id)
      VALUE (?, ?, ?);`;
        connection.query(
          queryString,
          [title, salary, department_id],
          (err, data) => {
            if (err) throw err;
            console.log("Your department has been created.");
            init();
          }
        );
      });
  });
}

// Add a function to remove an department
// Add a function to remove an role

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
          "Delete an employee",
          "Update an employee's role",
          "Update an employee's manager",
          "View all departments",
          "Add a department",
          "View all roles",
          "Add a role",
          new inquirer.Separator(),
          "Quit",
          new inquirer.Separator(),
        ],
        message: "What would you like to do?",
        name: "userInput",
      },
    ])
    .then(({ userInput }) => {
      switch (userInput) {
        case "View all employees":
          viewAllEmployees();
          break;
        case "View all employees by department":
          viewAllEmployeesByDepartment();
          break;
        case "View all employees by manager":
          viewAllEmployeesByManager();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Delete an employee":
          deleteEmployee();
          break;
        case "Update an employee's role":
          updateEmployeeRole();
          break;
        case "Update an employee's manager":
          updateManager();
          break;
        case "View all departments":
          viewDepartments();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "Add a role":
          addRole();
          break;
        default:
          quit();
      }
    });
}
