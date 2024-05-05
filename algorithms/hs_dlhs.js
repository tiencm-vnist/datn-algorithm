const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS } = require("../consts/kpi.const");
const { scheduleTasks, topologicalSort } = require("../helper");
const { assets, assetAll } = require("./dangnv/data/asset");
const { employees } = require("./dangnv/data/employee");
// const { lastKPIs } = require("../data/kpi");
const { tasks } = require("./dangnv/data/task");
const ExcelJS = require('exceljs');
const { getKpiOfEmployees, getAvailableEmployeesForTasks, harmonySearch, compareSolution, scheduleTasksWithAsset, reScheduleTasks, newHarmonySearch, checkIsFitnessSolution, splitKPIToEmployees, DLHS, getDistanceOfKPIEmployeesTarget, getDistanceOfKPIEmployeesTarget_2, getTimeForProject, getEmployeesCost } = require("./hs_helper");
// CHIẾN LƯỢC 1: BƯỚC 1: GÁN TÀI NGUYÊN VÀ KHUNG THỜI GIAN SAO CHO NHỎ NHẤT CÓ THỂ (THỰC HIỆN SONG SONG VÀ CHECK LUÔN 1 TÀI NGUYÊN CHỈ THỰC HIỆN 1 TASK TẠI 1 THỜI ĐIỂM)

// const tasks = require('../data-benmark/get-data').tasks
// const employees = require('../data-benmark/get-data').employees

// console.log("task: ", tasks)
// console.log("emps: ", employees)

// SAVE result to ./output/output.json files
const fileName = './algorithms/output/kpi_employee.json'
const fs = require('fs');
const { kMeansWithEmployees, splitKPIToEmployeesByKMeans, findBestMiniKPIOfTasks, reSplitKPIOfEmployees } = require("../helper/k-means");

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
  const BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 3, Max_FEs = 10000, FEs = 0

  let fitnessSolutions = []

  
  let testResult = DLHS(HM_SIZE, BW_max, BW_min, PSLSize, numOfSub, Max_FEs, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
  console.log("test Result: ", testResult)
  // for (let i = 1; i < 10; i++) {
  //   const result = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFind
  //   // const bestFitnessSolutions = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFitnessSolutions
  //   if (!compareSolution(testResult, result)) {
  //     testResult = result
  //   }
  //   // if (result.standardDeviation < 0.15) {
  //   //   fitnessSolutions.push(result)
  //   //   fitnessSolutions = fitnessSolutions.concat(bestFitnessSolutions)
  //   // }
  // }
  reScheduleTasks(testResult.assignment, assets)
  // console.log("solution: ", testResult.assignment)
  const kpiOfEmployee = getKpiOfEmployees(testResult.assignment, employees, lastKPIs)
  // await saveResult(kpiOfEmployee, fileName)
  // if (fitnessSolutions.length) {
  //   fitnessSolutions.sort((solutionA, solutionB) => compareSolution(solutionA, solutionB) ? -1 : 1)
  // }


}

// main()

