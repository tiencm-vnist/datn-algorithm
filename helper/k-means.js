const { topologicalSort } = require(".");
const { scheduleTasksWithAsset, getAvailableEmployeesForTasks, splitKPIToEmployees } = require("../algorithms/hs_helper");
const { KPI_TYPES } = require("../consts/kpi.const");
const { assets } = require("../data/asset");
const { employees } = require("../data/employee");
const { tasks } = require("../data/task");

const START_DATE = new Date()
START_DATE.setFullYear(2024, 4, 1)
START_DATE.setHours(0, 0, 0, 0)
job = {
  startTime: START_DATE,
  tasks: tasks
}
job.tasks = topologicalSort(tasks)
job.tasks = scheduleTasksWithAsset(job, assets)
job.tasks = getAvailableEmployeesForTasks(job.tasks, employees)

function preprocessEmployees(employees) {
    // Find all unique qualities
    const allQualities = new Set();
    for (const employee of employees) {
        for (const key in employee.qualities) {
            allQualities.add(key);
        }
    }

    // Ensure all employees have the same qualities
    for (const employee of employees) {
        for (const quality of allQualities) {
            if (!employee.qualities.hasOwnProperty(quality)) {
                employee.qualities[quality] = 0;
            }
        }
  }
  return employees
}

function getRandomEmployees(employees, k) {
  const randomEmployees = [];
  const shuffledEmployees = employees.sort(() => 0.5 - Math.random()); // Chiến lược 1: Randomize the order of employees
  // const shuffledEmployees = employees.sort((item) => )
  
  for (let i = 0; i < k; i++) {
    randomEmployees.push(shuffledEmployees[i]); // Select first k employees
  }
  console.log("random: ", randomEmployees.map((item) => item.id))
  return randomEmployees;
}

function initializeCentroids_1(employees, k) {
  const randomEmployees = getRandomEmployees(employees, k);
  const centroids = randomEmployees.map(employee => ({ ...employee.qualities }));
  return centroids;
}

