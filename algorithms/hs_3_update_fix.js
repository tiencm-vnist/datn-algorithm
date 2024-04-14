const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS } = require("../consts/kpi.const");
const { scheduleTasks, topologicalSort } = require("../helper");
const { assets, assetAll } = require("../new_data/asset");
const { employees } = require("../new_data/employee");
const { lastKPIs } = require("../new_data/kpi");
const { tasks } = require("../new_data/task");
const ExcelJS = require('exceljs');
const { getKpiOfEmployees, getAvailableEmployeesForTasks, harmonySearch, compareSolution, scheduleTasksWithAsset, reScheduleTasks, newHarmonySearch, checkIsFitnessSolution, getDistanceOfKPIEmployeesTarget, splitKPIToEmployees } = require("./hs_helper");
// CHIẾN LƯỢC 1: BƯỚC 1: GÁN TÀI NGUYÊN VÀ KHUNG THỜI GIAN SAO CHO NHỎ NHẤT CÓ THỂ (THỰC HIỆN SONG SONG VÀ CHECK LUÔN 1 TÀI NGUYÊN CHỈ THỰC HIỆN 1 TASK TẠI 1 THỜI ĐIỂM)


// SAVE result to ./output/output.json files
const fileName = './algorithms/output/kpi_employee.json'
const fs = require('fs');

async function saveResult(newResult, fileName) {
  // Đọc dữ liệu từ file JSON
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      console.error('Lỗi khi đọc file:', err);
      return;
    }

    // Chuyển đổi dữ liệu từ chuỗi JSON thành mảng JavaScript
    let testResults = [];
    try {
      testResults = JSON.parse(data);
    } catch (err) {
      console.error('Lỗi khi parse dữ liệu JSON:', err);
      return;
    }

    // Thêm testResult mới vào mảng đã đọc từ file JSON
    testResults.push(newResult);

    // Chuyển đổi mảng đã cập nhật thành chuỗi JSON
    const updatedData = JSON.stringify(testResults, null, 2);

    // Ghi dữ liệu đã cập nhật vào file JSON
    fs.writeFile(fileName, updatedData, (err) => {
      if (err) {
        console.error('Lỗi khi ghi vào file:', err);
        return;
      }
      console.log(`Đã cập nhật và lưu dữ liệu vào file ${fileName}`);
    });
  });
}

function readDataFromFile(fileName) {
  return new Promise((resolve, reject) => {
    // Đọc dữ liệu từ file JSON
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        reject(err); // Trả về lỗi nếu có lỗi khi đọc file
        return;
      }

      try {
        const dataArray = JSON.parse(data); // Chuyển đổi dữ liệu từ chuỗi JSON thành mảng JavaScript
        resolve(dataArray); // Trả về mảng đã được đọc từ file
      } catch (error) {
        reject(error); // Trả về lỗi nếu có lỗi khi phân tích cú pháp JSON
      }
    });
  });
}


