const { lastKPIs } = require('../data/kpi');
const { topologicalSort, scheduleTasks, assignTasks } = require('../helper');

// Các biến toàn cục
let employees; // Danh sách nhân viên
let tasks; // Danh sách nhiệm vụ
let kpis; // Danh sách KPI gần nhất
let job;
const START_DATE = new Date()
START_DATE.setFullYear(2024, 3, 21);
START_DATE.setHours(0, 0, 0, 0)

const PAR = 0.3, HMCR = 0.95


// Hàm khởi tạo
function init() {
  // Đọc dữ liệu đầu vào từ các biến toàn cục
  employees = require('../data/employee').employees;
  tasks = require("../data/task").tasks;
  kpis = require("../data/kpi").lastKPIMatrix;
  job = {
    startTime: START_DATE,
    tasks: tasks
  }

  const tbSalary = employees.reduce((currValue, currItem) => currValue + currItem.costPerHour, 0) / employees.length;
  const totalTimeEstimate = tasks.reduce((currValue, currItem) => currValue + currItem.estimateTime, 0)
  w2 = 1 / (6 * tbSalary * totalTimeEstimate * 8)
  w1 = -1, w3 = 1;
}

function calculateAverageInLastKPI(lastKPIs) {
  let num = 0;
  let total = 0;
  lastKPIs.forEach((kpiItem) => {
    kpiItem.kpiInTask.forEach((item) => {
      if (item > 0) {
        num++;
        total += item
      }
    })
  })
  return total/num
}

function generateRandomSolution(tasks, employees, lastKPIs) {
  const tasksLength = tasks.length;
  const employeesLength = employees.length 

  if (!tasksLength || !employeesLength) {
    throw new Error("Mảng tasks hoặc employees trống")
  }

  let solution = [];
  // console.log("solutonLength: ", solution)

  
  for(let i = 0; i < tasksLength; i++) {
    const taskID = tasks[i].id

    // TODO: replace minPerformemceRequireInTask value
    const minPerformemceRequireInTask = 0
    const availableEmps = lastKPIs
      .filter((item) => item.kpiInTask[taskID] !== -1 && item.kpiInTask[taskID] > minPerformemceRequireInTask)
    
    let randomIndex = 0;
    let empIndex = -1;
    let assignEmployee = {}
    let KPIExpectValue = 0

    if (availableEmps?.length) {
      randomIndex = Math.floor(Math.random() * availableEmps.length);
      // solution[i] = availableEmps[randomIndex]
      empIndex = availableEmps[randomIndex].id
      KPIExpectValue = availableEmps[randomIndex].kpiInTask[taskID]
    } else {
      randomIndex = Math.floor(Math.random() * employeesLength)
      empIndex = employees[randomIndex].id
    }
    assignEmployee = employees.find((item) => item.id === empIndex)
    KPIExpectValue = lastKPIs.find((item) => item.id === empIndex).kpiInTask[taskID]
    KPIExpectValue = KPIExpectValue !== -1 ? KPIExpectValue : 0

    solution.push({
      task: {
        id: tasks[i].id,
        estimateTime: tasks[i].estimateTime
      },
      assignEmployee: {
        id: assignEmployee.id,
        costPerHour: assignEmployee.costPerHour
      },
      KPIValue: KPIExpectValue
    })
  }
  return solution;
}


// evaluateObjectTive1
function evaluateTotalKPI(solution) {
  // TODO: calculate with KPI weight in KPI type and KPI weight in task
  const weight = 1;
  const value = solution.reduce((currValue, currItem) => currValue + currItem.KPIValue * weight, 0)
  return value / (weight*solution.length);
}

function evaluateTotalCost(solution) {
  const workDayHour = 8
  // const TOTAL_HOUR = 
  // const AVERAGE_EMP_COST = employees

  const value = solution.reduce((currValue, currItem) => currValue + currItem.task.estimateTime * currItem.assignEmployee.costPerHour * workDayHour, 0)
  return value;
}

