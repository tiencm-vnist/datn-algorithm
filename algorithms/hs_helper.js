const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS } = require("../consts/kpi.const");
const { topologicalSort } = require("../helper");
const { employees } = require("../new_data/employee");

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

function isAssetCompatibleWithRequirement(asset, requireAsset) {
  if (asset.type !== requireAsset.type) 
    return false
  for (const req of requireAsset.quality) {
    const key = req.key;
    const requiredValue = req.value;

    const assetQuality = asset.qualities.find(q => q.key === key);
    if (!assetQuality || assetQuality.level < requiredValue) {
      return false;
    }
  }
  return true;
}

function getAvailableTimeForAssetOfTask(task, assets) {
  let availableAssets = []
  if (task.requireAsset.length == 0) {
    return {
      taskAssets: [],
      availableTime: new Date(0)
    }
  }

  let availableTimes = [];
  task.requireAsset.forEach(require => {
    let readyToUse = assets.readyToUse.filter(asset => isAssetCompatibleWithRequirement(asset, require)).sort((a, b) => a.costPerHour - b.costPerHour)
    // Nếu có tài nguyên yêu cầu và đủ số lượng => trả về timeavailable = 0 
    if (readyToUse.length >= require.number) {
      availableTimes.push(new Date(0));
      readyToUse = readyToUse.sort((a, b) => {
        const usageLogsA = a?.usageLogs ? a?.usageLogs.sort((log1, log2) => new Date(log2.endDate) - new Date(log1.endDate))[0] : new Date(0)
        const usageLogsB = b?.usageLogs ? b?.usageLogs.sort((log1, log2) => new Date(log2.endDate) - new Date(log1.endDate))[0] : new Date(0)
        return usageLogsA - usageLogsB
      })
      let logsReadyToUse = readyToUse.filter((item) => item?.usageLogs)
      if (logsReadyToUse?.length) {
        logsReadyToUse = logsReadyToUse.map(_ => _.usageLogs.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0].endDate).sort((a, b) => new Date(b) - new Date(a));
        availableTimes.push(new Date(logsReadyToUse[0]))
      }
      // console.log("avaiTime in ready: ", availableTimes, "task: ", task.id)
      
      for (let i = 0; i < require.number; i++) {
        availableAssets.push(readyToUse[i])
      }
      // return {
      //   taskAssets: availableAssets,
      //   availableTime: new Date(0)
      // }
    }
    else {
      // Nếu không đủ số lượng
      availableAssets = [...readyToUse]
      const remain = require.number - readyToUse.length;
      let inUse = assets.inUse.filter(asset => isAssetCompatibleWithRequirement(asset, require)).sort((a, b) => a.costPerHour - b.costPerHour);
      if (inUse?.length && remain <= inUse?.length) {
        // Lấy cả bọn tài nguyên đang được sử dụng ra 
        inUse = inUse.sort((a, b) => {
          const usageLogsA = a.usageLogs.sort((log1, log2) => new Date(log2.endDate) - new Date(log1.endDate))[0]
          const usageLogsB = b.usageLogs.sort((log1, log2) => new Date(log2.endDate) - new Date(log1.endDate))[0]
          return usageLogsA - usageLogsB
        })
        const inUseToPush = inUse.slice(0, remain)
        availableAssets.push(...inUseToPush)
        const logs = inUseToPush.map(_=>_.usageLogs.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0].endDate).sort((a, b) =>  new Date(a) - new Date(b));
        // trả về mảng logs mới nhất của các tài nguyên đang sử dụng, trong đó chứa endDate gần nhất (tức là endDate sẽ được dùng available) của từng thằng tài nguyên đang sử dụng)), logs theo thứ tự tăng dần của endaDate của từng thằng tài nguyên đang dùng
        // Nến ví dụ cần 2 thằng thì thời điểm sớm nhất để 2 thằng đó được sử dụng là logs của thằng thứ 2 (remain - 1)
        // console.log("logs: ", typeof logs[remain - 1])
        availableTimes.push(new Date(logs[remain - 1]))
        return {
          taskAssets: availableAssets,
          availableTime: new Date(Math.max(...availableTimes))
        }
      } else {
        // Check từ đầu luôn khi tạo task cũng được
        throw Error("Không đủ tài nguyên")
      }
    }
  });
  // console.log("available Time: ", new Date(Math.max(...availableTimes)), "task: ", task.id)
  return {
    taskAssets: availableAssets,
    availableTime: new Date(Math.max(...availableTimes))
  }
}

