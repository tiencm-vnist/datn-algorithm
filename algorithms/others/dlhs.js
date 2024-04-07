const { topologicalSort, scheduleTasks, assignTasks } = require('../../helper');


// Các biến toàn cục
let employees; // Danh sách nhân viên
let tasks; // Danh sách nhiệm vụ
let lastKPIs; // Danh sách KPI gần nhất
let job;
const START_DATE = new Date()
START_DATE.setFullYear(2024, 3, 21);
START_DATE.setHours(0, 0, 0, 0)

const PAR = 0.3, HMCR = 0.95
let w1 = 1; w2 = 1; w3 = 1;


// Hàm khởi tạo
function init() {
  // Đọc dữ liệu đầu vào từ các biến toàn cục
  employees = require('../data/employee').employees;
  tasks = require("../data/task").tasks;
  lastKPIs = require("../data/kpi").lastKPIs;
  job = {
    startTime: START_DATE,
    tasks: tasks
  }

  const tbSalary = employees.reduce((currValue, currItem) => currValue + currItem.costPerHour, 0) / employees.length;
  const totalTimeEstimate = tasks.reduce((currValue, currItem) => currValue + currItem.estimateTime, 0)
  w2 = 1 / (6 * tbSalary * totalTimeEstimate * 8)
  w1 = 1, w3 = 1;
}

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
  let percentChenhlech
  for (let i = 0; i < sortedEmployees.length - 1; i++) {
    let radioB = sortedEmployees[i + 1].totalKPI / sortedEmployees[i + 1].costPerHour
    let radioA =  sortedEmployees[i].totalKPI / sortedEmployees[i].costPerHour
    const difference = radioA - radioB;
    if (difference > maxDifference) {
      maxDifference = difference;
      percentChenhlech = ((radioA - radioB)) / radioB
    }
  }
  
  return percentChenhlech
}

function randomInRange(a, b) {
  // Tính toán phạm vi giữa a và b
  if (a > b) {
    const temp = a;
    a = b;
    b = temp;
  }
 
  const range = b - a;
  // Sinh số ngẫu nhiên trong phạm vi và trả về
  return Math.random() * range + a;
}

function divideHM(HM, numSubs) {
  const subHMs = [];
  const chunkSize = Math.ceil(HM.length / numSubs); // Kích thước của mỗi phần con

  for (let i = 0; i < HM.length; i += chunkSize) {
      const chunk = HM.slice(i, i + chunkSize); // Chia mảng chính thành các phần con
      subHMs.push(chunk); // Thêm phần con vào mảng subHMs
  }

  return subHMs;
}

function determineBW(BW_max, BW_min, FEs, Max_FEs) {
  if (FEs < Max_FEs / 2) {
    return BW_max - (BW_max - BW_min) * 2 * FEs / Max_FEs
  } else {
    return BW_min
  }
}



function initPSL(PSL, m) {
  for(let i = 0; i < m; i++) {
    let HMCR = randomInRange(0.9, 1)
    let PAR = randomInRange(0, 1)
    PSL.push({
      HMCR,
      PAR
    })
  }
}

function selectRandomFromPSL(PSL) {
  const randomIndex = Math.floor(Math.random() * PSL.length);
  const selected = PSL[randomIndex];
  PSL.splice(randomIndex, 1); // Xóa phần tử đã chọn khỏi mảng
  return selected;
}


