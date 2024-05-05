const tasks = [
  {
    id: 1,
    name: "Task 1",
    estimateTime: 2,
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Pantry",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
    // kpiInTask: [
    //   {
    //     id: 1,
    //     type: "A",
    //     weight: 8/35,
    //   }
    // ]
  },
  {
    id: 2,
    name: "Task 2",
    estimateTime: 4,
    preceedingTasks: [1],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Table",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},

  },
  {
    id: 3,
    name: "Task 3",
    estimateTime: 4,
    preceedingTasks: [1],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Server",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 4,
    name: "Task 4",
    estimateTime: 10,
    preceedingTasks: [2],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Table",
        number: 1,
        quality: [
          {
            level: 2
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 5,
    name: "Task 5",
    estimateTime: 2,
    preceedingTasks: [3],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Laptop",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 6,
    name: "Task 6",
    estimateTime: 5,
    preceedingTasks: [2, 3],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Laptop",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 7,
    name: "Task 7",
    estimateTime: 5,
    preceedingTasks: [5, 6],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Server",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 8,
    name: "Task 8",
    estimateTime: 4,
    preceedingTasks: [3],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Server",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 9,
    name: "Task 9",
    estimateTime: 6,
    preceedingTasks: [5],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Server",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 10,
    name: "Task 10",
    estimateTime: 6,
    preceedingTasks: [4, 7],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Table",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 11,
    name: "Task 11",
    estimateTime: 6,
    preceedingTasks: [5, 6],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Laptop",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 12,
    name: "Task 12",
    estimateTime: 4,
    preceedingTasks: [5],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Table",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 13,
    name: "Task 13",
    estimateTime: 4,
    preceedingTasks: [9],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Pantry",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
  {
    id: 14,
    name: "Task 14",
    estimateTime: 5,
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    requireAsset: [
      {
        type: "Table",
        number: 1,
        quality: [
          {
            level: 1
          }
        ]
      }
    ],
    requireAssign: {},
  },
]

module.exports = {
  tasks
}