function evaluateMaxKPIChechLech(solution) {
  let employeeInfo = {}
  solution.forEach(item => {
    const { assignEmployee, KPIValue } = item;
    const { id, costPerHour } = assignEmployee;

    // Kiểm tra nếu id của người làm việc đã được thêm vào đối tượng employeeInfo chưa
    if (!employeeInfo[id]) {
      employeeInfo[id] = { id, costPerHour: assignEmployee.costPerHour, totalKPI: 0, costPerHour };
    }
  
    // Cập nhật tổng KPI cho người làm việc
    employeeInfo[id].totalKPI += KPIValue;
  });

  const sortedEmployees = Object.values(employeeInfo).sort((a, b) => {
    return (b.totalKPI / b.costPerHour) - (a.totalKPI / a.costPerHour);
  });

  

  // Tính độ chênh lệch lớn nhất tỷ lệ KPI/Luong
  let maxDifference = 0;
  for (let i = 0; i < sortedEmployees.length - 1; i++) {
    let radioB = sortedEmployees[i + 1].totalKPI / sortedEmployees[i + 1].costPerHour
    let radioA =  sortedEmployees[i].totalKPI / sortedEmployees[i].costPerHour
    const difference = radioA - radioB;
    if (difference > maxDifference) {
      maxDifference = difference;
    }
  }
  
  return maxDifference
}

function random() {
  return Math.random();
}



// 1: Total KPI, 2: totalCost, 3: chenh lech KPI/luong
function evaluateObjectTiveFitness(objVlaue1, w1, objVlaue2, w2, objVlaue3, w3) {
  return w1 / objVlaue1 + w2 * objVlaue2 + w3 * objVlaue3;
}

function updateHarmonyMemory(HM, newSolution, obj1, w1, obj2, w2, obj3, w3) {
  HM.sort((solutionA, solutionB) => {
    const obj1A = solutionA.toalKPI
    const obj2A = solutionA.totalCost
    const obj3A = solutionA.chenhLechRatio

    const obj1B = solutionB.toalKPI
    const obj2B = solutionB.totalCost
    const obj3B = solutionB.chenhLechRatio

    const fitnessA = evaluateObjectTiveFitness(obj1A, w1, obj2A, w2, obj3A, w3)
    const fitnessB = evaluateObjectTiveFitness(obj1B, w1, obj2B, w2, obj3B, w3)

    return fitnessA - fitnessB
  })

  const lastWorstSolution = HM[HM.length - 1]
  const obj1W = lastWorstSolution.toalKPI
  const obj2W = lastWorstSolution.totalCost
  const obj3W = lastWorstSolution.chenhLechRatio
  const fitnessW = evaluateObjectTiveFitness(obj1W, w1, obj2W, w2, obj3W, w3)
  const fitnessNew = evaluateObjectTiveFitness(obj1, w1, obj2, w2, obj3, w3)

  if (fitnessW > fitnessNew) {
    HM.pop()
    HM.push({
      solution: newSolution,
      toalKPI: obj1,
      totalCost: obj2,
      chenhLechRatio: obj3
    })
  }
}

// arr = [0, 4, 3, 1, 3]
// arr.sort((a, b) => a - b)
// console.log("arr: ", arr)
// arr.pop()
// console.log("arr: ", arr)


