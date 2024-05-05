const modules = require('./module').modules
const employees = require('./employee').employees
const ExcelJS = require('exceljs');

let tasks = []
modules.forEach((module) => {
  const numTasks = employees.length
  const moduleId = module.id
  const preceedingModules = module.preceeding

  for (let i = 0; i < numTasks; i++) {
    const taskId = (moduleId - 1) * numTasks + i + 1
    const taskName = `${module.name} - Task ${i + 1}`
    const taskEstimateTime = module.estimateTime / numTasks

    const task = {
      id: taskId,
      name: taskName,
      estimateTime: taskEstimateTime,
      // preceeding: [],
      startTime: null,
      endTime: null,
      moduleId: module.id,
      preceedingModules
    }
    tasks.push(task)
  }
})

// tasks.filter((item) => preceedingModules.includes(item.moduleId)).map((item) => item.id)
tasks = tasks.map((task) => {
  const pre1 = tasks.filter((item) => task.preceedingModules.includes(item.moduleId)).map((item) => item.id)
  const pre2 = tasks.filter((item) => item.moduleId + 1 === task.moduleId).map((item) => item.id)
  const pre = pre1.concat(pre2)
  return {
    ...task,
    preceedingTasks: pre
  }
})

// console.log("modules: ", modules)
// console.log("emps: ", employees)

const fileName = './algorithms/output/kpi_employee.json'
const fs = require('fs');

async function addInput() {
  const workbook = new ExcelJS.Workbook();
  const worksheetModule = workbook.addWorksheet('Input_Module');
  const worksheetTask = workbook.addWorksheet('Input_Task');
  const worksheetEmp = workbook.addWorksheet('Input_Employee');

  worksheetModule.addRow(['ID', 'Name', 'Preceedings', 'Estimate Effort'])
  modules.forEach((module) => {
    worksheetModule.addRow([module.id, module.name, module.preceedingModules?.length ? module.preceedingModules.join(", "): "[ ]", module.estimateTime])
  })

  worksheetEmp.addRow(['ID', 'Name', 'Productivity'])
  employees.forEach((employee) => {
    worksheetEmp.addRow([employee.id, employee.name, employee.productivity])
  })

  worksheetTask.addRow(['ID', 'Name', 'Preceedings', 'Estimate Effort', 'Module ID'])
  tasks.forEach((task) => {
    worksheetTask.addRow([task.id, task.name, task.preceedingTasks.join(", "), task.estimateTime, task.moduleId])
  })


  const filePath = 'thuat_toan_of_me_benmark_input.xlsx';
  await workbook.xlsx.writeFile(filePath);
}

addInput()

module.exports = {
  tasks,
  employees,
}