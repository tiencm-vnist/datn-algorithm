
const { tasks } = require('../data/task');
const { assets } = require('../data/asset');
const { employees } = require('../data/employee');

  
const START_DATE = new Date()
START_DATE.setFullYear(2024, 7, 1)
START_DATE.setHours(0, 0, 0, 0)

const END_DATE = new Date()
END_DATE.setFullYear(2024, 10, 1)
END_DATE.setHours(0, 0, 0, 0)

// For DLHS
const BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 3, Max_FEs = 20000, FEs = 0, R = 100, HMS = 60
const DLHS_Arguments = {
  HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs
}

// For HS
const bw = 1, maxIter = 20000, hmSize = 60, PAR = 0.5, HMCR = 0.95
const HS_Arguments = {
  bw, maxIter, hmSize, PAR, HMCR
}

const assetHasKPIWeight = 0.1
const kpiTarget = {
  'A': { value: 0.88, weight: 0.35 },
  'B': { value: 0.91, weight: 0.35 },
  'C': { value: 0.91, weight: 0.3 },
}

const project = {
  startTime: START_DATE,
  endTime: END_DATE,
  tasks: tasks,
  kpiTarget: kpiTarget,
  employees: employees,
  assets: assets
}


module.exports = {
  project,
  assetHasKPIWeight,
  DLHS_Arguments,
  HS_Arguments
}