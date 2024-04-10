const tasks = [
  {
    id: 1,
    name: "A1",
    preceedingTasks: [14],
    startTime: null,
    endTime: null,
    requireAsset: [
      // { type: "Server", number: 1, technicalCapacity: 75 },
      // { 
      //   type: "Laptop", 
      //   number: 1, 
      //   quality: [
      //     { level: 1}
      //   ]
      // },
      { 
        type: "Pantry",
        number: 1, 
        quality: [
          {
            level: 2
          }
        ]
      }
    ],
    requireAssign: {
      // degree: 2,
      english: 2,
      year_of_exp: 2
    },
    estimateTime: 7,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 8/35,
      }
    ]
  },
  {
    id: 2,
    name: "A21",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 2}
        ]
      },
    ],
    estimateTime: 7,
    // requireAssign: {
    //   degree: {
    //     name: "Bachelor",
    //     value: 2,
    //   },
    //   skills: [
    //     { name: "Backend", value: 3},
    //     { name: "Frontend", value: 1},
    //     { name: "Docker", value: 1}
    //   ],
    //   yearOfExp: {
    //     name: 1,
    //     value: 1
    //   }
    // },
    requireAssign: {
      degree: 2,
      backend: 2,
      frontend: 1,
      docker: 1,
      year_of_exp: 1,
    },
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 3/35,
      }
    ]
  },
  {
    id: 3,
    name: "A22",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    requireAssign: {
      degree: 2,
      frontend: 2,
      // ],
      // yearOfExp: {
      //   name: 1,
      //   value: 1
      // }
    },
    estimateTime: 6,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 3/35,
      }
    ]
  },
  {
    id: 4,
    name: "A23",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 2 }
        ]
      },
    ],
    requireAssign: {
      degree: 2,
      backend: 1,
      frontend: 2,
      year_of_exp: 1
    },
    estimateTime: 8,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 4/35,
      }
    ]
  },
  {
    id: 5,
    name: "A3",
    preceedingTasks: [12],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Server", 
        number: 1, 
        quality: [
          { level: 2 }
        ] 
      },
    ],
    requireAssign: {
      degree: 2,
      ci_cd: 2,
      docker: 2,
      year_of_exp: 1
    },
    estimateTime: 5,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 6/35,
      }
    ]
  },
  {
    id: 6,
    name: "B1",
    preceedingTasks: [10],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    // requireAssign: ["QA", "Tester"],
    requireAssign: {
      manual_test: 2,
      unit_test: 1
    },
    estimateTime: 1,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 5/35,
      }
    ]
  },
  {
    id: 7,
    name: "B2",
    preceedingTasks: [2, 3, 4, 9, 16, 17, 18],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 3}
        ]
      },
    ],
    // requireAssign: ["Dev", "Tester", "Leader", "QA"],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
    },
    estimateTime: 5,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 5/35,
      }
    ]
  },
  {
    id: 8,
    name: "B3",
    preceedingTasks: [7],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 2}
        ]
      },
    ],
    // requireAssign: ["Dev", "Leader"],
    requireAssign: {
      backend: 2,
      frontend: 1,
      year_of_exp: 1
    },
    estimateTime: 7,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 10/35,
      }
    ]
  },
  {
    id: 9,
    name: "B4",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    // requireAssign: ["Dev", "Tester"],
    requireAssign: {
      degree: 2,
      unit_test: 2
    },
    estimateTime: 2,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 5/35,
      }
    ]
  },
  {
    id: 10,
    name: "C1",
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    requireAssign: {
      year_of_exp: 3,

    },
    estimateTime: 1,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 10/35,
      }
    ]
  },
  {
    id: 11,
    name: "D1",
    preceedingTasks: [8],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Pantry", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    // requireAssign: ["Tester", "QA"],
    requireAssign: {
      english: 5
    },
    estimateTime: 2,
    kpiInTask: [
      {
        id: 3,
        type: "C",
        weight: 10/30,
      }
    ]
  },
  {
    id: 12,
    name: "D2",
    preceedingTasks: [11],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Server", 
        number: 1, 
        quality: [
          { level: 3 }
        ]
      },
    ],
    // requireAssign: ["Dev", "Leader"],
    requireAssign: {
      year_of_exp: 2,
      ci_cd: 2,
      backend: 2
    },
    estimateTime: 4,
    kpiInTask: [
      {
        id: 3,
        type: "C",
        weight: 5/30,
      }
    ]
  },
  {
    id: 13,
    name: "E1",
    preceedingTasks: [1],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    requireAssign: {
      year_of_exp: 2,
      english: 3
    },
    estimateTime: 2,
    kpiInTask: [
      {
        id: 3,
        type: "C",
        weight: 5/30,
      }
    ]
  },
  {
    id: 14,
    name: "F1",
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    requireAssign: {
      year_of_exp: 2,
      english: 5
    },
    estimateTime: 1.5,
    kpiInTask: [
      {
        id: 3,
        type: "C",
        weight: 5/30,
      }
    ]
  },
  {
    id: 15,
    name: "F2",
    preceedingTasks: [5],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      ci_cd: 2,
      frontend: 2,
      docker: 2,
    },
    estimateTime: 1,
    kpiInTask: [
      {
        id: 3,
        type: "C",
        weight: 5/30,
      }
    ]
  },
  {
    id: 16,
    name: "A24",
    preceedingTasks: [2, 13],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 2}
        ]
      },
    ],
    // requireAssign: ["Dev", "Leader"],
    requireAssign: {
      year_of_exp: 1,
      backend: 1,
      frontend: 2
    },
    estimateTime: 8,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 5/35,
      }
    ]
  },
  {
    id: 17,
    name: "A25",
    preceedingTasks: [3, 13],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 2}
        ]
      },
    ],
    // requireAssign: ["Dev", "Leader"],
    requireAssign: {
      backend: 1,
      frontend: 2
    },
    estimateTime: 7,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 3/35,
      }
    ]
  },
  {
    id: 18,
    name: "A26",
    preceedingTasks: [4, 13],
    startTime: null,
    endTime: null,
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    // requireAssign: ["Dev", "Leader"],
    requireAssign: {
      frontend: 3,
    },
    estimateTime: 6,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 3/35,
      }
    ]
  },
  // {
  //   id: 16,
  //   name: "F19",
  //   preceedingTasks: [],
  //   startTime: null,
  //   endTime: null,
  //   requireAsset: [],
  //   estimateTime: 2.7
  // },
  // {
  //   id: 17,
  //   name: "F20",
  //   preceedingTasks: [19],
  //   startTime: null,
  //   endTime: null,
  //   requireAsset: [],
  //   estimateTime: 1.7
  // },
];

