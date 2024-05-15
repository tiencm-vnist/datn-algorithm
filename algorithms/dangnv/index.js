const { topologicalSort, initBestAssignment, getAvailableTimeForAsset, calculateLatestStartTime, branchAndBound, findOptimalAssignment, groupBy, reCalculateTimeWorking } = require('./helper')
const ExcelJS = require('exceljs');
const { DAY_WORK_HOURS } = require('../../consts/kpi.const');

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

function isStartIndex(currentAssignment, index) {
    let taskInThread = currentAssignment.filter(_ => _.threadIndex == index);

    if (taskInThread.length == 0){
      return true
    }

    return false;
}

// tính random chi phí
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

// Lấy các task 1 nhân viên đang làm dở hoặc đang được phân công làm trong khoảng thời gian startTime - endTime (dính phát lấy luôn)
function duplicateSchedule(employee, startTime, endTime) {
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

function assignTasks(jobs, jobIndex, assignments, bestAssignment, currentCost, minCost, checkDuplicateFlag) {
  if (jobIndex === Object.keys(jobs).length) {
    if (currentCost < calculateRandomAssigneCost(bestAssignment)) {
      if ((JSON.stringify(assignments) != undefined) && (Object.keys(assignments).length == Object.keys(jobs).length)) {
        Object.keys(bestAssignment).forEach(key => bestAssignment[key] = JSON.parse(JSON.stringify(assignments[key])));
        Object.keys(assignments).forEach(key => delete assignments[key]);
      }
      return
    }
    return;
  }

  const jobKey = Object.keys(jobs)[jobIndex];
  const tasks = JSON.parse(JSON.stringify(jobs[jobKey]));

  for (let i = 0; i < employees.length; i++) {
    const startTime = new Date(Math.min(...tasks.map(_ => new Date( _.startTime))));
    const endTime = new Date(Math.max(...tasks.map(_ => new Date(_.endTime))));
    // console.log("startTime: ", startTime)
    // console.log("endTime: ", endTime)
    let noneDuplicate = !checkDuplicateFlag || (duplicateSchedule(employees[i], startTime, endTime).length === 0);
    if ((!Object.values(assignments).flat().some(assignment => assignment.assignee === employees[i])) && noneDuplicate) {
      const taskCost = (endTime - startTime) / (1000 * 60 * 60 * 24) * employees[i].costPerHour * 8;

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
      assignTasks(jobs, jobIndex + 1, assignments, bestAssignment, currentCost + taskCost, minCost, checkDuplicateFlag);

    }
  }
}

function branchAndBoundEmployee(jobs, employees, checkDuplicateFlag) {
  var bestAssignment = Object.assign({}, JSON.parse(JSON.stringify(jobs)));
  const minCost = Number.MAX_SAFE_INTEGER;
  var assignments = Object.assign({});
  assignTasks(jobs, 0, assignments, bestAssignment, 0, minCost, checkDuplicateFlag);

  return bestAssignment
}

function getTimeForProject(assignment) {
  const listStartTime = assignment.map((item) => new Date(item.startTime))
  const listEndTime = assignment.map((item) => new Date (item.endTime))

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
   
    const { assignee, estimateTime } = assignment[i]

    const { costPerHour } = assignee
    // const { estimateTime } = task
    
    totalCost += costPerHour * DAY_WORK_HOURS * estimateTime
  }
  return totalCost
}