function testResult() {
  // Sử dụng hàm để đọc dữ liệu từ file
  readDataFromFile(fileName)
    .then((data) => {

      // TEST DATA FROM JSON FILE
      let randomIndex = Math.floor(Math.random() * data.length) % data.length
      randomIndex = 2
      let kpiOfEmployeesTarget = data[randomIndex]

      // employees.forEach((employee) => {
      //   kpiOfEmployeesTarget[employee.id]['total'] = 0
      //   for (let key in KPI_TYPES) {
      //     kpiOfEmployeesTarget[employee.id]['total'] += kpiOfEmployeesTarget[employee.id][key] * KPI_TYPES[key].weight
      //   }
      // })
      // console.log("kpiOfEmployee: ", kpiOfEmployeesTarget)

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
      
      // PARAMS FOR HS
      const PAR = 0.4, HMCR = 0.95, HMS = 60, bw = 1, MAX_TER = 4000

      // PARAMS FOR DHLS
      const BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 3, Max_FEs = 10000, R = 102

      let kpiTarget = {
        'A': { value: 0, weight: 0.35 },
        'B': { value: 0, weight: 0.35 },
        'C': { value: 0, weight: 0.3 },
      }

      // kpiTarget = {}

      const minimumKpi = findBestMiniKPIOfTasks(job.tasks, kpiTarget)
      const clusters = kMeansWithEmployees(employees, 4) 
      kpiOfEmployeesTarget = splitKPIToEmployeesByKMeans(job.tasks, clusters, employees, kpiTarget)
      kpiOfEmployeesTarget = reSplitKPIOfEmployees(minimumKpi, kpiOfEmployeesTarget)


      const DLHS_Arguments = {
        HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs
      }

      let testResult = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
      // for (let i = 1; i < 20; i++) {
      //   const result = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
      //   // const result = searchResult.bestFind
      //   // const listFitness = searchResult.bestFitnessSolutions
      //   // if (listFitness?.length) {
      //   //   console.log("vào đây")
      //   // }
      //   // console.log("check cost: ", testResult.totalCost, " - ", result.totalCost)
      //   const checkIsFitnessSolutionResult = checkIsFitnessSolution(result, kpiTarget, kpiOfEmployeesTarget)
      //   if (checkIsFitnessSolutionResult) {
      //     testResult = result
      //     console.log("target: ", kpiOfEmployeesTarget)
      //     console.log("result: ", testResult.kpiOfEmployees)
      //     console.log("totalCost: ", testResult.totalCost)
      //     console.log("kpi: ", testResult.kpiAssignment)
      //     break
      //   }
      //   if (!compareSolution(testResult, result, kpiTarget, kpiOfEmployeesTarget)) {
      //     testResult = result
      //   }
      // }
      // reScheduleTasks(testResult.assignment, assets)

      // LOG result
      // console.log("result: ", testResult.assignment)
      // console.log("target: ", kpiOfEmployeesTarget)
      // console.log("totalCost: ", testResult.totalCost)
      // console.log("kpi: ", testResult.kpiAssignment)
      // console.log("distance: ", testResult.distanceWithKPIEmployeesTarget)
      // console.log("distance check: ", getDistanceOfKPIEmployeesTarget(testResult.kpiOfEmployees, kpiOfEmployeesTarget))
      // console.log("distance check 2: ", getDistanceOfKPIEmployeesTarget_2(testResult.kpiOfEmployees, kpiOfEmployeesTarget))
      // const checkIsFitnessSolutionResult = checkIsFitnessSolution(testResult, kpiTarget, kpiOfEmployeesTarget)
      // if (checkIsFitnessSolutionResult) {
      //   console.log("result: ", testResult.kpiOfEmployees)
      //   console.log("target: ", kpiOfEmployeesTarget)
      //   // console.log("assignment: ", testResult.assignment)
      //   console.log("kpi: ", testResult.kpiAssignment)
      //   console.log("distance: ", testResult.distanceWithKPIEmployeesTarget)
      //   console.log("distance check: ", getDistanceOfKPIEmployeesTarget(testResult.kpiOfEmployees, kpiOfEmployeesTarget))
      // } else {
      //   console.log("")
      // }

    })
    .catch((error) => {
      console.error('Lỗi khi đọc dữ liệu từ file:', error);
    });
}