// tasks = [
//   {
//     id: 1,
//     name: "A1",
//     preceedingTasks: [],
//     startTime: null,
//     endTime: null,
//     requireAsset: [],
//     estimateTime: 1.7
//   },
//   {
//     id: 2,
//     name: "A2",
//     preceedingTasks: [1],
//     startTime: null,
//     endTime: null,
//     requireAsset: [],
//     estimateTime: 1.7
//   },
//   {
//     id: 3,
//     name: "A3",
//     preceedingTasks: [1,2],
//     startTime: null,
//     endTime: null,
//     requireAsset: [],
//     estimateTime: 1.7
//   },
// ]

// const fullTasks = [
//   {
//     id: 14,
//     name: 'F1',
//     preceedingTasks: [],
//     startTime: new Date('2024-04-20T17:00:00.000Z'),
//     endTime: new Date('2024-04-22T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['QA'],
//     estimateTime: 1.5
//   },
//   {
//     id: 10,
//     name: 'C1',
//     preceedingTasks: [],
//     startTime: new Date('2024-04-20T17:00:00.000Z'),
//     endTime: new Date('2024-04-21T17:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Leader', 'QA'],
//     estimateTime: 1
//   },
//   {
//     id: 6,
//     name: 'B1',
//     preceedingTasks: [10],
//     startTime: new Date('2024-04-21T17:00:00.000Z'),
//     endTime: new Date('2024-04-22T17:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['QA', 'Tester'],
//     estimateTime: 1
//   },
//   {
//     id: 1,
//     name: 'A1',
//     preceedingTasks: [14],
//     startTime: new Date('2024-04-22T05:00:00.000Z'),
//     endTime: new Date('2024-04-24T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Leader', 'QA'],
//     estimateTime: 2
//   },
//   {
//     id: 13,
//     name: 'E1',
//     preceedingTasks: [1],
//     startTime: new Date('2024-04-24T05:00:00.000Z'),
//     endTime: new Date('2024-04-26T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Tester', 'Leader', 'QA'],
//     estimateTime: 2
//   },
//   {
//     id: 2,
//     name: 'A21',
//     preceedingTasks: [13],
//     startTime: new Date('2024-04-26T05:00:00.000Z'),
//     endTime: new Date('2024-05-10T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Leader'],
//     estimateTime: 14
//   },
//   {
//     id: 3,
//     name: 'A22',
//     preceedingTasks: [13],
//     startTime: new Date('2024-04-26T05:00:00.000Z'),
//     endTime: new Date('2024-05-10T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Leader'],
//     estimateTime: 14
//   },
//   {
//     id: 4,
//     name: 'A23',
//     preceedingTasks: [13],
//     startTime: new Date('2024-04-26T05:00:00.000Z'),
//     endTime: new Date('2024-05-10T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Leader'],
//     estimateTime: 14
//   },
//   {
//     id: 9,
//     name: 'B4',
//     preceedingTasks: [13],
//     startTime: new Date('2024-04-26T05:00:00.000Z'),
//     endTime: new Date('2024-04-28T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Tester'],
//     estimateTime: 2
//   },
//   {
//     id: 7,
//     name: 'B2',
//     preceedingTasks: [2, 3, 4, 9],
//     startTime: new Date('2024-05-10T05:00:00.000Z'),
//     endTime: new Date('2024-05-15T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Tester', 'Leader', 'QA'],
//     estimateTime: 5
//   },
//   {
//     id: 8,
//     name: 'B3',
//     preceedingTasks: [7],
//     startTime: new Date('2024-05-15T05:00:00.000Z'),
//     endTime: new Date('2024-05-22T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Leader'],
//     estimateTime: 7
//   },
//   {
//     id: 11,
//     name: 'D1',
//     preceedingTasks: [8],
//     startTime: new Date('2024-05-22T05:00:00.000Z'),
//     endTime: new Date('2024-05-24T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Tester', 'QA'],
//     estimateTime: 2
//   },
//   {
//     id: 12,
//     name: 'D2',
//     preceedingTasks: [11],
//     startTime: new Date('2024-05-24T05:00:00.000Z'),
//     endTime: new Date('2024-05-28T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Leader'],
//     estimateTime: 4
//   },
//   {
//     id: 5,
//     name: 'A3',
//     preceedingTasks: [12],
//     startTime: new Date('2024-05-28T05:00:00.000Z'),
//     endTime: new Date('2024-06-02T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev', 'Leader'],
//     estimateTime: 5
//   },
//   {
//     id: 15,
//     name: 'F2',
//     preceedingTasks: [5],
//     startTime: new Date('2024-06-02T05:00:00.000Z'),
//     endTime: new Date('2024-06-03T05:00:00.000Z'),
//     requireAsset: [],
//     requireAssign: ['Dev'],
//     estimateTime: 1
//   }
// ];


module.exports = {
  tasks,
  // fullTasks
}