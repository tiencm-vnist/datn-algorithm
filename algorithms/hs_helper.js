const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS, KPI_OF_ASSET_IN_TASK } = require('../consts/kpi.const')
const { topologicalSort, duplicateSchedule, getLastestEndTime } = require("../helper/index");

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

function getVectorLength(vector) {
  let length = 0;
  for (const key in vector) {
    length += vector[key] * vector[key]
  }
  return Math.sqrt(length)
}
function getDistanceQualityVector(vector1, vector2) {
  if (vector1 === undefined) {
    vector1 = {}
  }
  if (vector2 === undefined) {
    vector2 = {}
  }
  // Tạo một mảng mới để lưu trữ các key của cả hai vector
  const allKeys = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);

  let distance = 0;

  for (const key of allKeys) {
    const value1 = vector1[key] || 0;
    const value2 = vector2[key] || 0;
    const diff = value1 - value2

    const squaredDifference = diff * diff;

    distance += squaredDifference;
  }

  return Math.sqrt(distance);
}

function findTasksWithMatchingTagsAndRequire(allTasks, task) {
  // Lọc mảng allTasks để tìm các task có tags bao gồm tags của task đầu vào
  const { requireAssign } = task
  const taskKeys = Object.keys(requireAssign !== undefined ? requireAssign : {}).sort()
  
  return allTasks.filter((currentTask) => {

    const requireAssignOfCurrentTask = currentTask?.requireAssign
    // Kiểm tra tags
    if (!requireAssignOfCurrentTask || !Object.keys(requireAssignOfCurrentTask).length) {
      return false
    }
    
    if (!task.tags.every((tag) => currentTask.tags.includes(tag)) || !currentTask.tags.every((tag) => task.tags.includes(tag))) {
      return false;
    }
    const taskKeysItem = Object.keys(requireAssignOfCurrentTask).sort()

    if (Math.abs(taskKeys?.length - taskKeysItem?.length) > 1) {
      return false
    }

    if (taskKeys?.length >= taskKeysItem?.length) {
      for (const key of taskKeysItem) {
        if (!taskKeys.includes(key)) {
          return false
        }
      }
    } else {
      for (const key of taskKeys) {
        if (!taskKeysItem.includes(key)) {
          return false
        }
      }
    }

    // Kiểm tra requireAssign
    // for (const key in requireAssign) {
    //   if (requireAssignOfCurrentTask[key] === undefined || requireAssignOfCurrentTask[key] === 0) {
    //     return false;
    //   }
    // }

    return true;
  });
}

function getLastKPIAndAvailableEmpsInTasks(tasks, allTasksInPast, employees) {
  const lastKPIsOfEmps = []
  employees.forEach((employee) => {
    const id = employee.id
    let kpiInTask = []
    tasks.forEach(() => {
      kpiInTask.push(0)
    })
    kpiInTask.push(0)
    lastKPIsOfEmps.push({
      id,
      kpiInTask: kpiInTask
    })
  })
  lastKPIsOfEmps.sort((a, b) => a.id - b.id)
  // console.log("lastKPI: ", lastKPIsOfEmps)
  tasks.forEach((task) => {
    const { requireAssign } = task
    let availableAssignee = employees
    
    if (requireAssign === undefined || !Object.keys(requireAssign)?.length) {
      employees.map((employee) => {
        const employeeId = employee.id
        let kpiValue = 0
        taskOfEmps = allTasksInPast.filter((item) => item.assignee.id === employeeId).sort((a, b) => b.evaluatePoint - a.evaluatePoint)
        kpiValue = taskOfEmps[0].evaluatePoint
        kpiInTaskWithEmp = lastKPIsOfEmps.find((item) => item.id === employee.id)

        kpiInTaskWithEmp[task.id] = kpiValue
      })
    } else {
      const listTasksMatching = findTasksWithMatchingTagsAndRequire(allTasksInPast, task)
      availableAssignee = findEmployeesWithQualities(employees, requireAssign)
      // console.log("Avai 1: ", availableAssignee.map((item) => item.id))
      const vectorLengthAssigneeCurrentTask = getVectorLength(requireAssign)
  
      if (!availableAssignee || !availableAssignee?.length) {
        throw Error("Tồn tại công việc không có ai có khả năng làm dược")
      }
      availableAssignee.forEach((employee) => {
        let listTasksMatchingWithEmp = listTasksMatching.filter((item) => item.assignee.id === employee.id)
        if (listTasksMatchingWithEmp && listTasksMatchingWithEmp?.length > 0) {
          listTasksMatchingWithEmp = listTasksMatchingWithEmp.sort((a, b) => {
            const distanceA = getDistanceQualityVector(a.requireAssign, requireAssign);
            const distanceB = getDistanceQualityVector(b.requireAssign, requireAssign);
  
            // So sánh khoảng cách
            if (distanceA !== distanceB) {
              return distanceA - distanceB;
            }
  
            // Nếu khoảng cách bằng nhau, so sánh theo thuộc tính khác
            return a.evaluatePoint - b.evaluatePoint;
          });
  
          let kpiValue = 0

          // console.log("task: ", task.id, "emp: ", employee.id, "listTaskMachingWithEmps", listTasksMatchingWithEmp.map((item) => item.id))
          const taskFail = listTasksMatchingWithEmp.find((item) =>         
            item.evaluatePoint === -1 && getVectorLength(item.requireAssign) <= getVectorLength(task.requireAssign)
          )
          kpiInTaskWithEmp = lastKPIsOfEmps.find((item) => item.id === employee.id)
  
          if (taskFail) {
            kpiInTaskWithEmp.kpiInTask[task.id] = -1
          } else {
            let kpiValueFromTaskInPast = listTasksMatchingWithEmp[0].evaluatePoint
            const vectorLengthAssigneePastTask = getVectorLength(listTasksMatchingWithEmp[0].requireAssign)
            if (vectorLengthAssigneeCurrentTask <= vectorLengthAssigneePastTask) {
              kpiValue = kpiValueFromTaskInPast
            } else {
              kpiValue = kpiValueFromTaskInPast * Math.sqrt(vectorLengthAssigneePastTask / vectorLengthAssigneeCurrentTask)
            }
            kpiInTaskWithEmp.kpiInTask[task.id] = kpiValue

            //
          }
          // console.log("task: ", task.id, "- emp: ", employee.id, "- kpi: ", kpiValue)
        }
      })
      
    }


    let updateAvailableAssignee = availableAssignee.filter((employee) => {
      const employeeId = employee.id
      const lastKPIOfEmp = lastKPIsOfEmps.find((item) => item.id === employeeId)
      // kiểm tra mấy thằng bị KPI gán = -1
      if (lastKPIOfEmp.kpiInTask[task.id] === -1) {
        return false
      } else {
        return true
      }
    })
    task.availableAssignee = updateAvailableAssignee
    // console.log("task: ", task.id, "Avai 2: ", task.availableAssignee.map((item) => item.id))

  })


  tasks.forEach((task) => {
    const { availableAssignee, id } = task
    // console.log("task: ", id, "emp: ",availableAssignee.map((item) => item.id).join(", "), lastKPIsOfEmps.map((item) => item.kpiInTask[id]))

    availableAssignee.map((employee) => {
      const employeeId = employee.id
      let kpiOfEmployeeInTask = lastKPIsOfEmps.find((item) => item.id === employeeId)
      let kpiValue = kpiOfEmployeeInTask.kpiInTask[id]
      if (kpiValue === 0) {
        let kpiOfOthersEmployeeInTask = lastKPIsOfEmps.map((item) => item.kpiInTask[id]).filter((item) => item !== KPI_NOT_WORK && item !== 0).sort((a, b) => a - b)
        // console.log("task: ", id, "emp: ", employee.id, "kpi: ", kpiOfOthersEmployeeInTask)
        if (kpiOfOthersEmployeeInTask?.length) {
          kpiValue = kpiOfOthersEmployeeInTask[0]
        } else {
          kpiValue = Math.random(0.7, 1)
        }
        kpiOfEmployeeInTask.kpiInTask[id] = kpiValue
      }
    })
    // console.log("task: ", id, "emp: ",availableAssignee.map((item) => item.id).join(", "), lastKPIsOfEmps.map((item) => item.kpiInTask[id]))

  })
  return lastKPIsOfEmps
}

function getAvailableEmployeesForTasks(tasks, employees, lastKPIs) {
  return tasks.map((task) => {
    let availableAsset = []
    // let availableAssignee = []
    const availableAssignee = findEmployeesWithQualities(employees, task.requireAssign)
    // console.log("ava: ", availableAssignee.map((item) => item.id))
    const taskId = task.id
    // Xử lý các nhân viên đã bị điều chỉnh task này
    let availableWithCheckInPast = availableAssignee.filter((assignee) => {
      const { id } = assignee
      const lastKPIOfAssignee = lastKPIs.find((item) => item.id === id)
      // console.log("id: ", id, lastKPIOfAssignee)
      if (lastKPIOfAssignee.kpiInTask[taskId] !== -1) {
        return true
      } else {
        return false
      }
    })
    // console.log("last ava: ", availableWithCheckInPast.map((item) => item.id))

    return {
      ...task,
      availableAssignee: availableWithCheckInPast && availableWithCheckInPast?.length > 0 ? availableWithCheckInPast : availableAssignee,
      availableAsset: availableAsset
    }
  })
}

function isConflictSchedule(employee, startTimeCheck, endTimeCheck, allTasksOutOfProject) {
  let isConflict = false
  let allTasksWithEmployee = allTasksOutOfProject.filter((item) => item.assignee.id === employee.id)
  // console.log("allTasks: ", allTasksWithEmployee.map((item) => item.assignee.id).join(", "))
  if (!allTasksWithEmployee || !allTasksWithEmployee?.length)
    return false
  
  for (let i = 0; i < allTasksWithEmployee?.length; i++) {
    const task = allTasksWithEmployee[i]
    const { startTime, endTime } = task
    // console.log("test: ", startTime, endTime)
    if (startTimeCheck >= endTime || endTimeCheck <= startTime) {
      continue
    } else {
      isConflict = true
      break
    }
  }
  return isConflict
}

