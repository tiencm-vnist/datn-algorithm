const tasks = [
  {
    id: 1,
    name: "Phân tích yêu cầu khách hàng",
    code: "A1",
    preceedingTasks: [14],
    startTime: null,
    endTime: null,
    tags: ['analysis'],
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
        weight: 0.228,
      }
    ]
  },
  {
    id: 2,
    code: "A21",
    name: "Dựng codebase React-NodeJS",
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
    tags: ['backend', 'frontend'],
    estimateTime: 7,
    requireAssign: {
      backend: 2,
      frontend: 1,
      docker: 1,
      year_of_exp: 1,
    },
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 0.086,
      }
    ]
  },
  {
    id: 3,
    code: "A22",
    name: "Dựng trang phân bổ nguồn lực dự án",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    tags: ['frontend'],
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
    },
    estimateTime: 6,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 0.086,
      }
    ]
  },
  {
    id: 4,
    code: "A23",
    name: "Dựng giao diện module quản lý thẻ",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    tags: ['frontend'],
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
      backend: 1,
      frontend: 2,
      year_of_exp: 1
    },
    estimateTime: 8,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 0.114,
      }
    ]
  },
  {
    id: 5,
    code: "A3",
    name: "Triển khai hệ thống DXClan lên server",
    preceedingTasks: [12],
    startTime: null,
    endTime: null,
    tags: ['devops'],
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
      ci_cd: 2,
      docker: 2,
      year_of_exp: 1
    },
    estimateTime: 5,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 0.171,
      }
    ]
  },
  {
    id: 6,
    code: "B1",
    name: "Tạo kế hoạch kiểm thử các chức năng",
    preceedingTasks: [10],
    startTime: null,
    endTime: null,
    tags: ['testing'],
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
      manual_test: 2,
      unit_test: 1
    },
    estimateTime: 1,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 0.143,
      }
    ]
  },
  {
    id: 7,
    code: "B2",
    name: "Kiểm thử luồng phân bổ nguồn lực",
    preceedingTasks: [2, 3, 4, 9, 16, 17, 18],
    startTime: null,
    endTime: null,
    tags: ['testing'],
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 3}
        ]
      },
    ],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    estimateTime: 5,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 0.143,
      }
    ]
  },
  {
    id: 8,
    code: "B3",
    name: "Sửa lỗi các module yêu cầu",
    preceedingTasks: [7],
    startTime: null,
    endTime: null,
    tags: ['frontend', 'backend'],
    requireAsset: [
      { 
        type: "Table", 
        number: 1, 
        quality: [
          { level: 2}
        ]
      },
    ],
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
        weight: 0.286,
      }
    ]
  },
  {
    id: 9,
    code: "B4",
    name: "Viết kịch bản thử nghiệm cho luồng phân bổ nguồn lực",
    preceedingTasks: [13],
    startTime: null,
    endTime: null,
    tags: ['testing'],
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
      degree: 2,
      unit_test: 2,
    },
    estimateTime: 2,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 0.143,
      }
    ]
  },
  {
    id: 10,
    code: "C1",
    name: "Lập kế hoạch cho dự án",
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    tags: ['planning'],
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
      degree: 2
    },
    estimateTime: 1,
    kpiInTask: [
      {
        id: 2,
        type: "B",
        weight: 0.285,
      }
    ]
  },
  {
    id: 11,
    code: "D1",
    name: "Thu thập phản hồi của khách hàng",
    preceedingTasks: [8],
    startTime: null,
    endTime: null,
    tags: ['collecting_data'],
    requireAsset: [
      { 
        type: "Pantry", 
        number: 1, 
        quality: [
          { level: 1}
        ]
      },
    ],
    requireAssign: {
      english: 5
    },
    estimateTime: 2,
    kpiInTask: [
      {
        id: 3,
        type: "C",
        weight: 0.333,
      }
    ]
  },
  {
    id: 12,
    code: "D2",
    name: "Điều chỉnh chức năng phân bổ nguồn lực",
    preceedingTasks: [11],
    startTime: null,
    endTime: null,
    tags: ['backend', 'frontend'],
    requireAsset: [
      { 
        type: "Server", 
        number: 1, 
        quality: [
          { level: 3 }
        ]
      },
    ],
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
        weight: 0.167,
      }
    ]
  },
  {
    id: 13,
    name: "Đề xuất ý cho bài toán phân bổ nguồn lực",
    code: "E1",
    preceedingTasks: [1],
    startTime: null,
    endTime: null,
    tags: ['idea'],
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
        weight: 0.166,
      }
    ]
  },
  {
    id: 14,
    code: "F1",
    name: "Lập tài liệu thuyết trình với các bên liên quan",
    preceedingTasks: [],
    startTime: null,
    endTime: null,
    tags: ['document'],
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
        weight: 0.167,
      }
    ]
  },
  {
    id: 15,
    code: "F2",
    name: "Viết tài liệu công nghệ sử dụng",
    preceedingTasks: [5],
    startTime: null,
    endTime: null,
    tags: ['document'],
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
        weight: 0.167,
      }
    ]
  },
  {
    id: 16,
    code: "A24",
    name: "Dựng các trang thêm, sửa, xóa dự án",
    preceedingTasks: [2, 13],
    startTime: null,
    endTime: null,
    tags: ['frontend'],
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 2}
        ]
      },
    ],
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
        weight: 0.143,
      }
    ]
  },
  {
    id: 17,
    code: "A25",
    name: "Lập trình service mô đun quản lý dự án",
    preceedingTasks: [3, 13],
    startTime: null,
    endTime: null,
    tags: ['backend'],
    requireAsset: [
      { 
        type: "Laptop", 
        number: 1, 
        quality: [
          { level: 2}
        ]
      },
    ],
    requireAssign: {
      backend: 2,
      frontend: 2
    },
    estimateTime: 7,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 0.086,
      }
    ]
  },
  {
    id: 18,
    code: "A26",
    name: "Ghép API mô đun quản lý dự án",
    preceedingTasks: [4, 13],
    startTime: null,
    endTime: null,
    tags: ['frontend', 'backend'],
    requireAsset: [
      {
        type: "Laptop",
        number: 1,
        quality: [
          { level: 1 }
        ]
      },
    ],
    requireAssign: {
      frontend: 2,
      backend: 1,
      manual_test: 1
    },
    estimateTime: 6,
    kpiInTask: [
      {
        id: 1,
        type: "A",
        weight: 0.086,
      }
    ]
  },
]


