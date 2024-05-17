const KPI_INIT_TYPES = {
  "A": {
    value: 0,
    weight: 0.35
  },
  "B": {
    value: 0,
    weight: 0.35
  },
  "C": {
    value: 0,
    weight: 0.3
  },
}

const KPI_TYPES = {
  "A": {
    weight: 0.35
  },
  "B": {
    weight: 0.35
  },
  "C": {
    weight: 0.3
  },
}


const KPI_NOT_WORK = -1
const DAY_WORK_HOURS = 8
const KPI_OF_ASSET_IN_TASK = 1

module.exports = {
  KPI_INIT_TYPES,
  KPI_NOT_WORK,
  DAY_WORK_HOURS,
  KPI_TYPES,
  KPI_OF_ASSET_IN_TASK
}