// function getCapacityPoint(requireAssign, availableAssignee) {
//   let point = 0, count = 0
//   for (let key in requireAssign) {
//     count++
//     point += employeeQualities[key] 
//   }
// }

function findMeanOfQuality(qualityKey, availableAssignee) {
  const values = availableAssignee.map(employee => employee.qualities[qualityKey]);
  const sum = values.reduce((acc, currentValue) => acc + currentValue, 0);

  const mean = sum / availableAssignee.length;
  return mean;
}

function getCapacityPointOfEmployeeInTask(requiredQualities, employee) {
  let total = 0
  let count = 0
  for (let qualityKey in requiredQualities) {
    count++;
    total += employee.qualities[qualityKey]
  }
  return total / count;
}

function splitKPIOfTaskToEmployees(task, kpiTarget) {
  const kpiOfEmployee = {}
  const { requireAssign, availableAssignee, kpiInTask, id } = task
  // console.log("task: ", task)
  let totalMeanOfTask = 0
  let totalQualityRequire = 0
  for (let qualityKey in requireAssign) {
    totalQualityRequire++;
    const meanCapacityOfQuality = findMeanOfQuality(qualityKey, availableAssignee)
    // console.log("key: ", qualityKey, ": ", meanCapacityOfQuality)
    totalMeanOfTask += meanCapacityOfQuality
  }
  // const total 
  const meanCapacityOfTask = totalMeanOfTask / totalQualityRequire
  // console.log("mean: ", meanCapacityOfTask, "task: ", task.id)
  
  let totalRatio = 0
  // let availableAssigneeFilter = availableAssignee.filter((employee) => getCapacityPointOfEmployeeInTask(requireAssign, employee) >= meanCapacityOfTask)
  // console.log("availableAssigneeFilter: ", availableAssigneeFilter)
  availableAssignee.forEach((employee) => {
    kpiOfEmployee[employee.id] = {}
    for (let key in KPI_TYPES) {
      kpiOfEmployee[employee.id][key] = 0
    }
    // kpiOfEmployee[employee.id]['ratio'] = getCapacityPointOfEmployeeInTask(requireAssign, employee) / meanCapacityOfTask
    const capacityOfEmployeeInTask = getCapacityPointOfEmployeeInTask(requireAssign, employee)
    // console.log('capacity Emp: ', capacityOfEmployeeInTask)
    kpiOfEmployee[employee.id]['ratio'] = capacityOfEmployeeInTask
    totalRatio +=  kpiOfEmployee[employee.id]['ratio']
  })

  let testTotalKPI = 0
  availableAssignee.forEach((employee) => {
    kpiInTask.forEach(({ type, weight }) => {
      const ratio = kpiOfEmployee[employee.id]['ratio']
      const value = weight * kpiTarget[type].value * ratio / totalRatio
      kpiOfEmployee[employee.id][type] += value
      testTotalKPI += value
    })
    
  })
  return kpiOfEmployee
}

function splitKPIToEmployees(tasks, employees, kpiTarget) {
  const kpiOfEmployees = {}
  employees.forEach((employee) => {
    kpiOfEmployees[employee.id] = {}
    for (let key in KPI_TYPES) {
      kpiOfEmployees[employee.id][key] = 0
    }
    kpiOfEmployees[employee.id]['total'] = 0
  })

  tasks.forEach((task) => {
    const kpiSplitInTask = splitKPIOfTaskToEmployees(task, kpiTarget)
    for (let employeeId in kpiSplitInTask) {
      for (let key in KPI_TYPES) {
        kpiOfEmployees[employeeId][key] += kpiSplitInTask[employeeId][key]
      }
    }
  })
  employees.forEach((employee) => {
    const { id } = employee
    for (let key in kpiTarget) {
      kpiOfEmployees[id]['total'] += kpiTarget[key].weight * kpiOfEmployees[id][key]
    }
  })
  // console.log("kpiOf: ", kpiOfEmployees)
  return kpiOfEmployees
}

