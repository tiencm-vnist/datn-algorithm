// Thuật toán lõi
const fs = require('fs');
const ExcelJS = require('exceljs');

const { topologicalSort } = require('../helper/index');
const { scheduleTasksWithAsset, getAvailableEmployeesForTasks, checkIsFitnessSolution, compareSolution, reScheduleTasks, getKpiOfEmployees, DLHS, getTimeForProject, getDistanceOfKPIEmployeesTarget_2, getAvailableEmployeesWithCheckConflict, scheduleTasksWithAssetAndEmpTasks, getLastKPIAndAvailableEmpsInTasks } = require('./hs_helper');
const { kMeansWithEmployees, splitKPIToEmployeesByKMeans, findBestMiniKPIOfTasks, reSplitKPIOfEmployees } = require('../helper/k-mean.helper');
const { allTasksOutOfProject } = require('../data/taskOutofProject');
const { allTasksInPast } = require('../data/taskInPast');




const proposalForProject = (job, allTasksInPast, allTasksOutOfProject, DLHS_Arguments, assetHasKPIWeight) => {
  allTasksOutOfProject.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  const {
    employees,
    assets,
    kpiTarget
  } = job
  

  // Step 1


  // Step 1.1
  job.tasks = topologicalSort(job.tasks)

  // pre-processing KPI
  const lastKPIs = getLastKPIAndAvailableEmpsInTasks(job.tasks, allTasksInPast, employees)
  console.log("job.task: ", job.tasks.forEach(task => {
    console.log(task.id, task.availableAssignee.map((emp) => emp.id).join(", "))
  }))


  // Step 1.2
  let kpiOfEmployeesTarget = splitKPIToEmployeesByKMeans(job.tasks, employees, kpiTarget, assetHasKPIWeight)
  const minimumKpi = findBestMiniKPIOfTasks(job.tasks, kpiTarget, assetHasKPIWeight)
  kpiOfEmployeesTarget = reSplitKPIOfEmployees(minimumKpi, kpiOfEmployeesTarget)


  job.tasks = scheduleTasksWithAssetAndEmpTasks(job, assets, allTasksOutOfProject)
  let lastestEndTime = new Date(0)
  for (let i = 0; i < job.tasks?.length; i++) {
    const task = job.tasks[i]
    const endTime = new Date(task?.endTime)
    if (lastestEndTime < endTime) {
      lastestEndTime = endTime
    }
    
  }
  if (new Date(lastestEndTime) > new Date(job.endTime)) {
    throw Error("Không thể tìm được phương án phân bổ để thỏa mãn thời gian của dự án! Hãy điều chỉnh lại tài nguyên và thời gian dự kiến!")
  }

  // Step 2
  let testResult = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget, assetHasKPIWeight)
  for (let i = 1; i < 20; i++) {
    const result = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget, assetHasKPIWeight)
  
    const checkIsFitnessSolutionResult = checkIsFitnessSolution(result, kpiTarget, kpiOfEmployeesTarget)
    if (checkIsFitnessSolutionResult) {
      testResult = result
      break
    }
    if (!compareSolution(testResult, result, kpiTarget, kpiOfEmployeesTarget)) {
      testResult = result
    }
  }

  // Step 3
  if (testResult?.falseDuplicate) {
    console.log("vào đây")
    reScheduleTasks(testResult.assignment, assets, allTasksOutOfProject)
    console.log("day works: ", getTimeForProject(testResult.assignment))
  }

  return testResult
}