function evaluateObjectTiveFitness(objVlaue1, w1, objVlaue2, w2, objVlaue3, w3) {
  return w1 / objVlaue1 + w2 * objVlaue2 + w3 * objVlaue3;
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

function refillPSL(PSL, WPSL, lastPSL, m) {
  if(!WPSL?.length) {
    PSL = lastPSL
    return
  }
  for(let i = 0; i < m; i++) {
    const random = Math.random();
    if (random <= 0.75) {
      const { HMCR, PAR } = WPSL[Math.floor(Math.random() * WPSL.length)]
      PSL.push({
        HMCR, PAR
      })
    } else {
      const HMCR = randomInRange(0.9, 1);
      const PAR = randomInRange(0, 1);
      PSL.push({
        HMCR, PAR
      })
    }
  }
  WPSL = []
  return
}


function initHM(HM, hmSize, tasks, employees, lastKPIs) {
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
}

function findBestLocalSolution(subHM, w1, w2, w3) {
  subHM.sort((solutionA, solutionB) => {
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
  return subHM[0]
}

function updateSubHM(subHM, HMCR, PAR, PSL, WPSL, x_new, newobj1, w1, newobj2, w2, newobj3, w3) {
  subHM.sort((solutionA, solutionB) => {
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

  const lastWorstSolution = subHM[subHM.length - 1]
  const obj1W = lastWorstSolution.toalKPI
  const obj2W = lastWorstSolution.totalCost
  const obj3W = lastWorstSolution.chenhLechRatio
  const fitnessW = evaluateObjectTiveFitness(obj1W, w1, obj2W, w2, obj3W, w3)
  const fitnessNew = evaluateObjectTiveFitness(newobj1, w1, newobj2, w2, newobj3, w3)

  if (fitnessW > fitnessNew) {
    subHM.pop()
    subHM.push({
      solution: x_new,
      toalKPI: newobj1,
      totalCost: newobj2,
      chenhLechRatio: newobj3
    })

    // record to WPLS
    WPSL.push({
      HMCR, PAR
    })
  }
}

function regroupSubHMs(subHMs, mSubs) {
  // console.log("RỂ")
  // Gộp các mảng con thành một mảng lớn
  let mergedArray = subHMs.reduce((acc, cur) => acc.concat(cur), []);

  // Xáo trộn mảng lớn bằng phương pháp xáo trộn mẫu (Fisher-Yates Shuffle)
  for (let i = mergedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mergedArray[i], mergedArray[j]] = [mergedArray[j], mergedArray[i]];
  }

  // Chia đều các phần tử vào các mảng con mới
  let newSubHMs = [];
  const subHMSize = Math.ceil(mergedArray.length / mSubs);
  for (let i = 0; i < mergedArray.length; i += subHMSize) {
    newSubHMs.push(mergedArray.slice(i, i + subHMSize));
  }

  return newSubHMs;
}

function newHMFromSubs(subHMs) {
  let newHM = []
  for (let i = 0; i < subHMs?.length; i++) {
    let bestLocal = findBestLocalSolution(subHMs[i])
    newHM.push(bestLocal)
  }
  return newHM
}


function DLHS(hmSize, BW_max, BW_min, m, R, Max_FEs, FEs, tasks, employees, lastKPIs, w1, w2, w3) {
  // Step 2: Initialize HM and PSL
  let PSL = [];
  let HM = []
  let WPSL = []
  initHM(HM, hmSize, tasks, employees, lastKPIs)
  initPSL(PSL, m);
  let lastPSL = PSL
  // console.log("PSL: ", PSL)
  // console.log("HM: ", HM)
  // console.log("test rand: ", randomInRange(0, 1))

  // Step 3: Main loop
  // Step 4: Randomly divide HM into m sub-HMs with the same size
  let subHMs = divideHM(HM, 3);
  while (FEs < 0.9 * Max_FEs) {
    // console.log("FEs: ", FEs)
    // console.log("subSM: ", subHMs.length)

    // Step 5: For each sub-HM
    for (let subHM of subHMs) {
      // Step 5.1: Select HMCR, PAR, and determine BW
      let { HMCR, PAR } = selectRandomFromPSL(PSL)
      let BW = determineBW(BW_max, BW_min, FEs, Max_FEs);
      // console.log("BW: ", BW)

      // Step 5.2: Improvise a new harmony
      let x_new = [];
      const minPerformemceRequireInTask = 0

      for (let j = 0; j < tasks.length; j++) {
        taskID = tasks[j].id
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
        let xNewj = empIndex
        // empIndex: id của thằng nhân viên sẽ gán sau điều chỉnh lấy random

        if (Math.random() < HMCR) {
          const xlB = findBestLocalSolution(subHM)
          xNewj = xlB.solution.find((item) => item.task.id === taskID).assignEmployee.id

          if (Math.random() < PAR) {
            let randomXJID = 0
            const randomSolution = HM[Math.floor(Math.random() * HM.length)]
            xNewj = randomSolution.solution.find((item) => item.task.id === taskID).assignEmployee.id
            if (availableEmps?.length) {
              randomXJID = Math.floor((xNewj + Math.random() * BW) % availableEmps?.length)
              xNewj = availableEmps[randomXJID].id
            } else {
              randomXJID = Math.floor((xNewj + Math.random() * BW) % employeesLength?.length)
              xNewj = employees[randomXJID].id
            }
          }
        } 

        // túm lại xNewj là id của thằng employee ứng với taskId của thằng solution mới
        assignEmployee = employees.find((item) => item.id === xNewj)
        KPIExpectValue = lastKPIs.find((item) => item.id === xNewj).kpiInTask[taskID]
        KPIExpectValue = KPIExpectValue !== -1 ? KPIExpectValue : 0

        x_new.push({
          task: {
            id: tasks[j].id,
            estimateTime: tasks[j].estimateTime
          },
          assignEmployee: {
            id: assignEmployee.id,
            costPerHour: assignEmployee.costPerHour
          },
          KPIValue: KPIExpectValue
        })
      }

      const newobj1 = evaluateTotalKPI(x_new)
      const newobj2 = evaluateTotalCost(x_new)
      const newobj3 = evaluateMaxKPIChechLech(x_new)

      FEs++;
      // Step 5.3: Update sub-HM and record HMCR and PAR into WPSL if X_new is better than X_w
      updateSubHM(subHM, HMCR, PAR, PSL, WPSL, x_new, newobj1, w1, newobj2, w2, newobj3, w3);
      
      
      // Step 5.4: Refill PSL if empty
      if (PSL.length === 0) {
        refillPSL(PSL, WPSL, lastPSL, m);
      }
    }
    
    // Step 6: Check termination conditions
    if (FEs !== 0 && FEs % R === 0) {
      // console.log("vao day")
      // console.log("subHMs L: ", subHMs.length)
      subHMs = regroupSubHMs(subHMs, 3);
      // console.log("subHMs L: ", subHMs.length)
    }
  }


  let newHM = newHMFromSubs(subHMs);
  while (FEs < Max_FEs) {
    // console.log("PSL: ", PSL)

    let { HMCR, PAR } = selectRandomFromPSL(PSL)
    let BW = determineBW(BW_max, BW_min, FEs, Max_FEs);
    // console.log("BW: ", BW)

    // Step 5.2: Improvise a new harmony
    let x_new = [];
    const minPerformemceRequireInTask = 0

    for (let j = 0; j < tasks.length; j++) {
      taskID = tasks[j].id
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
      let xNewj = empIndex
      // empIndex: id của thằng nhân viên sẽ gán sau điều chỉnh lấy random

      if (Math.random() < HMCR) {
        const xlB = findBestLocalSolution(newHM)
        xNewj = xlB.solution.find((item) => item.task.id === taskID).assignEmployee.id

        if (Math.random() < PAR) {
          let randomXJID = 0
          const randomSolution = HM[Math.floor(Math.random() * HM.length)]
          xNewj = randomSolution.solution.find((item) => item.task.id === taskID).assignEmployee.id
          if (availableEmps?.length) {
            randomXJID = Math.floor((xNewj + Math.random() * BW) % availableEmps?.length)
            xNewj = availableEmps[randomXJID].id
          } else {
            randomXJID = Math.floor((xNewj + Math.random() * BW) % employeesLength?.length)
            xNewj = employees[randomXJID].id
          }
        }
      } 

      // túm lại xNewj là id của thằng employee ứng với taskId của thằng solution mới
      assignEmployee = employees.find((item) => item.id === xNewj)
      KPIExpectValue = lastKPIs.find((item) => item.id === xNewj).kpiInTask[taskID]
      KPIExpectValue = KPIExpectValue !== -1 ? KPIExpectValue : 0

      x_new.push({
        task: {
          id: tasks[j].id,
          estimateTime: tasks[j].estimateTime
        },
        assignEmployee: {
          id: assignEmployee.id,
          costPerHour: assignEmployee.costPerHour
        },
        KPIValue: KPIExpectValue
      })
    }

    const newobj1 = evaluateTotalKPI(x_new)
    const newobj2 = evaluateTotalCost(x_new)
    const newobj3 = evaluateMaxKPIChechLech(x_new)

    FEs++;
    updateSubHM(newHM, HMCR, PAR, PSL, WPSL, x_new, newobj1, w1, newobj2, w2, newobj3, w3);
    // // Step 5.4: Refill PSL if empty
    // if (PSL.length === 0) {
    //   refillPSL(PSL, WPSL, lastPSL, m);
    // }
    return newHM[0]
  }
}


function main() {
  init()
  job.tasks = topologicalSort(tasks)
  job.tasks = scheduleTasks(job)

  // Test data
  // console.log("emp: ", employees)
  // console.log("task: ", job.tasks)
  // console.log("last KPI: ", lastKPIs)

  // Step 1: Set parameters
  let HMS = 30;
  let BW_max = 1.0;
  let BW_min = 0.1;
  let m = 5;
  let R = 102;
  let Max_FEs = 10000;
  let FEs = 0;
  let w1 = 1;
  let w2 = 1;
  let w3 = 1;
  const tbSalary = employees.reduce((currValue, currItem) => currValue + currItem.costPerHour, 0) / employees.length;
  const totalTimeEstimate = tasks.reduce((currValue, currItem) => currValue + currItem.estimateTime, 0)
  w2 = 1 / (6 * tbSalary * totalTimeEstimate * 8)
  w1 = 2, w3 = 100;

  console.log("HMSIZE: ", HMS)
  console.log("MaxIter: ", Max_FEs)

  
  const result = DLHS(HMS, BW_max, BW_min, m, R, Max_FEs, FEs, tasks, employees, lastKPIs, w1, w2, w3)

  console.log("result: ", result)
}

// CALL Main()
main();
