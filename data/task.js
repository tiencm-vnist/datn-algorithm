let tasks = [
  {
    id: 1,
    name: "A1",
    preceedingTasks: [14],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: [
      "Leader", 
      "QA"
    ],
    estimateTime: 2
  },
  {
    id: 2,
    name: "A21",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Leader"],
    estimateTime: 14
  },
  {
    id: 3,
    name: "A22",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Leader"],
    estimateTime: 14
  },
  {
    id: 4,
    name: "A23",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Leader"],
    estimateTime: 14
  },
  {
    id: 5,
    name: "A3",
    preceedingTasks: [12],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Leader"],
    estimateTime: 5
  },
  {
    id: 6,
    name: "B1",
    preceedingTasks: [10],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["QA", "Tester"],
    estimateTime: 1
  },
  {
    id: 7,
    name: "B2",
    preceedingTasks: [2, 3, 4, 9],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Tester", "Leader", "QA"],
    estimateTime: 5
  },
  {
    id: 8,
    name: "B3",
    preceedingTasks: [7],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Leader"],
    estimateTime: 7
  },
  {
    id: 9,
    name: "B4",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Tester"],
    estimateTime: 2
  },
  {
    id: 10,
    name: "C1",
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Leader", "QA"],
    estimateTime: 1
  },
  {
    id: 11,
    name: "D1",
    preceedingTasks: [8],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Tester", "QA"],
    estimateTime: 2
  },
  {
    id: 12,
    name: "D2",
    preceedingTasks: [11],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Leader"],
    estimateTime: 4
  },
  {
    id: 13,
    name: "E1",
    preceedingTasks: [1],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev", "Tester", "Leader", "QA"],
    estimateTime: 2
  },
  {
    id: 14,
    name: "F1",
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["QA"],
    estimateTime: 1.5,
  },
  {
    id: 15,
    name: "F2",
    preceedingTasks: [5],
    startTime: null,
    endTime: null,
    requireAsset: [],
    requireAssign: ["Dev"],
    estimateTime: 1
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

const fullTasks = [
  {
    id: 14,
    name: 'F1',
    preceedingTasks: [],
    startTime: new Date('2024-04-20T17:00:00.000Z'),
    endTime: new Date('2024-04-22T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['QA'],
    estimateTime: 1.5
  },
  {
    id: 10,
    name: 'C1',
    preceedingTasks: [],
    startTime: new Date('2024-04-20T17:00:00.000Z'),
    endTime: new Date('2024-04-21T17:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Leader', 'QA'],
    estimateTime: 1
  },
  {
    id: 6,
    name: 'B1',
    preceedingTasks: [10],
    startTime: new Date('2024-04-21T17:00:00.000Z'),
    endTime: new Date('2024-04-22T17:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['QA', 'Tester'],
    estimateTime: 1
  },
  {
    id: 1,
    name: 'A1',
    preceedingTasks: [14],
    startTime: new Date('2024-04-22T05:00:00.000Z'),
    endTime: new Date('2024-04-24T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Leader', 'QA'],
    estimateTime: 2
  },
  {
    id: 13,
    name: 'E1',
    preceedingTasks: [1],
    startTime: new Date('2024-04-24T05:00:00.000Z'),
    endTime: new Date('2024-04-26T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Tester', 'Leader', 'QA'],
    estimateTime: 2
  },
  {
    id: 2,
    name: 'A21',
    preceedingTasks: [13],
    startTime: new Date('2024-04-26T05:00:00.000Z'),
    endTime: new Date('2024-05-10T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Leader'],
    estimateTime: 14
  },
  {
    id: 3,
    name: 'A22',
    preceedingTasks: [13],
    startTime: new Date('2024-04-26T05:00:00.000Z'),
    endTime: new Date('2024-05-10T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Leader'],
    estimateTime: 14
  },
  {
    id: 4,
    name: 'A23',
    preceedingTasks: [13],
    startTime: new Date('2024-04-26T05:00:00.000Z'),
    endTime: new Date('2024-05-10T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Leader'],
    estimateTime: 14
  },
  {
    id: 9,
    name: 'B4',
    preceedingTasks: [13],
    startTime: new Date('2024-04-26T05:00:00.000Z'),
    endTime: new Date('2024-04-28T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Tester'],
    estimateTime: 2
  },
  {
    id: 7,
    name: 'B2',
    preceedingTasks: [2, 3, 4, 9],
    startTime: new Date('2024-05-10T05:00:00.000Z'),
    endTime: new Date('2024-05-15T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Tester', 'Leader', 'QA'],
    estimateTime: 5
  },
  {
    id: 8,
    name: 'B3',
    preceedingTasks: [7],
    startTime: new Date('2024-05-15T05:00:00.000Z'),
    endTime: new Date('2024-05-22T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Leader'],
    estimateTime: 7
  },
  {
    id: 11,
    name: 'D1',
    preceedingTasks: [8],
    startTime: new Date('2024-05-22T05:00:00.000Z'),
    endTime: new Date('2024-05-24T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Tester', 'QA'],
    estimateTime: 2
  },
  {
    id: 12,
    name: 'D2',
    preceedingTasks: [11],
    startTime: new Date('2024-05-24T05:00:00.000Z'),
    endTime: new Date('2024-05-28T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Leader'],
    estimateTime: 4
  },
  {
    id: 5,
    name: 'A3',
    preceedingTasks: [12],
    startTime: new Date('2024-05-28T05:00:00.000Z'),
    endTime: new Date('2024-06-02T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev', 'Leader'],
    estimateTime: 5
  },
  {
    id: 15,
    name: 'F2',
    preceedingTasks: [5],
    startTime: new Date('2024-06-02T05:00:00.000Z'),
    endTime: new Date('2024-06-03T05:00:00.000Z'),
    requireAsset: [],
    requireAssign: ['Dev'],
    estimateTime: 1
  }
];


module.exports = {
  tasks,
  fullTasks
}