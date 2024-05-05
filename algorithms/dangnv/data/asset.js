const assetAll = [
  {
    id: 1,
    type: "Laptop",
    name: "Laptop 1",
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
    name: "Laptop 2",
    qualities: [{
      level: 2,
    }],
    costPerHour: 2,
    status: 'ready_to_use',
    logs: []
  },
  {
    id: 3,
    type: "Server",
    name: "Server 1",
    qualities: [{
      level: 1,
    }],
    costPerHour: 5,
    status: 'ready_to_use',
    logs: []
  },
  {
    id: 4,
    type: "Pantry",
    name: "Pantry 1",
    qualities: [{
      level: 4,
    }],
    costPerHour: 0.5,
    status: 'in_use',
    logs: [],
    usageLogs: [
      {
        startDate: new Date('2024-04-01T05:00:00.000Z'),
        endDate: new Date('2024-05-12T05:00:00.000Z')
      }
    ]
  },
  {
    id: 5,
    type: "Table",
    name: "Table 1",
    qualities: [{
      level: 2,
    }],
    costPerHour: 1.5,
    status: 'ready_to_use',
    logs: []
  },
  {
    id: 6,
    type: "Table",
    name: "Table 2",
    qualities: [{
      level: 1,
    }],
    costPerHour: 1,
    status: 'ready_to_use',
    logs: []
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