function getAvailableEmployeesWithCheckConflict(tasks, allTasksOutOfProject) {
  const updateTasks = tasks.map((task) => {
    let updateAvailableAssignee = []
    const { availableAssignee, startTime, endTime } = task
    // console.log("task: ", startTime, " ", endTime)
    console.log("taskid: ", task.id, "availableAssignee: ", availableAssignee?.map(item => item.id).join(", "))
    if (availableAssignee?.length) {
      updateAvailableAssignee = availableAssignee.filter((employee) => {
        const check = !isConflictSchedule(employee, startTime, endTime, allTasksOutOfProject)
        return check
      })
    } 
    console.log("taskid: ", task.id, "availableAssignee: ", updateAvailableAssignee?.map(item => item.id).join(", "))
    if (updateAvailableAssignee?.length) {
      return {
        ...task,
        availableAssignee: updateAvailableAssignee
      }
    } else {
      return {
        ...task,
        isConflict: true
      }
    }
  })
  return updateTasks
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
  if (task.requireAsset?.length == 0) {
    return {
      taskAssets: [],
      availableTime: new Date(0)
    }
  }

  let availableTimes = [];
  availableTimes.push(new Date(0))
  if (task?.requireAsset?.length)
    task.requireAsset.forEach(require => {
      let readyToUse = assets.readyToUse.filter(asset => isAssetCompatibleWithRequirement(asset, require)).sort((a, b) => a.costPerHour - b.costPerHour)
      // Nếu có tài nguyên yêu cầu và đủ số lượng => trả về timeavailable = 0 
      if (readyToUse.length >= require.number) {
        availableTimes.push(new Date(0));
        
        for (let i = 0; i < require.number; i++) {
          availableAssets.push(readyToUse[i])
        }
      }
      else {
        // Nếu không đủ số lượng
        availableAssets = [...readyToUse]
        const remain = require.number - readyToUse.length;
        let inUse = assets.inUse.filter(asset => isAssetCompatibleWithRequirement(asset, require));
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

function getAvailableTimeForAssetOfTask_2(task, assets) {
  let availableAssets = []
  if (task.requireAsset?.length == 0) {
    return {
      taskAssets: [],
      availableTime: new Date(0)
    }
  }

  let availableTimes = [];
  availableTimes.push(new Date(0))
  if (task?.requireAsset?.length)
    task.requireAsset.forEach(require => {
      let readyToUse = assets.readyToUse.filter(asset => isAssetCompatibleWithRequirement(asset, require)).sort((a, b) => a.costPerHour - b.costPerHour)
      // Nếu có tài nguyên yêu cầu và đủ số lượng => trả về timeavailable = 0 
      if (readyToUse.length >= require.number) {
        availableTimes.push(new Date(0));
        // readyToUse = readyToUse.sort((a, b) => {
        //   const usageLogsA = a?.usageLogs ? a?.usageLogs.sort((log1, log2) => new Date(log2.endDate) - new Date(log1.endDate))[0] : new Date(0)
        //   const usageLogsB = b?.usageLogs ? b?.usageLogs.sort((log1, log2) => new Date(log2.endDate) - new Date(log1.endDate))[0] : new Date(0)
        //   console.log("usageLogsA: ", usageLogsA)
        //   console.log("usageLogsB: ", usageLogsB)

        //   return usageLogsA - usageLogsB
        // })
        // let logsReadyToUse = readyToUse.filter((item) => item?.usageLogs)
        // if (logsReadyToUse?.length) {
        //   logsReadyToUse = logsReadyToUse.map(_ => _.usageLogs.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0].endDate).sort((a, b) => new Date(b) - new Date(a));
        //   availableTimes.push(new Date(logsReadyToUse[0]))
        // }
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

// function splitKPIOfTaskToEmployees(task, kpiTarget) {
//   const kpiOfEmployee = {}
//   const { requireAssign, availableAssignee, kpiInTask, id } = task
//   // console.log("task: ", task)
//   let totalMeanOfTask = 0
//   let totalQualityRequire = 0
//   for (let qualityKey in requireAssign) {
//     totalQualityRequire++;
//     const meanCapacityOfQuality = findMeanOfQuality(qualityKey, availableAssignee)
//     // console.log("key: ", qualityKey, ": ", meanCapacityOfQuality)
//     totalMeanOfTask += meanCapacityOfQuality
//   }
//   // const total 
//   const meanCapacityOfTask = totalMeanOfTask / totalQualityRequire
//   // console.log("mean: ", meanCapacityOfTask, "task: ", task.id)
  
//   let totalRatio = 0
//   // let availableAssigneeFilter = availableAssignee.filter((employee) => getCapacityPointOfEmployeeInTask(requireAssign, employee) >= meanCapacityOfTask)
//   // console.log("availableAssigneeFilter: ", availableAssigneeFilter)
//   availableAssignee.forEach((employee) => {
//     kpiOfEmployee[employee.id] = {}
//     for (let key in KPI_TYPES) {
//       kpiOfEmployee[employee.id][key] = 0
//     }
//     // kpiOfEmployee[employee.id]['ratio'] = getCapacityPointOfEmployeeInTask(requireAssign, employee) / meanCapacityOfTask
//     const capacityOfEmployeeInTask = getCapacityPointOfEmployeeInTask(requireAssign, employee)
//     // console.log('capacity Emp: ', capacityOfEmployeeInTask)
//     kpiOfEmployee[employee.id]['ratio'] = capacityOfEmployeeInTask
//     totalRatio +=  kpiOfEmployee[employee.id]['ratio']
//   })

//   let testTotalKPI = 0
//   availableAssignee.forEach((employee) => {
//     kpiInTask.forEach(({ type, weight }) => {
//       const ratio = kpiOfEmployee[employee.id]['ratio']
//       const value = weight * kpiTarget[type].value * ratio / totalRatio
//       kpiOfEmployee[employee.id][type] += value
//       testTotalKPI += value
//     })
    
//   })
//   return kpiOfEmployee
// }

function splitKPIToEmployees(tasks, employees, kpiTarget) {
  const kpiOfEmployees = {}
  employees.forEach((employee) => {
    kpiOfEmployees[employee.id] = {}
    for (let key in KPI_TYPES) {
      kpiOfEmployees[employee.id][key] = 0
    }
    // kpiOfEmployees[employee.id]['total'] = 0
  })

  tasks.forEach((task) => {
    const kpiSplitInTask = splitKPIOfTaskToEmployees(task, kpiTarget)
    for (let employeeId in kpiSplitInTask) {
      for (let key in KPI_TYPES) {
        kpiOfEmployees[employeeId][key] += kpiSplitInTask[employeeId][key]
      }
    }
  })
  // employees.forEach((employee) => {
  //   const { id } = employee
  //   for (let key in kpiTarget) {
  //     kpiOfEmployees[id]['total'] += kpiTarget[key].weight * kpiOfEmployees[id][key]
  //   }
  // })
  // console.log("kpiOf: ", kpiOfEmployees)
  return kpiOfEmployees
}

function markAssetsAsUsed(currentAssets, taskAssets, startTime, endTime) {
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
      updateInUse = updateInUse.filter((item) => item.id !== taskAsset.id)
      updateInUse.push({...taskAsset})
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

function reCalculateTimeWorking(time) {
  // console.log("time: ", time)
  // Đưa về giờ làm chuẩn
  if (time.getHours() >= 17) { // giờ >=17 chuyển sang ngày hôm sau
    time.setDate(time.getDate() + 1);
    time.setHours(8 + time.getHours() - 17)
  } else if (time.getHours() < 13 && time.getHours() > 12) {
    time.setHours(time.getHours() + 1)
  } else if (time.getHours() < 8) {
    time.setHours(8)
  };

  while (time.getDay() % 6 == 0 || time.getDay() % 7 == 0) { // Không làm T7, chủ nhật
    time.setDate(time.getDate() + 1);
  }

  // console.log("return time: ", time)

  return time;
}

function scheduleTasksWithAsset(job, assets) {
  const sortedTasks = job.tasks;
  // console.log("asset: ", assets)

  // JSON => date to string hết
  let currentAssets = JSON.parse(JSON.stringify(assets))
  for (const task of sortedTasks) {
    // console.log("currentAsset: ", currentAssets.inUse.length, currentAssets.readyToUse.length, "id task: ", task.id)
    const { taskAssets, availableTime } = getAvailableTimeForAssetOfTask(task, currentAssets);
    console.log(task.id, "available: ", availableTime)
    // console.log("task: ", task.id)
    // console.log("taskAssets: ", taskAssets)
    // Gán các tài nguyên đã chọn cho task
    task.assets = taskAssets;
    const numDay = Math.floor(task.estimateTime);
    const remainHour = (task.estimateTime - numDay) * DAY_WORK_HOURS;

    const preceedingTasks = task.preceedingTasks.map(id => job.tasks.find(t => t.id === id));
    if (preceedingTasks?.length > 0 ) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);

      task.startTime = new Date(Math.max(availableTime.getTime(), maxEndTimeOfPreceedingTasks));
    } else {
      task.startTime = new Date(Math.max(job.startTime, availableTime));
    }
    // recalculate Time
    task.startTime = reCalculateTimeWorking(task.startTime)
    task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
    task.endTime = reCalculateTimeWorking(task.endTime)


    // Đánh dấu các tài nguyên đã được sử dụng trong khoảng thời gian thực hiện nhiệm vụ
    currentAssets = markAssetsAsUsed(currentAssets, taskAssets, task.startTime, task.endTime);
    // console.log("currentAssets: ", currentAssets)
  }

  return sortedTasks;
}

// function scheduleTasksWithAsset(job, assets) {
//   const sortedTasks = job.tasks;
//   // console.log("asset: ", assets)

//   let currentTime = job.startTime;

//   // JSON => date to string hết
//   let currentAssets = JSON.parse(JSON.stringify(assets))
//   for (const task of sortedTasks) {
//     // console.log("currentAsset: ", currentAssets.inUse.length, currentAssets.readyToUse.length, "id task: ", task.id)
//     const { taskAssets, availableTime } = getAvailableTimeForAssetOfTask(task, currentAssets);
//     // console.log("available: ", availableTime.getTime())
//     // console.log("task: ", task.id)
//     // console.log("taskAssets: ", taskAssets)
//     // Gán các tài nguyên đã chọn cho task
//     task.assets = taskAssets;
//     const numDay = Math.floor(task.estimateTime);
//     const remainHour = (task.estimateTime - numDay) * DAY_WORK_HOURS;

//     const preceedingTasks = task.preceedingTasks.map(id => job.tasks.find(t => t.id === id));
//     if (preceedingTasks?.length > 0 ) {
//       const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
//       // console.log("maxEndTimeOfPreceedingTasks: ", maxEndTimeOfPreceedingTasks)
//       // const availableTimeForAsset = getAvailableTimeForAssetOfTask(task, taskAssets);

//       // Tìm thời gian bắt đầu cho nhiệm vụ sau khi tất cả các nhiệm vụ tiền điều kiện của nó đã hoàn thành và tài nguyên cần được sử dụng rảnh rỗi
//       task.startTime = new Date(Math.max(availableTime.getTime(), maxEndTimeOfPreceedingTasks));
//     } else {
//       task.startTime = new Date(Math.max(job.startTime, availableTime));
//     }
//     // recalculate Time
//     task.startTime = reCalculateTimeWorking(task.startTime)
//     task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
//     // console.log("task.startTime: ", task.startTime)
//     // console.log("task.endTime: ", task.endTime)
//     task.endTime = reCalculateTimeWorking(task.endTime)
//     // console.log("startTime: ", task.startTime)
//     // console.log("endTime: ", task.endTime)

//     // Xét ở đây


//     // Đánh dấu các tài nguyên đã được sử dụng trong khoảng thời gian thực hiện nhiệm vụ
//     currentAssets = markAssetsAsUsed(currentAssets, taskAssets, task.startTime, task.endTime);
//     // console.log("currentAssets: ", currentAssets)

//     currentTime = task.endTime;
//   }

//   return sortedTasks;
// }

function scheduleTasksWithAssetAndEmpTasks(job, assets, allTasksOutOfProject) {
  const sortedTasks = job.tasks;

  // JSON => date to string hết
  let currentAssets = JSON.parse(JSON.stringify(assets))
  for (const task of sortedTasks) {
    // console.log("currentAsset: ", currentAssets.inUse.length, currentAssets.readyToUse.length, "id task: ", task.id)
    const { taskAssets, availableTime } = getAvailableTimeForAssetOfTask(task, currentAssets);
    // console.log("available 1: ", availableTime)
    // console.log("task: ", task.id)
    // console.log("taskAssets: ", taskAssets)
    // Gán các tài nguyên đã chọn cho task
    task.assets = taskAssets;
    const numDay = Math.floor(task.estimateTime);
    const remainHour = (task.estimateTime - numDay) * DAY_WORK_HOURS;

    const preceedingTasks = task.preceedingTasks.map(id => job.tasks.find(t => t.id === id));
    if (preceedingTasks?.length > 0 ) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
      // console.log("maxEndTimeOfPreceedingTasks 1: ", new Date(maxEndTimeOfPreceedingTasks))
      // Tìm thời gian bắt đầu cho nhiệm vụ sau khi tất cả các nhiệm vụ tiền điều kiện của nó đã hoàn thành và tài nguyên cần được sử dụng rảnh rỗi
      task.startTime = new Date(Math.max(availableTime, maxEndTimeOfPreceedingTasks));
    } else {
      task.startTime = new Date(Math.max(job.startTime, availableTime));
    }
    // recalculate Time
    task.startTime = reCalculateTimeWorking(task.startTime)
    task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
    task.endTime = reCalculateTimeWorking(task.endTime)


    // Xét ở đây
    // allTasksOutOfProject
    while (true) {
      const availableAssigneeWithTask = task.availableAssignee
      const maxLength = availableAssigneeWithTask?.length

      const availableAssignees = task.availableAssignee.filter(assignee => {
        return !allTasksOutOfProject.some(otherTask => {
          return otherTask.assignee.id === assignee.id &&
            !(task.endTime <= otherTask.startTime || task.startTime >= otherTask.endTime);
        });
      });

      if (availableAssignees?.length > 1 || (maxLength <= 3 && availableAssignees.length == maxLength) || (maxLength > 3 &&  availableAssignees?.length >= maxLength - 1) || availableAssignees?.length >= 4) {
        task.availableAssignee = availableAssignees;
        break;
      } else {
        task.startTime.setHours(task.startTime.getHours() + 1);
        task.endTime.setHours(task.endTime.getHours() + 1);
      }
    }
    task.startTime = reCalculateTimeWorking(task.startTime)
    task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
    task.endTime = reCalculateTimeWorking(task.endTime)
    
    // console.log("startTime: ", task.startTime)
    // console.log("endTime: ", task.endTime)

    // Đánh dấu các tài nguyên đã được sử dụng trong khoảng thời gian thực hiện nhiệm vụ
    currentAssets = markAssetsAsUsed(currentAssets, taskAssets, task.startTime, task.endTime);
  }

  return sortedTasks;
}

function getKpiOfEmployees(assignment, employees, lastKPIs, assetHasKPIWeight = 0) {
  const kpiOfEmployee = {}
  for(let i = 0; i < employees.length; i++) {
    kpiOfEmployee[employees[i].id] = {}
    for (let key in KPI_TYPES) {
      kpiOfEmployee[employees[i].id][key] = 0
    }
    // kpiOfEmployee[employees[i].id]['total'] = 0
  }
  for(let i = 0; i < assignment.length; i++) {
    const { task, assignee } = assignment[i]
    const { kpiInTask } = task || []
    const { id } = assignee
    const kpiOfAssignee = lastKPIs.find((item) => item.id === id) 
    const { requireAsset } = task
    const IS_HAS_ASSET = requireAsset && requireAsset?.length > 0
    // console.log("kpiOfAssignee: ")
    let kpiValue = kpiOfAssignee.kpiInTask[task.id]
    if (kpiValue === KPI_NOT_WORK) {
      kpiValue = 0
      // Lấy kpi tồi nhất của thằng nào đã làm task này rồi: TODO
      let listKPIInThisTask = lastKPIs.filter((item) => item.kpiInTask[task.id] !== -1).map((item) => item.kpiInTask[task.id]).sort((a, b) => a - b)
      kpiValue = listKPIInThisTask[0]
    } 
    
    if (kpiInTask?.length) {
      kpiInTask.forEach((kpiItem) => {
        const { type, weight } = kpiItem
        if (IS_HAS_ASSET) {
          kpiOfEmployee[id][type] += kpiValue * weight * (1 - assetHasKPIWeight)
        } else {
          kpiOfEmployee[id][type] += kpiValue * weight
        }
      })
    }
  }



  return kpiOfEmployee

}


function getTotalKpi(assignment, lastKPIs, assetHasKPIWeight) {
  const kpiAssignment = {}
  for (let key in KPI_TYPES) {
    kpiAssignment[key] = 0
  }

  assignment.forEach((assignmentItem) => {
    const { task, assignee } = assignmentItem
    const { requireAsset } = task
    const IS_HAS_ASSET = requireAsset && requireAsset?.length > 0

    const { kpiInTask } = task || []
    const taskId = task.id
    const assigneeId = assignee.id
    let kpiValue = 0
    kpiValue = lastKPIs.find((item) => item.id === assigneeId)?.kpiInTask[taskId]
    if (kpiValue === KPI_NOT_WORK) {
      const kpiWithTaskInPast = lastKPIs.map((item) => item.kpiInTask[taskId]).filter((item) => item !== -1).sort((a, b) => a - b)
      kpiValue = kpiWithTaskInPast[0]
    }

    if (kpiInTask?.length) {
      kpiInTask.forEach((kpiGetItem) => {
        const { type, weight } = kpiGetItem
        if (IS_HAS_ASSET) {
          kpiAssignment[type] += kpiValue * weight * (1 - assetHasKPIWeight) + KPI_OF_ASSET_IN_TASK * weight * assetHasKPIWeight
        } else {
          kpiAssignment[type] += kpiValue * weight
        }
      })
    }
  })

  return kpiAssignment
}

function getTotalCost(assignment) {
  let totalCost = 0
  for (let i = 0; i < assignment.length; i++) {
    const { task, assignee } = assignment[i]
    const { estimateTime, assets } = task
    const { costPerHour } = assignee
    const timeForTask = estimateTime * DAY_WORK_HOURS
    // TODO: Tính cả cost theo KPI đạt được, ví dụ hiệu suất là 0.9 thì lấy cost / 0.9
    totalCost += timeForTask * costPerHour

    for (let j = 0; j < assets?.length; j++) {
      totalCost += timeForTask * assets[j].costPerHour
    }
  }

  return totalCost
}

function checkDuplicate(currentAssignment, employee, startTimeCheck, endTimeCheck) {
  let isDuplicate = false

  let currentAssignmentFilter = currentAssignment.filter((item) => item.assignee.id === employee.id)
  if (currentAssignmentFilter?.length) {
    for (let i = 0; i < currentAssignmentFilter.length; i++) {
      const { task } = currentAssignmentFilter[i]
      const { startTime, endTime } = task
      if (endTime <= startTimeCheck || endTimeCheck <= startTime) {
        continue
      } else {
        isDuplicate = true
        break
      }
    }
  } else {
    isDuplicate = false
  }

  return isDuplicate
}

function initRandomHarmonyVector(tasks, employees, lastKPIs, kpiOfEmployeesTarget, assetHasKPIWeight) {
  const randomAssignment = []
  const empAssigned = []
  let falseAssigneeScore = 0, kpiAssignment = {}, totalCost = 0, falseDuplicate = 0
  let taskInDuplicate = []

  for (let i = 0; i < tasks.length; i++) {
    let assignEmployee = {}
    const task = tasks[i]
    const { availableAssignee, assets } = task
    const { startTime, endTime } = task 

    let availableCheckDuplicate = availableAssignee.filter((employee) => !checkDuplicate(randomAssignment, employee, startTime, endTime))
    if (availableCheckDuplicate?.length) {
      assignEmployee = availableCheckDuplicate[Math.floor(Math.random() * availableCheckDuplicate.length)]
    } else {
      assignEmployee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
      falseDuplicate++;
      taskInDuplicate.push(task.id)
    }

    // TODO: code for available assets
    const assignAssets = [...assets]

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
  kpiAssignment = getTotalKpi(randomAssignment, lastKPIs, assetHasKPIWeight)
  // get total cost
  totalCost = getTotalCost(randomAssignment)
  
  // getKPI of Employees 
  const kpiOfEmployees = getKpiOfEmployees(randomAssignment, employees, lastKPIs, assetHasKPIWeight)

  // function get distance

  const distanceWithKPIEmployeesTarget = getDistanceOfKPIEmployeesTarget(kpiOfEmployees, kpiOfEmployeesTarget)

  const randomHarmonyVector = {
    // index,
    assignment: randomAssignment,
    falseAssigneeScore,
    totalCost,
    kpiAssignment,
    kpiOfEmployees,
    distanceWithKPIEmployeesTarget,
    falseDuplicate,
    taskInDuplicate
  }
  return randomHarmonyVector
}

function compareSolution(solutionA, solutionB, kpiTarget, kpiOfEmployeesTarget) {
  let checkNonKPIFlag = true
  for (let key in kpiTarget) {
    if (kpiTarget[key].value) {
      checkNonKPIFlag = false
    }
  }

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
      if (checkNonKPIFlag) {
        if (solutionA.falseDuplicate === solutionB.falseDuplicate) {
          if (solutionA.falseDuplicate === 0) {
            return solutionA.totalCost < solutionB.totalCost
          } else {
            return solutionA.falseDuplicate < solutionB.falseDuplicate
          }
        } else {
          return solutionA.falseDuplicate < solutionB.falseDuplicate
        }
      }

      let pointA = 0
      let pointB = 0
      let count = 0
      for (let key in kpiTarget) {
        count++;
        totalKpiOfA += kpiAssignmentOfA[key] * kpiTarget[key].weight 
        totalKpiOfB += kpiAssignmentOfB[key] * kpiTarget[key].weight 
        if (kpiAssignmentOfA[key].toFixed(4) >= kpiTarget[key].value && kpiAssignmentOfA[key] < 1.05 * kpiTarget[key].value) {
          pointA++;
        } else {
          totalKpiMissA += kpiTarget[key].value - kpiAssignmentOfA[key]
        }
        if (kpiAssignmentOfB[key].toFixed(4) >= kpiTarget[key].value && kpiAssignmentOfB[key] < 1.05 * kpiTarget[key].value) {
          pointB++;
        } else {
          totalKpiMissB += kpiTarget[key].value - kpiAssignmentOfB[key]
        }
      }
      if (pointA === pointB) {
        const distanceA = solutionA.distanceWithKPIEmployeesTarget
        const distanceB = solutionB.distanceWithKPIEmployeesTarget
        // return distanceA <= distanceB

        // if (solutionA.falseDuplicate === solutionB.falseDuplicate) {
        //   return distanceA <= distanceB
        // } else {
        //   return solutionA.falseDuplicate < solutionB.falseDuplicate
        // }
        if (Math.abs(distanceA - distanceB) <= 0.001) {
          return solutionA.falseDuplicate < solutionB.falseDuplicate
        } else {
          return distanceA < distanceB
        }

        if (pointA === count) {
          // Nếu cả 2 đều đạt KPI target => xem xét đạt KPI target của từng đứa
          // return 
          const distanceA = solutionA.distanceWithKPIEmployeesTarget
          const distanceB = solutionB.distanceWithKPIEmployeesTarget

          if (solutionA.falseDuplicate === solutionB.falseDuplicate) {
            return distanceA <= distanceB
          } else {
            return solutionA.falseDuplicate < solutionB.falseDuplicate
          }


          let employeeTargetPointA = 0, employeeTargetPointB = 0
          for (let employeeId in kpiOfEmployeesTarget) {
            let flagA = true, flagB = true
            for (let kpiType in KPI_TYPES) {
              if (kpiOfEmployeesA[employeeId][kpiType] < kpiOfEmployeesTarget[employeeId][kpiType]) {
                flagA = false
              }
              if (kpiOfEmployeesB[employeeId][kpiType] < kpiOfEmployeesTarget[employeeId][kpiType]) {
                flagB = false
              }
            }
            if (flagA) 
              employeeTargetPointA++
            if (flagB)
              employeeTargetPointB++
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
    if (kpiAssignmentOfSolution[key] < kpiTarget[key].value) {
      return false
    }
  }
  for (let employeeId in kpiOfEmployeesTarget) {
    for (let kpiType in KPI_TYPES) {
      if (kpiOfEmployees[employeeId][kpiType] < kpiOfEmployeesTarget[employeeId][kpiType]) {
        return false
      }
    }
  }
  if (solution.distanceWithKPIEmployeesTarget >= 0.001)
    return false
  if (solution.falseDuplicate) {
    return false
  }

  return true
}

function updateHarmonyMemory(HM, improviseSolution) {
  HM.pop()
  HM.push(improviseSolution)
}

function isHaveSameSolution(bestFitnessSolutions, currentBestSolution, ratio = 0.0001) {
  const currentKpiAssignment = currentBestSolution.kpiAssignment
  const currentTotalCost = currentBestSolution.totalCost

  const isHaveSameSolution = bestFitnessSolutions.find((fitnessSolution) => {
    const fitnessKpiAssignment = fitnessSolution.kpiAssignment
    const fitnessTotalCost = fitnessSolution.totalCost
    for (let key in fitnessKpiAssignment) {
      const diffValue = Math.abs(currentKpiAssignment[currentKpiAssignment] - fitnessKpiAssignment[key])
      if (diffValue > ratio) 
        return false
    }
    const diffCost = Math.abs(fitnessTotalCost - currentTotalCost)
    if (diffCost > ratio)
      return false

    return true
  })

  return isHaveSameSolution ? true : false
}


function reScheduleTasks(assignment, assets, allTasksOutOfProject, projectEndTime) {
  // Làm việc với 1 assignmentTemp
  const assignmentTemp = []
  for (let i = 0; i < assignment.length; i++) {
    const { task, assignee, assets } = assignment[i]
    const { startTime, endTime, estimateTime, preceedingTasks, id } = task
    assignmentTemp.push({
      task: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        preceedingTasks,
        estimateTime,
        id
      },
      assets,
      assignee
    })
  }

  assignmentTemp.sort((itemA, itemB) => new Date(itemA.task.endTime) - new Date(itemB.task.endTime))
  assignmentTemp[0].task.startTime.setDate(assignmentTemp[0].task.startTime.getDate() + 1)
  console.log("startTime: ", assignment[0].task.startTime)
  console.log("startTimeTmp: ", assignmentTemp[0].task.startTime)
  assignmentTemp.forEach(({ task }) => {
    task.startTime = new Date(task.startTime)
    task.endTime = new Date(task.endTime)
  })
  // console.log("assignment: ", assignment)
  const endTimeSavesTmp = {}
  const assetAssignmentsTmp = {};

  assignmentTemp.forEach(({ task, assignee }) => {
    let startTime = task.startTime
    const numDay = Math.floor(task.estimateTime);
    const remainHour = (task.estimateTime - numDay) * DAY_WORK_HOURS;

    const preceedingTasks = task.preceedingTasks.map(id => assignmentTemp.find((item) => item.task.id === id).task)
    const timeAvailableForAsset = getAvailableTimeForAssetOfTask(task, assets).availableTime
    task.startTime = new Date(Math.max(startTime, timeAvailableForAsset));
    if (preceedingTasks?.length > 0) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
      task.startTime = new Date(Math.max(startTime, maxEndTimeOfPreceedingTasks));
    }
    if (assignee.id in endTimeSavesTmp && endTimeSavesTmp[assignee.id].getTime() > task.startTime.getTime()) {
      // Nếu có xung đột, cập nhật thời gian bắt đầu của task
      task.startTime = endTimeSavesTmp[assignee.id]
    }
    // console.log("task.startTime: ", task.startTime)
    // Kiểm tra xung đột với tài nguyên
    if (task.assets?.length) {
      let assetConflict = false;
      task.assets.forEach(asset => {
        if (asset.id in assetAssignmentsTmp && assetAssignmentsTmp[asset.id].getTime() > task.startTime.getTime()) {
          assetConflict = true;
          // Nếu có xung đột với tài nguyên, cập nhật thời gian bắt đầu của task
          task.startTime = assetAssignmentsTmp[asset.id];
          // console.log("vao day: ", task.startTime)
        }
      });

      // ReCalculate Time
      task.startTime = reCalculateTimeWorking(task.startTime)
      // Nếu có xung đột với tài nguyên, xem xét lại thời gian kết thúc của task
      if (assetConflict) {
        task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
      }
    }

    // check thêm cả điều kiện về thời gian của thằng nhân viên
    while (true) {
      const isAvailable = !allTasksOutOfProject.some(otherTask => {
        return otherTask.assignee.id === assignee.id &&
          !(task.endTime <= otherTask.startTime || task.startTime >= otherTask.endTime);
      })

      if (isAvailable) {
        break;
      } else {
        task.startTime.setHours(task.startTime.getHours() + 1);
        task.endTime.setHours(task.endTime.getHours() + 1);
      }
    }

    task.startTime = reCalculateTimeWorking(task.startTime)
    // ReCalculate Time
    task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
    task.endTime = reCalculateTimeWorking(task.endTime)
    // console.log("task.endTime: ", task.endTime)

    endTimeSavesTmp[assignee.id] = task.endTime;

    // Cập nhật lại thông tin về tài nguyên được gán
    if (task.assets) {
      task.assets.forEach(asset => {
        assetAssignmentsTmp[asset.id] = task.endTime;
      });
    }
  })
  const endTimeTmp = getLastestEndTime(assignmentTemp)
 
  if (endTimeTmp > projectEndTime) {
    console.log("Điều chỉnh lịch nhưng không được vì vượt quá thời gian cho phép, những task bị trùng sẽ cần được ủy quyền")
  } else {
    assignment.forEach(({ task }) => {
      taskInTemp = assignmentTemp.find((item) => item.task.id === task.id).task
      task.startTime = new Date(taskInTemp.startTime)
      task.endTime = new Date(taskInTemp.endTime)
    })
  }

}

function reScheduleTasks(assignment, assets, allTasksOutOfProject, projectEndTime) {
  // Làm việc với 1 assignmentTemp
  for (let i = 0; i < assignment.length; i++) {
    const { task } = assignment[i]
    const { startTime, endTime } = task
    task.startTimeTmp = new Date(startTime)
    task.endTimeTmp = new Date(endTime)
  }
  assignment.sort((itemA, itemB) => new Date(itemA.task.endTime) - new Date(itemB.task.endTime))
  assignment.forEach(({ task }) => {
    task.startTime = new Date(task.startTime)
    task.endTime = new Date(task.endTime)
  })
  // Test
  // assignment[0].task.startTime.setDate(assignment[0].task.startTime.getDate())

  // console.log("assignment: ", assignment[0].task.startTime)
  // console.log("assignment: ", assignment[0].task.startTimeTmp)
  const endTimeSaves = {}
  const assetAssignments = {};

  assignment.forEach(({ task, assignee }) => {
    let startTime = task.startTime
    const numDay = Math.floor(task.estimateTime);
    const remainHour = (task.estimateTime - numDay) * DAY_WORK_HOURS;

    const preceedingTasks = task.preceedingTasks.map(id => assignment.find((item) => item.task.id === id).task)
    const timeAvailableForAsset = getAvailableTimeForAssetOfTask(task, assets).availableTime
    task.startTime = new Date(Math.max(startTime, timeAvailableForAsset));
    if (preceedingTasks?.length > 0) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
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
          // console.log("vao day: ", task.startTime)
        }
      });

      // ReCalculate Time
      task.startTime = reCalculateTimeWorking(task.startTime)
      // Nếu có xung đột với tài nguyên, xem xét lại thời gian kết thúc của task
      if (assetConflict) {
        task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
      }
    }

    // check thêm cả điều kiện về thời gian của thằng nhân viên
    while (true) {
      const isAvailable = !allTasksOutOfProject.some(otherTask => {
        return otherTask.assignee.id === assignee.id &&
          !(task.endTime <= otherTask.startTime || task.startTime >= otherTask.endTime);
      })

      if (isAvailable) {
        break;
      } else {
        task.startTime.setHours(task.startTime.getHours() + 1);
        task.endTime.setHours(task.endTime.getHours() + 1);
      }
    }

    task.startTime = reCalculateTimeWorking(task.startTime)
    // ReCalculate Time
    task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
    task.endTime = reCalculateTimeWorking(task.endTime)
    // console.log("task.endTime: ", task.endTime)

    endTimeSaves[assignee.id] = task.endTime;

    // Cập nhật lại thông tin về tài nguyên được gán
    if (task.assets) {
      task.assets.forEach(asset => {
        assetAssignments[asset.id] = task.endTime;
      });
    }
  })

  let endTimeTmp = getLastestEndTime(assignment)
  // console.log("endTimeTmp: ", endTimeTmp)
  
 
  if (endTimeTmp > projectEndTime) {
    console.log("Điều chỉnh lịch nhưng không được vì vượt quá thời gian cho phép, những task bị trùng sẽ cần được ủy quyền")
    assignment.forEach(({ task }) => {
      task.startTime = new Date(task.startTimeTmp)
      task.endTime = new Date(task.endTimeTmp)
    })
  } 
}

function getDistanceOfKPIEmployeesTarget(kpiOfEmployeesSolution, kpiOfEmployeesTarget) {
  let sum = 0, sumPositive = 0, sumNegative = 0
  let edge1 = 0, edge2 = 0

  for (let employeeId in kpiOfEmployeesTarget) {
    for (let kpiType in KPI_TYPES) {
      const detalValue = KPI_TYPES[kpiType].weight * (kpiOfEmployeesSolution[employeeId][kpiType] - kpiOfEmployeesTarget[employeeId][kpiType])
      sum += detalValue * detalValue
      edge1Value = KPI_TYPES[kpiType].weight * kpiOfEmployeesSolution[employeeId][kpiType]
      edge2Value = KPI_TYPES[kpiType].weight * kpiOfEmployeesTarget[employeeId][kpiType]

      edge1 += edge1Value * edge1Value
      edge2 += edge2Value * edge2Value
      if (detalValue > 0) {
        sumPositive += detalValue * detalValue
      } else {
        sumNegative += detalValue * detalValue
      }
    }
  }

  if (sumNegative === 0) {
    return 0
  }

  // let distance1 = Math.sqrt(sum) + Math.sqrt(sumPositive) - Math.sqrt(sumNegative)
  let distance2 = Math.sqrt(sum) - Math.sqrt(sumPositive) + Math.sqrt(sumNegative)
  let distance3 = Math.sqrt(sum)

  const distance = Math.min(distance2, distance3)

  return distance
}

function getDistanceOfKPIEmployeesTarget_2(kpiOfEmployeesSolution, kpiOfEmployeesTarget) {
  let sum = 0, sumPositive = 0, sumNegative = 0
  let edge1 = 0, edge2 = 0

  for (let employeeId in kpiOfEmployeesTarget) {
    for (let kpiType in KPI_TYPES) {
      const detalValue = KPI_TYPES[kpiType].weight * (kpiOfEmployeesSolution[employeeId][kpiType] - kpiOfEmployeesTarget[employeeId][kpiType])
      sum += detalValue * detalValue
      edge1Value = KPI_TYPES[kpiType].weight * kpiOfEmployeesSolution[employeeId][kpiType]
      edge2Value = KPI_TYPES[kpiType].weight * kpiOfEmployeesTarget[employeeId][kpiType]

      edge1 += edge1Value * edge1Value
      edge2 += edge2Value * edge2Value
      if (detalValue > 0) {
        sumPositive += detalValue * detalValue
      } else {
        sumNegative += detalValue * detalValue
      }
    }
  }

  let distance1 = Math.sqrt(sum) + Math.sqrt(sumPositive) - Math.sqrt(sumNegative)
  let distance2 = Math.sqrt(sum) - Math.sqrt(sumPositive) + Math.sqrt(sumNegative)
  let distance3 = Math.sqrt(sum)
  console.log(distance1, distance2, distance3)

  const distance = Math.min(distance1, distance2, distance3)
  // return distance > 0 ? distance : 0, Math.sqrt(edge1), Math.sqrt(edge2)
  console.log((edge1 + edge2 - distance3 * distance3) / (2 * Math.sqrt(edge1) * Math.sqrt(edge2)))
  return {
    distance: distance > 0 ? distance : 0,
    edge1: Math.sqrt(edge1),
    edge2: Math.sqrt(edge2)
  }
}

function harmonySearch_Base(HS_Arguments, tasks, employees, lastKPIs,  kpiTarget, kpiOfEmployeesTarget, assetHasKPIWeight) {
  
  const { hmSize, bw, maxIter, HMCR, PAR } = HS_Arguments
  
  // Step 1: init HM
  let HM = [], bestFitnessSolutions = []

  for (let i = 0; i < hmSize; i++) {
    let randomSolution = initRandomHarmonyVector(tasks, employees, lastKPIs, kpiOfEmployeesTarget, assetHasKPIWeight)
    // console.log("randomSolution: ", randomSolution.kpiAssignment)
    HM.push(randomSolution)
  }
  
  
  // STEP 2: 
  for (let i = 0; i < maxIter; i++) {
    const bestSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, kpiOfEmployeesTarget).best
    const worstSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, kpiOfEmployeesTarget).worst

    let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, kpiOfEmployeesTarget) 

    // if (isFitnessSolution) {
    //   if (!isHaveSameSolution(bestFitnessSolutions, bestSolution, 0)) {
    //     bestFitnessSolutions.push(bestSolution)
    //   }
    // } 
    let improviseAssignment = []
    let empAssigned = []
    let falseAssigneeScore = 0, falseDuplicate = 0
    let taskInDuplicate = []

    // const bestSolutionAssignment = bestSolution.assignment

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const { availableAssignee, assets } = task
      const { startTime, endTime } = task
  
      let randomAssignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
      let availableCheckDuplicate = availableAssignee.filter((employee) => !checkDuplicate(improviseAssignment, employee, startTime, endTime))
        if (availableCheckDuplicate?.length) {
          randomAssignee = availableCheckDuplicate[Math.floor(Math.random() * availableCheckDuplicate.length)]
        } 
      if (Math.random() < HMCR) {
        let randomAssignment = HM[Math.floor(Math.random() * HM?.length)].assignment
        randomAssignee = randomAssignment.find((item) => item.task.id === task.id).assignee
        if (Math.random() < PAR || !isFitnessSolution) {
          let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
          randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableAssignee.length
          randomAssignee = availableAssignee[randomAssigneeIndex]
        }
      }

      // Do for assets: TODO

      if (checkDuplicate(improviseAssignment, randomAssignee, startTime, endTime)) {
        falseDuplicate++
        taskInDuplicate.push(task.id)
      }
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
    const kpiAssignment = getTotalKpi(improviseAssignment, lastKPIs, assetHasKPIWeight)

    // get total Cost
    const totalCost = getTotalCost(improviseAssignment)

    const kpiOfEmployees = getKpiOfEmployees(improviseAssignment, employees, lastKPIs, assetHasKPIWeight)

    // get euclid distance kpi target
    // function get distance
    const distanceWithKPIEmployeesTarget = getDistanceOfKPIEmployeesTarget(kpiOfEmployees, kpiOfEmployeesTarget)

    const improviseSolution = {
      assignment: improviseAssignment,
      falseAssigneeScore,
      totalCost,
      kpiAssignment,
      kpiOfEmployees,
      distanceWithKPIEmployeesTarget,
      falseDuplicate,
      taskInDuplicate
    }

    // STEP 3
    const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, kpiOfEmployeesTarget) 
    if (checkIsImproviseSolution) {
      updateHarmonyMemory(HM, improviseSolution)
    }
  }

  return HM[0]
}