// testResult()



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
  const BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 3, Max_FEs = 10000, FEs = 0, R = 100
  const clusters = kMeansWithEmployees(employees, 4) 

  const PAR = 0.4, HMCR = 0.95, HMS = 6, bw = 1, MAX_TER = 10000
  const kpiTarget = {
    'A': { value: 0, weight: 0.35 },
    'B': { value: 0, weight: 0.35 },
    'C': { value: 0, weight: 0.3 },
  }

  const DLHS_Arguments = {
    HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs
  }
  let count = 0;
  do {
    // const kpiOfEmployeesTarget = splitKPIToEmployees(job.tasks, employees, kpiTarget)
    let kpiOfEmployeesTarget = splitKPIToEmployeesByKMeans(job.tasks, clusters, employees, kpiTarget)
    const minimumKpi = findBestMiniKPIOfTasks(job.tasks, kpiTarget)
    kpiOfEmployeesTarget = reSplitKPIOfEmployees(minimumKpi, kpiOfEmployeesTarget)

    console.log("kpi Of Employees Target: ", kpiOfEmployeesTarget)
    worksheet.addRow(['ID_KPI_Target', 'Target A', 'Target B', 'Target C'])
    worksheet.addRow([count + 1, kpiTarget['A'].value, kpiTarget['B'].value, kpiTarget['C'].value])
    // Add headers
    worksheet.addRow(['ID', 'Task ID', 'AssigneeId', 'MachineId', 'Start Time', 'End Time', ' ', 'Total Cost', 'Distance Of KPI', 'Total KPI A', 'Total KPI B', 'TotalKPI C', '', 'AssigneeId', 'KPI A when splits', 'KPI A of Assignee with All Tasks', 'KPI B when splits', 'Total KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks']);
    for (let j = 0; j < 5; j++) {
      // add vào đây 
      let testResult = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
      for (let i = 1; i < 40; i++) {
        const result = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
        // const result = searchResult.bestFind
        // const listFitness = searchResult.bestFitnessSolutions
        // if (listFitness?.length) {
        //   console.log("vào đây")
        // }
        const checkIsFitnessSolutionResult = checkIsFitnessSolution(result, kpiTarget, kpiOfEmployeesTarget)
        if (checkIsFitnessSolutionResult) {
          testResult = result
          // console.log("target: ", kpiOfEmployeesTarget)
          // console.log("result: ", testResult.kpiOfEmployees)
          // // console.log("assignment: ", testResult.assignment)
          // console.log("kpi: ", testResult.kpiAssignment)
          break
        }
        if (!compareSolution(testResult, result, kpiTarget, kpiOfEmployeesTarget)) {
          testResult = result
        }
      }
      reScheduleTasks(testResult.assignment, assets)
      const kpiAssignemt = testResult.kpiAssignment
      const kpiOfEmployee = getKpiOfEmployees(testResult.assignment, employees, lastKPIs)
      for (let i = 0; i < testResult.assignment.length; i++) {
        const { task, assignee, assets } = testResult.assignment[i]
        // console.log(task.id, assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.standardDeviation, kpiAssignemt['A'], kpiAssignemt['B'], kpiAssignemt['C'],  ' ', assignee.id, kpiOfEmployee[assignee.id]['A'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployee[assignee.id]['C'])
        // worksheet.addRow(['Task ID', 'AssigneeId', 'MachineId', 'Start Time', 'End Time', ' ', 'Total Cost', 'Distance Of KPI', 'Total KPI A', 'Total KPI B', 'TotalKPI C', '', 'AssigneeId', 'KPI A when splits', 'KPI A of Assignee with All Tasks', 'KPI B when splits', 'Total KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks']);
        worksheet.addRow([j + 1, task.id, assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.distanceWithKPIEmployeesTarget, kpiAssignemt['A'], kpiAssignemt['B'], kpiAssignemt['C'],  ' ', assignee.id, kpiOfEmployeesTarget[assignee.id]['A'], kpiOfEmployee[assignee.id]['A'], kpiOfEmployeesTarget[assignee.id]['B'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployeesTarget[assignee.id]['C'], kpiOfEmployee[assignee.id]['C']]);
      }    
  
      employeesheet.addRow(['Target A', 'Target B', 'Target C'])
      employeesheet.addRow([kpiTarget['A'].value, kpiTarget['B'].value, kpiTarget['C'].value])
      employeesheet.addRow(['ID', 'Employee ID', 'KPI A when splits', 'Total KPI A of Assignee with All Tasks', 'KPI B when splits', 'Toal KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks', '', 'Total KPI A', 'Total KPI B', 'TotalKPI C', 'Distance']);
      for (let i = 0; i < employees.length; i++) {
        // employeesheet.addRow(['Employee ID', 'KPI A when splits', 'Total KPI A of Assignee with All Tasks', 'KPI B when splits', 'Toal KPI B of Assignee with All Tasks', 'KPI C when splits', 'Total KPI C of Assignee with All Tasks', '', 'Total KPI A', 'Total KPI B', 'TotalKPI C', 'Distance']);
        employeesheet.addRow([i + 1, employees[i].id, kpiOfEmployeesTarget[employees[i].id]['A'], kpiOfEmployee[employees[i].id]['A'], kpiOfEmployeesTarget[employees[i].id]['B'], kpiOfEmployee[employees[i].id]['B'], kpiOfEmployeesTarget[employees[i].id]['C'], kpiOfEmployee[employees[i].id]['C'], '', kpiAssignemt['A'], kpiAssignemt['B'], kpiAssignemt['C'], testResult.distanceWithKPIEmployeesTarget]);
      }
      console.log("j = ", j + 1)
      
    }
    // Tang KPI chi tieu
    const rand = count % 3;
    if (rand === 1) {
      kpiTarget['A'].value += 0.01
    } else if (rand === 2) {
      kpiTarget['B'].value += 0.01
    } else {
      kpiTarget['C'].value += 0.01
    }
    count++;
  }
  while (kpiTarget['A'].value <= 0.83 && kpiTarget['B'].value <= 0.83 && kpiTarget['C'].value <= 0.83) 
  

  // Save workbook to a file
  const filePath = 'task_kpis_k_mean_min.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at: ${filePath}`);
}

// Example usage
// fillDataToExcel();