function initializeCentroids_2(employees, k) {
  const centroids = [];
  
  // Chọn một điểm ngẫu nhiên từ dữ liệu làm tâm cụm đầu tiên
  const firstCentroidIndex = Math.floor(Math.random() * employees.length);
  // console.log("firstIndex: ", firstCentroidIndex)
  centroids.push({ ...employees[firstCentroidIndex].qualities });

  // Tiến hành chọn các tâm cụm còn lại sử dụng phương pháp K-means++
  for (let i = 1; i < k; i++) {
    const distances = [];
    let totalDistance = 0;

    // Tính toán khoảng cách từ mỗi điểm đến tâm cụm gần nhất
    for (const employee of employees) {
        let minDistance = Infinity;
        for (const centroid of centroids) {
            const distance = euclideanDistance(employee.qualities, centroid);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        distances.push(minDistance);
        totalDistance += minDistance;
    }

      // Chọn một điểm mới với xác suất tỉ lệ với khoảng cách của nó đến tâm cụm gần nhất
      let accumulatedProbability = 0;
      const randomValue = Math.random() * totalDistance;
      for (let j = 0; j < distances.length; j++) {
        accumulatedProbability += distances[j];
        if (accumulatedProbability >= randomValue) {
          centroids.push({ ...employees[j].qualities });
          break;
        }
      }
  }

  return centroids;
}

function initializeCentroids_3(employees, k) {
  const centroids = [];
  
  // Chọn ngẫu nhiên centroid đầu tiên từ các điểm dữ liệu
  const firstCentroidIndex = Math.floor(Math.random() * employees.length);
  centroids.push({ ...employees[firstCentroidIndex].qualities });

  // Lặp lại cho đến khi k centroid được lấy mẫu
  for (let i = 1; i < k; i++) {
    const distances = [];
    let maxDistance = -Infinity;
    let farthestIndex = -1;

      // Tính toán khoảng cách của mỗi điểm dữ liệu từ trung tâm gần nhất đã chọn trước đó
    for (const employee of employees) {
      let minDistance = Infinity;
      for (const centroid of centroids) {
        const distance = euclideanDistance(employee.qualities, centroid);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
      distances.push(minDistance);
      if (minDistance > maxDistance) {
        maxDistance = minDistance;
        farthestIndex = distances.length - 1;
      }
    }

    // Chọn centroid tiếp theo từ các điểm dữ liệu
    // Xác suất chọn một điểm làm centroid tỷ lệ thuận với khoảng cách của nó từ centroid gần nhất đã chọn trước đó
    let accumulatedProbability = 0;
    const randomValue = Math.random() * maxDistance;
    for (let j = 0; j < distances.length; j++) {
        accumulatedProbability += distances[j];
        if (accumulatedProbability >= randomValue) {
            centroids.push({ ...employees[j].qualities });
            break;
        }
    }
  }

  return centroids;
}


// K-Means ++
function initializeCentroids_4(employees, k) {
  /*
  initialized the centroids for K-means++
  inputs:
    employees - array of employees points with shape (200, 2)
    k - number of clusters
  */

  // Initialize the centroids list and add
  // a randomly selected employees point to the list
  const centroids = [];
  const randomIndex = Math.floor(Math.random() * employees.length)
  centroids.push(employees[randomIndex].qualities);

  // Compute remaining k - 1 centroids
  for (let c_id = 1; c_id < k; c_id++) {
    // Initialize a list to store distances of employees
    // points from the nearest centroid
    const dist = [];

    for (let i = 0; i < employees.length; i++) {
      const point = employees[i].qualities;
      let d = Infinity;

      // Compute distance of 'point' from each of the previously
      // selected centroids and store the minimum distance
      for (let j = 0; j < centroids.length; j++) {
        const temp_dist = euclideanDistance(point, centroids[j]);
        d = Math.min(d, temp_dist);
      }
      dist.push(d);
    }

    // Select employees point with maximum distance as our next centroid
    const next_centroid = employees[dist.indexOf(Math.max(...dist))].qualities;
    centroids.push(next_centroid);
  }
  return centroids;
}

function getPointFromQuality(employee) {
  let sum = 0;
  for (let key in employee.qualities) {
    let t = employee.qualities[key]
    sum += t * t
  }
}

// KMeans: chọn K thằng tốt nhất
function initializeCentroids_5(employees, k) {
  const centroids = [];
  let newEmployees = employees.sort((employeeA, employeeB) => {
    const pointA = getPointFromQuality(employeeA)
    const pointB = getPointFromQuality(employeeB)

    return pointB - pointA
  })

  for (let i = 0; i < k; i++) {
    centroids.push(newEmployees[i].qualities)
  }
  
  return centroids
}


// KMeans: Chọn K thằng tồi nhất
function initializeCentroids_6(employees, k) {
  const centroids = [];
  let newEmployees = employees.sort((employeeA, employeeB) => {
    const pointA = getPointFromQuality(employeeA)
    const pointB = getPointFromQuality(employeeB)

    return pointA - pointB
  })

  for (let i = 0; i < k; i++) {
    centroids.push(newEmployees[i].qualities)
  }
  
  return centroids
}



function euclideanDistance(qualities1, qualities2) {
  let sum = 0;
  for (let key in qualities1) {
    sum += Math.pow(qualities1[key] - qualities2[key], 2);
  }
  return Math.sqrt(sum);
}

function assignToCluster(employees, centroids) {
  const clusters = new Array(centroids.length).fill().map(() => []);
  
  for (const employee of employees) {
    let minDistance = Infinity;
    let clusterIndex = -1;
    for (let i = 0; i < centroids.length; i++) {
      const distance = euclideanDistance(employee.qualities, centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        clusterIndex = i;
      }
    }
    clusters[clusterIndex].push(employee);
  }
  return clusters;
}


function calculateCentroids(clusters) {
  const centroids = [];
  for (const cluster of clusters) {
    if (cluster.length === 0) {
      centroids.push(null);
      console.log("vao day")
      continue;
    }
    const centroidAbs = {};
    for (const key in cluster[0].qualities) {
      let sum = 0;
      let count = 0; // Add count variable
      for (const employee of cluster) {
        if (employee.qualities.hasOwnProperty(key)) { // Check if employee has the property
          sum += employee.qualities[key];
          count++; // Increment count only when property exists
        }
      }
      centroidAbs[key] = count > 0 ? sum / count : 0; // Avoid division by zero
    }
    let centroid = {}
    let distanceFromCentroidAbs = Infinity
    for (item of cluster) {
      const distance = euclideanDistance(item.qualities, centroidAbs)
      if (distance < distanceFromCentroidAbs) {
        distanceFromCentroidAbs = distance
        centroid = item.qualities
      }
    }
    centroids.push(centroid);
  }
  return centroids
}

// function calculateCentroids(clusters) {
//   const centroids = [];
//   for (const cluster of clusters) {
//     if (cluster.length === 0) {
//       centroids.push(null);
//       continue;
//     }
//     const currentCentroid = cluster[0]; // Initialize current centroid with first point in cluster
//     let minDistance = Infinity;
//     let closestPoint = currentCentroid;
//     for (const point of cluster) {
//       const distance = euclideanDistance(point.qualities, currentCentroid.qualities);
//       if (distance < minDistance) {
//         minDistance = distance;
//         closestPoint = point;
//       }
//     }
//     centroids.push({ ...closestPoint.qualities });
//   }
//   return centroids;
// }



function kMeansWithEmployees(employees, k) {
  let employeesAfterProcess = preprocessEmployees(employees)
  // Initialize centroids randomly
  let centroids = initializeCentroids_5(employeesAfterProcess, k)
  // console.log("centroids ban dau: ", centroids)

  let prevClusters = [];
  let clusters = assignToCluster(employeesAfterProcess, centroids);
  // console.log("cluster: ", clusters)

  while (!clusters.every((cluster, i) => prevClusters[i] && cluster.length === prevClusters[i].length)) {
    prevClusters = clusters;
    centroids = calculateCentroids(clusters);
    clusters = assignToCluster(employeesAfterProcess, centroids);
  }
  // console.log("cluster: ", clusters.map(cluster => cluster.map((item) => item.id)))
  return clusters;
}

// Test the function

// Preprocess the employees data
// preprocessEmployees(employees);
// // console.log(employees);
// const k = 4;
// const clusters = kMeansWithEmployees(employees, k);
// // console.log(clusters);


// Now, all employees have the same set of qualities with default values for missing keys
function calculateCompetencyScore(employee) {
  let totalScore = 0;
  for (const key in employee.qualities) {
    totalScore += employee.qualities[key];
  }
  return totalScore;
}

function calculateClusterScores(clusters) {
  const clusterScores = [];
  for (const cluster of clusters) {
    let totalScore = 0;
    for (const employee of cluster) {
      totalScore += calculateCompetencyScore(employee) / cluster.length;
    }
    clusterScores.push(totalScore);
  }
  return clusterScores;
}

function createClusterData(clusters, clusterScores) {
    const clusterData = {};
    for (let i = 0; i < clusters.length; i++) {
      for (let employee of clusters[i]) {
        const { id } = employee
        clusterData[id] = {}
        clusterData[id]['clusterScore'] = clusterScores[i]
        clusterData[id]['cluster'] = i
      } 
      
    }
    return clusterData;
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

function findMeanOfQuality(qualityKey, availableAssignee) {
  const values = availableAssignee.map(employee => employee.qualities[qualityKey]);
  const sum = values.reduce((acc, currentValue) => acc + currentValue, 0);

  const mean = sum / availableAssignee.length;
  return mean;
}

function splitKPIOfTaskToEmployees(task, kpiTarget, clusterData) {
  const kpiOfEmployee = {}
  let { requireAssign, availableAssignee, kpiInTask, id } = task
  if (!kpiInTask) {
    kpiInTask = []
    for (let key in KPI_TYPES) {
      kpiInTask.push({
        type: key,
        weight: 0
      })
    }
  }
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
  
  let totalClusterScore = 0
  // let availableAssigneeFilter = availableAssignee.filter((employee) => getCapacityPointOfEmployeeInTask(requireAssign, employee) >= meanCapacityOfTask)
  // console.log("availableAssigneeFilter: ", availableAssigneeFilter)

  let kpiInClusters = {}
  availableAssignee.forEach((employee) => {
    const { id } = employee
    
     // init KPI in Clusters
    const clusterId = clusterData[id].cluster
    if (!kpiInClusters[clusterId]) {
      kpiInClusters[clusterId] = {}
      for (let key in kpiTarget) {
        kpiInClusters[clusterId][key] = 0
        kpiInClusters[clusterId]['totalRatio'] = 0
      }
    }

    kpiOfEmployee[id] = {}
    for (let key in KPI_TYPES) {
      kpiOfEmployee[id][key] = 0
    }
    // kpiOfEmployee[id]['ratio'] = getCapacityPointOfEmployeeInTask(requireAssign, employee) / meanCapacityOfTask
    const capacityOfEmployeeInTask = getCapacityPointOfEmployeeInTask(requireAssign, employee)
    // console.log('capacity Emp: ', capacityOfEmployeeInTask)
    kpiOfEmployee[id]['ratio'] = capacityOfEmployeeInTask

    kpiInClusters[clusterId]['totalRatio'] += capacityOfEmployeeInTask

    for (let key in clusterData[id]) {
      kpiOfEmployee[id][key] = clusterData[id][key]
    }
    
    totalClusterScore += kpiOfEmployee[id]['clusterScore']

   
  })

  // let testTotalKPI = 0
  availableAssignee.forEach((employee) => {
    const clusterScore = kpiOfEmployee[employee.id]['clusterScore']
    const clusterId = clusterData[employee.id].cluster
    

    
    kpiInTask.forEach(({ type, weight }) => {
      const value = weight * kpiTarget[type].value * clusterScore / totalClusterScore
      kpiOfEmployee[employee.id][type] += value
      kpiInClusters[clusterId][type] += value
      // testTotalKPI += value
    })
  })
  
  for (let employeeId in kpiOfEmployee) {
    for (let type in KPI_TYPES) {
      const clusterId = kpiOfEmployee[employeeId].cluster
      kpiOfEmployee[employeeId][type] = kpiInClusters[clusterId][type] * kpiOfEmployee[employeeId].ratio / kpiInClusters[clusterId].totalRatio
    }

    delete kpiOfEmployee[employeeId].ratio;
    delete kpiOfEmployee[employeeId].clusterScore;
    delete kpiOfEmployee[employeeId].cluster;
  }
  return kpiOfEmployee
}

function findBestMiniKPIOfTasks(tasks, kpiTarget) {
  const minimumKpi = {}
  if (!kpiTarget['A'].value) {
    return minimumKpi
  }

  for (let key in kpiTarget) {
    minimumKpi[key] = Infinity
  }

  tasks.forEach((task) => {
    const { kpiInTask } = task
    kpiInTask.forEach(({ type, weight }) => {
      if (minimumKpi[type] > weight) {
        minimumKpi[type] = weight
      }
    })
  })

  for (let key in kpiTarget) {
    const value = kpiTarget[key].value
    minimumKpi[key] = minimumKpi[key] * value
  }

  return minimumKpi

}

function reSplitKPIOfEmployees(minimumKpi, kpiOfEmployeesBefore) {
  const kpiOfEmployees = { ...kpiOfEmployeesBefore }
  const isCanSplitKpi = {}
  const totalToSplit = {}
  for (let key in KPI_TYPES) {
    totalToSplit[key] = {}
    totalToSplit[key]['COUNT'] = 0
    totalToSplit[key]['TOTAL'] = 0
  }
  for (let employeeId in kpiOfEmployees) {
    isCanSplitKpi[employeeId] = {}
    isCanSplitKpi[employeeId]['NOT_FLAG'] = true
    const kpiOfEmployee = kpiOfEmployees[employeeId]

    for (let kpiType in kpiOfEmployee) {
      if (kpiOfEmployee[kpiType] * 2 >= minimumKpi[kpiType]) {
        // Nếu có 1 thằng KPI là có thể gán task
        isCanSplitKpi[employeeId]['NOT_FLAG'] = false
      }
    }
    for (let kpiType in kpiOfEmployee) {
      isCanSplitKpi[employeeId][kpiType] = 0
      if (!isCanSplitKpi[employeeId]['NOT_FLAG']) {
        if (kpiOfEmployee[kpiType] * 2 < minimumKpi[kpiType]) {
          isCanSplitKpi[employeeId][kpiType] = 1
          totalToSplit[kpiType]['TOTAL'] += kpiOfEmployee[kpiType]
        } else {
          totalToSplit[kpiType]['COUNT'] += 1
        }
      } else {
        totalToSplit[kpiType]['COUNT'] += 1
      }
    }
  }

  for (let kpiType in totalToSplit) {
    totalToSplit[kpiType]['VALUE'] = 0
    if (totalToSplit[kpiType]['COUNT']) {
      totalToSplit[kpiType]['VALUE'] = totalToSplit[kpiType]['TOTAL'] / totalToSplit[kpiType]['COUNT']
    } 
  }

  for (let employeeId in kpiOfEmployees) {
    const kpiOfEmployee = kpiOfEmployees[employeeId]
    
    for (let kpiType in kpiOfEmployee) {
      if (isCanSplitKpi[employeeId][kpiType]) {
        kpiOfEmployee[kpiType] = 0
      } else {
        kpiOfEmployee[kpiType] += totalToSplit[kpiType]['VALUE']
      }
    }
  }
  return kpiOfEmployees
}

function splitKPIToEmployeesByKMeans(tasks, clusters, employees, kpiTarget) {
  // Calculate cluster scores
  const clusterScores = calculateClusterScores(clusters);

  // Create cluster data
  const clusterData = createClusterData(clusters, clusterScores);
  // Print cluster data
  const kpiOfEmployees = {}
  employees.forEach((employee) => {
    kpiOfEmployees[employee.id] = {}
    for (let key in KPI_TYPES) {
      kpiOfEmployees[employee.id][key] = 0
    }
    // kpiOfEmployees[employee.id]['total'] = 0
  })

  tasks.forEach((task) => {
    const kpiSplitInTask = splitKPIOfTaskToEmployees(task, kpiTarget, clusterData)
    // console.log("kpiSplitInTask: ", kpiSplitInTask)
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
  return kpiOfEmployees
}

// const kpiTarget = {
//   'A': { value: 0.8, weight: 0.35 },
//   'B': { value: 0.8, weight: 0.35 },
//   'C': { value: 0.8, weight: 0.3 },
// }

// const kpiOfEmployees_1 = splitKPIToEmployeesByKMeans(job.tasks, clusters, employees, kpiTarget) 
// const kpiOfEmployees_2 = splitKPIToEmployees(job.tasks, employees, kpiTarget)
// console.log("kpiOfEmployees_1: ", kpiOfEmployees_1)
// console.log("kpiOfEmployees_2: ", kpiOfEmployees_2)


function calculateEuclidWithSomeProperties(qualities1, qualities2) {

}

function getClusterFromTask(task, employees, k) {

}

function preKMeanWithTask(task, employees, k) {

}

function splitKPIOfTaskToEmployeesWithPreKMean(employees, tasks) {

}

module.exports = {
  kMeansWithEmployees,
  splitKPIToEmployeesByKMeans,
  findBestMiniKPIOfTasks,
  reSplitKPIOfEmployees
}