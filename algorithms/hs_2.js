const { KPI_TYPES, KPI_NOT_WORK, DAY_WORK_HOURS, KPI_INIT_TYPES } = require('../consts/kpi.const')
const { topologicalSort, scheduleTasks, scheduleTasksNotParalell } = require('../helper')
const { lastKPIs } = require('../new_data/kpi')

// Chiến lược 1: Gán cho nó có thể thực hiện song song trước ==> check trùng, duplicate rồi chỉnh sau
// Chiến lược 2: Gán cho nó thực hiện đúng trước ==> co thời gian lại + điều chỉnh lại lịch sau
// Chiến lược 2 có vẻ ăn chắc mặc bền hơn ==> OKE
// LÀM CHIẾN LƯỢC 1 trước

// Các biến toàn cục
let employees, tasks, kpis, assets, job
const START_DATE = new Date()
START_DATE.setFullYear(2024, 4, 1)
START_DATE.setHours(0, 0, 0, 0)

const PAR = 0.3, HCMR = 0.95
let w1, w2, w3

let assignQualityRange = {}
let assetQualityRange = {}


function getRandomIntValue(minValue, maxValue) {
  return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue)
}

function getQualityAssignRange(employees) {
  const uniqueKeys = employees.reduce((keys, employee) => {
    for (const key in employee.qualities) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    return keys;
  }, []);

  const requireAssignRange = {};

  uniqueKeys.forEach(key => {
    const values = employees.reduce((result, employee) => {
      const value = employee.qualities[key];
      
      if ((value || typeof value === 'number') && !result.includes(value)) {
        result.push(value);
      }

      return result;
    }, []);

    values.sort((a, b) => a - b);

    if (values.length > 0) {
      requireAssignRange[key] = values;
    }
  });
  return requireAssignRange
}

function getQualityAssetRange(assetAll) {

  const rangeAssetQualities = {};

  assetAll.forEach(asset => {
    const { type, qualities } = asset;

    // Kiểm tra xem loại tài sản đã tồn tại trong đối tượng rangeAssetQualities chưa
    if (!rangeAssetQualities[type]) {
      // Nếu chưa tồn tại, tạo một mục mới với loại tài sản đó
      rangeAssetQualities[type] = {};
    }

    // Duyệt qua mỗi quality của tài sản và cập nhật range cho quality đó
    qualities && qualities.forEach(quality => {
      const qualityKey = Object.keys(quality)[0]; // Lấy key của quality
      const qualityValue = quality[qualityKey]; // Lấy giá trị của quality

      if ((qualityKey && qualityValue) || (qualityKey && typeof qualityValue === 'number')) {
        // Nếu qualityKey chưa tồn tại trong đối tượng rangeAssetQualities[type]
        if (!rangeAssetQualities[type][qualityKey]) {
          // Tạo một mục mới với qualityKey đó và gán giá trị là một mảng chứa qualityValue
          rangeAssetQualities[type][qualityKey] = [qualityValue];
        } else {
          // Nếu qualityKey đã tồn tại, kiểm tra xem qualityValue đã tồn tại trong mảng chưa
          if (!rangeAssetQualities[type][qualityKey].includes(qualityValue)) {
            // Nếu chưa tồn tại, thêm qualityValue vào mảng
            rangeAssetQualities[type][qualityKey].push(qualityValue);
          }
        }
      }
    });
  });

  return rangeAssetQualities

}

function createNewRandomAssetAssignArr(dataAssetAssign, assetQualityRange) {
  const newArr = dataAssetAssign.map(item => {
    const newItem = { ...item };
    const { type } = item
    if (newItem.quality) {
      newItem.quality = newItem.quality.map(qualityItem => {
        const key = Object.keys(qualityItem)[0];
        const fromValue = qualityItem[key];
        return { [key]: getRandomValueInRange(fromValue, assetQualityRange[type][key]) };
      });
    }
    return newItem;
  });
  return newArr;
}

function getRandomValueInRange(fromValue, arrRange) {
  let newAvailableArr = arrRange.filter((item) => item >= fromValue)
  if (newAvailableArr?.length) 
    return newAvailableArr[Math.floor(Math.random() * newAvailableArr?.length)]
  return 0
}

// Tạo một hàm để kiểm tra xem một nhân viên có đủ yêu cầu cho một task hay không
// function checkEmployeeQualifications(employee, requireAssign) {
//   for (let requirement in requireAssign) {
//     if (!employee.qualities[requirement] || employee.qualities[requirement] < requireAssign[requirement]) {
//       return false;
//     }
//   }
//   return true;
// }

