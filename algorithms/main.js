// Thuật toán lõi
const fs = require('fs');
const ExcelJS = require('exceljs');

const { topologicalSort } = require('../helper/index');
const { scheduleTasksWithAsset, getAvailableEmployeesForTasks, checkIsFitnessSolution, compareSolution, reScheduleTasks, getKpiOfEmployees, DLHS, getTimeForProject, getDistanceOfKPIEmployeesTarget_2, getAvailableEmployeesWithCheckConflict, scheduleTasksWithAssetAndEmpTasks, getLastKPIAndAvailableEmpsInTasks, harmonySearch_Base } = require('./hs_helper');
const { kMeansWithEmployees, splitKPIToEmployeesByKMeans, findBestMiniKPIOfTasks, reSplitKPIOfEmployees } = require('../helper/k-mean.helper');
const { allTasksOutOfProject } = require('../data/taskOutofProject');
const { allTasksInPast } = require('../data/taskInPast');
const { employees } = require('../data/employee');




const proposalForProjectWithDLHS = (job, allTasksInPast, allTasksOutOfProject, DLHS_Arguments, assetHasKPIWeight) => {
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
  // console.log("job.task: ", job.tasks.forEach(task => {
  //   console.log(task.id, task.availableAssignee.map((emp) => emp.id).join(", "))
  // }))


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
    // console.log("result: ", result.kpiAssignment, result.distanceWithKPIEmployeesTarget)
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
    console.log("vào đây!, chỉnh sửa lịch")
    reScheduleTasks(testResult.assignment, assets, allTasksOutOfProject, job.endTime)
  }

  return testResult
}

