const employees = [
  {
    id: 1, 
    name: "Leader A",
    position: "Leader",
    tags: [],
    level: 5,
    costPerHour: 10,
    qualities: {
      degree: 4,
      year_of_exp: 5,
      english: 4,
      // level: 5,
      backend: 5,
      frontend: 3,
      docker: 4,
      ci_cd: 4,
      unit_test: 1,
      manual_test: 1,
      automation_test: 3,
    },
    capacity: 85
  },
  {
    id: 2, 
    name: "Dev A Middle",
    position: "Dev",
    tags: [],
    level: 3,
    costPerHour: 7.5,
    qualities: {
      degree: 3,
      year_of_exp: 4,
      english: 3,
      // level: 4,
      backend: 4,
      ci_cd: 3,
      frontend: 3,
      docker: 4,
      automation_test: 4,
      unit_test: 2,
      manual_test: 1,
    },
    capacity: 70
  },
  {
    id: 3, 
    name: "Dev B Junior",
    position: "Dev",
    tags: [],
    level: 2,
    costPerHour: 5,
    qualities: {
      degree: 2,
      year_of_exp: 2,
      english: 3,
      // level: 3,
      backend: 3,
      ci_cd: 2,
      frontend: 2,
      docker: 2,
      automation_test: 3,
      unit_test: 1,
      manual_test: 1,
    },
    capacity: 40
  },
  {
    id: 7, 
    name: "Dev B1 Junior",
    position: "Dev",
    tags: [],
    level: 2,
    costPerHour: 5,
    qualities: {
      degree: 3,
      year_of_exp: 2,
      english: 4,
      // level: 3,
      backend: 2,
      frontend: 3,
      automation_test: 2,
      docker: 2,
      ci_cd: 2,
      unit_test: 2,
      manual_test: 1,
    },
    capacity: 45
  },
  {
    id: 4, 
    name: "Dev C Fresher",
    position: "Dev",
    tags: [],
    level: 1,
    costPerHour: 2.5,
    qualities: {
      degree: 2,
      year_of_exp: 1,
      english: 3,
      // level: 1,
      backend: 2,
      ci_cd: 1,
      frontend: 2,
      docker: 2,
      unit_test: 2,
      manual_test: 1,
    },
    capacity: 22
  },
  {
    id: 8, 
    name: "Dev C2 Fresher",
    position: "Dev",
    tags: [],
    level: 1,
    costPerHour: 2.5,
    qualities: {
      degree: 2,
      english: 4,
      // level: 1,
      backend: 1,
      frontend: 3,
      docker: 1,
      year_of_exp: 1,
      unit_test: 2,
      manual_test: 1,
    },
    capacity: 19
  },
  {
    id: 5,
    name: "Tester A",
    position: "Tester",
    tags: [],
    level: 2,
    costPerHour: 3.75,
    qualities: {
      degree: 2,
      year_of_exp: 2,
      english: 5,
      // level: 2,
      manual_test: 5,
      automation_test: 3,
      unit_test: 4,
    },
    capacity: 35
  },
  {
    id: 6,
    name: 'BrSE A',
    position: "QA",
    tags: [],
    level: 4,
    costPerHour: 4.375,
    qualities: {
      degree: 2,
      year_of_exp: 3,
      english: 6,
      // level: 2,
      manual_test: 4,
      automation_test: 2,
      unit_test: 3,
    },
    capacity: 70
  }
]

const lastKPIs = [
  
]

module.exports = {
  employees
}