// Tìm nhân viên với năng lực như trên 
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

// function findAssetsWithQualities(assets, requireAsset) {
//   const asset
// }

function calculatePointOfSolutionQuality(harmonyVectorA, tasks, employees, assets) {

  return 0;
}


function init() {
  employees = require('../new_data/employee').employees
  tasks = require('../new_data/task').tasks
  kpis = require('../new_data/kpi').lastKPIs
  assets = require('../new_data/asset').assets
  job = {
    startTime: START_DATE,
    tasks: tasks
  }

  const tbSalary = employees.reduce((currValue, currItem) => currValue + currItem.costPerHour, 0) / employees.length;
  const totalTimeEstimate = tasks.reduce((currValue, currItem) => currValue + currItem.estimateTime, 0)
  w2 = 1 / (6 * tbSalary * totalTimeEstimate * 8)
  w1 = -1, w3 = 1;

  // init available range for assign and asset
  assignQualityRange = getQualityAssignRange(employees)
  // console.log("assignQuality Range: ", assignQualityRange)
  assetQualityRange = getQualityAssetRange([...assets.inUse, ...assets.readyToUse])
  // console.log("assignQuality Range: ", assetQualityRange)
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

// function getKpiForEmployee(employeeId, assignment) {
//   for(let i = 0; i < )
// }

function getMaxChenhLech(assignment, employees) {
  let kpiOfEmployee = {}
  for(let i = 0; i < employees; i++) {
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
      // Lấy kpi tồi nhất của thằng nào đã làm task này rồi: TODO

    } 
    
    kpiInTask.forEach((kpiItem) => {
      const { type, weight } = kpiItem
      kpiOfEmployee[id] += kpiValue * weight * KPI_TYPES[type].weight
    })
  }

  return kpiOfEmployee
}

function getTotalKpi(assignment, lastKPIs) {
  let initKPIValue = { ...KPI_INIT_TYPES }
  // console.log("initKPIValue: ", initKPIValue)

  for(let i = 0; i < assignment.length; i++) {
    const { task, assignee } = assignment[i]
    const { id } = assignee
    const kpiOfAssignee = lastKPIs.find((item) => item.id === id) 
    // console.log("kpiOfAssignee: ")
    let kpiValue = kpiOfAssignee.kpiInTask[task.id]
    if (kpiValue === KPI_NOT_WORK) {
      // Lấy kpi tồi nhất của thằng nào đã làm task này rồi: TODO

    } 
    // console.log("kpiValue: ", kpiValue)

    const { kpiInTask } = task
    kpiInTask.forEach((item) => {
      const {type, weight} = item
      initKPIValue[type].value += kpiValue * weight
    })
  }

  return initKPIValue
}

function calculateObjectives(assignment, tasks, employees, assets, lastKPIs) {

}

function randomAssign(harmonyVectorX, tasks, employees, assets, lastKPIs) {
  let randomAssign = []
  for(let i = 0; i < harmonyVectorX.length; i++) {
    const { taskId, assignee } = harmonyVectorX[i];
    let { availableEmployees } = assignee
    console.log("avai: ", availableEmployees.map((item) => item.id))
    if (i > 0) {
      // console.log("random assignee: ", i,  ": ", randomAssign)
      const lastAssignee  = randomAssign[i - 1].assignee
      // console.log("last assignee: ", i,  ": ", lastAssignee)

      let filterAvailableEmployees = availableEmployees.filter((item) => item.id !== lastAssignee.id)
      if (filterAvailableEmployees.length) {
        availableEmployees = filterAvailableEmployees
      }
    }
    const assigneeRandom = availableEmployees[Math.floor(Math.random() * availableEmployees.length)]
    
    // random assign asset: TODO
    const assetRandom = []
    randomAssign.push({
      task: tasks.find((item) => item.id === taskId),
      assignee: assigneeRandom,
      asset: assetRandom
      // random asset: TODO
    })

  }
  // const 
  const testTotalKPI = getTotalKpi(randomAssign, lastKPIs)
  const testTotalCost = getTotalCost(randomAssign)
  const kpiChenhLech = getMaxChenhLech(randomAssign, employees)
  return {
    randomAssign,
    totalKpi: testTotalKPI,
    totalCost: testTotalCost,
    kpiChenhLech: kpiChenhLech
  }
}