const proposalForProjectWithHS_Base = (job, allTasksInPast, allTasksOutOfProject, HS_Arguments, assetHasKPIWeight) => {
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
  let testResult = harmonySearch_Base(HS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget, assetHasKPIWeight)
  for (let i = 1; i < 20; i++) {
    const result = harmonySearch_Base(HS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget, assetHasKPIWeight)
  
    console.log("result.kpi: ", result.kpiAssignment, result.distanceWithKPIEmployeesTarget)
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
  if (testResult?.falseDuplicate || true) {
    console.log("vào đây")
    reScheduleTasks(testResult.assignment, assets, allTasksOutOfProject, new Date('2024-10-08T05:00:00.000Z'))
    console.log("day works: ", getTimeForProject(testResult.assignment))
  }

  return testResult
}

async function testDLHS() {
  const { project, assetHasKPIWeight, DLHS_Arguments, HS_Arguments } = require('./input')
  
  const start = performance.now()
  let testResult = proposalForProjectWithDLHS(project, allTasksInPast, allTasksOutOfProject, DLHS_Arguments, assetHasKPIWeight)
  const end = performance.now()
  const performanceTime = (end - start) / 1000

  console.log("Cost: ", testResult.totalCost)
  console.log("KPIs: ", testResult.kpiAssignment)
  console.log("KPI of Employees: ", testResult.kpiOfEmployees)
  console.log("Distance: ", testResult.distanceWithKPIEmployeesTarget)
  // console.log("Distance2: ", getDistanceOfKPIEmployeesTarget_2(testResult.kpiOfEmployees, kpiOfEmployeesTarget))
  console.log("Time: ", (end - start) / 1000, " (s)")
  console.log("Day works: ", getTimeForProject(testResult.assignment))
  console.log("Duplicate: ", testResult.falseDuplicate)


  // Đưa dữ liệu đầu ra
  const workbook = new ExcelJS.Workbook();
  const argumentsSheet = workbook.addWorksheet('Tham so thuat toan');
  const projectGeneralSheet = workbook.addWorksheet('Thong_Tin_Du_An')
  const taskSheet = workbook.addWorksheet('Ket_qua_phan_bo');
  const employeesheet = workbook.addWorksheet('Lich_Nhan_Cong');
  const assetSheet = workbook.addWorksheet('Lich_May_Moc');

  // Thông tin về tham số
  argumentsSheet.addRow(['Tham số thuật toán DLHS'])
  argumentsSheet.addRow(['Key', 'Value']);
  // Thêm từng key và value vào sheet
  Object.keys(DLHS_Arguments).forEach(key => {
    argumentsSheet.addRow([key, DLHS_Arguments[key]]);
  });

  // Thông tin chung về dự án
  projectGeneralSheet.addRow(['ID_KPI_Target', 'Target A', 'Target B', 'Target C'])
  projectGeneralSheet.addRow([project.kpiTarget['A'].value, project.kpiTarget['B'].value, project.kpiTarget['C'].value])
  projectGeneralSheet.addRow(['Start Time', 'End Time'])
  projectGeneralSheet.addRow([project.startTime.toLocaleString(), project.endTime.toLocaleString()])

  // Thêm dữ liệu cho sheet kết quả phân bổ task
  taskSheet.addRow(['Thông tin phân bổ'])
  taskSheet.addRow(['Task ID (Task Name)', 'Start Time', 'End Time', 'AssigneeId (Assignee Name)', 'AssetId (Asset Name)']);
  for (let i = 0; i < testResult.assignment.length; i++) {
    const { task, assignee, assets } = testResult.assignment[i]
    let assetToPush = ''
    assets.forEach((asset) => {
      assetToPush += `${asset.id} (${asset.name}), `
    })
    assetToPush = assetToPush.substring(0, assetToPush.length - 2)
    assetToPush = `[ ${assetToPush}]`

    taskSheet.addRow([`${task.id} (${task.name})`, task.startTime.toLocaleString(), task.endTime.toLocaleString(), `${assignee.id} (${assignee.name})`, assetToPush]);
  }

  // Kết quả phân bổ
  taskSheet.addRow(['Các kết quả sau khi phân bổ'])
  let headerSheet = []
  let resultRow = []
  const kpiTarget = project.kpiTarget
  for (let key in kpiTarget) {
    headerSheet.push('Target KPI Type ' + key)
    headerSheet.push('Result KPI Type ' + key)
    resultRow.push(kpiTarget[key].value)
    resultRow.push(testResult.kpiAssignment[key])
  }
  
  taskSheet.addRow([...headerSheet, 'Start Time', 'End Time', 'Total Duration Works', 'Total Cost', 'Distance', 'Performence (s)'])
  taskSheet.addRow([...resultRow, getTimeForProject(testResult.assignment).startTime.toLocaleString(), getTimeForProject(testResult.assignment).endTime.toLocaleString(), getTimeForProject(testResult.assignment).totalTime, testResult.totalCost, testResult.distanceWithKPIEmployeesTarget, performanceTime])
  
  taskSheet.addRow(['KPI Phân bổ'])
  let header = ['Employee ID Name', 'Employee ID']
  for (let key in kpiTarget) {
    header.push('KPI Type ' + key)
  }
  taskSheet.addRow([...header])
  for (let key in testResult.kpiOfEmployees) {
    const employeeName = project.employees.find((item) => Number(item.id) == Number(key)).name
    const kpiOfEmployee = testResult.kpiOfEmployees[key]
    let row = [employeeName, key]
    for (let kpiType in kpiOfEmployee) {
      row.push(kpiOfEmployee[kpiType])
    }
    taskSheet.addRow([...row])
  }


  // Thêm dữ liệu cho sheet lịch nhân công thực hiện công việc
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
      name: task.name,
      project: "Project Hien tai",
      estimateTime: task?.estimateTime,
      requireAssign: task?.requireAssign,
      requireAsset: task?.requireAsset
    })
  }
  for (let key in employeeTimes) {
    const employeeWorks = employeeTimes[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

    employeesheet.addRow(['Emp ID', 'Task ID', 'Task name', 'StartTime', 'End Time', 'Task ở đâu', 'Task liên quan', 'point', 'estimate Time'])
    for (let i = 0; i < employeeWorks.length; i++) {
      employeesheet.addRow([key, employeeWorks[i]?.id, employeeWorks[i]?.name, employeeWorks[i].startTime, employeeWorks[i].endTime, employeeWorks[i]?.project ? employeeWorks[i]?.project : employeeWorks[i]?.status ? "Project QK" : "Project outof", employeeWorks[i]?.taskLq, employeeWorks[i]?.evaluatePoint === -1 ? "fail" : employeeWorks[i]?.evaluatePoint, employeeWorks[i]?.estimateTime ? employeeWorks[i]?.estimateTime : employeeWorks[i]?.taskLq, JSON.stringify(employeeWorks[i]?.requireAssign), JSON.stringify(employeeWorks[i]?.requireAsset)])
    }
  }


  // Thêm dữ liệu cho sheet thời gian của tài sản
  const assetsAll = project.assets
  const allAssets = [...assetsAll.inUse, ...assetsAll.readyToUse]
  let allAssetTimes = {}
  allAssets.forEach((asset) => {
    allAssetTimes[asset.id] = asset.usageLogs || []
  })
  testResult.assignment.forEach(({ task, assets }) => {
    const {startTime, endTime} = task
    assets.forEach((asset) => {
      allAssetTimes[asset.id].push({
        startDate: new Date(startTime),
        endDate: new Date(endTime),
        task: task.name
      })
    })
  })

  assetSheet.addRow(['AssetID', 'Start Date', 'End Date', 'Thực hiện công việc trong dự án'])

  Object.keys(allAssetTimes).forEach(assetId => {
    allAssetTimes[assetId].forEach(time => {
      assetSheet.addRow([
        assetId,
        time.startDate.toLocaleString(),
        time.endDate.toLocaleString(),
        time?.task ? item.task : "Công việc khác ngoài dự án"
      ]);
    });
  });
  
  // Save workbook to a file
  const filePath = '../output/task_kpis_output.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

testDLHS()

