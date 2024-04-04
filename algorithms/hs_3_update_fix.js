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

function calculateStandardDeviation(numbers) {
  // Bước 1: Tính trung bình của dãy số
  const mean = Object.values(numbers).reduce((acc, val) => acc + val, 0) / Object.keys(numbers).length;

  // Bước 2: Tính tổng bình phương của độ lệch so với trung bình
  const squaredDifferences = Object.values(numbers).map(val => Math.pow(val - mean, 2)).reduce((acc, val) => acc + val, 0);

  // Bước 3: Tính độ lệch chuẩn
  const standardDeviation = Math.sqrt(squaredDifferences / Object.keys(numbers).length);

  return standardDeviation / mean;
}

function getStandardDeviationOfKpi_SalaryRatio(assignment, employees, lastKPIs) {
  const kpiOfEmployee = {}
  for(let i = 0; i < employees.length; i++) {
    kpiOfEmployee[employees[i].id] = 0
  }
  for(let i = 0; i < assignment.length; i++) {
    const { task, assignee } = assignment[i]
    const { kpiInTask } = task
    const { id } = assignee
    const kpiOfAssignee = lastKPIs.find((item) => item.id === id) 
    // console.log("kpiOfAssignee: ")
    let kpiValue = kpiOfAssignee.kpiInTask[task.id]
    if (kpiValue === KPI_NOT_WORK) {
      kpiValue = 0
      // Lấy kpi tồi nhất của thằng nào đã làm task này rồi: TODO
      let listKPIInThisTask = lastKPIs.filter((item) => item.kpiInTask[task.id] !== -1).map((item) => item.kpiInTask[task.id]).sort((a, b) => a - b)
      kpiValue = listKPIInThisTask[0]
    } 
    
    kpiInTask.forEach((kpiItem) => {
      const { type, weight } = kpiItem
      kpiOfEmployee[id] += kpiValue * weight * KPI_TYPES[type].weight
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


function getTotalKpi(assignment, lastKPIs) {
  const kpiAssignment = {}
  for (let key in KPI_TYPES) {
    kpiAssignment[key] = 0
  }

  assignment.forEach((assignmentItem) => {
    const { task, assignee } = assignmentItem

    const { kpiInTask } = task
    const taskId = task.id
    const assigneeId = assignee.id
    let kpiValue = 0
    kpiValue = lastKPIs.find((item) => item.id === assigneeId).kpiInTask[taskId]
    if (kpiValue === KPI_NOT_WORK) {
      const kpiWithTaskInPast = lastKPIs.map((item) => item.kpiInTask[taskId]).filter((item) => item !== -1).sort((a, b) => a - b)
      kpiValue = kpiWithTaskInPast[0]
    }

    kpiInTask.forEach((kpiGetItem) => {
      const { type, weight } = kpiGetItem
      kpiAssignment[type] += kpiValue * weight
    })
  })

  return kpiAssignment
}

function getTotalCost(assignment) {
  let totalCost = 0
  for (let i = 0; i < assignment.length; i++) {
    const { task, assignee, assets } = assignment[i]
    const { estimateTime } = task
    const { costPerHour } = assignee
    const timeForTask = estimateTime * DAY_WORK_HOURS
    totalCost += timeForTask * costPerHour

    for (let j = 0; j < assets?.length; j++) {
      totalCost += timeForTask * assets[j].costPerHour
    }
  }

  return totalCost
}

function initRandomHarmonyVector(tasks, employees, lastKPIs, index) {
  const randomAssignment = []
  const empAssigned = []
  let falseAssigneeScore = 0, falseAssetScore = 0, kpiAssignment = {}, kpiOfEmployee = {}, standardDeviation = 0, totalCost = 0
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const { availableAssignee } = task
    const assignEmployee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]

    // TODO: code for available assets
    const assignAssets = []

    if (!empAssigned.includes(assignEmployee.id)) {
      empAssigned.push(assignEmployee.id)
    }

    
    randomAssignment.push({
      task,
      assignee: assignEmployee,
      assets: assignAssets
    })
  }
  falseAssigneeScore = employees.length - empAssigned.length

  // get total KPI
  kpiAssignment = getTotalKpi(randomAssignment, lastKPIs)

  // get kpi standard ratio 
  kpiOfEmployee = getStandardDeviationOfKpi_SalaryRatio(randomAssignment, employees, lastKPIs).kpiOfEmployee
  standardDeviation = getStandardDeviationOfKpi_SalaryRatio(randomAssignment, employees, lastKPIs).standardDeviation

  // get total cost
  totalCost = getTotalCost(randomAssignment)

  const randomHarmonyVector = {
    index,
    assignment: randomAssignment,
    falseAssetScore,
    falseAssigneeScore,
    totalCost,
    kpiAssignment,
    standardDeviation
  }
  return randomHarmonyVector
}

function compareSolution(solutionA, solutionB, kpiTarget, standardDeviationTarget) {
  // console.log("KPI target: ", kpiTarget)
  // console.log("solution A: ", solutionA.index, " ", solutionA.kpiAssignment)
  // console.log("solution B: ", solutionB.index, " ", solutionB.kpiAssignment)

  const kpiAssignmentOfA = solutionA.kpiAssignment
  const kpiAssignmentOfB = solutionB.kpiAssignment
  const falseAssigneeScoreA = solutionA.falseAssigneeScore
  const falseAssigneeScoreB = solutionB.falseAssigneeScore
  // console.log("False A: ", falseAssigneeScoreA)
  // console.log("False B: ", falseAssigneeScoreB)
  let totalKpiOfA = 0, totalKpiOfB = 0, totalKpiMissA = 0, totalKpiMissB = 0
  if (falseAssigneeScoreA === falseAssigneeScoreB) {
    if (!falseAssigneeScoreA) {
      // Nếu cả 2 đều gán oke => check KPI
      let pointA = 0
      let pointB = 0
      let count = 0
      for (let key in kpiTarget) {
        count++;
        totalKpiOfA += kpiAssignmentOfA[key] * kpiTarget[key].weight 
        totalKpiOfB += kpiAssignmentOfB[key] * kpiTarget[key].weight 
        if (kpiAssignmentOfA[key].toFixed(2) >= kpiTarget[key].value) {
          pointA++;
        } else {
          totalKpiMissA += kpiTarget[key].value - kpiAssignmentOfA[key]
        }
        if (kpiAssignmentOfB[key].toFixed(2) >= kpiTarget[key].value) {
          pointB++;
        } else {
          totalKpiMissB += kpiTarget[key].value - kpiAssignmentOfB[key]
        }
      }
      // console.log("point A: ", pointA)
      // console.log("point B: ", pointB)
      if (pointA === pointB) {
        if (pointA === count) {
          // Nếu cả 2 đều đạt KPI target => xem xét độ lệch chuẩn
          const standardDeviationRatioOfA = solutionA.standardDeviation
          const standardDeviationRatioOfB = solutionB.standardDeviation
          if (standardDeviationRatioOfA <= standardDeviationTarget && standardDeviationRatioOfB <= standardDeviationTarget) {
            // Nếu đạt độ lệch chuẩn => xem xét về tổng KPI hoặc phí
            // TRƯỚC MẶT SO TỔNG KPI
            return totalKpiOfA >= totalKpiOfB
          } else {
            return standardDeviationRatioOfA <= standardDeviationRatioOfB
          }
        } else if (pointA) {
          // Nếu = point mà có tiêu chí không đạt xem xét về độ thọt KPI tương ứng của bọn không đủ
          return totalKpiMissA < totalKpiMissB
        } else {
          return totalKpiOfA > totalKpiOfB
        }
      } else {
        // Nếu 2 point khác nhau
        return pointA > pointB
      }
    } else {
      if (solutionA.totalCost < solutionB.totalCost) {
        return true
      } else {
        return totalKpiOfA > totalKpiOfB
      }
    }
  } else {
    return falseAssigneeScoreA < falseAssigneeScoreB
  }
}

function findBestAndWorstHarmonySolution(HM, kpiTarget, standardDeviationTarget) {
  HM.sort((solutionA, solutionB) => compareSolution(solutionA, solutionB, kpiTarget, standardDeviationTarget) ? -1 : 1)
  return {
    best: HM[0],
    worst: HM[HM.length - 1]
  }
}

function checkIsFitnessSolution(solution, kpiTarget, standardDeviationTarget) {
  const kpiAssignmentOfSolution = solution.kpiAssignment
  const standardDeviationRatioOfSolution = solution.standardDeviation
  
  if (standardDeviationRatioOfSolution > standardDeviationTarget) {
    return false
  }
  for (let key in kpiTarget) {
    if (kpiAssignmentOfSolution[key].toFixed(2) < kpiTarget[key].value) {
      return false
    }
  }

  return true
}

function updateHarmonyMemory(HM, improviseSolution) {
  HM.pop()
  HM.push(improviseSolution)
}

function isHaveSameSolution(bestFitnessSolutions, currentBestSolution, ratio = 0.0001) {
  const currentKpiAssignment = currentBestSolution.kpiAssignment
  const currentStandardDeviation = currentBestSolution.standardDeviation
  const currentTotalCost = currentBestSolution.totalCost

  const isHaveSameSolution = bestFitnessSolutions.find((fitnessSolution) => {
    const fitnessKpiAssignment = fitnessSolution.kpiAssignment
    const fitnessStandarDeviation = fitnessSolution.standardDeviation
    const fitnessTotalCost = fitnessSolution.totalCost
    for (let key in fitnessKpiAssignment) {
      const diffValue = Math.abs(currentKpiAssignment[currentKpiAssignment] - fitnessKpiAssignment[key])
      if (diffValue > ratio) 
        return false
    }
    const diffCost = Math.abs(fitnessTotalCost - currentTotalCost)
    const diffStandard = Math.abs(currentStandardDeviation - fitnessStandarDeviation)
    if (diffCost > ratio || diffStandard > ratio)
      return false

    return true
  })

  return isHaveSameSolution ? true : false
}

function harmonySearch(hmSize, maxIter, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, tasks, employees, lastKPIs) {
  
  // STep 1: init HM
  let HM = [], bestFitnessSolutions = []

  for (let i = 0; i < hmSize; i++) {
    let randomSolution = initRandomHarmonyVector(job.tasks, employees, lastKPIs, i + 1)
    HM.push(randomSolution)
  }
  let standardDeviationTargetReduce = standardDeviationTarget
  
  
  // STEP 2: 
  for (let i = 0; i < maxIter; i++) {
    const bestSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, standardDeviationTarget).best
    const worstSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, standardDeviationTarget).worst

    // if (i < Math.floor(maxIter / 16)) {
    //   standardDeviationTargetReduce = standardDeviationTargetReduce
    // } else if (i < Math.floor(maxIter / 8)) {
    //   standardDeviationTargetReduce = 5 * standardDeviationTarget / 4
    // } else if (i < Math.floor(maxIter / 4)) {
    //   standardDeviationTargetReduce = 3 * standardDeviationTarget / 2
    // } else if (i < Math.floor(maxIter / 2)) {
    //   standardDeviationTargetReduce = 5 * standardDeviationTarget / 4
    // } else if (i < Math.floor(3 * maxIter / 4)) {
    //   standardDeviationTargetReduce = standardDeviationTarget
    // } else {
    //   standardDeviationTargetReduce = 0.99 * standardDeviationTarget
    // }

    let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, standardDeviationTargetReduce) 

    if (isFitnessSolution) {
      if (!isHaveSameSolution(bestFitnessSolutions, bestSolution, 0)) {
        bestFitnessSolutions.push(bestSolution)
      }
      // standardDeviationTargetReduce = standardDeviationTargetReduce * 0.99
    } 
    let improviseAssignment = []
    let empAssigned = []
    let falseAssigneeScore = 0
    let falseAssetScore = 0

    const bestSolutionAssignment = bestSolution.assignment

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const { availableAssignee, assignee, assets } = task
  
      let randomAssignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]

      if (Math.random() < HMCR) {
        randomAssignee = bestSolutionAssignment.find((item) => item.task.id === task.id).assignee
        if (Math.random() < PAR || !isFitnessSolution) {
          let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
          randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableAssignee.length
          randomAssignee = availableAssignee[randomAssigneeIndex]
        }
      }

      // Do for assets: TODO

      if (!empAssigned.includes(randomAssignee.id)) {
        empAssigned.push(randomAssignee.id)
      }
      
      improviseAssignment.push({
        task,
        assignee: randomAssignee,
        assets: assets
      })
    }

    // total False
    falseAssigneeScore = employees.length - empAssigned.length
    // total False assets: TODO

    // get total KPI
    const kpiAssignment = getTotalKpi(improviseAssignment, lastKPIs)

    // get total Cost
    const totalCost = getTotalCost(improviseAssignment)

    // get standard ratio
    // const kpiOfEmployee = getStandardDeviationOfKpi_SalaryRatio(improviseAssignment, employees, lastKPIs).kpiOfEmployee
    const standardDeviation = getStandardDeviationOfKpi_SalaryRatio(improviseAssignment, employees, lastKPIs).standardDeviation

    const improviseSolution = {
      assignment: improviseAssignment,
      falseAssetScore,
      falseAssigneeScore,
      totalCost,
      kpiAssignment,
      standardDeviation
    }

    // STEP 3
    const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, standardDeviationTargetReduce) 
    if (checkIsImproviseSolution) {
      updateHarmonyMemory(HM, improviseSolution)
    }
  }

  // // Test sắp xếp
  // HM.sort((solutionA, solutionB) => compareSolution(solutionA, solutionB, kpiTarget, standardDeviationTarget) === true ? -1 : 1)

  // for (let i = 0; i < hmSize; i++) {
  //   console.log("HM after sort: ", i, " : ", "index: ", HM[i].index, ": ", "falseS: ", HM[i].falseAssigneeScore, "totalCost: ", HM[i].totalCost, ": ", HM[i].kpiAssignment)
  //   if (HM[i].falseAssigneeScore === 0) {
  //     console.log("check: ", getTotalKpi(HM[i].assignment, lastKPIs))
  //   }
  // }

  // const testValue = compareSolution(HM[0], HM[1], kpiTarget, standardDeviationTarget)
  // console.log("compare HM[0] and HM[1] after check: ", testValue)

  // STEP final: 
  console.log("bests: ", bestFitnessSolutions)
  return HM[0]
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


  const PAR = 0.4, HMCR = 0.95, HM_SIZE = 50, bw = 1, MAX_TER = 20000
  const kpiTarget = {
    'A': { value: 0.8, weight: 0.35 },
    'B': { value: 0.8, weight: 0.35 },
    'C': { value: 0.8, weight: 0.3 },
  }
  const standardDeviationTarget = 0.1

  const result = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs)
  console.log("result: ", result.kpiAssignment, ": ", result.standardDeviation)
  console.log("check: ", getTotalKpi(result.assignment, lastKPIs))
}


main()