function reScheduleTasksNotAsset(assignment, assets) {
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
          // console.log("vao day: ", task.startTime)
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

function getTimeForProject(assignment) {
  const listStartTime = assignment.map((item) => item.task.startTime)
  const listEndTime = assignment.map((item) => item.task.endTime)

  const startTime = new Date(Math.min(...listStartTime))
  const endTime = new Date(Math.max(...listEndTime))

  return {
    startTime, 
    endTime,
    totalTime: (endTime - startTime) / (1000 * 3600 * 24)
  }
}

function getEmployeesCost(assignment) {
  let totalCost = 0;
  for (let i = 0; i < assignment.length; i++) {
   
    const { assignee, task } = assignment[i]

    const { costPerHour } = assignee
    const { estimateTime } = task
    
    totalCost += costPerHour * DAY_WORK_HOURS * estimateTime
  }
  return totalCost
}

// const fs = require('fs');

// async function fillDataToExcel() {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Task KPIs');
//   const employeesheet = workbook.addWorksheet('Task KPIs of Employee');

//   const START_DATE = new Date()
//   START_DATE.setFullYear(2024, 4, 1)
//   START_DATE.setHours(0, 0, 0, 0)
//   job = {
//     startTime: START_DATE,
//     tasks: tasks
//   }
//   job.tasks = topologicalSort(tasks)
//   job.tasks = scheduleTasksWithAsset(job, assets)
//   // console.log("job.tasks: ", job.tasks)
//   // console.log("assets: ", assets.inUse[0].usageLogs)
//   job.tasks = getAvailableEmployeesForTasks(job.tasks, employees)

//   const PAR = 0.4, HMCR = 0.95, HM_SIZE = 40, bw = 1, MAX_TER = 4000
//   const kpiTarget = {
//     'A': { value: 0.8, weight: 0.35 },
//     'B': { value: 0.8, weight: 0.35 },
//     'C': { value: 0.8, weight: 0.3 },
//   }
//   const standardDeviationTarget = 0.1


//   for (let j = 0; j < 100; j++) {
//     // Add headers
//     worksheet.addRow(['Task ID', 'AssigneeId', 'MachineId', 'Start Time', 'End Time', ' ', 'Total Cost', 'Standard Ratio', 'Total KPI A', 'Total KPI B', 'TotalKPI C', '', 'AssigneeId', 'Total KPI A of Assignee with All Tasks', 'Toal KPI B of Assignee with All Tasks', 'Total KPI C of Assignee with All Tasks']);
//     // add vào đây 
//     let testResult = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFind
//     for (let i = 1; i < 8; i++) {
//       const result = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFind
//       // const bestFitnessSolutions = harmonySearch(HM_SIZE, MAX_TER, HMCR, PAR, bw, kpiTarget, standardDeviationTarget, job.tasks, employees, lastKPIs).bestFitnessSolutions
//       if (!compareSolution(testResult, result, kpiTarget, kpiOfEmployeesTarget)) {
//         testResult = result
//       }
//     }
//     reScheduleTasks(testResult.assignment, assets)
//     const kpiAssignment = testResult.kpiAssignment
//     const kpiOfEmployee = getKpiOfEmployees(testResult.assignment, employees, lastKPIs)
//     for (let i = 0; i < testResult.assignment.length; i++) {
//       const { task, assignee, assets } = testResult.assignment[i]
//       // console.log(task.id, assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.standardDeviation, kpiAssignment['A'], kpiAssignment['B'], kpiAssignment['C'],  ' ', assignee.id, kpiOfEmployee[assignee.id]['A'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployee[assignee.id]['C'])
//       worksheet.addRow([task.id, assignee.id, assets[0].id, task.startTime, task.endTime, ' ', testResult.totalCost, testResult.standardDeviation, kpiAssignment['A'], kpiAssignment['B'], kpiAssignment['C'],  ' ', assignee.id, kpiOfEmployee[assignee.id]['A'], kpiOfEmployee[assignee.id]['B'], kpiOfEmployee[assignee.id]['C']]);
//     }
    

//     employeesheet.addRow(['Employee ID', 'Total KPI A of Assignee with All Tasks', 'Toal KPI B of Assignee with All Tasks', 'Total KPI C of Assignee with All Tasks', '', 'Total KPI A', 'Total KPI B', 'TotalKPI C', 'Standard']);
//     for (let i = 0; i < employees.length; i++) {
//       employeesheet.addRow([employees[i].id, kpiOfEmployee[employees[i].id]['A'], kpiOfEmployee[employees[i].id]['B'], kpiOfEmployee[employees[i].id]['C'], '', kpiAssignment['A'], kpiAssignment['B'], kpiAssignment['C'], testResult.standardDeviation]);
//     }
//     // console.log("j = ", j + 1)
//   }
  

//   // Save workbook to a file
//   const filePath = 'task_kpis.xlsx';
//   await workbook.xlsx.writeFile(filePath);
//   console.log(`Excel file created at: ${filePath}`);
// }



// FOR DLHS

function initHM(HM, hmSize, tasks, employees, lastKPIs, kpiOfEmployeesTarget, assetHasKPIWeight) {
  for (let i = 0; i < hmSize; i++) {
    let randomSolution = initRandomHarmonyVector(tasks, employees, lastKPIs, kpiOfEmployeesTarget, assetHasKPIWeight)
    HM.push(randomSolution)
  }
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
  if (PSL?.length !== 0) {
    const randomIndex = Math.floor(Math.random() * PSL.length);
    const selected = PSL[randomIndex];
    PSL.splice(randomIndex, 1); // Xóa phần tử đã chọn khỏi mảng
    return selected;
  } else {
    const HMCR = randomInRange(0.9, 1)
    const PAR = randomInRange(0, 1)
    return {
      HMCR, PAR
    }
  }
}

function refillPSL(PSL, WPSL, lastPSL, PSLSize) {
  if(!WPSL?.length) {
    PSL = lastPSL
    return
  }
  for(let i = 0; i < PSLSize; i++) {
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

function determineBW(BW_max, BW_min, FEs, Max_FEs) {
  if (FEs < Max_FEs / 2) {
    return BW_max - (BW_max - BW_min) * 2 * FEs / Max_FEs
  } else {
    return BW_min
  }
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


function newHMFromSubs(subHMs, kpiTarget, kpiOfEmployeesTarget) {
  let newHM = []
  for (let i = 0; i < subHMs?.length; i++) {
    let bestLocal = findBestAndWorstHarmonySolution(subHMs[i], kpiTarget, kpiOfEmployeesTarget).best
    newHM.push(bestLocal)
    subHMs[i].sort((solutionA, solutionB) => compareSolution(solutionA, solutionB, kpiTarget, kpiOfEmployeesTarget) ? -1 : 1)
    const SizeToPush = 5
    for (let j = 1; j < SizeToPush + 1; j++) {
      newHM.push(subHMs[i][j])
    }
  }
  return newHM
}


function DLHS(DLHS_Arguments, tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget, assetHasKPIWeight) {
  const { HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs } = DLHS_Arguments
  let FEs = 0

  // Step 2: Initialize HM and PSL
  let PSL = []
  let HM = []
  let WPSL = []
  initHM(HM, HMS, tasks, employees, lastKPIs, kpiOfEmployeesTarget, assetHasKPIWeight)
  initPSL(PSL, PSLSize)
  let lastPSL = PSL
  let bestFitnessSolutions = []

  // Step 3: Main loop
  // Step 4: Randomly divide HM into m sub-HMs with the same size
  let subHMs = divideHM(HM, numOfSub)
  while (FEs < 0.9 * Max_FEs) {
    
    // Step 5: For each sub-HM
    for (let subHM of subHMs) {
      // console.log("FE: ", FEs)
      // Step 5.1: Select HMCR, PAR, and determine BW
      let { HMCR, PAR } = selectRandomFromPSL(PSL)
      let bw = determineBW(BW_max, BW_min, FEs, Max_FEs)
      // console.log("BW: ", bw)

      // Step 5.2: Improvise a new harmony vector
      const bestSolution = findBestAndWorstHarmonySolution(subHM, kpiTarget, kpiOfEmployeesTarget).best
      const worstSolution = findBestAndWorstHarmonySolution(subHM, kpiTarget, kpiOfEmployeesTarget).worst
      let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, kpiOfEmployeesTarget) 
      // if (isFitnessSolution) {
      //   // console.log("vao day: ", isFitnessSolution)
      //   if (!isHaveSameSolution(bestFitnessSolutions, bestSolution, 0)) {
      //     bestFitnessSolutions.push(bestSolution)
      //   }
      // } 

      let improviseAssignment = []
      let empAssigned = []
      let falseAssigneeScore = 0, falseDuplicate = 0
      let taskInDuplicate = []
      // let falseAssetScore = 0
      const bestSolutionAssignment = bestSolution.assignment
      tasks.forEach((task) => {
        const { availableAssignee, assets } = task
        const { startTime, endTime } = task 

        let randomAssignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
        let availableCheckDuplicate = availableAssignee.filter((employee) => !checkDuplicate(improviseAssignment, employee, startTime, endTime))
        if (availableCheckDuplicate?.length) {
          randomAssignee = availableCheckDuplicate[Math.floor(Math.random() * availableCheckDuplicate.length)]
        } 
        if (Math.random() < HMCR) {
          randomAssignee = bestSolutionAssignment.find((item) => item.task.id === task.id).assignee

          if (Math.random() < PAR || !isFitnessSolution) {
            if (availableCheckDuplicate?.length) {
              let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
              randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableCheckDuplicate.length
              randomAssignee = availableCheckDuplicate[randomAssigneeIndex]
            } else {
              let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
              randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableAssignee.length
              randomAssignee = availableAssignee[randomAssigneeIndex]
            }

          }
        }
        if (checkDuplicate(improviseAssignment, randomAssignee, startTime, endTime)) {
          falseDuplicate++
          taskInDuplicate.push(task.id)
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
      })

      // total False
      falseAssigneeScore = employees.length - empAssigned.length
      // total False assets: TODO

      // get total KPI
      const kpiAssignment = getTotalKpi(improviseAssignment, lastKPIs, assetHasKPIWeight)

      // get total Cost
      const totalCost = getTotalCost(improviseAssignment)

      // getKPI of Employees 
      const kpiOfEmployees = getKpiOfEmployees(improviseAssignment, employees, lastKPIs, assetHasKPIWeight)

      //  get distance
      const distanceWithKPIEmployeesTarget = getDistanceOfKPIEmployeesTarget(kpiOfEmployees, kpiOfEmployeesTarget)

      const improviseSolution = {
        assignment: improviseAssignment,
        falseAssigneeScore,
        totalCost,
        kpiAssignment,
        kpiOfEmployees,
        distanceWithKPIEmployeesTarget,
        falseDuplicate,
        taskInDuplicate
      }

      FEs++;

      // Step 5.3: Update sub-HM and record HMCR and PAR into WPSL if X_new is better than X_w
      // console.log("worstSolution: ", worstSolution.kpiAssignment)
      const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, kpiOfEmployeesTarget) 
      if (checkIsImproviseSolution) {
        updateHarmonyMemory(subHM, improviseSolution)
        
        // record to WPLS
        WPSL.push({
          HMCR, PAR
        })
      }


      // Step 5.4: Refill PSL if empty
      if (PSL?.length === 0) {
        refillPSL(PSL, WPSL, lastPSL, PSLSize);
        // console.log("PSL: ", PSL)
      }
    
      // Step 6: Check termination conditions
      if (FEs !== 0 && FEs % R === 0) {
        // console.log("vao day")
        // console.log("subHMs L: ", subHMs[0].length)
        subHMs = regroupSubHMs(subHMs, numOfSub);
        // console.log("subHMs L: ", subHMs[0].length)
      }
    }

  }

  // Step 7: 
  let newHM = newHMFromSubs(subHMs, kpiTarget, kpiOfEmployeesTarget)
  while (FEs < Max_FEs) {
    let { HMCR, PAR } = selectRandomFromPSL(PSL)
    let bw = determineBW(BW_max, BW_min, FEs, Max_FEs)

    const bestSolution = findBestAndWorstHarmonySolution(newHM, kpiTarget, kpiOfEmployeesTarget).best
    const worstSolution = findBestAndWorstHarmonySolution(newHM, kpiTarget, kpiOfEmployeesTarget).worst
    let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, kpiOfEmployeesTarget) 
    // if (isFitnessSolution) {
    //   if (!isHaveSameSolution(bestFitnessSolutions, bestSolution, 0)) {
    //     bestFitnessSolutions.push(bestSolution)
    //   }
    // } 

    let improviseAssignment = []
    let empAssigned = []
    let falseAssigneeScore = 0
    let falseAssetScore = 0, falseDuplicate = 0
    let taskInDuplicate = []
    const bestSolutionAssignment = bestSolution.assignment
    tasks.forEach((task) => {
      let randomAssignee = {}
      const { availableAssignee, assets } = task
      const { startTime, endTime } = task 

      let availableCheckDuplicate = availableAssignee.filter((employee) => !checkDuplicate(improviseAssignment, employee, startTime, endTime))
      if (availableCheckDuplicate?.length) {
        randomAssignee = availableCheckDuplicate[Math.floor(Math.random() * availableCheckDuplicate.length)]
      } else {
        randomAssignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
      }

      if (Math.random() < HMCR) {
        randomAssignee = bestSolutionAssignment.find((item) => item.task.id === task.id).assignee

        if (Math.random() < PAR || !isFitnessSolution) {
          if (availableCheckDuplicate?.length) {
            let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
            randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableCheckDuplicate.length
            randomAssignee = availableCheckDuplicate[randomAssigneeIndex]
          } else {
            let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
            randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableAssignee.length
            randomAssignee = availableAssignee[randomAssigneeIndex]
          }
        }
      }
      if (checkDuplicate(improviseAssignment, randomAssignee, startTime, endTime)) {
        falseDuplicate++
        taskInDuplicate.push(task.id)
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
    })

    // total False
    falseAssigneeScore = employees.length - empAssigned.length
    // total False assets: TODO

    // get total KPI
    const kpiAssignment = getTotalKpi(improviseAssignment, lastKPIs, assetHasKPIWeight)

    // get total Cost
    const totalCost = getTotalCost(improviseAssignment)

    // getKPI of Employees 
      const kpiOfEmployees = getKpiOfEmployees(improviseAssignment, employees, lastKPIs, assetHasKPIWeight)

    //  get distance
    const distanceWithKPIEmployeesTarget = getDistanceOfKPIEmployeesTarget(kpiOfEmployees, kpiOfEmployeesTarget)

    const improviseSolution = {
      assignment: improviseAssignment,
      // falseAssetScore, TODO
      falseAssigneeScore,
      totalCost,
      kpiAssignment,
      kpiOfEmployees,
      distanceWithKPIEmployeesTarget,
      falseDuplicate,
      taskInDuplicate
    }

    // console.log("improveSolution: ", improviseSolution.kpiAssignment)
    // console.log("worst: ", worstSolution.kpiAssignment)

    const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, kpiOfEmployeesTarget) 
    if (checkIsImproviseSolution) {
      updateHarmonyMemory(newHM, improviseSolution)
    }
    FEs++;
    // Step 5.4: Refill PSL if empty
    if (PSL.length === 0) {
      refillPSL(PSL, WPSL, lastPSL, PSLSize);
    }
  }
  return newHM[0]
}

function DLHS_2(DLHS_Arguments, tasks, employees, lastKPIs, kpiTarget, kpiOfEmployeesTarget, assetHasKPIWeight) {
  const { HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs } = DLHS_Arguments
  let FEs = 0

  // Step 2: Initialize HM and PSL
  let PSL = []
  let HM = []
  let WPSL = []
  initHM(HM, HMS, tasks, employees, lastKPIs, kpiOfEmployeesTarget, assetHasKPIWeight)
  initPSL(PSL, PSLSize)
  let lastPSL = PSL
  let bestFitnessSolutions = []
  console.log("HM: ", HM.map((item) => item.distanceWithKPIEmployeesTarget))


  for (let i = FEs; i < Max_FEs * 0.4; i++) {
    let HMCR = 0.95, PAR = 0.3, bw = 1
    // let bw = determineBW(BW_max, BW_min, FEs, Max_FEs)
    // console.log("BW: ", bw)

    // Step 5.2: Improvise a new harmony vector
    const bestSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, kpiOfEmployeesTarget).best
    const worstSolution = findBestAndWorstHarmonySolution(HM, kpiTarget, kpiOfEmployeesTarget).worst
    let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, kpiOfEmployeesTarget) 
    // if (isFitnessSolution) {
    //   // console.log("vao day: ", isFitnessSolution)
    //   if (!isHaveSameSolution(bestFitnessSolutions, bestSolution, 0)) {
    //     bestFitnessSolutions.push(bestSolution)
    //   }
    // } 

    let improviseAssignment = []
    let empAssigned = []
    let falseAssigneeScore = 0, falseDuplicate = 0
    let taskInDuplicate = []
    // let falseAssetScore = 0
    const bestSolutionAssignment = bestSolution.assignment
    tasks.forEach((task) => {
      const { availableAssignee, assets } = task
      const { startTime, endTime } = task 

      let randomAssignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
      let availableCheckDuplicate = availableAssignee.filter((employee) => !checkDuplicate(improviseAssignment, employee, startTime, endTime))
      if (availableCheckDuplicate?.length) {
        randomAssignee = availableCheckDuplicate[Math.floor(Math.random() * availableCheckDuplicate.length)]
      } 
      if (Math.random() < HMCR) {
        let randomSolution = HM[Math.floor(Math.random() * HM.length)]
        let randomAssignment = randomSolution.assignment
        randomAssignee = randomAssignment.find((item) => item.task.id === task.id).assignee

        if (Math.random() < PAR || !isFitnessSolution) {
          if (availableCheckDuplicate?.length) {
            let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
            randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableCheckDuplicate.length
            randomAssignee = availableCheckDuplicate[randomAssigneeIndex]
          } else {
            let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
            randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableAssignee.length
            randomAssignee = availableAssignee[randomAssigneeIndex]
          }

        }
      }
      if (checkDuplicate(improviseAssignment, randomAssignee, startTime, endTime)) {
        falseDuplicate++
        taskInDuplicate.push(task.id)
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
    })

    // total False
    falseAssigneeScore = employees.length - empAssigned.length
    // total False assets: TODO

    // get total KPI
    const kpiAssignment = getTotalKpi(improviseAssignment, lastKPIs, assetHasKPIWeight)

    // get total Cost
    const totalCost = getTotalCost(improviseAssignment)

    // getKPI of Employees 
    const kpiOfEmployees = getKpiOfEmployees(improviseAssignment, employees, lastKPIs, assetHasKPIWeight)

    //  get distance
    const distanceWithKPIEmployeesTarget = getDistanceOfKPIEmployeesTarget(kpiOfEmployees, kpiOfEmployeesTarget)

    const improviseSolution = {
      assignment: improviseAssignment,
      falseAssigneeScore,
      totalCost,
      kpiAssignment,
      kpiOfEmployees,
      distanceWithKPIEmployeesTarget,
      falseDuplicate,
      taskInDuplicate
    }

    FEs++;

    // Step 5.3: Update sub-HM and record HMCR and PAR into WPSL if X_new is better than X_w
    // console.log("worstSolution: ", worstSolution.kpiAssignment)
    const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, kpiOfEmployeesTarget) 
    if (checkIsImproviseSolution) {
      updateHarmonyMemory(HM, improviseSolution)
      // record to WPLS
      // WPSL.push({
      //   HMCR, PAR
      // })
    }


    // Step 5.4: Refill PSL if empty
    // if (PSL?.length === 0) {
    //   refillPSL(PSL, WPSL, lastPSL, PSLSize);
    //   // console.log("PSL: ", PSL)
    // }
  }

  console.log("HM: update", HM.map((item) => item.distanceWithKPIEmployeesTarget))

  // Step 3: Main loop
  // Step 4: Randomly divide HM into m sub-HMs with the same size
  let subHMs = divideHM(HM, numOfSub)
  // console.log("subHM: ", subHMs.map((item) => item.map((itemCon) => itemCon.distanceWithKPIEmployeesTarget).join(", ")))

  for (let i = FEs; i < 0.9 * Max_FEs; i++) {
    
    // Step 5: For each sub-HM
    for (let subHM of subHMs) {
      // console.log("FE: ", FEs)
      // Step 5.1: Select HMCR, PAR, and determine BW
      let { HMCR, PAR } = selectRandomFromPSL(PSL)
      let bw = determineBW(BW_max, BW_min, FEs, Max_FEs)
      // console.log("BW: ", bw)

      // Step 5.2: Improvise a new harmony vector
      const bestSolution = findBestAndWorstHarmonySolution(subHM, kpiTarget, kpiOfEmployeesTarget).best
      const worstSolution = findBestAndWorstHarmonySolution(subHM, kpiTarget, kpiOfEmployeesTarget).worst
      let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, kpiOfEmployeesTarget) 
      // if (isFitnessSolution) {
      //   // console.log("vao day: ", isFitnessSolution)
      //   if (!isHaveSameSolution(bestFitnessSolutions, bestSolution, 0)) {
      //     bestFitnessSolutions.push(bestSolution)
      //   }
      // } 

      let improviseAssignment = []
      let empAssigned = []
      let falseAssigneeScore = 0, falseDuplicate = 0
      let taskInDuplicate = []
      // let falseAssetScore = 0
      const bestSolutionAssignment = bestSolution.assignment
      tasks.forEach((task) => {
        const { availableAssignee, assets } = task
        const { startTime, endTime } = task 

        let randomAssignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
        let availableCheckDuplicate = availableAssignee.filter((employee) => !checkDuplicate(improviseAssignment, employee, startTime, endTime))
        if (availableCheckDuplicate?.length) {
          randomAssignee = availableCheckDuplicate[Math.floor(Math.random() * availableCheckDuplicate.length)]
        } 
        if (Math.random() < HMCR) {
          randomAssignee = bestSolutionAssignment.find((item) => item.task.id === task.id).assignee

          if (Math.random() < PAR || !isFitnessSolution) {
            if (availableCheckDuplicate?.length) {
              let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
              randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableCheckDuplicate.length
              randomAssignee = availableCheckDuplicate[randomAssigneeIndex]
            } else {
              let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
              randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableAssignee.length
              randomAssignee = availableAssignee[randomAssigneeIndex]
            }

          }
        }
        if (checkDuplicate(improviseAssignment, randomAssignee, startTime, endTime)) {
          falseDuplicate++
          taskInDuplicate.push(task.id)
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
      })

      // total False
      falseAssigneeScore = employees.length - empAssigned.length
      // total False assets: TODO

      // get total KPI
      const kpiAssignment = getTotalKpi(improviseAssignment, lastKPIs, assetHasKPIWeight)

      // get total Cost
      const totalCost = getTotalCost(improviseAssignment)

      // getKPI of Employees 
      const kpiOfEmployees = getKpiOfEmployees(improviseAssignment, employees, lastKPIs, assetHasKPIWeight)

      //  get distance
      const distanceWithKPIEmployeesTarget = getDistanceOfKPIEmployeesTarget(kpiOfEmployees, kpiOfEmployeesTarget)

      const improviseSolution = {
        assignment: improviseAssignment,
        falseAssigneeScore,
        totalCost,
        kpiAssignment,
        kpiOfEmployees,
        distanceWithKPIEmployeesTarget,
        falseDuplicate,
        taskInDuplicate
      }

      FEs++;

      // Step 5.3: Update sub-HM and record HMCR and PAR into WPSL if X_new is better than X_w
      // console.log("worstSolution: ", worstSolution.kpiAssignment)
      const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, kpiOfEmployeesTarget) 
      if (checkIsImproviseSolution) {
        updateHarmonyMemory(subHM, improviseSolution)
        
        // record to WPLS
        WPSL.push({
          HMCR, PAR
        })
      }


      // Step 5.4: Refill PSL if empty
      if (PSL?.length === 0) {
        refillPSL(PSL, WPSL, lastPSL, PSLSize);
        // console.log("PSL: ", PSL)
      }
    
      // Step 6: Check termination conditions
      if (FEs !== 0 && FEs % R === 0) {
        // console.log("vao day")
        // console.log("subHMs L: ", subHMs.length)
        subHMs = regroupSubHMs(subHMs, numOfSub);
        // console.log("subHMs L: ", subHMs.length)
      }
    }

  }

  // Step 7: 
  let newHM = newHMFromSubs(subHMs, kpiTarget, kpiOfEmployeesTarget)
  for (let i = FEs; i < Max_FEs; i++) {
    let { HMCR, PAR } = selectRandomFromPSL(PSL)
    let bw = determineBW(BW_max, BW_min, FEs, Max_FEs)

    const bestSolution = findBestAndWorstHarmonySolution(newHM, kpiTarget, kpiOfEmployeesTarget).best
    const worstSolution = findBestAndWorstHarmonySolution(newHM, kpiTarget, kpiOfEmployeesTarget).worst
    let isFitnessSolution = checkIsFitnessSolution(bestSolution, kpiTarget, kpiOfEmployeesTarget) 
    // if (isFitnessSolution) {
    //   if (!isHaveSameSolution(bestFitnessSolutions, bestSolution, 0)) {
    //     bestFitnessSolutions.push(bestSolution)
    //   }
    // } 

    let improviseAssignment = []
    let empAssigned = []
    let falseAssigneeScore = 0
    let falseAssetScore = 0, falseDuplicate = 0
    let taskInDuplicate = []
    const bestSolutionAssignment = bestSolution.assignment
    tasks.forEach((task) => {
      let randomAssignee = {}
      const { availableAssignee, assets } = task
      const { startTime, endTime } = task 

      let availableCheckDuplicate = availableAssignee.filter((employee) => !checkDuplicate(improviseAssignment, employee, startTime, endTime))
      if (availableCheckDuplicate?.length) {
        randomAssignee = availableCheckDuplicate[Math.floor(Math.random() * availableCheckDuplicate.length)]
      } else {
        randomAssignee = availableAssignee[Math.floor(Math.random() * availableAssignee.length)]
      }

      if (Math.random() < HMCR) {
        randomAssignee = bestSolutionAssignment.find((item) => item.task.id === task.id).assignee

        if (Math.random() < PAR || !isFitnessSolution) {
          if (availableCheckDuplicate?.length) {
            let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
            randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableCheckDuplicate.length
            randomAssignee = availableCheckDuplicate[randomAssigneeIndex]
          } else {
            let randomAssigneeIndex = availableAssignee.findIndex((item) => item.id === randomAssignee.id)
            randomAssigneeIndex = Math.floor(Math.random() * bw + randomAssigneeIndex) % availableAssignee.length
            randomAssignee = availableAssignee[randomAssigneeIndex]
          }
        }
      }
      if (checkDuplicate(improviseAssignment, randomAssignee, startTime, endTime)) {
        falseDuplicate++
        taskInDuplicate.push(task.id)
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
    })

    // total False
    falseAssigneeScore = employees.length - empAssigned.length
    // total False assets: TODO

    // get total KPI
    const kpiAssignment = getTotalKpi(improviseAssignment, lastKPIs, assetHasKPIWeight)

    // get total Cost
    const totalCost = getTotalCost(improviseAssignment)

    // getKPI of Employees 
      const kpiOfEmployees = getKpiOfEmployees(improviseAssignment, employees, lastKPIs, assetHasKPIWeight)

    //  get distance
    const distanceWithKPIEmployeesTarget = getDistanceOfKPIEmployeesTarget(kpiOfEmployees, kpiOfEmployeesTarget)

    const improviseSolution = {
      assignment: improviseAssignment,
      // falseAssetScore, TODO
      falseAssigneeScore,
      totalCost,
      kpiAssignment,
      kpiOfEmployees,
      distanceWithKPIEmployeesTarget,
      falseDuplicate,
      taskInDuplicate
    }

    // console.log("improveSolution: ", improviseSolution.kpiAssignment)
    // console.log("worst: ", worstSolution.kpiAssignment)

    const checkIsImproviseSolution = compareSolution(improviseSolution, worstSolution, kpiTarget, kpiOfEmployeesTarget) 
    if (checkIsImproviseSolution) {
      updateHarmonyMemory(newHM, improviseSolution)
    }
    FEs++;
    // Step 5.4: Refill PSL if empty
    if (PSL.length === 0) {
      refillPSL(PSL, WPSL, lastPSL, PSLSize);
    }
  }
  return newHM[0]
}

module.exports = {
  findEmployeesWithQualities,
  getAvailableEmployeesForTasks,
  getTotalKpi,
  getTotalCost,
  initRandomHarmonyVector,
  compareSolution,
  findBestAndWorstHarmonySolution,
  checkIsFitnessSolution,
  updateHarmonyMemory,
  isHaveSameSolution,
  scheduleTasksWithAsset,
  reScheduleTasks,
  // splitKPIOfTaskToEmployees,
  // splitKPIToEmployees,
  getKpiOfEmployees,
  harmonySearch_Base,
  // fillDataToExcel,
  DLHS,
  getDistanceOfKPIEmployeesTarget,
  getDistanceOfKPIEmployeesTarget_2,
  getTimeForProject,
  getEmployeesCost,
  reScheduleTasksNotAsset,
  getAvailableEmployeesWithCheckConflict,
  scheduleTasksWithAssetAndEmpTasks,
  // getLastKPIInTasks
  getLastKPIAndAvailableEmpsInTasks
}