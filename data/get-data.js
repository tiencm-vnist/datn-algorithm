const tasks = require('./task').tasks
const employees = require('./employee').employees
const assets = require('./asset').assetAll
const ExcelJS = require('exceljs');


console.log("tasks: ", tasks)
console.log("employees: ", employees)
console.log("assets: ", assets)


const fileName = './algorithms/output/kpi_employee.json'
const fs = require('fs');
const { getLastKPIAndAvailableEmpsInTasks } = require('../algorithms/hs_helper');

async function addInput() {
  const workbook = new ExcelJS.Workbook();
  const worksheetAsset = workbook.addWorksheet('Input_Asset');
  const worksheetTask = workbook.addWorksheet('Input_Task');
  const worksheetEmp = workbook.addWorksheet('Input_Employee');

  worksheetAsset.addRow(['ID', 'Name', 'Type', 'Status', 'Qualities Capacity Level', 'Usage Logs'])
  assets.forEach((asset) => {
    worksheetAsset.addRow([asset.id, asset.name, asset.type, asset.status, asset.qualities['level'], JSON.stringify(asset?.usageLogs)])
  })

  worksheetEmp.addRow(['ID', 'Name', 'Cost Per Hour', 'Qualities_Degree', 'Qualities_Year_Of_Exp', 'Qualities_English', 'Qualities_Backend', 'Qualities_Frontend', 'Qualities_Docker', 'Qualities_CI_CD', 'Qualities_Unit_Test', 'Qualities_Manual_Test', 'Qualities_Automation_Test'])

  employees.forEach((employee) => {
    worksheetEmp.addRow([employee.id, employee.name, employee.costPerHour, employee.qualities?.degree, employee.qualities?.year_of_exp, employee.qualities?.english, employee.qualities?.backend, employee.qualities?.frontend, employee.qualities?.docker, employee.qualities?.ci_cd, employee.qualities?.unit_test, employee.qualities?.manual_test, employee.qualities?.automation_test])
  })

  worksheetTask.addRow(['ID', 'Name', 'Preceedings', 'Estimate Effort', 'Require Asset Type', 'Require Asset Number', 'Require Asset Capacity', 'Require Assign'])
  tasks.forEach((task) => {
    worksheetTask.addRow([task.id, task.name, task.preceedingTasks.join(", "), task.estimateTime, task.requireAsset[0].type, task.requireAsset[0].number, task.requireAsset[0].quality[0].level, task?.requireAssign])
  })


  const filePath = 'so_sanh_input.xlsx';
  await workbook.xlsx.writeFile(filePath);
}
addInput()

module.exports = {
  tasks,
  employees,
}