async function test() {
  const { project, assetHasKPIWeight, DLHS_Arguments } = require('./input')

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Task KPIs');
  const employeesheet = workbook.addWorksheet('Task KPIs of Employee');
  let count = 0
  worksheet.addRow(['ID_KPI_Target', 'Target A', 'Target B', 'Target C'])
  worksheet.addRow([project.kpiTarget['A'].value, project.kpiTarget['B'].value, project.kpiTarget['C'].value])
  // Add headers
  worksheet.addRow(['ID', 'Task ID', 'Preceeding IDs', 'Available Assignee', 'AssigneeId', 'MachineId', 'Start Time', 'End Time', ' ', 'Total Cost', 'Distance Of KPI', 'Total KPI A', 'Total KPI B', 'TotalKPI C', '', 'AssigneeId', 'KPI A when splits', 'KPI A of Assignee with All Tasks', 'KPI B when splits', 'Total KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks']);
  const start = performance.now()
  let testResult = proposalForProject(project, allTasksInPast, allTasksOutOfProject, DLHS_Arguments, assetHasKPIWeight)
  const end = performance.now()

  console.log("Cost: ", testResult.totalCost)
  console.log("KPIs: ", testResult.kpiAssignment)
  console.log("KPI of Employees: ", testResult.kpiOfEmployees)
  console.log("Distance: ", testResult.distanceWithKPIEmployeesTarget)
  // console.log("Distance2: ", getDistanceOfKPIEmployeesTarget_2(testResult.kpiOfEmployees, kpiOfEmployeesTarget))
  console.log("Time: ", (end - start) / 1000, " (s)")
  console.log("Day works: ", getTimeForProject(testResult.assignment))
  console.log("Duplicate: ", testResult.falseDuplicate)

  const employeeTimes = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: []
  }

  for (let key in employeeTimes) {
    const allTasksOfEmpInPast = allTasksInPast.filter((item) => Number(item.assignee.id) === Number(key))
    // console.log("allTasksOfEmpInPast: ", allTasksOfEmpInPast)
    const allTasksOfEmpOutOfProject = allTasksOutOfProject.filter((item) => Number(item.assignee.id) === Number(key))
    employeeTimes[key].push(...allTasksOfEmpInPast)
    employeeTimes[key].push(...allTasksOfEmpOutOfProject)
  }
  


  for (let i = 0; i < testResult.assignment.length; i++) {
    const { task, assignee, assets } = testResult.assignment[i]
    employeeTimes[assignee.id].push({
      startTime: task.startTime,
      endTime: task.endTime,
      id: task.id,
      taskName: task.name,
      project: "Project Hien tai"
    })
  }
  for (let key in employeeTimes) {
    const employeeWorks = employeeTimes[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

    for (let i = 0; i < employeeWorks.length; i++) {
      worksheet.addRow([key, employeeWorks[i]?.id, employeeWorks[i].startTime, employeeWorks[i].endTime, employeeWorks[i]?.project ? employeeWorks[i]?.project : employeeWorks[i]?.status ? "Project QK" : "Project outof"])
    }
  }

  // for (let i = 0; i < testResult.assignment.length; i++) {
  //   const { task, assignee, assets } = testResult.assignment[i]
  //   worksheet.addRow([i + 1, task.id, task.preceedingTasks.join(", "), task.availableAssignee.map((item) => item.id).join(", "), assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.distanceWithKPIEmployeesTarget, kpiAssignment['A'], kpiAssignment['B'], kpiAssignment['C'],  ' ', assignee.id, kpiOfEmployeesTarget[assignee.id]['A'], kpiOfEmployee[assignee.id]['A'], kpiOfEmployeesTarget[assignee.id]['B'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployeesTarget[assignee.id]['C'], kpiOfEmployee[assignee.id]['C']]);
  // }    

  // employeesheet.addRow(['Target A', 'Target B', 'Target C'])
  // employeesheet.addRow([project.kpiTarget['A'].value, project.kpiTarget['B'].value, project.kpiTarget['C'].value])
  // employeesheet.addRow(['ID', 'Employee ID', 'KPI A when splits', 'Total KPI A of Assignee with All Tasks', 'KPI B when splits', 'Toal KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks', '', 'Total KPI A', 'Total KPI B', 'TotalKPI C', 'Distance']);
  // for (let i = 0; i < employees.length; i++) {
  //   employeesheet.addRow([i + 1, employees[i].id, kpiOfEmployeesTarget[employees[i].id]['A'], kpiOfEmployee[employees[i].id]['A'], kpiOfEmployeesTarget[employees[i].id]['B'], kpiOfEmployee[employees[i].id]['B'], kpiOfEmployeesTarget[employees[i].id]['C'], kpiOfEmployee[employees[i].id]['C'], '', kpiAssignment['A'], kpiAssignment['B'], kpiAssignment['C'], testResult.distanceWithKPIEmployeesTarget]);
  // }
    
  
  // Save workbook to a file
  const filePath = '../output/task_kpis_output.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

test()
