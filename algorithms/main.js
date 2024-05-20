// Thuật toán lõi
const fs = require('fs');
const ExcelJS = require('exceljs');
const { tasks } = require('../data/task');
const { assets } = require('../data/asset');
const { employees } = require('../data/employee');
const { lastKPIs } = require('../data/kpi');

const { topologicalSort } = require('../helper/index');
const { scheduleTasksWithAsset, getAvailableEmployeesForTasks, checkIsFitnessSolution, compareSolution, reScheduleTasks, getKpiOfEmployees, DLHS, getTimeForProject, getDistanceOfKPIEmployeesTarget_2, getAvailableEmployeesWithCheckConflict, scheduleTasksWithAssetAndEmpTasks, getLastKPIAndAvailableEmpsInTasks } = require('./hs_helper');
const { kMeansWithEmployees, splitKPIToEmployeesByKMeans, findBestMiniKPIOfTasks, reSplitKPIOfEmployees } = require('../helper/k-mean.helper');
const { allTasksOutOfProject } = require('../data/taskOutofProject');
const { allTasksInPast } = require('../data/taskInPast');


async function test() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Task KPIs');
  const employeesheet = workbook.addWorksheet('Task KPIs of Employee');

  const START_DATE = new Date()
  START_DATE.setFullYear(2024, 7, 1)
  START_DATE.setHours(0, 0, 0, 0)
  job = {
    startTime: START_DATE,
    tasks: tasks
  }
  job.tasks = topologicalSort(tasks)
  // console.log("job.tasks: ", job.tasks)
  // job.tasks = scheduleTasksWithAsset(job, assets)
  // console.log("job.tasks: ", job.tasks)
  // console.log("emp: ", employees)
  // const allTasksInPast = require('./taskInPast').allTasksInPast


  const lastKPIs = getLastKPIAndAvailableEmpsInTasks(job.tasks, allTasksInPast, employees)
  // console.log("lastKPIs: ", lastKPIs)
  // job.tasks = getAvailableEmployeesForTasks(job.tasks, employees, lastKPIs)  
  job.tasks.forEach(task => {
    console.log(task.id, ": ", task.availableAssignee.map((item) => item.id).join(", "))
  });


  // return
  const BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 4, Max_FEs = 10000, FEs = 0, R = 100, HMS = 60

  const kpiTarget = {
    'A': { value: 0.88, weight: 0.35 },
    'B': { value: 0.91, weight: 0.35 },
    'C': { value: 0.91, weight: 0.3 },
  }

  const DLHS_Arguments = {
    HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs
  }

  const assetHasKPIWeight = 0.1

  let count = 0;
  let kpiOfEmployeesTarget = splitKPIToEmployeesByKMeans(job.tasks, employees, kpiTarget, assetHasKPIWeight)

  const minimumKpi = findBestMiniKPIOfTasks(job.tasks, kpiTarget, assetHasKPIWeight)
  kpiOfEmployeesTarget = reSplitKPIOfEmployees(minimumKpi, kpiOfEmployeesTarget)
  console.log("kpiTarget: ", kpiOfEmployeesTarget)

  job.tasks = scheduleTasksWithAssetAndEmpTasks(job, assets, allTasksOutOfProject)
  // job.tasks.forEach(task => {
  //   console.log(task.id, ": ", task.availableAssignee.map((item) => item.id).join(", "))
  // });
  worksheet.addRow(['ID_KPI_Target', 'Target A', 'Target B', 'Target C'])
  worksheet.addRow([count + 1, kpiTarget['A'].value, kpiTarget['B'].value, kpiTarget['C'].value])
  // Add headers
  worksheet.addRow(['ID', 'Task ID', 'Preceeding IDs', 'Available Assignee', 'AssigneeId', 'MachineId', 'Start Time', 'End Time', ' ', 'Total Cost', 'Distance Of KPI', 'Total KPI A', 'Total KPI B', 'TotalKPI C', '', 'AssigneeId', 'KPI A when splits', 'KPI A of Assignee with All Tasks', 'KPI B when splits', 'Total KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks']);
  const start = performance.now()
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
  reScheduleTasks(testResult.assignment, assets)
  const end = performance.now()

  const kpiAssignment = testResult.kpiAssignment
  const kpiOfEmployee = testResult.kpiOfEmployees
  console.log("Cost: ", testResult.totalCost)
  console.log("KPIs: ", testResult.kpiAssignment)
  console.log("KPI of Employees: ", kpiOfEmployee)
  console.log("Distance: ", testResult.distanceWithKPIEmployeesTarget)
  console.log("Distance2: ", getDistanceOfKPIEmployeesTarget_2(testResult.kpiOfEmployees, kpiOfEmployeesTarget))
  console.log("Time: ", (end - start) / 1000, " (s)")
  console.log("Day works: ", getTimeForProject(testResult.assignment))
  console.log("Duplicate: ", testResult.falseDuplicate)

  for (let i = 0; i < testResult.assignment.length; i++) {
    const { task, assignee, assets } = testResult.assignment[i]
    worksheet.addRow([i + 1, task.id, task.preceedingTasks.join(", "), task.availableAssignee.map((item) => item.id).join(", "), assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.distanceWithKPIEmployeesTarget, kpiAssignment['A'], kpiAssignment['B'], kpiAssignment['C'],  ' ', assignee.id, kpiOfEmployeesTarget[assignee.id]['A'], kpiOfEmployee[assignee.id]['A'], kpiOfEmployeesTarget[assignee.id]['B'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployeesTarget[assignee.id]['C'], kpiOfEmployee[assignee.id]['C']]);
  }    

  employeesheet.addRow(['Target A', 'Target B', 'Target C'])
  employeesheet.addRow([kpiTarget['A'].value, kpiTarget['B'].value, kpiTarget['C'].value])
  employeesheet.addRow(['ID', 'Employee ID', 'KPI A when splits', 'Total KPI A of Assignee with All Tasks', 'KPI B when splits', 'Toal KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks', '', 'Total KPI A', 'Total KPI B', 'TotalKPI C', 'Distance']);
  for (let i = 0; i < employees.length; i++) {
    employeesheet.addRow([i + 1, employees[i].id, kpiOfEmployeesTarget[employees[i].id]['A'], kpiOfEmployee[employees[i].id]['A'], kpiOfEmployeesTarget[employees[i].id]['B'], kpiOfEmployee[employees[i].id]['B'], kpiOfEmployeesTarget[employees[i].id]['C'], kpiOfEmployee[employees[i].id]['C'], '', kpiAssignment['A'], kpiAssignment['B'], kpiAssignment['C'], testResult.distanceWithKPIEmployeesTarget]);
  }
    
  
  // Save workbook to a file
  const filePath = '../output/task_kpis_output.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

test()
