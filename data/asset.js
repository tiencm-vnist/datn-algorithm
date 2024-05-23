const assetAll = [
  {
    id: 1,
    type: "Laptop",
    code: "SW.001",
    name: "Laptop Macbook Air M1",
    qualities: [
      {
        level: 1,
      }
    ],
    costPerHour: 1.5,
    status: 'ready_to_use',
    logs: []
  },
  {
    id: 2,
    type: "Laptop",
    code: "SW.002",
    name: "Laptop Macbook Pro M1",
    qualities: [{
      level: 2,
    }],
    costPerHour: 2,
    status: 'in_use',
    usageLogs: [
      {
        startDate: new Date('2024-07-01T08:00:00.000Z'),
        endDate: new Date('2024-07-20T08:00:00.000Z')
      },
      {
        startDate: new Date('2024-07-21T02:00:00.000Z'),
        endDate: new Date('2024-08-01T08:00:00.000Z')
      },
      {
        startDate: new Date('2024-08-01T02:00:00.000Z'),
        endDate: new Date('2024-08-10T08:00:00.000Z')
      },
    ],
    logs: []
  },
  {
    id: 3,
    type: "Laptop",
    code: "SW.003",
    name: "Laptop Macbook Pro M1",
    qualities: [{
      level: 3,
    }],
    costPerHour: 4.5,
    status: 'in_use',
    logs: [],
    usageLogs: [
      {
        startDate: new Date('2024-07-01T01:00:00.000Z'),
        endDate: new Date('2024-07-13T02:00:00.000Z')
      },
      {
        startDate: new Date('2024-07-13T02:00:00.000Z'),
        endDate: new Date('2024-07-25T08:00:00.000Z')
      },
      {
        startDate: new Date('2024-07-26T02:00:00.000Z'),
        endDate: new Date('2024-08-08T08:00:00.000Z')
      },
    ],
  },
  {
    id: 4,
    type: "Server",
    name: "Server 12GB SSD",
    code: "SW.004",
    qualities: [{
      level: 3,
    }],
    costPerHour: 5,
    status: 'in_use',
    usageLogs: [
      {
        startDate: new Date('2024-07-01T08:00:00.000Z'),
        endDate: new Date('2024-07-15T08:00:00.000Z')
      },
      {
        startDate: new Date('2024-07-16T01:00:00.000Z'),
        endDate: new Date('2024-08-18T08:00:00.000Z')
      },
      {
        startDate: new Date('2024-08-19T01:00:00.000Z'),
        endDate: new Date('2024-09-24T08:00:00.000Z')
      },
    ],
    logs: []
  },
  {
    id: 5,
    type: "Server",
    name: "Server 16GB SSD",
    code: "SW.005",
    qualities: [{
      level: 4,
    }],
    costPerHour: 7.5,
    status: 'ready_to_use',
    logs: []
  },
  {
    id: 6,
    type: "Pantry",
    code: "SW.007",
    name: "Phòng họp B1-704",
    qualities: [{
      level: 4,
    }],
    costPerHour: 0.5,
    status: 'ready_to_use',
    logs: [],
  },
  {
    id: 7,
    type: "Table",
    code: "SW.008",
    name: "Bàn 1",
    qualities: [{
      level: 2,
    }],
    costPerHour: 1.5,
    status: 'ready_to_use',
    logs: []
  },
  {
    id: 8,
    code: "SW.009",
    type: "Table",
    name: "Bàn 2",
    qualities: [{
      level: 1,
    }],
    costPerHour: 1,
    status: 'ready_to_use',
    logs: []
  },
  {
    id: 9,
    type: "Table",
    code: "SW.010",
    name: "Bàn 3",
    qualities: [{
      level: 3,
    }],
    costPerHour: 2,
    status: 'in_use',
    logs: [],
    usageLogs: [
      {
        startDate: new Date('2024-07-01T06:00:00.000Z'),
        endDate: new Date('2024-08-12T05:00:00.000Z')
      },
      {
        startDate: new Date('2024-08-12T05:00:00.000Z'),
        endDate: new Date('2024-09-08T05:00:00.000Z')
      },
    ]
  },
]

const listAssetInUse = assetAll.filter((item) => item.status === 'in_use')
const listAssetReadyToUse = assetAll.filter((item) => item.status === 'ready_to_use')

const assets = {
  inUse: listAssetInUse,
  readyToUse: listAssetReadyToUse
}

module.exports = {
  assets,
  assetAll
}

// const assetAll = [
//   {
//     id: 1,
//     type: "Laptop",
//     name: "Laptop 1",
//     qualities: [
//       {
//         level: 1,
//       }
//     ],
//     costPerHour: 1.5,
//     status: 'ready_to_use',
//     logs: []
//   },
//   {
//     id: 2,
//     type: "Laptop",
//     name: "Laptop 2",
//     qualities: [{
//       level: 2,
//     }],
//     costPerHour: 2,
//     status: 'ready_to_use',
//     logs: []
//   },
//   {
//     id: 3,
//     type: "Server",
//     name: "Server 1",
//     qualities: [{
//       level: 1,
//     }],
//     costPerHour: 5,
//     status: 'ready_to_use',
//     logs: []
//   },
//   {
//     id: 4,
//     type: "Pantry",
//     name: "Pantry 1",
//     qualities: [{
//       level: 4,
//     }],
//     costPerHour: 0.5,
//     status: 'in_use',
//     logs: [],
//     usageLogs: [
//       {
//         startDate: new Date('2024-04-01T05:00:00.000Z'),
//         endDate: new Date('2024-05-12T05:00:00.000Z')
//       }
//     ]
//   },
//   {
//     id: 5,
//     type: "Table",
//     name: "Table 1",
//     qualities: [{
//       level: 2,
//     }],
//     costPerHour: 1.5,
//     status: 'ready_to_use',
//     logs: []
//   },
//   {
//     id: 6,
//     type: "Table",
//     name: "Table 2",
//     qualities: [{
//       level: 1,
//     }],
//     costPerHour: 1,
//     status: 'ready_to_use',
//     logs: []
//   },
// ]

// const listAssetInUse = assetAll.filter((item) => item.status === 'in_use')
// const listAssetReadyToUse = assetAll.filter((item) => item.status === 'ready_to_use')

// const assets = {
//   inUse: listAssetInUse,
//   readyToUse: listAssetReadyToUse
// }

// module.exports = {
//   assets,
//   assetAll
// }

