const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS } = require("../consts/kpi.const");
const { scheduleTasks, topologicalSort } = require("../helper");
const { assets } = require("../new_data/asset");
const { employees } = require("../new_data/employee");
const { lastKPIs } = require("../new_data/kpi");
const { tasks } = require("../new_data/task");


function findEmployeesWithQualities(employees, requiredQualities) {
  const employeesWithRequiredQualities = employees.filter(employee => {
    const qualities = employee.qualities;
    for (let key in requiredQualities) {
      if (!qualities[key] || qualities[key] < requiredQualities[key]) {
        return false;
      }
    }
    return true;
  });
  return employeesWithRequiredQualities;
}

function getAvailableEmployeesForTasks(tasks, employees) {
  return tasks.map((task) => {
    let availableAsset = []
    // let availableAssignee = []
    const availableAssignee = findEmployeesWithQualities(employees, task.requireAssign)
    return {
      ...task,
      availableAssignee: availableAssignee,
      availableAsset: availableAsset
    }
  })
}

function getTotalKpi(assignment, tasksDictionary, lastKPIs) {
  let initKPIValue = { ...KPI_TYPES }
  for (let key in KPI_TYPES) {
    initKPIValue[key].value = 0;
  }

  for(let i = 0; i < assignment.length; i++) {
    const { taskId, assigneeId } = assignment[i]
    const kpiOfAssignee = lastKPIs.find((item) => item.id == assigneeId) 
    let kpiValue = kpiOfAssignee.kpiInTask[taskId]
    if (kpiValue === KPI_NOT_WORK) {
      kpiValue = 0
      let listKPIInThisTask = lastKPIs.filter((item) => item.kpiInTask[taskId] !== -1).map((item) => item.kpiInTask[taskId]).sort((a, b) => a - b)
      kpiValue = listKPIInThisTask[0]
      // console.log("kpiValue: ", kpiValue)
    } 

    const { kpiInTask } = tasksDictionary[taskId]
    kpiInTask.forEach((item) => {
      const { type, weight } = item
      initKPIValue[type].value += kpiValue * weight
    })
  }

  return {...initKPIValue}
}

function getTotalCost(assignment, tasksDictionry, employeesDictionary, assetsDictionary) {
  let totalCost = 0;

  for(let i = 0; i < assignment.length; i++) {
    const {taskId, assigneeId, assignAssets } = assignment[i]
    const totalTimeOfTask = tasksDictionry[taskId + ''].estimateTime * DAY_WORK_HOURS
    totalCost += totalTimeOfTask * employeesDictionary[assigneeId].costPerHour

    // TODO
    for (let i = 0; i < assignAssets.length; i++) {
      const { id } = assignAssets[i]
      totalCost += totalTimeOfTask * assetsDictionary[id].costPerHour
    }
  }

  return totalCost
}

function calculateStandardDeviation(numbers) {
  // Bước 1: Tính trung bình của dãy số
  const mean = Object.values(numbers).reduce((acc, val) => acc + val, 0) / Object.keys(numbers).length;

  // Bước 2: Tính tổng bình phương của độ lệch so với trung bình
  const squaredDifferences = Object.values(numbers).map(val => Math.pow(val - mean, 2)).reduce((acc, val) => acc + val, 0);

  // Bước 3: Tính độ lệch chuẩn
  const standardDeviation = Math.sqrt(squaredDifferences / Object.keys(numbers).length);

  return standardDeviation / mean;
}


function getStandardDeviationOfKpi_SalaryRatio(assignment, tasksDictionary, employees, lastKPIs) {
  const kpiOfEmployee = {}
  for(let i = 0; i < employees.length; i++) {
    kpiOfEmployee[employees[i].id] = 0
  }
  for(let i = 0; i < assignment.length; i++) {
    const { taskId, assigneeId } = assignment[i]
    const { kpiInTask } = tasksDictionary[taskId]
    const kpiOfAssignee = lastKPIs.find((item) => item.id === assigneeId) 
    // console.log("kpiOfAssignee: ")
    let kpiValue = kpiOfAssignee.kpiInTask[taskId]
    if (kpiValue === KPI_NOT_WORK) {
      kpiValue = 0
      // Lấy kpi tồi nhất của thằng nào đã làm task này rồi: TODO
      let listKPIInThisTask = lastKPIs.filter((item) => item.kpiInTask[taskId] !== -1).map((item) => item.kpiInTask[taskId]).sort((a, b) => a - b)
      kpiValue = listKPIInThisTask[0]
    } 
    
    kpiInTask.forEach((kpiItem) => {
      const { type, weight } = kpiItem
      kpiOfEmployee[assigneeId] += kpiValue * weight * KPI_TYPES[type].weight
    })
  }

  for (let key in kpiOfEmployee) {
    const id = Number(key)
    const employee = employees.find((item) => item.id === id)
    kpiOfEmployee[key] = kpiOfEmployee[key] / employee.costPerHour 
  }

  const standardDeviation = calculateStandardDeviation(kpiOfEmployee)

  return { kpiOfEmployee, standardDeviation } 

}

