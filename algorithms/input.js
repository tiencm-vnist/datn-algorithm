
const { tasks } = require('../data/task');
const { assets } = require('../data/asset');
const { employees } = require('../data/employee');

  
const START_DATE = new Date()
START_DATE.setFullYear(2024, 7, 1)
START_DATE.setHours(0, 0, 0, 0)

const END_DATE = new Date()
END_DATE.setFullYear(2024, 10, 1)
END_DATE.setHours(0, 0, 0, 0)

const BW_max = 2, BW_min = 1, PSLSize = 5, numOfSub = 4, Max_FEs = 10000, FEs = 0, R = 100, HMS = 60
const kpiTarget = {
  'A': { value: 0.88, weight: 0.35 },
  'B': { value: 0.91, weight: 0.35 },
  'C': { value: 0.91, weight: 0.3 },
}


const DLHS_Arguments = {
  HMS, BW_max, BW_min, PSLSize, numOfSub, R, Max_FEs
}

const assetHasKPIWeight = 0.1

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
  DLHS_Arguments
}