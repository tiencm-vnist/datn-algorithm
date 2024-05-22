const allTasksOutOfProject = [
  // 1
  {
    id: 1,
    project: "",
    name: "Phân tích nhu cầu học ngoại ngữ của sinh viên",
    startTime: new Date('2024-07-27T08:00:00.000Z'),
    endTime: new Date('2024-08-01T04:00:00.000Z'),
    requireAssign: {},
    requireAsset: [],
    estimateTime: 4.5,
    assignee: {
      id: 1
    }
  },

  // {
  //   id: 2,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-09-24T06:00:00.000Z'),
  //   endTime: new Date('2024-09-24T10:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 1
  //   }
  // },
  {
    id: 3,
    project: "",
    name: "Phân tích yêu cầu sắp xếp lịch giảng dạy",
    startTime: new Date('2024-09-30T08:00:00.000Z'),
    endTime: new Date('2024-10-03T10:00:00.000Z'),
    estimateTime: 3.25,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 1
    }
  },
  {
    id: 4,
    project: "",
    name: "Lập kế hoạch cho dự án SSLG",
    startTime: new Date('2024-10-04T01:00:00.000Z'),
    endTime: new Date('2024-10-06T10:00:00.000Z'),
    estimateTime: 3,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 1
    }
  },

  //2
  {
    id: 5,
    project: "",
    name: "Dựng code base Java core",
    startTime: new Date('2024-07-27T02:00:00.000Z'),
    endTime: new Date('2024-08-01T10:00:00.000Z'),
    requireAssign: {},
    requireAsset: [],
    estimateTime: 5.875,
    assignee: {
      id: 2
    }
  },
  {
    id: 6,
    project: "",
    name: "Sửa lỗi chức năng Thêm vào giỏ",
    startTime: new Date('2024-08-02T01:00:00.000Z'),
    endTime: new Date('2024-08-03T08:00:00.000Z'),
    requireAssign: {},
    requireAsset: [],
    estimateTime: 1.75,
    assignee: {
      id: 2
    }
  },
  {
    id: 7,
    project: "",
    name: "Triển khai module quản lý thầu lên server",
    startTime: new Date('2024-08-03T08:00:00.000Z'),
    endTime: new Date('2024-08-08T10:00:00.000Z'),
    requireAssign: {},
    estimateTime: 5.25,
    requireAsset: [],
    assignee: {
      id: 2
    }
  },
  {
    id: 8,
    project: "",
    name: "Dựng trang giới thiệu sản phẩm",
    startTime: new Date('2024-09-24T06:00:00.000Z'),
    endTime: new Date('2024-09-24T10:00:00.000Z'),
    estimateTime: 0.5,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 2
    }
  },

  //3
  {
    id: 9,
    project: "",
    name: "Dựng giao diện module mua hàng",
    startTime: new Date('2024-07-27T01:00:00.000Z'),
    endTime: new Date('2024-08-01T08:00:00.000Z'),
    estimateTime: 5.75,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 3
    },

  },
  {
    id: 10,
    project: "",
    name: "Lập trình infra",
    startTime: new Date('2024-09-04T06:00:00.000Z'),
    endTime: new Date('2024-09-08T06:00:00.000Z'),
    estimateTime: 4,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 3
    },
  },
  {
    id: 11,
    project: "",
    name: "Kiểm thử luồng mua hàng",
    estimateTime: 2.5, 
    startTime: new Date('2024-09-08T06:00:00.000Z'),
    endTime: new Date('2024-09-10T10:00:00.000Z'),
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 3
    },
  },
  {
    id: 12,
    project: "",
    name: "Đề xuất ý tưởng cho giao diện mới",
    startTime: new Date('2024-09-23T06:00:00.000Z'),
    endTime: new Date('2024-09-24T10:00:00.000Z'),
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 3
    },
  },
  
  // 4
  {
    id: 13,
    project: "",
    name: "Dựng các màn cho module đặt lịch",
    startTime: new Date('2024-07-28T06:00:00.000Z'),
    endTime: new Date('2024-08-03T10:00:00.000Z'),
    estimateTime: 6.5,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 4
    },
  },
  {
    id: 14,
    project: "",
    name: "Lập trình trang quản lý phân quyền",
    startTime: new Date('2024-08-04T01:00:00.000Z'),
    endTime: new Date('2024-08-08T10:00:00.000Z'),
    estimateTime: 5,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 4
    },
  },
  {
    id: 16,
    project: "",
    name: "Đọc hiểu code base",
    startTime: new Date('2024-08-09T01:00:00.000Z'),
    endTime: new Date('2024-08-11T10:00:00.000Z'),
    estimateTime: 3,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 4
    },
  },
  // {
  //   id: 16,
  //   project: "Ghép API mô đun bán hàng",
  //   name: "",
  //   startTime: new Date('2024-08-09T01:00:00.000Z'),
  //   endTime: new Date('2024-08-11T10:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 4
  //   },
  // },
  {
    id: 17,
    project: "",
    name: "Ghép API mô đun bán hàng",
    estimateTime: 8,
    startTime: new Date('2024-09-24T01:00:00.000Z'),
    endTime: new Date('2024-10-02T10:00:00.000Z'),
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 4
    },
  },
  {
    id: 18,
    project: "",
    name: "Lập trình trang quảng bá, giới thiệu sản phẩm",
    startTime: new Date('2024-10-04T01:00:00.000Z'),
    endTime: new Date('2024-10-09T10:00:00.000Z'),
    estimateTime: 6, 
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 4
    },
  },

  // 5
  {
    id: 19,
    project: "",
    name: "Viết kịch bản kiểm thử tích hợp",
    startTime: new Date('2024-08-17T01:00:00.000Z'),
    endTime: new Date('2024-08-21T10:00:00.000Z'),
    estimateTime: 5,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 5
    },
  },
  // {
  //   id: 20,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-08-22T01:00:00.000Z'),
  //   endTime: new Date('2024-08-28T02:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 5
  //   },
  // },
  // {
  //   id: 21,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-08-29T01:00:00.000Z'),
  //   endTime: new Date('2024-09-04T03:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 5
  //   },
  // },
  // {
  //   id: 22,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-09-18T01:00:00.000Z'),
  //   endTime: new Date('2024-09-21T10:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 5
  //   },
  // },
  // {
  //   id: 23,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-09-30T01:00:00.000Z'),
  //   endTime: new Date('2024-10-02T08:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 5
  //   },
  // },

  // 6
  {
    id: 24,
    project: "",
    name: "Xây dựng kịch bản thử nghiệm cho luồng quản lý hóa đơn",
    startTime: new Date('2024-08-20T01:00:00.000Z'),
    endTime: new Date('2024-08-24T10:00:00.000Z'),
    estimateTime: 5,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 6
    },
  },
  // {
  //   id: 25,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-09-03T01:00:00.000Z'),
  //   endTime: new Date('2024-09-06T10:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 6
  //   },
  // },
  // {
  //   id: 26,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-09-17T03:00:00.000Z'),
  //   endTime: new Date('2024-09-19T08:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 6
  //   },
  // },
  // {
  //   id: 27,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-09-27T02:00:00.000Z'),
  //   endTime: new Date('2024-09-28T10:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 6
  //   },
  // },
  // {
  //   id: 28,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-09-29T01:00:00.000Z'),
  //   endTime: new Date('2024-10-02T05:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 6
  //   },
  // },

  // 7
  {
    id: 28,
    project: "",
    name: "Sửa lỗi module quản lý thuế TNCN",
    startTime: new Date('2024-08-09T05:00:00.000Z'),
    endTime: new Date('2024-08-11T05:00:00.000Z'),
    estimateTime: 3,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 7
    },
  },

  // {
  //   id: 29,
  //   project: "",
  //   name: "",
  //   startTime: new Date('2024-08-29T01:00:00.000Z'),
  //   endTime: new Date('2024-09-02T05:00:00.000Z'),
  //   requireAssign: {},
  //   requireAsset: [],
  //   assignee: {
  //     id: 7
  //   },
  // },


  {
    id: 30,
    project: "",
    name: "Triển khai ứng dụng trên github",
    startTime: new Date('2024-09-23T06:00:00.000Z'),
    endTime: new Date('2024-09-24T10:00:00.000Z'),
    estimateTime: 1.5,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 7
    },
  },

  //8
  {
    id: 31,
    project: "",
    name: "Dựng các màn hình của chatbot",
    startTime: new Date('2024-07-29T04:00:00.000Z'),
    endTime: new Date('2024-08-02T10:00:00.000Z'),
    estimateTime: 4.5,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 8
    },
  },
  {
    id: 32,
    project: "",
    name: "Lập trình service chat với socket",
    startTime: new Date('2024-08-09T01:00:00.000Z'),
    endTime: new Date('2024-08-11T10:00:00.000Z'),
    estimateTime: 4,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 8
    },
  },
  {
    id: 33,
    project: "",
    name: "Dựng các màn hình trò chuyện",
    startTime: new Date('2024-08-24T01:00:00.000Z'),
    endTime: new Date('2024-08-29T10:00:00.000Z'),
    estimateTime: 6,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 8
    },
  },
  {
    id: 34,
    project: "",
    name: "Kiểm thử tính năng tạo cuộc họp",
    startTime: new Date('2024-08-30T01:00:00.000Z'),
    endTime: new Date('2024-09-01T10:00:00.000Z'),
    estimateTime: 2,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 8
    },
  },
  {
    id: 35,
    project: "",
    name: "Dựng các màn hình của mô đun quản lý lớp học",
    startTime: new Date('2024-09-17T02:00:00.000Z'),
    endTime: new Date('2024-09-22T08:00:00.000Z'),
    estimateTime: 5.625,
    requireAssign: {},
    requireAsset: [],
    assignee: {
      id: 8
    },
  },
]

module.exports = {
  allTasksOutOfProject
}