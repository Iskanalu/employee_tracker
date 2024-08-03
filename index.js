const inquirer = require('inquirer');
const pool = require('./db');
const Table = require('cli-table3');

// Main function to display options and call appropriate functions
async function main() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'Add a department',
      'Add a role',
      'Add an employee',
      'View all departments',
      'View all roles',
      'View all employees',      
      'Update an employee role',
    ],
  });

  switch (action) {
    case 'View all departments':
      await viewDepartments();
      break;
    case 'View all roles':
      await viewRoles();
      break;
    case 'View all employees':
      await viewEmployees();
      break;
    case 'Add a department':
      await addDepartment();
      break;
    case 'Add a role':
      await addRole();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRole();
      break;
    default:
      console.log('Invalid action.');
      break;
  }

  await main(); // Re-display menu
}

// Function to view all departments
async function viewDepartments() {
  const result = await pool.query('SELECT * FROM departments');
  const table = new Table({
    head: ['ID', 'Department Name'],
  });
  console.log('results >'. result);
  result.rows.forEach(row => table.push([row.id, row.name]));
  console.log(table.toString());
}

// Function to view all roles
async function viewRoles() {
  const result = await pool.query(`
    SELECT roles.id, roles.title, roles.salary, departments.name as department
    FROM roles
    LEFT JOIN departments ON roles.department_id = departments.id
  `);
  const table = new Table({
    head: ['ID', 'Title', 'Salary', 'Department'],
  });
  result.rows.forEach(row => table.push([row.id, row.title, row.salary, row.department]));
  console.log(table.toString());
}

// Function to view all employees
async function viewEmployees() {
  const result = await pool.query(`
    SELECT employees.id, employees.first_name, employees.last_name, roles.title as role,
           departments.name as department, roles.salary, managers.first_name as manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees as managers ON employees.manager_id = managers.id
  `);
  const table = new Table({
    head: ['ID', 'First Name', 'Last Name', 'Role', 'Department', 'Salary', 'Manager'],
  });
  result.rows.forEach(row => table.push([
    row.id, row.first_name, row.last_name, row.role, row.department, row.salary, row.manager
  ]));
  console.log(table.toString());
}

// Function to add a department
async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the department name:',
  });

  await pool.query('INSERT INTO departments (name) VALUES ($1)', [name]);
  console.log(`Department '${name}' added.`);
}

// Function to add a role
async function addRole() {
  const departments = await pool.query('SELECT id, name FROM departments');
  const departmentChoices = departments.rows.map(dept => ({
    name: dept.name,
    value: dept.id,
  }));

  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter the role title:' },
    { type: 'input', name: 'salary', message: 'Enter the salary:' },
    { type: 'list', name: 'department_id', message: 'Select the department:', choices: departmentChoices },
  ]);

  await pool.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
  console.log(`Role '${title}' added.`);
}

// Function to add an employee
async function addEmployee() {
  const roles = await pool.query('SELECT id, title FROM roles');
  const roleChoices = roles.rows.map(role => ({
    name: role.title,
    value: role.id,
  }));

  const managers = await pool.query('SELECT id, first_name, last_name FROM employees');
  const managerChoices = managers.rows.map(manager => ({
    name: `${manager.first_name} ${manager.last_name}`,
    value: manager.id,
  }));
  managerChoices.push({ name: 'None', value: null });

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: 'Enter the employee’s first name:' },
    { type: 'input', name: 'last_name', message: 'Enter the employee’s last name:' },
    { type: 'list', name: 'role_id', message: 'Select the role:', choices: roleChoices },
    { type: 'list', name: 'manager_id', message: 'Select the manager:', choices: managerChoices },
  ]);

  await pool.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
  console.log(`Employee '${first_name} ${last_name}' added.`);
}

// Function to update an employee role
async function updateEmployeeRole() {
  const employees = await pool.query('SELECT id, first_name, last_name FROM employees');
  const employeeChoices = employees.rows.map(emp => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const roles = await pool.query('SELECT id, title FROM roles');
  const roleChoices = roles.rows.map(role => ({
    name: role.title,
    value: role.id,
  }));

  const { employee_id, new_role_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Select the employee to update:', choices: employeeChoices },
    { type: 'list', name: 'new_role_id', message: 'Select the new role:', choices: roleChoices },
  ]);

  await pool.query('UPDATE employees SET role_id = $1 WHERE id = $2', [new_role_id, employee_id]);
  console.log('Employee role updated.');
}

// Start the application
main();