const { assets } = require("./data/asset");
const ExcelJS = require('exceljs');

function topologicalSort(tasks) {
  const result = [];
  const visited = new Set();
  const inProgress = new Set();
  
  function visit(task) {
    if (inProgress.has(task)) {
      throw new Error('Tasks have cyclic dependencies.');
    }
    
    if (!visited.has(task)) {
      inProgress.add(task);
      
      const dependencies = task.preceedingTasks || [];
      dependencies.forEach(depId => {
        const dependency = tasks.find(t => t.id === depId);
        if (!dependency) {
          throw new Error(`Dependency with id ${depId} not found.`);
        }
        visit(dependency);
      });
      
      inProgress.delete(task);
      visited.add(task);
      result.unshift(task);
    }
  }
  
  for (const task of tasks) {
    visit(task);
  }
  
  return result.reverse();
}

function reCalculateStartTime(startTime) {
  if (startTime.getHours() == 17){
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(8)
  }
  return startTime;
}

function reCalculateTimeWorking(time, isStartIndex = false) {
  // Đưa về giờ làm chuẩn
  if (time.getHours() >= 17) { // giờ >=17 chuyển sang ngày hôm sau
      time.setDate(time.getDate() + 1);
      time.setHours(8 + time.getHours() - 17)
  } else if (time.getHours() >= 12) {
      time.setHours(time.getHours())
  } else if (time.getHours() < 8) {
    // Nếu < 8h mà là bắt đầu của luồng công việc
      if (isStartIndex) {
          time.setHours(8)
      } else {
      // Chưa hiểu chỗ này
      time.setHours(16 + time.getHours())
      }
  };

  while (time.getDay() % 6 == 0 || time.getDay() % 5 == 0) { // Không làm chủ nhật
      time.setDate(time.getDate() + 1);
  }

  return time;
}

function reCalculateStartTime(startTime) {
  if (startTime.getHours() == 17){
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(8)
  }

  return startTime;
}

function initBestAssignment(job) {
  let nextEndTime = job.startTime;
  job.tasks.forEach(function(task) {
    const numDay = Math.floor(task.hours / 8);
    const remainHour = task.hours % 8;
    task.startTime = reCalculateStartTime(nextEndTime);
    task.endTime = new Date(86400000000000);
    nextEndTime = task.endTime;
  });

  return job.tasks;
}

// lấy thời gian có thể dùng được asset cho task này
function getAvailableTimeForAsset(task, asset) {
  if (task.requireAsset.length == 0) {
    return {
      availableTime: new Date(0),
      taskAssets: []
    }
  }
  let taskAssets = []

  let availableTimeList = [];
  task.requireAsset.forEach(require => {
    // console.log("require.type: ", require.type, require.number)
    let readyToUse = asset.readyToUse.filter((item) => item.type === (require.type));
    // console.log("readyToUse: ", readyToUse)
    // Nếu có tài nguyên yêu cầu và đủ số lượng => trả về timeavailable = 0 
    if (readyToUse.length >= require.number) {
      availableTimeList.push(new Date(0));
      let readyToUseTemp = readyToUse.slice(0, require.number)

      if (readyToUseTemp?.length) {
        for (let j = 0; j < readyToUseTemp?.length; j++) {
          taskAssets.push(readyToUseTemp[j])
        }
      }
    }
    else {
      // Nếu không đủ số lượng
      let remain = require.number - readyToUse.length;
      // console.log("inUse: ", asset.inUse, require.type)
      let inUse = asset.inUse.filter((item) => item.type === (require.type));
      // console.log("inUse: ", inUse)
      if (inUse?.length && remain <= inUse?.length) {
        // Lấy cả bọn tài nguyên đang được sử dụng ra 
        let logs = inUse.map(_ => _.usageLogs.sort((a, b) => b.endDate - a.endDate)[0].endDate).sort((a, b) => a - b);
        let sortedAssets = inUse.map(asset => {
          const latestLog = asset.usageLogs.sort((a, b) => b.endDate - a.endDate)[0].endDate;
          return { asset, latestLog };
        }).sort((a, b) => a.latestLog - b.latestLog);
        let sortedAssetsTemp = sortedAssets.slice(0, remain).map((item) => item.asset)

        if (sortedAssetsTemp?.length) {
        for (let j = 0; j < sortedAssetsTemp?.length; j++) {
          taskAssets.push(sortedAssetsTemp[j])
        }
      }

        // trả về mảng logs mới nhất của các tài nguyên đang sử dụng, trong đó chứa endDate gần nhất (tức là endDate sẽ được dùng available) của từng thằng tài nguyên đang sử dụng)), logs theo thứ tự tăng dần của endaDate của từng thằng tài nguyên đang dùng
        // Nến ví dụ cần 2 thằng thì thời điểm sớm nhất để 2 thằng đó được sử dụng là logs của thằng thứ 2 (remain - 1)
        availableTimeList.push(new Date(logs[remain - 1]))
      } else {
        // Check từ đầu luôn khi tạo task cũng được
        throw Error("Không đủ tài nguyên")
      }
    }
  });
  // console.log("test: ", availableTimeList, taskAssets)
  return {
    availableTime: new Date(Math.max(...availableTimeList)),
    taskAssets
  }
    // trả về thời gian mà tài nguyên có thể available cho task đó (thời gian sớm nhất nhưng phải lấy max)
}