function initRandomHarmonyVector(tasks, employees, assets, lastKPIs, tasksDictionary, employeesDictionary, assetsDictionary, index) {
  let randomAssign = []
  let assignee = {}
  let asset = []
  let empAssigned = []
  let assigneeFalseScore = 0, assetFalseScore = 0, chenhLechRadioMax = 1000, kpiAssignment = {}, totalCost = 0
  let standardDeviationRatio = 0
  let kpiOfEmployee = {}

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const { availableAssignee, availableAsset } = task
    
    assignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
    if (!empAssigned.includes(assignee.id)) {
      empAssigned.push(assignee.id)
    }
    
    // TODO: assign asset for task

    // Add to current solution
    randomAssign.push({
      taskId: task.id,
      assigneeId: assignee.id,
      assignAssets: []
    })
  }

  // check is oke assignment?
  if (empAssigned.length < employees.length) {
    assigneeFalseScore += employees.length - empAssigned.length;
    totalCost = getTotalCost(JSON.parse(JSON.stringify(randomAssign)), tasksDictionary, employeesDictionary, assetsDictionary)
  } else {
    kpiAssignment = getTotalKpi(JSON.parse(JSON.stringify(randomAssign)), tasksDictionary, lastKPIs)
    totalCost = getTotalCost(JSON.parse(JSON.stringify(randomAssign)), tasksDictionary, employeesDictionary, assetsDictionary)
    standardDeviationRatio = getStandardDeviationOfKpi_SalaryRatio(JSON.parse(JSON.stringify(randomAssign)), tasksDictionary, employees, lastKPIs).standardDeviation
    kpiOfEmployee = getStandardDeviationOfKpi_SalaryRatio(JSON.parse(JSON.stringify(randomAssign)), tasksDictionary, employees, lastKPIs).kpiOfEmployee
  }

  return {
    index,
    solution: JSON.parse(JSON.stringify(randomAssign)),
    assigneeFalseScore,
    assetFalseScore,
    kpiAssignment: JSON.parse(JSON.stringify(kpiAssignment)),
    totalCost,
    standardDeviationRatio,
    kpiOfEmployee: JSON.parse(JSON.stringify(kpiOfEmployee))
  }
}



// function testA(objA) {
//   let objB = { ...objA }
//   let arr = [...objA.arr]
//   objB['A'] = 0.1
//   objB.arr = arr
//   objB.arr[0] = -1
//   return objB
// }

// return A có tốt hơn B không?
function compareSolution(solutionAJSON, solutionBJSON, kpiTarget, standardDeviationTarget, tasksDictionary) {
  const solutionA = JSON.parse(solutionAJSON)
  const solutionB = JSON.parse(solutionBJSON)
  console.log("solution A: ", solutionA.solution)
  console.log("solution B: ", solutionB.solution)
  const assigneeFalseScoreOfA = solutionA.assigneeFalseScore
  const assigneeFalseScoreOfB = solutionB.assigneeFalseScore
  let kpiAssignmentOfA = getTotalKpi(solutionA.solution, tasksDictionary, lastKPIs)
  let kpiAssignmentOfB = getTotalKpi(solutionB.solution, tasksDictionary, lastKPIs)
  console.log("KPI assignment of A: ", kpiAssignmentOfA)
  console.log("KPI assignment of B: ", kpiAssignmentOfB)

  if (assigneeFalseScoreOfA === assigneeFalseScoreOfB) {
    if (assigneeFalseScoreOfA !== 0) {
      // Chỉnh lại xem
      return solutionA.totalCost < solutionB.totalCost
    } else {
      let pointA = 0, pointB = 0, count = 0, totalKPIofA = 0, totalKPIofB = 0, totalMissKpiOfA = 0, totalMissKpiOfB = 0 
      for (let key in kpiTarget) {
        count++
        totalKPIofA += kpiAssignmentOfA[key].value * kpiAssignmentOfA[key].weight
        totalKPIofB += kpiAssignmentOfB[key].value * kpiAssignmentOfB[key].weight

        if (kpiTarget[key].value <= kpiAssignmentOfA[key].value) {
          pointA++
        } else {
          totalMissKpiOfA += kpiAssignmentOfA[key].value * kpiAssignmentOfA[key].weight
        }

        if (kpiTarget[key].value <= kpiAssignmentOfB[key].value) {
          pointB++
        } else {
          totalMissKpiOfB += kpiAssignmentOfB[key].value * kpiAssignmentOfB[key].weight
        }
      }
      if (pointA === pointB) {
        // đã đạt ngưỡng
        if (pointA === count) {
          const standardDeviationRatioOfA = getStandardDeviationOfKpi_SalaryRatio(JSON.parse(JSON.stringify(solutionA.solution)), tasksDictionary, employees, lastKPIs)
          const standardDeviationRatioOfB = getStandardDeviationOfKpi_SalaryRatio(JSON.parse(JSON.stringify(solutionB.solution)), tasksDictionary, employees, lastKPIs)
          // Đã đạt ngưỡng thì quan tâm độ lệch chuẩn
          if (standardDeviationRatioOfA <= standardDeviationRatioOfB) {
            // đạt độ lệch chuẩn thì so sánh tổng KPI
            if (standardDeviationRatioOfB <= standardDeviationTarget) {
              return totalKPIofA >= totalKPIofB
            } else {
              return true
            }
          } else if (standardDeviationRatioOfA <= standardDeviationTarget) {
            return totalKPIofA >= totalKPIofB
          } else {
            return false
          }
        } else {
          return totalMissKpiOfA > totalMissKpiOfB
        }
      } else {
        return pointA > pointB
      }
    }
  } else {
    return assigneeFalseScoreOfA < assigneeFalseScoreOfB
  }
}

