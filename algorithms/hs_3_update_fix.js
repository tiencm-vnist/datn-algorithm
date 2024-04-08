const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS } = require("../consts/kpi.const");
const { scheduleTasks, topologicalSort, getAvailableTimeForAsset } = require("../helper");
const { assets, assetAll } = require("../new_data/asset");
const { employees } = require("../new_data/employee");
const { lastKPIs } = require("../new_data/kpi");
const { tasks } = require("../new_data/task");

// CHIẾN LƯỢC 1: BƯỚC 1: GÁN TÀI NGUYÊN VÀ KHUNG THỜI GIAN SAO CHO NHỎ NHẤT CÓ THỂ (THỰC HIỆN SONG SONG VÀ CHECK LUÔN 1 TÀI NGUYÊN CHỈ THỰC HIỆN 1 TASK TẠI 1 THỜI ĐIỂM)


/* CHIẾN LƯỢC 1:
  Bước 1: gán thời gian cho task + tài nguyên ==> Tối ưu nhất có thể
  Bước 2: Gán người cho task => không quan tâm đến yếu tố 1 người không thể thực hiện task song song
  Bước 3: chỉnh sửa lại lịch các task sao cho có thể thực hiện được (thằng nào đang thực hiện 2 việc cùng 1 lúc thì phải thay đổi lại cách gán)
*/

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
  const kpiAssignmentOfA = solutionA.kpiAssignment
  const kpiAssignmentOfB = solutionB.kpiAssignment
  const falseAssigneeScoreA = solutionA.falseAssigneeScore
  const falseAssigneeScoreB = solutionB.falseAssigneeScore
 
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


// SAVE result to ./output/output.json files
const fileName = './algorithms/output/output.json'
const fs = require('fs');

function saveResult(newResult, fileName) {
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

function findAvailableAssetsForTask(task, assets) {
  const availableAssets = { inUse: [], readyToUse: [] };
  if (!task.requireAsset?.length) {
    return availableAssets
  }

  for (const require of task.requireAsset) {
    let readyToUse = assets.readyToUse.filter(asset => isAssetCompatibleWithRequirement(asset, require));
    let inUse = assets.inUse.filter(asset => isAssetCompatibleWithRequirement(asset, require));

    availableAssets.readyToUse.push(...readyToUse);
    availableAssets.inUse.push(...inUse);
  }

  // ĐÂY CHỈ LÀ AVAILABLE ASSETS CHỨ CHƯA TÍNH ĐẾN CHUYỆN CHECK TASKS THỰC HIỆN SONG SONG
  return availableAssets;
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
  job.tasks = scheduleTasksWithAsset(job, assets)
  // console.log("job.tasks: ", job.tasks)
  // console.log("assets: ", assets.inUse[0].usageLogs)
  job.tasks = getAvailableEmployeesForTasks(job.tasks, employees)
  
  // const HM = [{ value: 4 }, { value: 1 }, { value: 2 }, { value: 5 }, { value: 7 }];
  
  // console.log("Before sorting:", HM); // In ra trước khi sắp xếp
  // HM.sort((a, b) => a.value - b.value);
  // console.log("After sorting:", HM); // In ra sau khi sắp xếp
  
  
  // let newTasks = JSON.parse(JSON.stringify(job.tasks))
  // console.log("newTasks: ", newTasks)

  // newTasks = newTasks.sort((a, b) => (new Date(a.startTime).getTime() - new Date(b.startTime).getTime()))
  // console.log("task: ", newTasks)
  

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
    const bestFitnessSolutions = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFitnessSolutions
    if (!compareSolution(testResult, result)) {
      testResult = result
    }
    // if (result.standardDeviation < 0.15) {
    //   fitnessSolutions.push(result)
    //   fitnessSolutions = fitnessSolutions.concat(bestFitnessSolutions)
    // }
  }

  console.log("solution: ", testResult.assignment)
  console.log("solution: ", testResult.kpiAssignment)
  console.log("solution: ", testResult.standardDeviation)

  saveResult(testResult, fileName)


  // if (fitnessSolutions.length) {
  //   fitnessSolutions.sort((solutionA, solutionB) => compareSolution(solutionA, solutionB) ? -1 : 1)
  // }


}

function gianTasks() {
  
  // Ví dụ sử dụng
  const job = {
    startTime: new Date(), // Thời gian bắt đầu công việc (ví dụ: thời điểm hiện tại)
    tasks: [
      { id: 1, preceedTasks: [], duration: 200000000, startTime: null, endTime: null },
      { id: 2, preceedTasks: [1], duration: 100000000, startTime: null, endTime: null },
      { id: 3, preceedTasks: [1], duration: 200000000, startTime: null, endTime: null },
      // Thêm các nhiệm vụ khác nếu cần
    ]
  };

  const scheduledTasks = scheduleTasks(job);
  console.log(scheduledTasks);

  const endTimes = {};

// Duyệt qua từng task đã được sắp xếp
  tasks.forEach(({ task, assignee }) => {
    // Tìm thời gian bắt đầu cho task hiện tại
    let startTime = task.startTime;
    // Kiểm tra xem task có xung đột với các task đã được gán cho assignee không
    if (assignee.id in endTimes && endTimes[assignee.id] > startTime) {
      // Nếu có xung đột, cập nhật thời gian bắt đầu của task
      startTime = endTimes[assignee.id];
    }
    // Gán thời gian bắt đầu và kết thúc cho task
    task.startTime = startTime;
    task.endTime = startTime + task.estimateTime;
    // Cập nhật thời gian kết thúc mới cho assignee
    endTimes[assignee.id] = task.endTime;
  });
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
          task.startTime = assetAssignments[assetId];
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


main()

function testResult() {
  // Sử dụng hàm để đọc dữ liệu từ file
  readDataFromFile(fileName)
    .then((data) => {
      const assignment = data[data.length - 1].assignment

      // console.log('Dữ liệu từ file JSON:', assignment);
      // Bạn có thể thực hiện các thao tác khác với mảng đã đọc được ở đây
      reScheduleTasks(assignment, assets)

      console.log("update assignment after re-schedule: ", assignment)
    })
    .catch((error) => {
      console.error('Lỗi khi đọc dữ liệu từ file:', error);
    });
}

testResult()