function reScheduleTasks(assignment, assets) {
  assignment.sort((itemA, itemB) => new Date(itemA.endTime) - new Date(itemB.endTime))
  assignment.forEach((task) => {
    task.startTime = new Date(task.startTime)
    task.endTime = new Date(task.endTime)
  })
  let currentTime = assignment[0].startTime

  // console.log("assignment: ", assignment)
  const endTimeSaves = {}
  const assetAssignments = {};

  assignment.forEach((task) => {
    const { assignee } = task
    
    let startTime = task.startTime
    const numDay = Math.floor(task.estimateTime);
    const remainHour = (task.estimateTime - numDay) * DAY_WORK_HOURS;

    const preceedingTasks = task.preceedingTasks.map(id => assignment.find((item) => item.id === id))
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

      // ReCalculate Time
      task.startTime = reCalculateTimeWorking(task.startTime)
      const timeForAsset = getAvailableTimeForAsset(task, assets)
      task.startTime = new Date(Math.max([timeForAsset, task.startTime]))
      // Nếu có xung đột với tài nguyên, xem xét lại thời gian kết thúc của task
      if (assetConflict) {
        task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
      }
    }
    
    // ReCalculate Time
    task.endTime = new Date(task.startTime.getTime() + numDay * 3600 * 1000 * 24 + remainHour * 3600 * 1000);
    task.endTime = reCalculateTimeWorking(task.endTime)

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


const tasks = require('./data/task').tasks
const employees = require('./data/employee').employees
const assets = require('./data/asset').assets
const allTask = []


function proposalForTaskBidding() {
  // console.log("task: ", tasks)
  // console.log("employee: ", employees)
  // console.log("asset: ", assets)
  const numThreads = employees.length
  const START_DATE = new Date()

  START_DATE.setFullYear(2024, 4, 1)
  START_DATE.setHours(0, 0, 0, 0)
  const job = {
    startTime: START_DATE,
    tasks: tasks
  }

  job.tasks.forEach(_ => _.threadIndex = null)

  const start = performance.now()
  job.tasks = topologicalSort(tasks)

  // console.log("numThreads: ", numThreads)
  // console.log("jobTask: ", job.tasks)

  const optimalAssignment = findOptimalAssignment(job, numThreads, assets);
  // console.log('Optimal Assignment:', optimalAssignment);
  // console.log('Latest Completion Time:', calculateLatestCompletionTime(job));

  // Gán con người va
  const jobs = groupBy(optimalAssignment, 'threadIndex');


  const result = branchAndBoundEmployee(jobs, employees, true);
  const end = performance.now()
  const timeExce = end - start
  // console.log("result: ", result)

  // Object.values(result).flat().forEach(_ => {
  //   _.assignee = _.assignee.name
  // })

  const assignment = Object.values(result).flat()
  return { assignment, timeExce }

  // reScheduleTasks(assignment, assets)
  
  
}

async function testThuatToan() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('So sanh');
  worksheet.addRow(['No Iter', 'Task ID', 'Emp ID', 'Start Time', 'End Time', 'Total Day Works', 'Total Cost of Emps', 'Time Exce'])

  
  let totalTimeExec = 0, totalEmpsCost = 0, totalTime = 0
  let timeExceMin = Infinity, minEmpsCost = Infinity, minTimeCost = Infinity
  // let timeExceT = 100

  for (let k = 0; k < 8; k++) {
    console.log("k: ", k + 1)
    const { assignment, timeExce } = proposalForTaskBidding() 
    const time = getTimeForProject(assignment).totalTime
    const empsCost = getEmployeesCost(assignment)

    for (let i = 0; i < assignment.length; i++) {
      const { id, assignee, startTime, endTime } = assignment[i]
      worksheet.addRow([k + 1, id, assignee.id, startTime, endTime, time, empsCost, timeExce])
    }
    totalTimeExec += timeExce
    totalEmpsCost += empsCost
    totalTime += time
    if (timeExceMin > timeExce) {
      timeExceMin = timeExce
    }
    if (minEmpsCost > empsCost) {
      minEmpsCost = empsCost
    }
    if (minTimeCost > time) {
      minTimeCost = time
    }
  }

  worksheet.addRow(['Num Iter', 'Average Emps Cost', 'Average Time Works', 'Average Time Exec (ms)', 'Min Emps Cost', 'Min Time Works', 'Min Time Exec (ms)'])
  worksheet.addRow([100, totalEmpsCost / 100, totalTime / 100, totalTimeExec / 100, minEmpsCost, minTimeCost, timeExceMin])
  const filePath = 'thuat_toan_of_dang_100.xlsx';
  await workbook.xlsx.writeFile(filePath);
}


testThuatToan()