function calculateLatestStartTime(jobStartTime, index, currentAssignment, task, asset) {
  let taskInThread = currentAssignment.filter(_ => _.threadIndex == index); // Tìm task với threadIndex = index
  let prevTaskEndTime = currentAssignment.filter(_ => task.preceedingTasks.includes(_.id)).map(_ => new Date(_.endTime)); // Lấy những thằng endtime của currentAssignment thỏa mãn là task tiên quyết của task hiện tại đang xét 
  let testResult = getAvailableTimeForAsset(task, asset); // lấy available time cho asset để thực hiện task hiện tại
  let {availableTime, taskAssets} = testResult
  prevTaskEndTime.push(availableTime)
  // console.log("availableTime: ", availableTime)

  if (taskInThread.length == 0) {
    prevTaskEndTime.push(jobStartTime)

    return {
      lastestStartTime: new Date(Math.max(...prevTaskEndTime)),
      taskAssets: taskAssets
    }
  }

  // console.log("taskInThread: ", taskInThread)
  let listEndTimeInThread = taskInThread.map(_ => new Date(_.endTime));
  // console.log("listEndTimeInThread: ", listEndTimeInThread)
  // console.log("task: ", task)
  // console.log("...listEndTimeInThread.concat(prevTaskEndTime): ", ...listEndTimeInThread.concat(prevTaskEndTime), "task", task.id)

  return {
    lastestStartTime: new Date(Math.max(...listEndTimeInThread.concat(prevTaskEndTime))),
    taskAssets
  }
}

// Tính thời gian hoàn thành muộn nhất các tasks trong job
function calculateLatestCompletionTime(job) {
  let latestCompletionTime = job.startTime;

  for (let i = 0; i < job.tasks.length; i++) {
    const task = job.tasks[i];
    const taskEndTime = new Date(task.endTime);
    if (taskEndTime > latestCompletionTime) {
      latestCompletionTime = taskEndTime;
    }
  }

  return latestCompletionTime;
}

// Check xem ở luồng công việc index đối với việc giao hiện tại đã có task chưa => chưa thì là luồng đó chưa có task nào => tức là bắt đầu luồng công việc index nếu gán
function isStartIndex(currentAssignment, index) {
  let taskInThread = currentAssignment.filter(_ => _.threadIndex == index);

  if (taskInThread.length == 0){
      return true
  }
  return false;
}