async function main() {
  // init sth
  const START_DATE = new Date()
  START_DATE.setFullYear(2024, 4, 1)
  START_DATE.setHours(0, 0, 0, 0)
  job = {
    startTime: START_DATE,
    tasks: tasks
  }
  job.tasks = topologicalSort(tasks)
  job.tasks = scheduleTasksWithAsset(job, assets)
  job.tasks = getAvailableEmployeesForTasks(job.tasks, employees)
  

  const tasksDictionary = {}
  tasks.forEach((task) => {
    const {name, preceedingTasks, startTime, endTime, estimateTime, kpiInTask, id } = task
    tasksDictionary[id] = {
      name,
      preceedingTasks: [...preceedingTasks],
      startTime,
      endTime,
      estimateTime,
      kpiInTask: [...kpiInTask]
    }
  })

  const employeesDictionary = {}
  employees.forEach((employee) => {
    const { name, costPerHour, qualities, id } = employee
    employeesDictionary[id] = {
      name,
      costPerHour,
      qualities: { ...qualities }
    }
  })


  const PAR = 0.4, HMCR = 0.95, HM_SIZE = 40, bw = 1, MAX_TER = 4000
  const kpiTarget = {
    'A': { value: 0.8, weight: 0.35 },
    'B': { value: 0.8, weight: 0.35 },
    'C': { value: 0.8, weight: 0.3 },
  }
  const standardDeviationTarget = 0.1

  let fitnessSolutions = []

  
  let testResult = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFind
  for (let i = 1; i < 10; i++) {
    const result = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFind
    // const bestFitnessSolutions = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFitnessSolutions
    if (!compareSolution(testResult, result)) {
      testResult = result
    }
    // if (result.standardDeviation < 0.15) {
    //   fitnessSolutions.push(result)
    //   fitnessSolutions = fitnessSolutions.concat(bestFitnessSolutions)
    // }
  }
  reScheduleTasks(testResult.assignment, assets)
  // console.log("solution: ", testResult.assignment)
  const kpiOfEmployee = getKpiOfEmployees(testResult.assignment, employees, lastKPIs)
  await saveResult(kpiOfEmployee, fileName)
  // if (fitnessSolutions.length) {
  //   fitnessSolutions.sort((solutionA, solutionB) => compareSolution(solutionA, solutionB) ? -1 : 1)
  // }


}




// main()

function testResult() {
  // Sử dụng hàm để đọc dữ liệu từ file
  readDataFromFile(fileName)
    .then((data) => {
      const randomIndex = Math.floor(Math.random() * data.length) % data.length
      let kpiOfEmployeesTarget = data[randomIndex]
      // kpiOfEmployeesTarget = splitKPIToEmployees(job.tasks, employees, lastKPIs)
      // const kpiOfEmployeesTarget1 = data[2]

      // console.log("distance: ", getDistanceOfKPIEmployeesTarget(kpiOfEmployeesTarget, kpiOfEmployeesTarget1))
      // return
      // console.log("kpiOfEmployee: ", kpiOfEmployee)
      const START_DATE = new Date()
      START_DATE.setFullYear(2024, 4, 1)
      START_DATE.setHours(0, 0, 0, 0)
      job = {
        startTime: START_DATE,
        tasks: tasks
      }
      job.tasks = topologicalSort(tasks)
      job.tasks = scheduleTasksWithAsset(job, assets)
      job.tasks = getAvailableEmployeesForTasks(job.tasks, employees)


      
      const PAR = 0.4, HMCR = 0.95, HM_SIZE = 40, bw = 1, MAX_TER = 5000
      const kpiTarget = {
        'A': { value: 0.8, weight: 0.35 },
        'B': { value: 0.8, weight: 0.35 },
        'C': { value: 0.8, weight: 0.3 },
      }
      const standardDeviationTarget = 0.1

      let fitnessSolutions = []
      kpiOfEmployeesTarget = splitKPIToEmployees(job.tasks, employees, kpiTarget)

      // kpiOfEmployeesTarget = data[1]

      let testResult = newHarmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, kpiOfEmployeesTarget, job.tasks, employees, lastKPIs).bestFind
      for (let i = 1; i < 30; i++) {
        const searchResult = newHarmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, kpiOfEmployeesTarget, job.tasks, employees, lastKPIs)
        const result = searchResult.bestFind
        const listFitness = searchResult.bestFitnessSolutions
        const checkIsFitnessSolutionResult = checkIsFitnessSolution(result, kpiTarget, kpiOfEmployeesTarget)
      
        if (!compareSolution(testResult, result, kpiTarget, kpiOfEmployeesTarget)) {
          testResult = result
        }
      }
      reScheduleTasks(testResult.assignment, assets)
      console.log("result: ", testResult.kpiOfEmployees)
      console.log("target: ", kpiOfEmployeesTarget)
      console.log("assignment: ", testResult.assignment)
      console.log("kpi: ", testResult.kpiAssignment)
      console.log("distance: ", testResult.distanceWithKPIEmployeesTarget)
      console.log("distance check: ", getDistanceOfKPIEmployeesTarget(testResult.kpiOfEmployees, kpiOfEmployeesTarget))
      const checkIsFitnessSolutionResult = checkIsFitnessSolution(testResult, kpiTarget, kpiOfEmployeesTarget)
      if (checkIsFitnessSolutionResult) {
        console.log("fitness")
      } else {
        console.log("none fitness")
      }

    })
    .catch((error) => {
      console.error('Lỗi khi đọc dữ liệu từ file:', error);
    });
}