function markAssetsAsUsed(currentAssets, taskAssets, startTime, endTime) {
  // console.log("task assets: ", taskAssets.map((item) => {
  //   return {
  //     id: item.id,
  //     status: item.status
  //   }
  // }))
  let updateInUse = currentAssets.inUse
  let updateReadyToUse = currentAssets.readyToUse
  
  for (let i = 0; i < taskAssets.length; i++) {
    let taskAsset = taskAssets[i]
    const currentStatus = taskAsset.status
    if (!taskAsset?.usageLogs) {
      taskAsset.usageLogs = []
    }
    taskAsset.usageLogs.push({
      startDate: startTime.toISOString(),
      endDate: endTime.toISOString()
    })
    if (currentStatus === 'ready_to_use') {
      taskAsset.status = 'in_use'
      updateReadyToUse = updateReadyToUse.filter((item) => item.id !== taskAsset.id)
      updateReadyToUse.push({...taskAsset})
    } else {
      updateInUse = updateInUse.filter((item) => item.id !== taskAsset.id)
      updateInUse.push({...taskAsset})
    }
    

  }
  
  return {
    inUse: updateInUse,
    readyToUse: updateReadyToUse
  }
}

function scheduleTasksWithAsset(job, assets) {
  const sortedTasks = topologicalSort(job.tasks);
  // console.log("asset: ", assets)

  let currentTime = job.startTime;

  // JSON => date to string hết
  let currentAssets = JSON.parse(JSON.stringify(assets))
  for (const task of sortedTasks) {
    // console.log("currentAsset: ", currentAssets.inUse.length, currentAssets.readyToUse.length, "id task: ", task.id)
    const { taskAssets, availableTime } = getAvailableTimeForAssetOfTask(task, currentAssets);
    // console.log("available: ", availableTime.getTime())
    // console.log("task: ", task.id)
    // console.log("taskAssets: ", taskAssets)
    // Gán các tài nguyên đã chọn cho task
    task.assets = taskAssets;

    const preceedingTasks = task.preceedingTasks.map(id => job.tasks.find(t => t.id === id));
    if (preceedingTasks?.length > 0 ) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
      // console.log("maxEndTimeOfPreceedingTasks: ", maxEndTimeOfPreceedingTasks)
      // const availableTimeForAsset = getAvailableTimeForAssetOfTask(task, taskAssets);

      // Tìm thời gian bắt đầu cho nhiệm vụ sau khi tất cả các nhiệm vụ tiền điều kiện của nó đã hoàn thành và tài nguyên cần được sử dụng rảnh rỗi
      task.startTime = new Date(Math.max(availableTime.getTime(), maxEndTimeOfPreceedingTasks));
    } else {
      task.startTime = new Date(Math.max(job.startTime, availableTime));
    }
    task.endTime = new Date(task.startTime.getTime() + task.estimateTime * 3600 * 1000 * 24);

    // Đánh dấu các tài nguyên đã được sử dụng trong khoảng thời gian thực hiện nhiệm vụ
    currentAssets = markAssetsAsUsed(currentAssets, taskAssets, task.startTime, task.endTime);
    // console.log("currentAssets: ", currentAssets)

    currentTime = task.endTime;
  }

  return sortedTasks;
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

function getKpiOfEmployees(assignment, employees, lastKPIs) {
  const kpiOfEmployee = {}
  for(let i = 0; i < employees.length; i++) {
    kpiOfEmployee[employees[i].id] = {}
    for (let key in KPI_TYPES) {
      kpiOfEmployee[employees[i].id][key] = 0
    }
    kpiOfEmployee[employees[i].id]['total'] = 0
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
      kpiOfEmployee[id][type] += kpiValue * weight
      kpiOfEmployee[id]['total'] += kpiValue * weight * KPI_TYPES[type].weight
    })
  }



  return kpiOfEmployee

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
  
  // getKPI of Employees 
  const kpiOfEmployees = getKpiOfEmployees(randomAssignment, employees, lastKPIs)

  const randomHarmonyVector = {
    index,
    assignment: randomAssignment,
    falseAssetScore,
    falseAssigneeScore,
    totalCost,
    kpiAssignment,
    standardDeviation,
    kpiOfEmployees
  }
  return randomHarmonyVector
}

