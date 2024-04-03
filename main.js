const assets = require('./data/asset');
const employees = require('./data/employee');
const { lastKPIs } = require('./data/kpi');
const { tasks, fullTasks } = require('./data/task')
const { topologicalSort, initBestAssignment, getAvailableTimeForAsset, findOptimalAssignment, calculateLatestCompletionTime, groupBy, scheduleTasks } = require('./helper')

const startDate = new Date()
startDate.setFullYear(2024, 3, 21);
startDate.setHours(0, 0, 0, 0)

const biddingPackage = {
  startDate: startDate
}

// console.log("test date: /", biddingPackage.startDate.toString())

let numThreads = employees.length
// console.log("numThreads: ", numThreads);
// console.log("asset: ", assets)

const job = {
  startTime: startDate,
  tasks: tasks
}

job.tasks = topologicalSort(tasks)

const optimalAssignment = findOptimalAssignment(job, 2, assets);
console.log("optimalAssignment: ", optimalAssignment)
// const jobs = groupBy(optimalAssignment, 'threadIndex');
// console.log("jobs: ", jobs)

const testTasks = scheduleTasks(job)
// console.log("testTasks: ", testTasks.sort((a, b) => a.startTime - b.startTime))
// console.log("fullTasks: ", fullTasks)



// Hàm tính toán KPI cho mỗi phân công
function calculateKPI(assignment, kpiMatrix) {
  let totalKPI = 0;
  for (let i = 0; i < assignment.length; i++) {
      totalKPI += kpiMatrix[assignment[i].employeeId][assignment[i].taskId];
  }
  return totalKPI;
}

// Hàm tính toán chi phí cho mỗi phân công
function calculateCost(assignment, employees, tasks) {
  let totalCost = 0;
  for (let i = 0; i < assignment.length; i++) {
      const employee = employees.find(emp => emp.id === assignment[i].employeeId);
      const task = tasks.find(tsk => tsk.id === assignment[i].taskId);
      totalCost += employee.costPerHour * task.estimateTime;
  }
  return totalCost;
}

// Hàm tìm kiếm cục bộ (Simulated Annealing)
function simulatedAnnealing(tasks, employees, kpiMatrix, initialAssignment, initialTemperature, coolingRate, iterations) {
  let currentAssignment = initialAssignment.slice();
  let currentKPI = calculateKPI(currentAssignment, kpiMatrix);
  let currentCost = calculateCost(currentAssignment, employees, tasks);
  let bestAssignment = currentAssignment.slice();
  let bestKPI = currentKPI;
  let bestCost = currentCost;
  let temperature = initialTemperature;

  for (let i = 0; i < iterations; i++) {
      const randomIndex = Math.floor(Math.random() * currentAssignment.length);
      const newEmployeeId = Math.floor(Math.random() * employees.length);
      const newAssignment = currentAssignment.slice();
      newAssignment[randomIndex].employeeId = newEmployeeId;
      const newKPI = calculateKPI(newAssignment, kpiMatrix);
      const newCost = calculateCost(newAssignment, employees, tasks);
      const deltaKPI = newKPI - currentKPI;
      const deltaCost = newCost - currentCost;

      if (deltaKPI > 0 || Math.exp(deltaKPI / temperature) > Math.random()) {
          currentAssignment = newAssignment.slice();
          currentKPI = newKPI;
          currentCost = newCost;
          if (currentKPI > bestKPI || (currentKPI === bestKPI && currentCost < bestCost)) {
              bestAssignment = currentAssignment.slice();
              bestKPI = currentKPI;
              bestCost = currentCost;
          }
      }

      temperature *= coolingRate;
  }

  return bestAssignment;
}

// Sử dụng giải thuật tìm kiếm cục bộ
// Khởi tạo phân bố ban đầu với giá trị ngẫu nhiên cho employeeId
const initialAssignment = fullTasks.map(task => ({
  taskId: task.id,
  employeeId: Math.floor(Math.random() * employees.length)
}));

// Trong hàm simulatedAnnealing, thay vì sao chép mảng, ta sẽ tạo một mảng mới từ mảng hiện tại

// const initialTemperature = 1000;
// const coolingRate = 0.99;
// const iterations = 10000;

// const bestAssignment = simulatedAnnealing(fullTasks, employees, lastKPIs[0].kpiInTask, initialAssignment, initialTemperature, coolingRate, iterations);
// console.log(bestAssignment);