const { fullTasks } = require('./data/task')
const { employees } = require('./data/employee')

const tasks = fullTasks
const { lastKPIs } = require('./data/kpi')


function employeeCanDoTask(employee, task) {
  return task.requireAssign.includes(employee.position);
}

// console.log("em: ", tasks)

function getKPIFromTask(employee, task, lastKPIs) {
  const kpiData = lastKPIs.find((lastItem) => lastItem.id === employee.id)
  // console.log("kpi data: ", kpiData)
  if (!kpiData)
    return 0
  const value = kpiData.kpiInTask[task.id]
  return value !== -1 ? value : 0
} 
// console.log("test: ", getKPIFromTask(employees[0], tasks[1], lastKPIs))

const dp = new Array(employees.length + 1).fill(null).map(() => new Array(tasks.length + 1).fill(-1));
for (let i = 1; i <= employees.length; i++) {
  for (let j = 1; j <= tasks.length; j++) {
    if (!employeeCanDoTask(employees[i - 1], tasks[j - 1])) {
      dp[i][j] = -1;
    } else if (employees[i - 1].startTime > tasks[j - 1].startTime) {
      dp[i][j] = -1;
    }
  }
}

for (let i = 1; i <= employees.length; i++) {
  for (let j = 1; j <= tasks.length; j++) {
    if (dp[i][j] === -1) continue;

    let maxCost = 0;
    let maxKPI = 0;
    let minKPIRatioDiff = Number.MAX_VALUE;
    for (let k = 0; k < i; k++) {
      if (dp[k][j] !== -1) {
        const totalCost = dp[k][j].cost + employees[i - 1].costPerHour * tasks[j - 1].estimateTime;
        const totalKPI = dp[k][j].kpi + getKPIFromTask(employees[i - 1], tasks[j - 1]);
        const kpiRatioDiff = Math.abs(totalKPI / employees[i - 1].costPerHour - totalKPI / employees[k].costPerHour);

        if (employees[i - 1].endTime <= tasks[j - 1].endTime) {
          if (totalCost > maxCost || (totalCost === maxCost && totalKPI > maxKPI) || (totalCost === maxCost && totalKPI === maxKPI && kpiRatioDiff < minKPIRatioDiff)) {
            maxCost = totalCost;
            maxKPI = totalKPI;
            minKPIRatioDiff = kpiRatioDiff;
            dp[i][j] = { cost: maxCost, kpi: maxKPI, kpiRatioDiff: minKPIRatioDiff };
          }
        }
      }
    }
  }
}


let i = employees.length;
let j = tasks.length;
const assignment = new Array(employees.length).fill(-1);
while (i > 0 && j > 0) {
  const state = dp[i][j];
  assignment[i - 1] = j - 1;

  for (let k = 0; k < i; k++) {
    if (dp[k][j].cost === state.cost && dp[k][j].kpi === state.kpi && dp[k][j].kpiRatioDiff === state.kpiRatioDiff) {
      i = k;
      break;
    }
  }
  j--;
}

// In ra phương pháp gán tối ưu
console.log("Phương pháp gán tối ưu:");
for (let i = 0; i < employees.length; i++) {
  console.log(`Nhân viên ${i + 1}: Nhiệm vụ ${assignment[i] + 1}`);
}