const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Test Algorithm');
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
    // console.log("useages logs: ", taskAsset.usageLogs, taskAsset.name)
    if (currentStatus === 'ready_to_use') {
      taskAsset.status = 'in_use'
      updateReadyToUse = updateReadyToUse.filter((item) => item.id !== taskAsset.id)
      // console.log("task ")
      updateInUse.push(taskAsset)
    } else {
      updateInUse = updateInUse.filter((item) => item.id !== taskAsset.id)
      updateInUse.push(taskAsset)
    }


  }
  
  return {
    inUse: updateInUse,
    readyToUse: updateReadyToUse
  }
}

// worksheet.addRow(['Task ID', 'Index Of NumThreads', 'CurrrentDepth', 'currentEndTime', 'Cal Lastest']);
function branchAndBound(numThreads, job, currentDepth, currentEndTime, currentAssignment, bestAssignment, asset) {

  if (currentDepth === job.tasks.length) {
    if (currentEndTime < calculateLatestCompletionTime(job)) {
      bestAssignment.splice(0, bestAssignment.length, ...currentAssignment);
    }

    // worksheet.addRow(['CurrrentDepth End', 'currentEndTime End', 'Cal Lastest End']);
    // worksheet.addRow([currentDepth, currentEndTime, calculateLatestCompletionTime(job)]);

    return;
  }

  const task = job.tasks[currentDepth];

  for (let index = 0; index < numThreads; index++) {
    // worksheet.addRow([task.id, index, currentDepth, currentEndTime, calculateLatestCompletionTime(job)]);

    const numDay = Math.floor(task.estimateTime);

    const remainHour = (task.estimateTime - numDay) * 8;

    // Tính lại startTime cho task đó, đảm bảo thời gian tài nguyên sẵn sàng
    let { lastestStartTime, taskAssets } = calculateLatestStartTime(job.startTime, index, currentAssignment, task, asset)
    // console.log("lastestStartTime: ", lastestStartTime)
    const startTime = reCalculateTimeWorking(lastestStartTime, isStartIndex(currentAssignment, index));
    // console.log("startTime: ", startTime)

    // Endtime: starttime + duration
    const endTime = reCalculateTimeWorking(new Date(startTime.getTime() + numDay * 86400000 + remainHour * 3600000));
    // console.log("endtime: ", endTime)
    const threadIndex = index;
    const newAssignment = [...currentAssignment];
    newAssignment[currentDepth] = { ...task, startTime, endTime, threadIndex };

    if (calculateLatestCompletionTime({ startTime: job.startTime, tasks: newAssignment }) > calculateLatestCompletionTime(job)) {
      continue;
    }
    // console.log("startTime, endTime: ", startTime, endTime)
    updateAssets = markAssetsAsUsed(asset, taskAssets, startTime, endTime)
    branchAndBound(numThreads, job, currentDepth + 1, endTime, newAssignment, bestAssignment, updateAssets);
  }
  // const filePath = 'test_log_t.xlsx';
  // await workbook.xlsx.writeFile(filePath);
}

const fs = require('fs');
const { start } = require("repl");

function findOptimalAssignment(job, numThreads, asset) {

  const bestAssignment = initBestAssignment(job);
  branchAndBound(numThreads, job, 0, job.startTime, [], bestAssignment, asset);
  bestAssignment.sort((a, b) => a.index - b.index);

  return bestAssignment;
}

function groupBy(array, property) {
  return array.reduce((result, obj) => {
    const key = obj[property];

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(obj);
    return result;
  }, {});
}


function calculateRandomAssigneCost(job) {
  let totalCost = 0;
  for (let i = 0; i < Object.keys(job).length; i++) {
      const tasks = job[i];
      const startTime = new Date(Math.min(...tasks.map(_ => new Date(_.startTime))));
      const endTime = new Date(Math.max(...tasks.map(_ => new Date(_.endTime))));
      let salary = 0;
      if (tasks[0].assignee == null){
        salary = Math.max(...employees.map(_ => _.costPerHour))
      } else {
        salary = tasks[0].assignee.costPerHour
      };
      const taskCost = (endTime - startTime) / (1000 * 60 * 60 * 24) * salary * 8;
      totalCost = totalCost + taskCost;
  }

  return totalCost;
}