function findBestAssignForTask(harmonyVectorX, tasks, employees, assets, lastKPIs) {
  let HM = []
  const HM_SIZE = 30

  // Test ramdom assign
  const randomAssign = randomAssign(harmonyVectorX, tasks, employees, assets, lastKPIs)

  // for (let i = 0; i < 30; i++) {
  //   const randomAssign = randomAssign(harmonyVectorX, lastKPIs)
  // }
}

function initRandomHarmonyVector(tasks, employees, assets) {
  let harmonyVectorX = []
  let assigneeFalseScore = 0
  let assetFalseScore = 0

  for(let i = 0; i < tasks.length; i++) {
    const { requireAsset, requireAssign } = tasks[i]

    const requireAssignRandom = {};
    for (const key in requireAssign) {
      if (key) {
        // console.log("key: ", key, ": ", assignQualityRange[key])
        const value = requireAssign[key];
        requireAssignRandom[key] = getRandomValueInRange(value, assignQualityRange[key]);
      }
    }

    // tạo được bộ năng lực của nhân viên, tìm kiếm xem có nhân viên nào phù hợp
    const employeesWithRequiredQualities = findEmployeesWithQualities(employees, requireAssignRandom)
    if(!employeesWithRequiredQualities?.length) {
      assigneeFalseScore += 1
    }

    let requireAssetRandom = []
    if (requireAsset?.length) {
      requireAssetRandom = createNewRandomAssetAssignArr(requireAsset, assetQualityRange)
    }

    // Tính cho asset
    // const assetWithRequiredQualities = findAssetsWithQualities(assets, requireAsset) {

    // }

    harmonyVectorX.push({
      taskId: tasks[i].id,
      assignee: {
        qualities: requireAssignRandom,
        availableEmployees: employeesWithRequiredQualities
      },
      asset: {
        qualities: requireAssetRandom,
        availableAsset: [],
      }
    })
  }

  return { qualityWithAssignAvailable: harmonyVectorX, assigneeFalseScore, assetFalseScore }

  if (assigneeFalseScore || assetFalseScore) {
    return {qualityWithAssignAvailable: harmonyVectorX, assigneeFalseScore, assetFalseScore }
  } else {
    // findBestAssignForTask(harmonyVectorX, tasks, employees, assets, lastKPIs)
    return {qualityWithAssignAvailable: harmonyVectorX, assigneeFalseScore, assetFalseScore }
  }
}

function harmonySearch(hmSize, maxIter, PAR, HCMR, bw, tasks, employees, assets, lastKPIs) {
  let HM = []
  // Step 1: init HM
  for (let i = 0; i < hmSize; i++) {
    // init 1 harmony solution vector and push to HM
    const harmonyVectorX = initRandomHarmonyVector(tasks, employees, assets)
    HM.push(harmonyVectorX)
  }

  // TEST
  let flag = true
  let harmonyVectorX
  while(flag) {
    harmonyVectorX = initRandomHarmonyVector(tasks, employees, assets)
    const { assigneeFalseScore } = harmonyVectorX
    if (!assigneeFalseScore) {
      flag = false
    }
  }
  const { qualityWithAssignAvailable } = harmonyVectorX
  // console.log("test solution: ", qualityWithAssignAvailable)
  const randomSolution = randomAssign(qualityWithAssignAvailable, tasks, employees, assets, lastKPIs)
  console.log("randomsolution: ", randomSolution)
}

// Check xem 2 bộ nghiệm X thì bộ nào tốt hơn
function harmonyFunction(harmonyVectorA, harmonyVectorB) {

}

// Tạo một mảng mới tương ứng với mỗi task, lưu trữ id của các nhân viên thỏa mãn yêu cầu
// const taskAssignments = tasks.map(task => {
//   const suitableEmployees = employees.filter(employee => {
//       return checkEmployeeQualifications(employee, task.requireAssign);
//   }).map(employee => employee.id);

//   return { taskN: task.name, taskId: task.id, suitableEmployees };
// });


function main() {
  init()
  // console.log("task: ", job.tasks)

  job.tasks = topologicalSort(tasks)
  // console.log("task: ", job.tasks)
  job.tasks = scheduleTasks(job)
  const HM_SIZE = 30, PAR = 0.4, HMCR = 0.95, bw = 1, maxIter = 1000

  harmonySearch(HM_SIZE, maxIter, PAR, HCMR, bw, tasks, employees, assets, lastKPIs)
  
  


  // console.log("harmonyVectorX: ", (harmonyVectorX))

  // const { tasks, employees } = require('./data');



// console.log(taskAssignments);

}

// Call main function
main()