function harmonySearch(hmSize, maxIter, PAR, HMCR, bw, tasks, employees, lastKPIs) {
  let HM = []

  // Init size
  for (let i = 0; i < hmSize; i++) {
    const solution = generateRandomSolution(tasks, employees, lastKPIs)
    const objVlaue1 = evaluateTotalKPI(solution)
    const objVlaue2 = evaluateTotalCost(solution)
    const objVlaue3 = evaluateMaxKPIChechLech(solution)

    HM.push({
      solution,
      toalKPI: objVlaue1,
      totalCost: objVlaue2,
      chenhLechRatio: objVlaue3
    })
  }

  for (let iteration = 0; iteration < maxIter; iteration++) {
    // Step 2: Improve new solution
    let newSolution = []
    const minPerformemceRequireInTask = 0
    for (let i = 0; i < tasks.length; i++) {
      let taskID = tasks[i].id

      const availableEmps = lastKPIs
        .filter((item) => item.kpiInTask[taskID] !== -1 && item.kpiInTask[taskID] > minPerformemceRequireInTask)
      
      let randomIndex = 0;
      let empIndex = -1;

      let assignEmployee = {}
      let KPIExpectValue = 0

      if (availableEmps?.length) {
        randomIndex = Math.floor(Math.random() * availableEmps.length);
        // solution[i] = availableEmps[randomIndex]
        empIndex = availableEmps[randomIndex].id
        KPIExpectValue = availableEmps[randomIndex].kpiInTask[taskID]
      } else {
        randomIndex = Math.floor(Math.random() * employeesLength)
        empIndex = employees[randomIndex].id
      }
      xj = empIndex // random xj

      // adjust xj
      if (random() < HMCR) {
        // xj = random của cột j của HM member random trong HM, lấy id
        const randomSolution = HM[Math.floor(Math.random() * HM.length)]
        // console.log("rand so: ", randomSolution)
        let xj = randomSolution.solution.find((item) => item.task.id === taskID).assignEmployee.id
        let randomXJID = 0
        if (random() < PAR) {
          if (availableEmps?.length) {
            randomXJID = Math.floor((xj + random() * bw) % availableEmps?.length)
            xj = availableEmps[randomXJID].id
          } else {
            randomXJID = Math.floor((xj + random() * bw) % employeesLength?.length)
            xj = employees[randomXJID].id
          }
        }
      } 

      // túm lại xj là id của thằng employee ứng với taskId của thằng solution mới
      assignEmployee = employees.find((item) => item.id === xj)
      KPIExpectValue = lastKPIs.find((item) => item.id === xj).kpiInTask[taskID]
      KPIExpectValue = KPIExpectValue !== -1 ? KPIExpectValue : 0

      newSolution.push({
        task: {
          id: tasks[i].id,
          estimateTime: tasks[i].estimateTime
        },
        assignEmployee: {
          id: assignEmployee.id,
          costPerHour: assignEmployee.costPerHour
        },
        KPIValue: KPIExpectValue
      })
    }
    const newobj1 = evaluateTotalKPI(newSolution)
    const newobj2 = evaluateTotalCost(newSolution)
    const newobj3 = evaluateMaxKPIChechLech(newSolution)

    // STEP 3: UPDATE HM
    updateHarmonyMemory(HM, newSolution, newobj1, w1, newobj2, w2, newobj3, w3);

  }

  return HM[0]
}


function main() {
  init()
  job.tasks = topologicalSort(tasks)
  job.tasks = scheduleTasks(job)

  // TEST INIT
  // console.log("emp: ", employees)
  // console.log("AVE: ", calculateAverageInLastKPI(lastKPIs))

  
  // TEST RANDOM solution
  // console.log("test: ", generateRandomSolution(job.tasks, employees, lastKPIs))
  // const solutionRandom = generateRandomSolution(job.tasks, employees, lastKPIs)
  // console.log("solution: ", solutionRandom)
  
  // const objVlaue1 = evaluateTotalKPI(solutionRandom)
  // console.log("kpi: ", objVlaue1)
  // const testTotalCost = evaluateTotalCost(solutionRandom)
  // console.log("cost: ", evaluateTotalCost(solutionRandom))

  // const kpiChenhLech =   evaluateMaxKPIChechLech(solutionRandom)

  // console.log("chenh lech: ", evaluateMaxKPIChechLech(solutionRandom))


  // console.log(`fitness:= (v2 = ${w2 * testTotalCost})`, w1 * objVlaue1 + w2 * testTotalCost + w3 * kpiChenhLech)

  const HM_SIZE = 30, MAX_ITER = 10000, bw = 1
  // console.log("tasks: ", job.tasks)

  
  const tbSalary = employees.reduce((currValue, currItem) => currValue + currItem.costPerHour, 0) / employees.length;
  const totalTimeEstimate = tasks.reduce((currValue, currItem) => currValue + currItem.estimateTime, 0)
  w2 = 1 / (6 * tbSalary * totalTimeEstimate * 8)
  w1 = 1, w3 = 1;
  console.log(w1, w2, w3)
  console.log("HMSIZE: ", HM_SIZE)
  console.log("MaxIter: ", MAX_ITER)

  const result = harmonySearch(HM_SIZE, MAX_ITER, PAR, HMCR, bw, job.tasks, employees, lastKPIs)
  console.log("result: ", result)
}

// CALL Main()
main();