function compareSolution(solutionA, solutionB, kpiTarget, kpiOfEmployeesTarget) {
  const kpiAssignmentOfA = solutionA.kpiAssignment
  const kpiAssignmentOfB = solutionB.kpiAssignment
  const falseAssigneeScoreA = solutionA.falseAssigneeScore
  const falseAssigneeScoreB = solutionB.falseAssigneeScore
  const kpiOfEmployeesA = solutionA.kpiOfEmployees
  const kpiOfEmployeesB = solutionB.kpiOfEmployees
 
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
        if (kpiAssignmentOfA[key].toFixed(4) >= kpiTarget[key].value) {
          pointA++;
        } else {
          totalKpiMissA += kpiTarget[key].value - kpiAssignmentOfA[key]
        }
        if (kpiAssignmentOfB[key].toFixed(4) >= kpiTarget[key].value) {
          pointB++;
        } else {
          totalKpiMissB += kpiTarget[key].value - kpiAssignmentOfB[key]
        }
      }
      // console.log("point A: ", pointA)
      // console.log("point B: ", pointB)
      if (pointA === pointB) {
        if (pointA === count) {
          // Nếu cả 2 đều đạt KPI target => xem xét đạt KPI target của từng đứa
          let employeeTargetPointA = 0, employeeTargetPointB = 0
          for (let employeeId in kpiOfEmployeesTarget) {
            // let flagA = true, flagB = true
            // for (let kpiType in KPI_TYPES) {
            //   if (kpiOfEmployeesA[employeeId][kpiType] < kpiOfEmployeesTarget[employeeId][kpiType]) {
            //     flagA = false
            //   }
            //   if (kpiOfEmployeesB[employeeId][kpiType] < kpiOfEmployeesTarget[employeeId][kpiType]) {
            //     flagB = false
            //   }
            // }
            // if (flagA)
            //   employeeTargetPointA++
            // if (flagB)
            //   employeeTargetPointB++
            if (kpiOfEmployeesA[employeeId]['total'] >= kpiOfEmployeesTarget[employeeId]['total']) {
              employeeTargetPointA++;
            }
            if (kpiOfEmployeesB[employeeId]['total'] >= kpiOfEmployeesTarget[employeeId]['total']) {
              employeeTargetPointB++;
            }
          }
          return employeeTargetPointA >= employeeTargetPointB
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

function findBestAndWorstHarmonySolution(HM, kpiTarget, kpiOfEmployeesTarget) {
  HM.sort((solutionA, solutionB) => compareSolution(solutionA, solutionB, kpiTarget, kpiOfEmployeesTarget) ? -1 : 1)
  return {
    best: HM[0],
    worst: HM[HM.length - 1]
  }
}

function checkIsFitnessSolution(solution, kpiTarget, kpiOfEmployeesTarget) {
  const kpiAssignmentOfSolution = solution.kpiAssignment
  const kpiOfEmployees = solution.kpiOfEmployees
  
  for (let key in kpiTarget) {
    if (kpiAssignmentOfSolution[key].toFixed(4) < kpiTarget[key].value) {
      return false
    }
  }
  for (let employeeId in kpiOfEmployeesTarget) {
    // for (let kpiType in KPI_TYPES) {
    //   if (kpiOfEmployees[employeeId][kpiType] < kpiOfEmployeesTarget[employeeId][kpiType]) {
    //     return false
    //   }
    // }
    // console.log(kpiOfEmployees[employeeId]['total'], kpiOfEmployeesTarget[employeeId]['total'])
    if (kpiOfEmployees[employeeId]['total'] < kpiOfEmployeesTarget[employeeId]['total']) {
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

    if (i < Math.floor(maxIter / 16)) {
      standardDeviationTargetReduce = 5 * standardDeviationTarget / 4
    } else if (i < Math.floor(maxIter / 8)) {
      standardDeviationTargetReduce = 9 * standardDeviationTarget / 8
    } else if (i < Math.floor(maxIter / 4)) {
      standardDeviationTargetReduce = standardDeviationTarget
    } else if (i < Math.floor(maxIter / 2)) {
      standardDeviationTargetReduce = 31/32 * standardDeviationTarget
    } else if (i < Math.floor(3 * maxIter / 4)) {
      standardDeviationTargetReduce = 15/16 * standardDeviationTarget
    } else {
      standardDeviationTargetReduce = 7/8 * standardDeviationTarget
    }

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
  return {
    bestFind: HM[0],
    bestFitnessSolutions
  }
}

function reScheduleTasks(assignment, assets) {
  let currentTime = assignment[0].task.startTime
  assignment.sort((itemA, itemB) => new Date(itemA.task.endTime) - new Date(itemB.task.endTime))
  assignment.forEach(({ task }) => {
    task.startTime = new Date(task.startTime)
    task.endTime = new Date(task.endTime)
  })
  // console.log("assignment: ", assignment)
  const endTimeSaves = {}
  const assetAssignments = {};

  assignment.forEach(({ task, assignee }) => {
    let startTime = task.startTime
    const preceedingTasks = task.preceedingTasks.map(id => assignment.find((item) => item.task.id === id).task)
    if (preceedingTasks?.length > 0) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
      // const timeAvailableForAsset = getAvailableTimeForAsset(task, assets)
      // task.startTime = new Date(Math.max(startTime, timeAvailableForAsset, maxEndTimeOfPreceedingTasks));
      task.startTime = new Date(Math.max(startTime, maxEndTimeOfPreceedingTasks));
    }
    if (assignee.id in endTimeSaves && endTimeSaves[assignee.id].getTime() > task.startTime.getTime()) {
      // Nếu có xung đột, cập nhật thời gian bắt đầu của task
      task.startTime = endTimeSaves[assignee.id]
    }
    // console.log("task.startTime: ", task.startTime)
    // Kiểm tra xung đột với tài nguyên
    if (task.assets?.length) {
      let assetConflict = false;
      task.assets.forEach(asset => {
        if (asset.id in assetAssignments && assetAssignments[asset.id].getTime() > task.startTime.getTime()) {
          assetConflict = true;
          // Nếu có xung đột với tài nguyên, cập nhật thời gian bắt đầu của task
          task.startTime = assetAssignments[asset.id];
          console.log("vao day: ", task.startTime)
        }
      });
      // Nếu có xung đột với tài nguyên, xem xét lại thời gian kết thúc của task
      if (assetConflict) {
        task.endTime = new Date(task.startTime.getTime() + task.estimateTime * 3600 * 1000 * 24);
      }
    }
    
    task.endTime = new Date(task.startTime.getTime() + task.estimateTime * 3600 * 1000 * 24);
    endTimeSaves[assignee.id] = task.endTime;

    // Cập nhật lại thông tin về tài nguyên được gán
    if (task.assets) {
      task.assets.forEach(asset => {
        assetAssignments[asset.id] = task.endTime;
      });
    }

    currentTime = task.endTime;
    // TODO: Gán assets
  })
}

function newHarmonySearch(hmSize, maxIter, HMCR, PAR, bw, kpiTarget, kpiOfEmployeesTarget, tasks, employees, lastKPIs) {
  
  // STep 1: init HM
  let HM = [], bestFitnessSolutions = []

  for (let i = 0; i < hmSize; i++) {
    let randomSolution = initRandomHarmonyVector(job.tasks, employees, lastKPIs, i + 1)
    HM.push(randomSolution)
  }
  
  
  // STEP 2: 
  for (let i = 0; i < maxIter; i++) {
    const bestSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, kpiOfEmployeesTarget).best
    const worstSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, kpiOfEmployeesTarget).worst

    let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, kpiOfEmployeesTarget) 

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

    const kpiOfEmployees = getKpiOfEmployees(improviseAssignment, employees, lastKPIs)

    const improviseSolution = {
      assignment: improviseAssignment,
      falseAssetScore,
      falseAssigneeScore,
      totalCost,
      kpiAssignment,
      standardDeviation,
      kpiOfEmployees
    }

    // STEP 3
    const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, kpiOfEmployeesTarget) 
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
  return {
    bestFind: HM[0],
    bestFitnessSolutions
  }
}

module.exports = {
  findEmployeesWithQualities,
  getAvailableEmployeesForTasks,
  calculateStandardDeviation,
  getStandardDeviationOfKpi_SalaryRatio,
  getTotalKpi,
  getTotalCost,
  initRandomHarmonyVector,
  compareSolution,
  findBestAndWorstHarmonySolution,
  checkIsFitnessSolution,
  updateHarmonyMemory,
  isHaveSameSolution,
  harmonySearch,
  scheduleTasksWithAsset,
  reScheduleTasks,
  splitKPIOfTaskToEmployees,
  splitKPIToEmployees,
  getKpiOfEmployees,
  newHarmonySearch
}