module.exports = {
  tasks,
  // fullTasks
}

// const tasks = [
//   {
//     id: 1,
//     name: "Task 1",
//     estimateTime: 2,
//     preceedingTasks: [],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Pantry",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//     // kpiInTask: [
//     //   {
//     //     id: 1,
//     //     type: "A",
//     //     weight: 8/35,
//     //   }
//     // ]
//   },
//   {
//     id: 2,
//     name: "Task 2",
//     estimateTime: 4,
//     preceedingTasks: [1],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Table",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},

//   },
//   {
//     id: 3,
//     name: "Task 3",
//     estimateTime: 4,
//     preceedingTasks: [1],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Server",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 4,
//     name: "Task 4",
//     estimateTime: 10,
//     preceedingTasks: [2],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Table",
//         number: 1,
//         quality: [
//           {
//             level: 2
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 5,
//     name: "Task 5",
//     estimateTime: 2,
//     preceedingTasks: [3],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Laptop",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 6,
//     name: "Task 6",
//     estimateTime: 5,
//     preceedingTasks: [2, 3],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Laptop",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 7,
//     name: "Task 7",
//     estimateTime: 5,
//     preceedingTasks: [5, 6],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Server",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 8,
//     name: "Task 8",
//     estimateTime: 4,
//     preceedingTasks: [3],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Server",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 9,
//     name: "Task 9",
//     estimateTime: 6,
//     preceedingTasks: [5],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Server",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 10,
//     name: "Task 10",
//     estimateTime: 6,
//     preceedingTasks: [4, 7],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Table",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 11,
//     name: "Task 11",
//     estimateTime: 6,
//     preceedingTasks: [5, 6],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Laptop",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 12,
//     name: "Task 12",
//     estimateTime: 4,
//     preceedingTasks: [5],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Table",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 13,
//     name: "Task 13",
//     estimateTime: 4,
//     preceedingTasks: [9],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Pantry",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
//   {
//     id: 14,
//     name: "Task 14",
//     estimateTime: 5,
//     preceedingTasks: [],
//     startTime: null,
//     endTime: null,
//     requireAsset: [
//       {
//         type: "Table",
//         number: 1,
//         quality: [
//           {
//             level: 1
//           }
//         ]
//       }
//     ],
//     requireAssign: {},
//   },
// ]

// module.exports = {
//   tasks
// }