function duplicateSchedule(employee, startTime, endTime){
  let currentTask = allTask.filter(_ => _.responsibleEmployees.toString().split(',').includes(employee._id.toString()));
  let duplicateTask = [];

  for (let i = 0; i < currentTask.length; i++){
    if (((startTime <= currentTask[i].startDate) && (endTime <= currentTask[i].startDate)) ||
      ((startTime >= currentTask[i].endDate) && (endTime >= currentTask[i].endDate))) {
      continue;
    }
    duplicateTask.push(currentTask[i]);
  }

  return duplicateTask;
}

function assignTasks(jobIndex, assignments, bestAssignment, currentCost, minCost, checkDuplicateFlag) {
  if (jobIndex === Object.keys(jobs).length) {
    if (currentCost < calculateRandomAssigneCost(bestAssignment)) {
      if ((JSON.stringify(assignments) != undefined) && (Object.keys(assignments).length == Object.keys(jobs).length)) {
        Object.keys(bestAssignment).forEach(key => bestAssignment[key] = JSON.parse(JSON.stringify(assignments[key])));
        Object.keys(assignments).forEach(key => delete assignments[key]);
      }
      return;
    }
    return;
  }

  const jobKey = Object.keys(jobs)[jobIndex];
  const tasks = JSON.parse(JSON.stringify(jobs[jobKey]));

  for (let i = 0; i < employees.length; i++) {
    const startTime = new Date(Math.min(...tasks.map(_ => new Date( _.startTime))));
    const endTime = new Date(Math.max(...tasks.map(_ => new Date(_.endTime))));
    let noneDuplicate = !checkDuplicateFlag || (duplicateSchedule(employees[i], startTime, endTime).length === 0);
    if ((!Object.values(assignments).flat().some(assignment => assignment.assignee === employees[i])) && noneDuplicate) {
      const taskCost = (endTime - startTime) / (1000 * 30 * 60 * 60 * 24) * employees[i].salary;

      if((currentCost + taskCost) > calculateRandomAssigneCost(bestAssignment)){
        Object.keys(assignments).forEach(key => delete assignments[key]);
        continue;
      }
      tasks.forEach(task =>
        task.assignee = employees[i]
      )
      let obj = {}
      obj[jobKey] = tasks
      assignments = Object.assign(assignments, obj);

      minCost = currentCost + taskCost
      assignTasks(jobIndex + 1, assignments, bestAssignment, currentCost + taskCost, minCost, checkDuplicateFlag);

    }
  }
}

function branchAndBoundEmployee(jobs, employees, checkDuplicateFlag) {
  var bestAssignment = Object.assign({}, JSON.parse(JSON.stringify(jobs)));
  const minCost = Number.MAX_SAFE_INTEGER;
  var assignments = Object.assign({});
  assignTasks(0, assignments, bestAssignment, 0, minCost, checkDuplicateFlag);

  return bestAssignment;
}

function scheduleTasks(job) {
  // console.log("job.startTime: ", job.startTime)
  // Sắp xếp các nhiệm vụ theo thứ tự topological
  const sortedTasks = topologicalSort(job.tasks);

  // Gán startTime và endTime cho từng nhiệm vụ
  let currentTime = job.startTime;
  for (const task of sortedTasks) {
    // Kiểm tra xem tất cả các nhiệm vụ tiên quyết đã hoàn thành chưa
    const preceedingTasks = task.preceedingTasks.map(id => job.tasks.find(t => t.id === id));
    if (preceedingTasks?.length > 0 ) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
      const timeAvailableForAsset = getAvailableTimeForAsset(task, assets)
      task.startTime = new Date(Math.max(timeAvailableForAsset, maxEndTimeOfPreceedingTasks));
      // task.startTime = new Date(maxEndTimeOfPreceedingTasks);
    } else {
      task.startTime = job.startTime;
    }
    task.endTime = new Date(task.startTime.getTime() + task.estimateTime * 3600 * 1000 * 24);
    currentTime = task.endTime;
  }

  return sortedTasks;
}

