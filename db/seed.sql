USE employeeDB;

INSERT INTO department (name)
VALUES ("Management"), ("Accounting"), ("Human Resources"), ("Engineering"), ("R&D"), ("Manufacturing"), ("Warehouse"),("Administrative");

INSERT INTO role (title, salary, department_id)
VALUES ("CEO", 200000, 1),
	("CFO", 180000, 1),
       ("COO", 180000, 1),
	("Accounting Manager", 100000, 2),
       ("Accountant", 80000, 2),
       ("HR Manager", 100000,3),
       ("HR Generalist", 70000,3),
       ("Engineering Manager", 150000, 4),
       ("Senior Engineer", 125000, 4),
       ("Engineer", 125000, 4),
       ("R&D Manager", 150000, 5),
       ("Senior Research Scientist", 125000, 5),
       ("Research Scientist", 100000, 5),
       ("Manufacturing Manager", 80000, 6),
       ("Manufacturing Associate", 40000, 6),
       ("Warehouse Manager", 60000, 7),
       ("Warehouse Associates", 30000, 7),
       ("Office Manager", 60000, 8),
       ("Office Assistant", 40000, 8);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Lauren","Cornish", 1, null),
	("Owen","Churchill", 2, 1),
       ("Lisa", "Reid", 3, 1);