async function soSanhThuatToan() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('So sanh');
  worksheet.addRow(['Task ID', 'Emp ID', 'Total Day Works', 'Total Cost of Emps'])

  const START_DATE = new Date()
  START_DATE.setFullYear(2024, 4, 1)
  START_DATE.setHours(0, 0, 0, 0)
  job = {
    startTime: START_DATE,
    tasks: tasks
  }

  // console.log("job: ", job.tasks)
  job.tasks = topologicalSort(tasks)
  job.tasks = scheduleTasksWithAsset(job, assets)
 
  // return

  job.tasks = getAvailableEmployeesForTasks(job.tasks, employees)

  // console.log("job.tasks: ", job.tasks)
  // for (let i = 0; i < job.tasks.length; i++) {
  //   console.log(job.tasks[i])
  // }

  // return

  const lastKPIs = employees.map((item) => {
    const kpiInTask = []
    kpiInTask.push(-1)
    tasks.forEach(() => kpiInTask.push(0))
    return {
      id: item.id,
      kpiInTask: kpiInTask
    }
  })

  // PARAMS FOR DHLS
  const HMS = 60, BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 3, Max_FEs = 10000, R = 102
  const kpiTarget = {
    'A': { value: 0, weight: 0.35 },
    'B': { value: 0, weight: 0.35 },
    'C': { value: 0, weight: 0.3 },
  }

  const minimumKpi = findBestMiniKPIOfTasks(job.tasks, kpiTarget)
  const clusters = kMeansWithEmployees(employees, 4) 
  kpiOfEmployeesTarget = splitKPIToEmployeesByKMeans(job.tasks, clusters, employees, kpiTarget)
  kpiOfEmployeesTarget = reSplitKPIOfEmployees(minimumKpi, kpiOfEmployeesTarget)


  const DLHS_Arguments = {
    HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs
  }
    
  worksheet.addRow(['No Iter', 'Task ID', 'Emp ID', 'Start Time', 'End Time', 'Total Day Works', 'Total Cost of Emps', 'Time Exce (ms)'])

  let minTimeCost = Infinity
  let minEmpsCost = Infinity
  let minTimeExce = Infinity


  let totalTimeCost = 0
  let totalEmpsCost = 0
  let totalTimeExce = 0

  for (let t = 0; t < 100; t++) {
    console.log("t: ", t + 1)
    

    let testResult = {}
    const start = performance.now();
    testResult = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
    // console.log(getTimeForProject(testResult.assignment).startTime, getTimeForProject(testResult.assignment).endTime, testResult.falseDuplicate)

    // for (let i = 1; i < 20; i++) {
    //   let result = DLHS(DLHS_Arguments, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
    //   // console.log(getTimeForProject(result.assignment).startTime, getTimeForProject(result.assignment).endTime, result.falseDuplicate)
    //   // const checkIsFitnessSolutionResult = checkIsFitnessSolution(result, kpiTarget, kpiOfEmployeesTarget)
    //   if (compareSolution(result, testResult, kpiTarget, kpiOfEmployeesTarget)) {
    //     testResult = result
    //   }
    // }
    reScheduleTasks(testResult.assignment)
    const end = performance.now();
    const timeExce = end - start
    // console.log("assets: ", assets.inUse.length, assets.readyToUse.length)
    // console.log("testResult: ", testResult.assignment)
    // console.log("getTimeForProject: ", getTimeForProject(testResult.assignment).totalTime)
    // console.log("get Employees Cost: ", getEmployeesCost(testResult.assignment))
    // console.log("get Cost: ", testResult.totalCost)
    // console.log("test kpi: ", testResult.kpiOfEmployees)
    // console.log("test kpi: ", testResult.distanceWithKPIEmployeesTarget)
    const getTimeWorks = getTimeForProject(testResult.assignment).totalTime
    const empCost = getEmployeesCost(testResult.assignment)
    console.log(getTimeForProject(testResult.assignment).startTime, getTimeForProject(testResult.assignment).endTime, empCost, testResult.falseDuplicate, getTimeForProject(testResult.assignment).totalTime)
    totalTimeCost += getTimeWorks
    totalEmpsCost += empCost
    totalTimeExce += timeExce

    if (minTimeCost > getTimeWorks) {
      minTimeCost = getTimeWorks
    }

    if (minEmpsCost > empCost) {
      minEmpsCost = empCost
    }

    if (minTimeExce > timeExce) {
      minTimeExce = timeExce
    }


    for (let k = 0; k < testResult.assignment.length; k++) {
      const { task, assignee } = testResult.assignment[k]
      const taskID = task.id
      const assigneeId = assignee.id
      worksheet.addRow([t + 1, taskID, assigneeId, task.startTime, task.endTime, getTimeWorks, empCost, timeExce])
    }
  }

  worksheet.addRow(['Num Iter', 'Average Emps Cost', 'Average Time Works', 'Average Time Exec (ms)', 'Min Emps Cost', 'Min Time Works', 'Min Time Exec (ms)'])
  worksheet.addRow([100, totalEmpsCost / 100, totalTimeCost / 100, totalTimeExce / 100, minEmpsCost, minTimeCost, minTimeExce])
  const filePath = 'thuat_toan_of_me.xlsx';
  await workbook.xlsx.writeFile(filePath);

}
soSanhThuatToan()