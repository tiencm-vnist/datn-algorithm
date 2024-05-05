const employees = [
  {
    id: 1, 
    name: "Emp A",
    position: "Leader",
    tags: [],
    level: 5,
    costPerHour: 12,
    qualities: {
      degree: 4,
      year_of_exp: 5,
      english: 4,
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
    name: "Emp B",
    position: "Dev",
    tags: [],
    level: 3,
    costPerHour: 11,
    qualities: {
      degree: 3,
      year_of_exp: 4,
      english: 3,
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
    name: "Emp C",
    position: "Dev",
    tags: [],
    level: 2,
    costPerHour: 11.5,
    qualities: {
      degree: 2,
      year_of_exp: 2,
      english: 3,
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
    id: 4, 
    name: "Emp D",
    position: "Dev",
    tags: [],
    level: 2,
    costPerHour: 13,
    qualities: {
      degree: 2,
      year_of_exp: 2,
      english: 3,
      backend: 3,
      ci_cd: 2,
      frontend: 2,
      docker: 2,
      automation_test: 2,
      unit_test: 1,
      manual_test: 1,
    },
    capacity: 40
  },
]

module.exports = {
  employees
}