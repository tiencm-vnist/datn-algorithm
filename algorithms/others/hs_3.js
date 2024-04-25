const { KPI_INIT_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS, KPI_TYPES } = require("../../consts/kpi.const");
const { topologicalSort, scheduleTasks } = require("../../helper");
const { assets } = require("../../data/asset");
const { employees } = require("../../data/employee");
const { lastKPIs } = require("../../data/kpi");
const { tasks } = require("../../data/task");
let job = {}
// let kpiTarget = {}

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

function init() {
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
  // kpiTarget = {
  //   'A': { value: 0.78, weight: 0.35 },
  //   'B': { value: 0.78, weight: 0.35 },
  //   'C': { value: 0.78, weight: 0.3 },    
  // }
}

function getTotalKpi(assignment, lastKPIs) {
  const initKPIValue = { ...KPI_TYPES }
  for (let key in KPI_TYPES) {
    initKPIValue[key].value = 0;
  }

  // console.log("initKPIValue: ", initKPIValue)

  for(let i = 0; i < assignment.length; i++) {
    const { task, assignee } = assignment[i]
    const { id } = assignee
    const kpiOfAssignee = lastKPIs.find((item) => item.id == id) 
    let kpiValue = kpiOfAssignee.kpiInTask[task.id]
    if (kpiValue === KPI_NOT_WORK) {
      kpiValue = 0
      let listKPIInThisTask = lastKPIs.filter((item) => item.kpiInTask[task.id] !== -1).map((item) => item.kpiInTask[task.id]).sort((a, b) => a - b)
      kpiValue = listKPIInThisTask[0]
      // console.log("kpiValue: ", kpiValue)
    } 

    const { kpiInTask } = task
    kpiInTask.forEach((item) => {
      const { type, weight } = item
      initKPIValue[type].value += kpiValue * weight
    })
  }

  return {...initKPIValue}
}