function scheduleTasksWithAsset(job, assets) {
  // console.log("job.startTime: ", job.startTime)
  // Sắp xếp các nhiệm vụ theo thứ tự topological
  const sortedTasks = topologicalSort(job.tasks);
  
  

  // Gán startTime và endTime cho từng nhiệm vụ
  let currentTime = job.startTime;
  for (const task of sortedTasks) {
    // Kiểm tra xem tất cả các nhiệm vụ tiên quyết đã hoàn thành chưa
    const preceedingTasks = task.preceedingTasks.map(id => job.tasks.find(t => t.id === id));
    if (preceedingTasks?.length > 0 ) {
      const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
      const timeAvailableForAsset = getAvailableTimeForAsset(task, assets)
      task.startTime = new Date(Math.max(timeAvailableForAsset, maxEndTimeOfPreceedingTasks));
      // task.startTime = new Date(maxEndTimeOfPreceedingTasks);
    } else {
      task.startTime = job.startTime;
    }
    task.endTime = new Date(task.startTime.getTime() + task.estimateTime * 3600 * 1000 * 24);
    currentTime = task.endTime;
  }

  return sortedTasks;
}

function reCalculateTimeWorking (time, isStartIndex = false)  {
  if (time.getHours() >= 17) {
      time.setDate(time.getDate() + 1);
      time.setHours(8 + time.getHours() - 17)
  } else if (time.getHours() >= 12) {
      time.setHours(time.getHours())
  } else if (time.getHours() < 8){
      if (isStartIndex) {
          time.setHours(8)
      } else {
      time.setHours(16 + time.getHours())
      }
  };

  while (time.getDay()%6 == 0) {
      time.setDate(time.getDate() + 1);
  }

  return time;
}

function reCalculateStartTime(startTime) {
  if (startTime.getHours() == 17){
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(8)
  }

  return startTime;
}


function scheduleTasksNotParalell(job) {
  // console.log("job.startTime: ", job.startTime)
  // Sắp xếp các nhiệm vụ theo thứ tự topological
  // const sortedTasks = topologicalSort(job.tasks);

  // Gán startTime và endTime cho từng nhiệm vụ
  let currentTime = job.startTime;
  for (const task of job.tasks) {
    // Kiểm tra xem tất cả các nhiệm vụ tiên quyết đã hoàn thành chưa
    // const preceedingTasks = task.preceedingTasks.map(id => job.tasks.find(t => t.id === id));
    // if (preceedingTasks?.length > 0 ) {
    //   const maxEndTimeOfPreceedingTasks = preceedingTasks.reduce((maxEndTime, t) => Math.max(maxEndTime, t.endTime), 0);
    //   // task.startTime = new Date(Math.max(currentTime, maxEndTimeOfPreceedingTasks));
    //   task.startTime = new Date(maxEndTimeOfPreceedingTasks);
    // } else {
    //   task.startTime = job.startTime;
    // }
    task.startTime = currentTime
    task.endTime = new Date(task.startTime.getTime() + task.estimateTime * 3600 * 1000 * 24);
    currentTime = task.endTime;
  }

  return job.tasks;
}

module.exports = {
  topologicalSort,
  initBestAssignment,
  getAvailableTimeForAsset,
  calculateLatestStartTime,
  calculateLatestCompletionTime,
  isStartIndex,
  branchAndBound,
  findOptimalAssignment,
  groupBy,
  calculateRandomAssigneCost,
  duplicateSchedule,
  assignTasks,
  branchAndBoundEmployee,
  scheduleTasks,
  scheduleTasksNotParalell,
  reCalculateTimeWorking
}