function customSort(solutionA, solutionB, kpiTarget, standardDeviationTarget, tasksDictionary) {
  if (compareSolution(solutionA, solutionB, kpiTarget, standardDeviationTarget, tasksDictionary)) {
    return -1; // Trả về -1 nếu a tốt hơn b
  } else {
    return 1; // Trả về 1 nếu b tốt hơn a hoặc cả hai bằng nhau
  }
}

function bubbleSort(HM, kpiTarget, standardDeviationTarget, tasksDictionary) {
  const n = HM.length;
  for (let i = 0; i < HM.length - 1; i++) {
    for (let j = i + 1; j < HM.length; j++) {
      let compareValue = compareSolution(HM[i], HM[j], kpiTarget, standardDeviationTarget, tasksDictionary)
      
      // console.log("compare: ", compareValue)
      if (!compareValue) {
        let temp = HM[i];
        HM[i] = HM[j];
        HM[j] = temp;
      }
    }
  }
  return HM;
}

function harmonySearch(hmSize, MAX_TER, PAR, HMCR, bw, tasks, employees, assets, lastKPIs, kpiTarget, standardDeviationTarget, tasksDictionary, employeesDictionary, assetsDictionary) {
  // console.log("init: ")
  // console.log("hmSize: ", hmSize)
  // console.log("MAX_TER: ", MAX_TER)
  // console.log("PAR: ", PAR)
  // console.log("HMCR: ", HMCR)
  // console.log("bw: ", bw)
  // console.log("tasks: ", tasks)
  // console.log("employees: ", employees)
  // console.log("assets: ", assets)
  // console.log("lastKPIs: ", lastKPIs)
  // console.log("kpiTarget: ", kpiTarget)
  // console.log("standardDeviationTarget: ", standardDeviationTarget)
  
  // Step 1: init random
  let HM = []
  for (let i = 0; i < hmSize; i++) {
    let randomAssign = {}
    randomAssign = initRandomHarmonyVector(tasks, employees, assets, lastKPIs, tasksDictionary, employeesDictionary, assetsDictionary, i + 1)
    HM.push((JSON.stringify(randomAssign)))
  }
  console.log("HM: ", HM)

  HM = bubbleSort(HM, kpiTarget, standardDeviationTarget, tasksDictionary)
  console.log("HM: ", HM)

  for (let i = 0; i < HM.length; i++) {
    if (JSON.parse(HM[i]).assigneeFalseScore == 0) {
      console.log("HM: ", i, ": ", JSON.parse(HM[i]).kpiAssignment)
      console.log("random assign kpi HM: ", i, ": ", getTotalKpi(JSON.parse(HM[i]).solution, tasksDictionary, lastKPIs))
    }
  }

  // Step 2
  // get best solution of HM


}

function main() {
  // init sth
  const START_DATE = new Date()
  START_DATE.setFullYear(2024, 4, 1)
  START_DATE.setHours(0, 0, 0, 0)
  job = {
    startTime: START_DATE,
    tasks: tasks
  }
  job.tasks = topologicalSort(tasks)
  job.tasks = scheduleTasks(job)
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

  

  const PAR = 0.4, HMCR = 0.95, HM_SIZE = 5, bw = 2, MAX_TER = 1000
  const kpiTarget = {
    'A': { value: 0.8, weight: 0.35 },
    'B': { value: 0.8, weight: 0.35 },
    'C': { value: 0.8, weight: 0.3 },
  }
  const standardDeviationTarget = 0.5

  harmonySearch(HM_SIZE, MAX_TER, PAR, HMCR, bw, job.tasks, employees, assets, lastKPIs, kpiTarget, standardDeviationTarget, tasksDictionary, employeesDictionary, assetsDictionary={})
}


main()