function getTotalCost(assignment) {
  let totalCost = 0;

  for(let i = 0; i < assignment.length; i++) {
    const {task, assignee, asset } = assignment[i]
    const totalTimeOfTask = task.estimateTime * DAY_WORK_HOURS
    totalCost += totalTimeOfTask * assignee.costPerHour
    for(let i = 0; i < asset.length; i++) {
      totalCost += totalTimeOfTask * asset[i].costPerHour
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


function getStandardDeviationOfKpi_SalaryRatio(assignment, employees, lastKPIs) {
  let kpiOfEmployee = {}
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

function initRandomHarmonyVector(tasks, employees, assets, lastKPIs) {
  let randomAssign = []
  let assignee = {}
  let asset = []
  let empAssigned = []
  let assigneeFalseScore = 0, assetFalseScore = 0, chenhLechRadioMax = 1000, kpiAssignment = {}, totalCost = 0
  let standardDeviationRatio = 0
  let kpiOfEmployee = {}

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const { availableAssignee } = task
    
    assignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
    if (!empAssigned.includes(assignee.id)) {
      empAssigned.push(assignee.id)
    }
    
    // TODO: assign asset for task

    // Add to current solution
    randomAssign.push({
      task,
      assignee,
      assigneeId: assignee.id, // TODO: delete this
      asset
    })
  }

  // check is oke assignment?
  if (empAssigned.length < employees.length) {
    assigneeFalseScore += employees.length - empAssigned.length;
    totalCost = getTotalCost(randomAssign)
  } else {
    kpiAssignment = getTotalKpi(randomAssign, lastKPIs)
    totalCost = getTotalCost(randomAssign)
    standardDeviationRatio = getStandardDeviationOfKpi_SalaryRatio(randomAssign, employees, lastKPIs).standardDeviation
    kpiOfEmployee = getStandardDeviationOfKpi_SalaryRatio(randomAssign, employees, lastKPIs).kpiOfEmployee
  }

  return {
    solution: randomAssign,
    assigneeFalseScore,
    assetFalseScore,
    kpiAssignment,
    totalCost,
    standardDeviationRatio,
    kpiOfEmployee
  }

}

// return A có tốt hơn B không
function compareSolution(solutionA, solutionB, kpiTarget, standardDeviationRatio, minKPIRatio) {
  
  // TODO: so cả assetFalseScore
  const assigneeFalseScoreOfA = solutionA.assigneeFalseScore
  const assigneeFalseScoreOfB = solutionB.assigneeFalseScore
  

  if (assigneeFalseScoreOfA === assigneeFalseScoreOfB && assigneeFalseScoreOfA > 0) {
    
    return solutionA.totalCost <= solutionB.totalCost
  }

  if (assigneeFalseScoreOfA === assigneeFalseScoreOfB && assigneeFalseScoreOfA === 0) {
    // Check
    const kpiAssignmentOfA = getTotalKpi(solutionA.solution, lastKPIs)
    const kpiAssignmentOfB = getTotalKpi(solutionB.solution, lastKPIs)

    // console.log("solution B score: ", kpiAssignmentOfB)
    // console.log("solution B score check: ", getTotalKpi(solutionB.solution, lastKPIs))

    
    const standardDeviationRatioOfA = solutionA.standardDeviationRatio
    const standardDeviationRatioOfB = solutionB.standardDeviationRatio
    let pointA = 0, pointB = 0
    let kpiOfSolutionA = 0, kpiOfSolutionB = 0
    
    for (let key in KPI_TYPES) {
      if (parseFloat(kpiAssignmentOfA[key].value.toFixed(2)) >= kpiTarget[key].value) {
        pointA++;
      }
      if (parseFloat(kpiAssignmentOfB[key].value.toFixed(2)) >= kpiTarget[key].value) {
        pointB++;
      }
      kpiOfSolutionA += kpiAssignmentOfA[key].value * kpiAssignmentOfA[key].weight
      kpiOfSolutionB += kpiAssignmentOfB[key].value * kpiAssignmentOfB[key].weight
    }

    if (pointA > pointB) {
      return true
    } else if (pointA < pointB) {
      return false
    } else if (pointA === pointB) {
      if (kpiAssignmentOfA - kpiAssignmentOfB > minKPIRatio) {
        return true
      } 
      else {
        return standardDeviationRatioOfA < standardDeviationRatioOfB
      }
    }
  }

  return assigneeFalseScoreOfA < assigneeFalseScoreOfB
}

function getBestHarmonySolutionOfHM(HM,  kpiTarget, standardDeviationTarget, minKPIRatio) {
  HM = HM.sort((solutionA, solutionB) => {
    // console.log("soluA: ", getTotalKpi(solutionA.solution, lastKPIs), "false: ", solutionA.assigneeFalseScore)
    // console.log("soluB: ", getTotalKpi(solutionB.solution, lastKPIs), "false: ", solutionB.assigneeFalseScore)
    const value = compareSolution({ ...solutionA }, { ...solutionB }, kpiTarget, standardDeviationTarget, 0) ? -1 : 1
    // console.log("value compare: is A ok than B => -1: ", value)
    return value
  })
  // console.log("after sort: ")
  // for (let i = 0; i < HM.length; i++) {
  //   console.log("HM: ", i, ": ", HM[i].solution.map((item) => item.task.id + " - " + item.assignee.id), " false: ", HM[i].assigneeFalseScore)
  //   console.log("HM: ", i, ": ", getTotalKpi(HM[i].solution, lastKPIs))
  // }
  // console.log("done sort: ")

  const hmbestSolution = { ...HM[0] }
  const hmWorstSolution = { ...HM[HM.length - 1] }

  // console.log("solution best: ", hmbestSolution.kpiAssignment)
  // console.log("check: ", getTotalKpi([...hmbestSolution.solution], lastKPIs), "lenth: ", hmbestSolution.solution.length)
  // console.log("solution best after: ", hmbestSolution.kpiAssignment)
  return {
    best: hmbestSolution,
    worst: hmWorstSolution
  }
} 

function isNotFitnessBest(solution, kpiTarget, standardDeviationRatio) {
  const assigneeFalseScoreOfA = solution.assigneeFalseScore
  if (assigneeFalseScoreOfA) {
    return true
  } else {
    let count = 0, point = 0
    const kpiAssignmentOf = getTotalKpi(solution.solution, lastKPIs)
    // console.log("kpi: ", kpiAssignmentOf)
    // console.log("kpiTarget: ", kpiTarget)
    for (let key in KPI_TYPES) {
      count++;
      if (parseFloat(kpiAssignmentOf[key].value.toFixed(2)) >= kpiTarget[key].value) {
        point++;
      }
    }
    // console.log("count: ", count, " - ", "point: ", point)
    
    if (point < count) {
      return true
    }
    let standardDeviationRatioOfSolution = calculateStandardDeviation(solution.kpiOfEmployee)
    // console.log("satrd: ", standardDeviationRatioOfSolution)
    if (standardDeviationRatioOfSolution > standardDeviationRatio) {
      return true
    }
  }
  return false
}

function updateHarmony(HM, newSolution, kpiTarget, standardDeviationTarget) {
  // console.log("newSolution: ", newSolution.kpiAssignment)
  // console.log("newSolution Check: ", getTotalKpi(newSolution.solution, lastKPIs))
  HM = HM.sort((solutionA, solutionB) => {
    return compareSolution(solutionA, solutionB, kpiTarget, standardDeviationTarget, 0) ? -1 : 1
  })

  const lastWorstSolution = HM[HM.length - 1]
  const isChange = compareSolution(newSolution, lastWorstSolution, kpiTarget, standardDeviationTarget, 0)
  // console.log("newSolution Check 2: ", getTotalKpi(newSolution.solution, lastKPIs))

  if (isChange) {
    HM.pop()
    HM.push(newSolution)
  }
}

function harmonySearch(hmSize, MAX_TER, PAR, HMCR, bw, tasks, employees, assets, lastKPIs, kpiTarget, standardDeviationTarget) {
  let HM = []
  // Step 1: init random
  for (let i = 0; i < hmSize; i++) {
    const randomSolution = initRandomHarmonyVector(tasks, employees, assets, lastKPIs)
    // console.log("random: ", "i = ", i, " ", randomSolution.kpiAssignment, "false assignee: ", randomSolution.assigneeFalseScore)
    // console.log("check random: ", "i = ", i, " ", getTotalKpi(randomSolution.solution, lastKPIs), "false assignee: ", randomSolution.assigneeFalseScore)
    HM.push(randomSolution)
    
    // console.log("rand Ass: ", randomSolution.kpiAssignment)
  } 
  // console.log("HM: ", HM.length)

  // Step 2
  for (let i = 0; i < MAX_TER; i++) {
    const hmbestSolution = getBestHarmonySolutionOfHM(HM, kpiTarget, standardDeviationTarget, 0).best
    const hmWorstSolution = getBestHarmonySolutionOfHM(HM, kpiTarget, standardDeviationTarget, 0).worst


    const bestKpiAssignment = getTotalKpi(hmbestSolution.solution, lastKPIs)
    const worstKpiAssignment = getTotalKpi(hmWorstSolution.solution, lastKPIs)
    // for (let i = 0; i < HM.length; i++) {
    //   console.log("HM: ", i, ": ", HM[i].solution.map((item) => item.task.id + " - " + item.assignee.id), " false: ", HM[i].assigneeFalseScore)
    //   console.log("HM: ", i, ": ", getTotalKpi(HM[i].solution, lastKPIs))
    // }
    // console.log("bestKPIAssignment: ", bestKpiAssignment)
    // console.log("worst: ", worstKpiAssignment)

    if (bestKpiAssignment['A'] === worstKpiAssignment['A']) {
      console.log("i ok: ", i) 
      break
    }
    // console.log("Find: ", hmbestSolution.kpiAssignment, ": ", i, " , false Score: ", hmbestSolution.assigneeFalseScore)
    // console.log("solution: ", hmbestSolution.kpiAssignment, ": ", i)
    // console.log("check: ", getTotalKpi([...hmbestSolution.solution], lastKPIs), ": ", i, "lenth: ", hmbestSolution.solution.length)
    // console.log("solution: ", hmbestSolution.kpiAssignment, ": ", i)

    let isNotOkSolution = isNotFitnessBest(hmbestSolution, kpiTarget, standardDeviationTarget)
    // console.log("isNotOkSolution: ", isNotOkSolution)
// 
    // const isNotOkSolution = false
    // console.log("check: ", getTotalKpi(hmbestSolution.solution, lastKPIs), ": ", i, "lenth: ", hmbestSolution.solution.length)
    // console.log("solution: ", hmbestSolution.kpiAssignment, ": ", i,)
    if (!isNotOkSolution) {
      console.log("Find: ", hmbestSolution.kpiAssignment, ": ", i, " , false Score: ", hmbestSolution.assigneeFalseScore)
      console.log("solution: ", hmbestSolution.kpiAssignment)
      console.log("check: ", getTotalKpi(hmbestSolution.solution, lastKPIs), ": ", i, "lenth: ", hmbestSolution.solution.length)
    }
    let initNewSolution = []
    let asset = []
    let empAssigned = []
    let assigneeFalseScore = 0, assetFalseScore = 0, chenhLechRadioMax = 1000, kpiAssignment = {}, totalCost = 0
    let standardDeviationRatio = 0
    let kpiOfEmployee = {}
    for (let j = 0; j < tasks.length; j++) {
      const task = tasks[j]
      let assignee = {}
      const { availableAssignee } = task
      assignee = { ...availableAssignee[Math.floor(Math.random() * availableAssignee.length)] }
      // TODO: assign asset for task

      if (Math.random() < HMCR) {
        assignee = { ...hmbestSolution.solution.find((item) => item.task.id === task.id).assignee }
        // console.log("assignee vào đây: ", assignee.id)

        // TODO: assign asset for task

        if (Math.random() < PAR || isNotOkSolution) {
          let lastAssigneeIndex = availableAssignee.findIndex((employee) => employee.id === assignee.id)
          lastAssigneeIndex = Math.floor(lastAssigneeIndex + bw) % availableAssignee.length
          assignee = { ...availableAssignee[lastAssigneeIndex] }
          // console.log("assignee vào đây: ", assignee.id)
          // TODO: assign asset for task
        }
        
      }

      if (!empAssigned.includes(assignee.id)) {
        empAssigned.push(assignee.id)
      }

      // Add to current solution
      initNewSolution.push({
        task,
        taskId: task.id,// TODO DELETE
        assignee,
        assigneeId: assignee.id, // TODO: delete this
        asset
      })
    }

    // check is oke assignment?
    // console.log("vao day: ", initNewSolution.map((item) => item.task.id + " - " + item.assignee.id))

    if (empAssigned.length < employees.length) {
      assigneeFalseScore += employees.length - empAssigned.length;
      totalCost = getTotalCost(initNewSolution)
    } else {
      kpiAssignment = getTotalKpi([...initNewSolution], lastKPIs)
      totalCost = getTotalCost(initNewSolution)
      standardDeviationRatio = getStandardDeviationOfKpi_SalaryRatio(initNewSolution, employees, lastKPIs).standardDeviation
      kpiOfEmployee = getStandardDeviationOfKpi_SalaryRatio(initNewSolution, employees, lastKPIs).kpiOfEmployee
    }

    const initNewSolutionObj = {
      solution: initNewSolution,
      assigneeFalseScore,
      assetFalseScore,
      kpiAssignment,
      totalCost,
      standardDeviationRatio,
      kpiOfEmployee
    }

    // console.log("init Solution: ", initNewSolutionObj.kpiAssignment)
    // console.log("Check: ", getTotalKpi(initNewSolutionObj.solution, lastKPIs))
    // console.log("init Solution: ", initNewSolutionObj.kpiAssignment)


    updateHarmony(HM, initNewSolutionObj, kpiTarget, standardDeviationRatio)
  }

  HM.sort((solutionA, solutionB) => {
    return compareSolution(solutionA, solutionB, kpiTarget, standardDeviationTarget, 0) ? -1 : 1
  })

  return {
    best: HM[0],
    worst: HM[HM.length - 1],
    random: HM[Math.floor(Math.random() * HM.length)]
  }
}

function test(job, kpiA, kpiB, kpiC, lastKPIs, maxChenhLech = 1) {
  let flag = true, i = 0 
  while (flag) {
    i++;
    let randomSolution = initRandomHarmonyVector(job.tasks, employees, assets, lastKPIs)
    const { assigneeFalseScore, standardDeviationRatio } = randomSolution
    const kpiAssignment = getTotalKpi(randomSolution.solution, lastKPIs)
    if (!assigneeFalseScore && kpiAssignment['A'].value.toFixed(2) >= kpiA && kpiAssignment['B'].value.toFixed(2) >= kpiB && kpiAssignment['C'].value.toFixed(2) >= kpiC && standardDeviationRatio < maxChenhLech) {
      flag = false
      console.log("ramdomSolution: ", i, randomSolution.kpiAssignment)
      console.log("check: ", i, ": ", getTotalKpi(randomSolution.solution, lastKPIs))
      console.log("affter check ramdomSolution: ", i, randomSolution.kpiAssignment)
    }
  }
}

function main() {
  init()
  // test(job, 0.8, 0.8, 0.8, lastKPIs, 0.15)
  const PAR = 0.4, HMCR = 0.95, HM_SIZE = 5, bw = 2, MAX_TER = 1000
  const kpiTarget = {
    'A': { value: 0.78, weight: 0.35 },
    'B': { value: 0.78, weight: 0.35 },
    'C': { value: 0.78, weight: 0.3 },
  }
  const standardDeviationTarget = 0.5


  // console.log("check: ", getTotalKpi(randomSolution.solution, lastKPIs))
  const solution = harmonySearch(HM_SIZE, MAX_TER, PAR, HMCR, bw, job.tasks, employees, assets, lastKPIs, kpiTarget, standardDeviationTarget)
  const kpiValue = getTotalKpi(solution.best.solution, lastKPIs)
  console.log("solution: A new", kpiValue)
  // cons
  // const solutionA = initRandomHarmonyVector(job.tasks, employees, assets, lastKPIs)
  // const solutionB = initRandomHarmonyVector(job.tasks, employees, assets, lastKPIs)
  // console.log("solution A: ", solutionA, solutionA.kpiAssignment)
  // console.log("solution B: ", solutionB, solutionB.kpiAssignment)
  // console.log("compare: ", compareSolution(solutionA, solutionB))
}


main()