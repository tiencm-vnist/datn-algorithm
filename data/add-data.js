
const fs = require('fs')
const ExcelJS = require('exceljs');
const { assets } = require('./asset');
const { getLastKPIAndAvailableEmpsInTasks } = require('../algorithms/hs_helper');

const workbook = new ExcelJS.Workbook();

const inputTaskSheet = workbook.addWorksheet('Input_Task');
const inputEmployeeSheet = workbook.addWorksheet('Input_Employee');
const inputAsset = workbook.addWorksheet('Input_Asset');
const taskInPastSheet = workbook.addWorksheet('Task_In_Past')
const taskOutOfSheet = workbook.addWorksheet('Task_In_Progress')
const lastKPISheet = workbook.addWorksheet('KPI_In_Task')

const tasks = require('./task').tasks
const employees = require('./employee').employees
const allTasksInPast = require('./taskInPast').allTasksInPast

// console.log("task: ", tasks)


async function addInputTaskData() {
  inputTaskSheet.addRow(['ID Công việc', 'Mã Công việc', 'Tên công việc', 'Loại KPI Liên quan', 'Trọng số KPI', 'Ước lượng thời gian (ngày)', 'Công việc tiền nhiệm', 'Yêu cầu năng lực nhân sự', 'Yêu cầu tài sản'])
  inputTaskSheet.addRow(['Task ID', 'Task Code', 'Task Name', 'KPI In Task', 'Task Weight', 'Estimate Time', 'Preceeding Tasks', 'Require Assignee', 'Require Asset'])
  tasks.forEach((task) => {
    const { id, name, estimateTime, preceedingTasks, requireAssign, requireAsset, code, kpiInTask } = task
    const preceedingTasksToAdd = preceedingTasks.join(", ")
    let requireAssignToPutData = ''
    for (let key in requireAssign) {
      // console.log("key: ", key)
      requireAssignToPutData += `${key}: ${requireAssign[key]}, `
    }
    requireAssignToPutData = requireAssignToPutData.substring(0, requireAssignToPutData?.length - 2)

    let assetToPutData = ''
    for (let i = 0; i < requireAsset?.length; i++) {
      const requireItem = requireAsset[i]
      assetToPutData += `{ type: ${requireItem?.type}, number: ${requireItem?.number}, capacity: ${requireItem?.quality[0]?.level}}`
    }
    assetToPutData = `[ ${assetToPutData} ]`
    
    inputTaskSheet.addRow([id, code, name, kpiInTask[0].type, kpiInTask[0].weight, estimateTime, preceedingTasksToAdd, requireAssignToPutData, assetToPutData])
  })

  const filePath = '../data/input.csv';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

async function addAssetData() {
  inputAsset.addRow(['ID Tài sản', 'Mã tài sản', 'Tên tài sản', 'Loại tài sản', 'Chi phí vận hành (giờ - $)',  'Khả năng sử dụng', 'Trạng thái', 'Thời gian sử dụng'])
  inputAsset.addRow(['Asset ID', 'Asset Code', 'Asset Name', 'Type', 'Cost Per Hour', 'Capacity', 'Status', 'Usage logs'])

  let assetAll = [...assets.readyToUse, ...assets.inUse].sort((a, b) => a.id - b.id)
  assetAll.forEach((asset) => {
    const { id, code, costPerHour, name, status, type, qualities, usageLogs } = asset
    let usageLogsToPush = ''
    usageLogs?.length && usageLogs.forEach((item) => {
      usageLogsToPush += `{startTime: ${item.startDate.toLocaleString()} - endTime: ${item.endDate.toLocaleString()}}, `
    })
    usageLogsToPush = usageLogsToPush.substring(0, usageLogsToPush?.length - 2)
    usageLogsToPush = `[ ${usageLogsToPush} ]`
    inputAsset.addRow([id, code, name, type, costPerHour, qualities[0].level, status, usageLogsToPush])
  })
  const filePath = '../data/input.csv';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

async function addEmployeeData() {
  inputEmployeeSheet.addRow(['ID Nhân viên', 'Mã nhân viên', 'Tên nhân viên', 'Lương (giờ - $)',  'Năng lực [thuộc tính: giá trị]'])
  inputEmployeeSheet.addRow(['Employee ID', 'Employee Code', 'Employee Name', 'Cost Per Hour', 'Capacities'])

  employees.forEach((employee) => {
    const { id, employeeNumber, costPerHour, name, qualities } = employee
    let capacitiesToPush = ''
    for (let key in qualities) {
      capacitiesToPush += `${key}: ${qualities[key]}, `
    }
    capacitiesToPush = capacitiesToPush.substring(0, capacitiesToPush?.length - 2)
    capacitiesToPush = `[ ${capacitiesToPush} ]`
    inputEmployeeSheet.addRow([id, employeeNumber, name, costPerHour, capacitiesToPush])
  })
  const filePath = '../data/input.csv';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

async function addInputTaskInPastData() {
  taskInPastSheet.addRow(['ID Nhân viên', 'Tên nhân viên', 'Tên công việc thực hiện', 'Trạng thái', 'Bắt đầu', 'Kết thúc', 'Số ngày công', 'Yêu cầu năng lực', 'Kết quả đánh giá'])
  taskInPastSheet.addRow(['Employee ID', 'Employee Name', 'Task Name', 'Trạng thái', 'Start Time', 'End Time', 'Work Time', 'Require Capacities', 'Evaluated Point'])
  let taskInPastOfEmps = {}
  employees.forEach((item) => {
    taskInPastOfEmps[item.id] = []
  })

  allTasksInPast.forEach((task) => {
    const assignee = task.assignee
    taskInPastOfEmps[assignee.id].push({
      ...task
    })
  })
  for (let key in taskInPastOfEmps) {
    const tasksOfEmp = taskInPastOfEmps[key]
    tasksOfEmp.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    const employee = employees.find((item) => Number(item.id) === Number(key))

    tasksOfEmp.forEach((task) => {
      const { name, estimateTime, startTime, endTime, requireAssign, evaluatePoint } = task
      let requireAssignToPutData = ''
      for (let key in requireAssign) {
        // console.log("key: ", key)
        requireAssignToPutData += `${key}: ${requireAssign[key]}, `
      }
      requireAssignToPutData = requireAssignToPutData.substring(0, requireAssignToPutData?.length - 2)
      taskInPastSheet.addRow([employee.id, employee.name, name, 'Đã hoàn thành', startTime.toLocaleString(), endTime.toLocaleString(), estimateTime, requireAssignToPutData, evaluatePoint])
    })
  }
  const filePath = '../data/input.csv';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);

}

async function addInputTaskOutOfData() {
  taskOutOfSheet.addRow(['ID Nhân viên', 'Tên nhân viên', 'Tên công việc thực hiện', 'Trạng thái', 'Bắt đầu', 'Kết thúc', 'Số ngày công', 'Yêu cầu năng lực'])
  taskOutOfSheet.addRow(['Employee ID', 'Employee Name', 'Task Name', 'Start Time', 'Trạng thái', 'End Time', 'Work Time', 'Require Capacities'])
  const allTasksOutOfProject = require('./taskOutofProject').allTasksOutOfProject
  let taskOutOfOfEmps = {}
  employees.forEach((item) => {
    taskOutOfOfEmps[item.id] = []
  })

  allTasksOutOfProject.forEach((task) => {
    const assignee = task.assignee
    taskOutOfOfEmps[assignee.id].push({
      ...task
    })
  })
  for (let key in taskOutOfOfEmps) {
    const tasksOfEmp = taskOutOfOfEmps[key]
    tasksOfEmp.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    console.log(tasksOfEmp)
    const employee = employees.find((item) => Number(item.id) === Number(key))

    tasksOfEmp.forEach((task) => {
      const { name, estimateTime, startTime, endTime, requireAssign } = task
      let requireAssignToPutData = ''
      for (let key in requireAssign) {
        // console.log("key: ", key)
        requireAssignToPutData += `${key}: ${requireAssign[key]}, `
      }
      requireAssignToPutData = requireAssignToPutData.substring(0, requireAssignToPutData?.length - 2)
      taskOutOfSheet.addRow([employee.id, employee.name, name, 'Đang thực hiện', startTime.toLocaleString(), endTime.toLocaleString(), estimateTime, requireAssignToPutData])
    })
  }
  const filePath = '../data/input.csv';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);

}


async function addKPIInTask() {
  const lastKPITMs = getLastKPIAndAvailableEmpsInTasks(tasks, allTasksInPast, employees)
  const allTasks = tasks.map((item) => `${item.id} - ${item.code}`)
  lastKPISheet.addRow(['', '', 'Công việc (ID - Code)'])
  lastKPISheet.addRow(['Tên nhân viên', 'ID nhân viên', ...allTasks])


  lastKPITMs.forEach((item) => {
    const { id, kpiInTask } = item
    const employee = employees.find((item) => Number(item.id) === Number(id))
    let kpiInTaskOfEmp = kpiInTask.filter((item, index) => index !== 0)
    lastKPISheet.addRow([employee.name, employee.id, ...kpiInTaskOfEmp])
  })
  const filePath = '../data/input.csv';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

addInputTaskData()
addAssetData()
addEmployeeData()
addInputTaskInPastData()
addInputTaskOutOfData()
addKPIInTask()