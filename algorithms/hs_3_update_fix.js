const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS } = require("../consts/kpi.const");
const { scheduleTasks, topologicalSort } = require("../helper");
const { assets, assetAll } = require("../new_data/asset");
const { employees } = require("../new_data/employee");
const { lastKPIs } = require("../new_data/kpi");
const { tasks } = require("../new_data/task");
const ExcelJS = require('exceljs');
const { getKpiOfEmployees, getAvailableEmployeesForTasks, harmonySearch, compareSolution, scheduleTasksWithAsset, reScheduleTasks, newHarmonySearch, checkIsFitnessSolution, splitKPIToEmployees, DLHS } = require("./hs_helper");
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
      let randomIndex = Math.floor(Math.random() * data.length) % data.length
      randomIndex = 4
      let kpiOfEmployeesTarget = data[randomIndex]
      kpiOfEmployeesTarget = {
        '1': { A: 0.18, B: 0.228571428571429, C: 0.15 },
        '2': { A: 0.0685714285714286, B: 0.228571428571429, C: 0.133333333333333 },
        '3': { A: 0.137142857142857, B: 0, C: 0.116666666666667 },
        '4': { A: 0.12, B: 0, C: 0 },
        '5': { A: 0, B: 0.128571428571429, C: 0.116666666666667 },
        '6': { A: 0, B: 0.114285714285714, C: 0.3 },
        '7': { A: 0.182857142857143, B: 0.114285714285714, C: 0 },
        '8': { A: 0.114285714285714, B: 0, C: 0 },
      }

      employees.forEach((employee) => {
        kpiOfEmployeesTarget[employee.id]['total'] = 0
        for (let key in KPI_TYPES) {
          kpiOfEmployeesTarget[employee.id]['total'] += kpiOfEmployeesTarget[employee.id][key] * KPI_TYPES[key].weight
        }
      })
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
      
      const PAR = 0.4, HMCR = 0.95, HM_SIZE = 40, bw = 1, MAX_TER = 4000
      const BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 3, Max_FEs = 10000, FEs = 0, R = 102

      const kpiTarget = {
        'A': { value: 0.8, weight: 0.35 },
        'B': { value: 0.8, weight: 0.35 },
        'C': { value: 0.8, weight: 0.3 },
      }
      const standardDeviationTarget = 0.1

      let fitnessSolutions = []
      const kpiOfEmployeesSplit = splitKPIToEmployees(job.tasks, employees, kpiTarget)
      // console.log("kpiOfEmployeesSplit: ", kpiOfEmployeesSplit)

  
      let testResult = DLHS(HM_SIZE, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs, FEs, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
      // console.log("testReult ki: ", testResult.kpiOfEmployees)
      // console.log("target: ", )
      for (let i = 1; i < 30; i++) {
        const result = DLHS(HM_SIZE, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs, FEs, job.tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget)
        // const result = searchResult.bestFind
        // const listFitness = searchResult.bestFitnessSolutions
        // if (listFitness?.length) {
        //   console.log("vào đây")
        // }
        const checkIsFitnessSolutionResult = checkIsFitnessSolution(result, kpiTarget, kpiOfEmployeesTarget)
        if (checkIsFitnessSolutionResult) {
          testResult = result
          console.log("target: ", kpiOfEmployeesTarget)
          console.log("result: ", testResult.kpiOfEmployees)
          // console.log("assignment: ", testResult.assignment)
          console.log("kpi: ", testResult.kpiAssignment)
          break
        }
        if (!compareSolution(testResult, result, kpiTarget, kpiOfEmployeesTarget)) {
          testResult = result
        }
      }
      reScheduleTasks(testResult.assignment, assets)
      console.log("result: ", testResult.kpiOfEmployees)
      console.log("target: ", kpiOfEmployeesTarget)
      // console.log("assignment: ", testResult.assignment)
      console.log("kpi: ", testResult.kpiAssignment)
      const checkIsFitnessSolutionResult = checkIsFitnessSolution(testResult, kpiTarget, kpiOfEmployeesTarget)
      if (checkIsFitnessSolutionResult) {
        console.log("result: ", testResult.kpiOfEmployees)
        console.log("target: ", kpiOfEmployeesTarget)
        // console.log("assignment: ", testResult.assignment)
        console.log("kpi: ", testResult.kpiAssignment)
        console.log("ok id: ", randomIndex)

      } else {
        console.log("bad id: ", randomIndex)
      }

    })
    .catch((error) => {
      console.error('Lỗi khi đọc dữ liệu từ file:', error);
    });
}

testResult()


// Example usage
// fillDataToExcel();