testResult()



// const fs = require('fs');

async function fillDataToExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Task KPIs');
  const employeesheet = workbook.addWorksheet('Task KPIs of Employee');

  const START_DATE = new Date()
  START_DATE.setFullYear(2024, 4, 1)
  START_DATE.setHours(0, 0, 0, 0)
  job = {
    startTime: START_DATE,
    tasks: tasks
  }
  job.tasks = topologicalSort(tasks)
  job.tasks = scheduleTasksWithAsset(job, assets)
  // console.log("job.tasks: ", job.tasks)
  // console.log("assets: ", assets.inUse[0].usageLogs)
  job.tasks = getAvailableEmployeesForTasks(job.tasks, employees)

  const PAR = 0.4, HMCR = 0.95, HM_SIZE = 40, bw = 1, MAX_TER = 10000
  const kpiTarget = {
    'A': { value: 0.8, weight: 0.35 },
    'B': { value: 0.8, weight: 0.35 },
    'C': { value: 0.8, weight: 0.3 },
  }
  const standardDeviationTarget = 0.1


  for (let j = 0; j < 10; j++) {
    // Add headers
    worksheet.addRow(['Task ID', 'AssigneeId', 'MachineId', 'Start Time', 'End Time', ' ', 'Total Cost', 'Standard Ratio', 'Total KPI A', 'Total KPI B', 'TotalKPI C', '', 'AssigneeId', 'Total KPI A of Assignee with All Tasks', 'Toal KPI B of Assignee with All Tasks', 'Total KPI C of Assignee with All Tasks']);
    // add vào đây 
    let testResult = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFind
    for (let i = 1; i < 8; i++) {
      const result = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFind
      // const bestFitnessSolutions = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFitnessSolutions
      if (!compareSolution(testResult, result)) {
        testResult = result
      }
    }
    reScheduleTasks(testResult.assignment, assets)
    const kpiAssignemt = testResult.kpiAssignment
    const kpiOfEmployee = getKpiOfEmployees(testResult.assignment, employees, lastKPIs)
    for (let i = 0; i < testResult.assignment.length; i++) {
      const { task, assignee, assets } = testResult.assignment[i]
      // console.log(task.id, assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.standardDeviation, kpiAssignemt['A'], kpiAssignemt['B'], kpiAssignemt['C'],  ' ', assignee.id, kpiOfEmployee[assignee.id]['A'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployee[assignee.id]['C'])
      worksheet.addRow([task.id, assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.standardDeviation, kpiAssignemt['A'], kpiAssignemt['B'], kpiAssignemt['C'],  ' ', assignee.id, kpiOfEmployee[assignee.id]['A'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployee[assignee.id]['C']]);
    }
    

    employeesheet.addRow(['Employee ID', 'Total KPI A of Assignee with All Tasks', 'Toal KPI B of Assignee with All Tasks', 'Total KPI C of Assignee with All Tasks', '', 'Total KPI A', 'Total KPI B', 'TotalKPI C', 'Standard']);
    for (let i = 0; i < employees.length; i++) {
      employeesheet.addRow([employees[i].id, kpiOfEmployee[employees[i].id]['A'], kpiOfEmployee[employees[i].id]['B'], kpiOfEmployee[employees[i].id]['C'], '', kpiAssignemt['A'], kpiAssignemt['B'], kpiAssignemt['C'], testResult.standardDeviation]);
    }
    console.log("j = ", j + 1)
  }
  

  // Save workbook to a file
  const filePath = 'task_kpis.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

// Example usage
// fillDataToExcel();
