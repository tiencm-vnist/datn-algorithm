const allTasksInPast = [
  // Task 1
  {
    id: 1,
    name: "Phân tích quy trình nghiệp vụ khám bệnh",
    status: "done",
    project: "",
    startTime: new Date('2024-06-10T03:00:00.000Z'),
    endTime: new Date('2024-06-17T10:00:00.000Z'),
    tags: ['analysis'],
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 1
    },
    estimateTime: 6.75,
    evaluatePoint: 0.9,
    taskLq: "Task 1 of data phan bo"
  },

  {
    id: 2,
    name: "Phân tích quá trình nhập kho",
    status: "done",
    project: "",
    startTime: new Date('2024-06-13T06:00:00.000Z'),
    endTime: new Date('2024-06-16T10:00:00.000Z'),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 1,
      english: 2,
    },
    assignee: {
      id: 2
    },
    estimateTime: 3.5,
    evaluatePoint: 0.96,
    taskLq: "Task 1 of data phan bo"
  },

  {
    id: 3,
    name: "Phân tích tính khả thi dự án",
    status: "done",
    project: "",
    startTime: new Date('2024-06-13T01:00:00.000Z'),
    endTime: new Date('2024-06-17T03:00:00.000Z'),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 3
    },
    estimateTime: 4.25,
    evaluatePoint: 0.85,
    taskLq: "Task 1 of data phan bo"
  },

  {
    id: 4,
    name: "Phân tích và tư vấn mua hàng cho KH",
    status: "done",
    project: "",
    startTime: new Date('2024-06-28T01:00:00.000Z'),
    endTime: new Date('2024-07-02T03:00:00.000Z'),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 5
    },
    estimateTime: 5.25,
    evaluatePoint: 0.75,
    taskLq: "Task 1 of data phan bo"
  },

  {
    id: 5,
    name: "Phân tích quy trình nhập kho",
    status: "done",
    project: "",
    startTime: new Date('2024-06-09T01:00:00.000Z'),
    endTime: new Date('2024-06-12T10:00:00.000Z'),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 7
    },
    estimateTime: 4,
    evaluatePoint: -1,
    taskLq: "Task 1 of data phan bo"
  },

  {
    id: 6,
    name: "Phân tích nhu cầu học tiếng Anh",
    status: "done",
    project: "",
    startTime: new Date('2024-06-09T01:00:00.000Z'),
    endTime: new Date('2024-06-12T10:00:00.000Z'),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.95,
    taskLq: "Task 1 of data phan bo"
  },

  // Task 2: backend, frontend
  {
    id: 7,
    name: "Viết Code base Java-Angular",
    status: "done",
    project: "",
    startTime: new Date('2024-06-18T01:00:00.000Z'),
    endTime: new Date('2024-06-24T07:00:00.000Z'),
    tags: ['backend', 'frontend'],
    estimateTime: 6.75,
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      frontend: 1,
      docker: 1
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.9,
    taskLq: "Task 2 of data phan bo"
  },

  {
    id: 8,
    name: "Dựng code base Laravel-React",
    status: "done",
    project: "",
    startTime: new Date('2024-06-23T06:00:00.000Z'),
    endTime: new Date('2024-06-29T10:00:00.000Z'),
    tags: ['backend', 'frontend'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      frontend: 1,
      docker: 1
    },
    assignee: {
      id: 2
    },
    estimateTime: 6.5,
    evaluatePoint: 0.95,
    taskLq: "Task 2 of data phan bo"
  },

  {
    id: 9,
    name: "Dựng code base NodeJS-React",
    status: "done",
    project: "",
    startTime: new Date('2024-06-22T03:00:00.000Z'),
    endTime: new Date('2024-06-29T05:00:00.000Z'),
    tags: ['backend', 'frontend'],
    requireAssign: {
      // year_of_exp: 1,
      backend: 2,
      frontend: 1,
      docker: 1
    },
    assignee: {
      id: 3
    },
    estimateTime: 7.25,
    evaluatePoint: 0.95,
    taskLq: "Task 2 of data phan bo"
  },

  {
    id: 10,
    name: "Dựng code base NestJS-React",
    status: "done",
    project: "",
    startTime: new Date('2024-07-05T01:00:00.000Z'),
    endTime: new Date('2024-07-11T10:00:00.000Z'),
    tags: ['backend', 'frontend'],
    requireAssign: {
      // year_of_exp: 1,
      backend: 2,
      frontend: 1,
      docker: 1
    },
    assignee: {
      id: 4
    },
    estimateTime: 6.5,
    evaluatePoint: 0.9,
    taskLq: "Task 2 of data phan bo"
  },
  // {
  //   id: 11,
  //   name: "Dựng code base Laravel-VueJS",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['backend', 'frontend'],
  //   requireAssign: {
  //     // year_of_exp: 1,
  //     backend: 2,
  //     frontend: 1,
  //     docker: 1
  //   },
  //   assignee: {
  //     id: 8
  //   },
  //   evaluatePoint: -1
  // },


  // => 7 theo 4


  // Task 3
  {
    id: 12,
    name: "Dựng trang homepage",
    status: "done",
    project: "",
    startTime: new Date('2024-06-24T07:00:00.000Z'),
    endTime: new Date('2024-06-27T07:00:00.000Z'),
    estimateTime: 3,
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
      year_of_exp: 1
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95,
    taskLq: "Task 3 of data phan bo"
  },
  {
    id: 13,
    name: "Dựng trang landingpage",
    status: "done",
    project: "",
    startTime: new Date('2024-06-20T02:00:00.000Z'),
    endTime: new Date('2024-06-23T05:00:00.000Z'),
    estimateTime: 3.375,
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.9,
    taskLq: "Task 3 of data phan bo"
  },
  {
    id: 14,
    name: "Dựng trang chủ phía khách",
    status: "done",
    project: "",
    startTime: new Date('2024-06-13T01:00:00.000Z'),
    endTime: new Date('2024-06-15T05:00:00.000Z'),
    estimateTime: 2.5,
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
    },
    assignee: {
      id: 7
    },
    evaluatePoint: -1, // For 3 and 16
    taskLq: "Task 3 of data phan bo"
  },
  {
    id: 15,
    name: "Dựng trang chủ, thống kê phía admin",
    status: "done",
    project: "",
    startTime: new Date('2024-07-12T01:00:00.000Z'),
    endTime: new Date('2024-07-18T05:00:00.000Z'),
    estimateTime: 6.5,
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
    },
    assignee: {
      id: 4
    },
    evaluatePoint: 0.8,
    taskLq: "Task 3 of data phan bo"
  },
  // {
  //   id: 16,
  //   name: "Dựng trang chủ admin",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['frontend'],
  //   requireAssign: {
  //     degree: 2,
  //     frontend: 2,
  //   },
  //   assignee: {
  //     id: 5
  //   },
  //   evaluatePoint: -1
  // },

  // {
  //   id: 17,
  //   name: "Dựng trang chủ admin",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['frontend'],
  //   requireAssign: {
  //     degree: 2,
  //     frontend: 2,
  //   },
  //   assignee: {
  //     id: 5
  //   },
  //   evaluatePoint: -1
  // },

  //

  // Task 4, 16
  {
    id: 18,
    name: "Dựng giao diện module quản lý thầu",
    status: "done",
    project: "",
    startTime: new Date('2024-07-02T01:00:00.000Z'),
    endTime: new Date('2024-07-08T05:00:00.000Z'),
    estimateTime: 6.5,
    tags: ['frontend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 1,
      frontend: 2,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.9,
    taskLq: "Task 4 of data phan bo"
  },
  {
    id: 19,
    name: "Dựng giao diện module quản lý nhân sự",
    status: "done",
    project: "",
    startTime: new Date('2024-07-05T06:00:00.000Z'),
    endTime: new Date('2024-07-09T07:00:00.000Z'),
    estimateTime: 4.125,
    tags: ['frontend'],
    requireAssign: {
      degree: 1,
      year_of_exp: 1,
      backend: 1,
      frontend: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.9,
    taskLq: "Task 4 of data phan bo"
  },
  {
    id: 20,
    name: "Dựng giao diện module quản lý phòng ban",
    status: "done",
    project: "",
    startTime: new Date('2024-06-15T06:00:00.000Z'),
    endTime: new Date('2024-06-21T10:00:00.000Z'),
    estimateTime: 6.5,
    tags: ['frontend'],
    requireAssign: {
      degree: 1,
      year_of_exp: 1,
      backend: 1,
      frontend: 2,
    },
    assignee: {
      id: 7
    },
    evaluatePoint: 0.85,
    taskLq: "Task 4 of data phan bo"
  },
  {
    id: 21,
    name: "Dựng giao diện thống kê nhân sự",
    status: "done",
    project: "",
    startTime: new Date('2024-07-03T06:00:00.000Z'),
    endTime: new Date('2024-07-06T08:00:00.000Z'),
    estimateTime: 3.25,
    tags: ['frontend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 1,
      frontend: 2,
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.8,
    taskLq: "Task 4 of data phan bo"
  },
  // 3, 4 tự theo 8

  // Task 5
  {
    id: 22,
    name: "Triển khai ứng dụng ở heroku",
    status: "done",
    project: "",
    startTime: new Date('2024-07-09T06:00:00.000Z'),
    endTime: new Date('2024-07-15T05:00:00.000Z'),
    estimateTime: 6,
    tags: ['devops'],
    requireAssign: {
      year_of_exp: 1,
      docker: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 7
    },
    evaluatePoint: 0.8,
    taskLq: "Task 5 of data phan bo"
  },
  {
    id: 23,
    name: "Triển khai module đấu thầu",
    status: "done",
    project: "",
    startTime: new Date('2024-07-09T07:00:00.000Z'),
    endTime: new Date('2024-07-13T10:00:00.000Z'),
    estimateTime: 4.375,
    tags: ['devops'],
    requireAssign: {
      year_of_exp: 1,
      docker: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.9,
    taskLq: "Task 5 of data phan bo"
  },
  {
    id: 24,
    name: "Triển khai module thanh toán",
    status: "done",
    project: "",
    startTime: new Date('2024-07-17T03:00:00.000Z'),
    endTime: new Date('2024-07-22T05:00:00.000Z'),
    estimateTime: 5.25,
    tags: ['devops'],
    requireAssign: {
      year_of_exp: 1,
      docker: 2,
      ci_cd: 2,
      backend: 1
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9,
    taskLq: "Task 5 of data phan bo"
  },
  // 1 theo 7

  // Task 6
  // {
  //   id: 25,
  //   name: "Tạo kế hoạch kiểm thử cho module bán hàng",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['testing'],
  //   requireAssign: {
  //     manual_test: 2,
  //     unit_test: 1
  //   },
  //   assignee: {
  //     id: 4
  //   },
  //   evaluatePoint: -1
  // },
  // {
  //   id: 26,
  //   name: "Tạo kế hoạch kiểm thử cho module bán hàng",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['testing'],
  //   requireAssign: {
  //     manual_test: 2,
  //     unit_test: 1
  //   },
  //   assignee: {
  //     id: 4
  //   },
  //   evaluatePoint: -1
  // },
  {
    id: 27,
    name: "Tạo kế hoạch kiểm thử đơn vị",
    status: "done",
    project: "",
    startTime: new Date('2024-02-07T03:00:00.000Z'),
    endTime: new Date('2024-07-07T03:00:00.000Z'),
    estimateTime: 5,
    tags: ['testing'],
    requireAssign: {
      manual_test: 2,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.95,
    taskLq: "Task 6 of data phan bo"
  },
  {
    id: 28,
    name: "Tạo kế hoạch kiểm thử tích hợp",
    status: "done",
    project: "",
    startTime: new Date('2024-06-27T06:00:00.000Z'),
    endTime: new Date('2024-07-01T10:00:00.000Z'),
    estimateTime: 4.5,
    tags: ['testing'],
    requireAssign: {
      manual_test: 2,
      unit_test: 1,
      // automation_test: 1
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.9,
    taskLq: "Task 6 of data phan bo"
  },

  // Task 7
  {
    id: 29,
    name: "Kiểm thử chức năng nhập kho",
    status: "done",
    project: "",
    startTime: new Date('2024-07-02T07:00:00.000Z'),
    endTime: new Date('2024-07-04T10:00:00.000Z'),
    estimateTime: 2.375,
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 2,
      automation_test: 1
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9,
    taskLq: "Task 7 of data phan bo"
  },
  {
    id: 30,
    name: "Kiểm thử tính năng đồng bộ dữ liệu",
    status: "done",
    project: "",
    startTime: new Date('2024-06-22T01:00:00.000Z'),
    endTime: new Date('2024-06-25T10:00:00.000Z'),
    estimateTime: 4,
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 2,
      automation_test: 1
    },
    assignee: {
      id: 7
    },
    evaluatePoint: 0.9,
    taskLq: "Task 7 of data phan bo"
  },
  {
    id: 31,
    name: "Kiểm thử tính năng thêm vào giỏ",
    status: "done",
    project: "",
    startTime: new Date('2024-07-07T03:00:00.000Z'),
    endTime: new Date('2024-07-09T05:00:00.000Z'),
    estimateTime: 2.25,
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.95,
    taskLq: "Task 7 of data phan bo"
  },
  {
    id: 32,
    name: "Kiểm thử luồng quản lý tài liệu",
    status: "done",
    project: "",
    startTime: new Date('2024-07-19T03:00:00.000Z'),
    endTime: new Date('2024-07-21T10:00:00.000Z'),
    estimateTime: 2.75,
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.8,
    taskLq: "Task 7 of data phan bo"
  },
  {
    id: 33,
    name: "Kiểm thử tính năng Thêm chứng chỉ",
    status: "done",
    project: "",
    startTime: new Date('2024-07-04T01:00:00.000Z'),
    endTime: new Date('2024-07-05T05:00:00.000Z'),
    estimateTime: 1.5,
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.8,
    taskLq: "Task 7 of data phan bo"

  },
  {
    id: 34,
    name: "Kiểm thử tính năng Sửa chứng chỉ",
    status: "done",
    project: "",
    startTime: new Date('2024-06-25T01:00:00.000Z'),
    endTime: new Date('2024-06-29T10:00:00.000Z'),
    estimateTime: 5,
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.75,
    taskLq: "Task 7 of data phan bo"
  },
  // 2, 4 tương tự

  // Task 8: Yêu cầu gần giống task 2, tương tự với 1, 2, 3, 4
  {
    id: 35,
    name: "Sửa lỗi module quản lý lịch đặt khách sạn",
    status: "done",
    project: "",
    startTime: new Date('2024-06-27T01:00:00.000Z'),
    endTime: new Date('2024-07-02T03:00:00.000Z'),
    estimateTime: 5.5,
    tags: ['frontend', 'backend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 2,
      frontend: 1,
      // docker: 1
    },
    assignee: {
      id: 7
    },
    evaluatePoint: 0.9,
    taskLq: "Task 8 of data phan bo"

  },

  {
    id: 36,
    name: "Sửa lỗi module quản lý phòng khách sạn",
    status: "done",
    project: "",
    startTime: new Date('2024-07-14T01:00:00.000Z'),
    endTime: new Date('2024-07-19T05:00:00.000Z'),
    estimateTime: 5.5,
    tags: ['frontend', 'backend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 2,
      frontend: 1,
      // docker: 1
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.9,
    taskLq: "Task 8 of data phan bo"

  },

  // Task 9
  // {
  //   id: 35,
  //   name: "Viết tài liệu kiểm module quản lý sách",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['testing'],
  //   requireAssign: {
  //     degree: 2,
  //     unit_test: 2,
  //     year_of_exp: 1
  //     // frontend: 1,
  //     // docker: 1
  //   },
  //   assignee: {
  //     id: 7
  //   },
  //   evaluatePoint: -1
  // },
  {
    id: 37,
    name: "Viết kịch bản kiểm thử cho luồng thanh toán",
    status: "done",
    project: "",
    startTime: new Date('2024-07-09T06:00:00.000Z'),
    endTime: new Date('2024-07-12T10:00:00.000Z'),
    estimateTime: 3.5,
    tags: ['testing'],
    requireAssign: {
      degree: 2,
      unit_test: 2,
      year_of_exp: 1
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.95,
    taskLq: "Task 9 of data phan bo"
  },
  {
    id: 38,
    name: "Viết kịch bản kiểm thử cho luồng đặt hàng",
    status: "done",
    project: "",
    startTime: new Date('2024-07-02T01:00:00.000Z'),
    endTime: new Date('2024-07-04T01:00:00.000Z'),
    tags: ['testing'],
    estimateTime: 2,
    requireAssign: {
      degree: 2,
      unit_test: 2,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.95,
    taskLq: "Task 9 of data phan bo"

  },
  {
    id: 39,
    name: "Viết kịch bản kiểm thử cho luồng nhập kho",
    status: "done",
    project: "",
    startTime: new Date('2024-06-18T05:00:00.000Z'),
    endTime: new Date('2024-06-24T10:00:00.000Z'),
    estimateTime: 6.5,
    tags: ['testing'],
    requireAssign: {
      degree: 2,
      unit_test: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.9,
    taskLq: "Task 9 of data phan bo"
  },
  {
    id: 40,
    name: "Viết kịch bản kiểm thử cho luồng xuất kho",
    status: "done",
    project: "",
    startTime: new Date('2024-06-30T01:00:00.000Z'),
    endTime: new Date('2024-07-03T05:00:00.000Z'),
    estimateTime: 3.5,
    tags: ['testing'],
    requireAssign: {
      degree: 2,
      unit_test: 2,
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.8,
    taskLq: "Task 9 of data phan bo"

  },
  // 2, 7, 4, 8, 5, 6 tương tự

  // Task 10: 1, 2, 6
  {
    id: 41,
    name: "Lập kế hoạch cho dự án DCMA",
    status: "done",
    project: "",
    startTime: new Date('2024-06-30T01:00:00.000Z'),
    endTime: new Date('2024-07-02T01:00:00.000Z'),
    estimateTime: 2,
    tags: ['planning'],
    requireAssign: {
      degree: 2,
      year_of_exp: 3,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.9,
    taskLq: "Task 10 of data phan bo"

  },
  {
    id: 42,
    name: "Lập kế hoạch cho dự án",
    status: "done",
    project: "",
    startTime: new Date('2024-06-20T01:00:00.000Z'),
    endTime: new Date('2024-06-24T05:00:00.000Z'),
    estimateTime: 4.5,
    tags: ['planning'],
    requireAssign: {
      degree: 2,
      year_of_exp: 3,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.85,
    taskLq: "Task 10 of data phan bo"

  },

  // {
  //   id: 43,
  //   name: "Lên kế hoạch cho dự án",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['planning'],
  //   requireAssign: {
  //     degree: 2,
  //     year_of_exp: 3,
  //   },
  //   assignee: {
  //     id: 6
  //   },
  //   evaluatePoint: 0.85,
  //   taskLq: "Task 10 of data phan bo"

  // },
  // {
  //   id: 44,
  //   name: "Lập kế hoạch tư vấn khách hàng",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['planning'],
  //   requireAssign: {
  //     degree: 2,
  //     year_of_exp: 3,
  //   },
  //   assignee: {
  //     id: 3
  //   },
  //   evaluatePoint: -1
  // },

  // Task 11: 
  // {
  //   id: 45,
  //   name: "Thu thập phản hồi của khách hàng",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['collecting_data'],
  //   requireAssign: {
  //     english: 5
  //   },
  //   assignee: {
  //     id: 3
  //   },
  //   evaluatePoint: -1
  // },
  {
    id: 46,
    name: "Thu thập phản hồi của đối tác",
    status: "done",
    project: "",
    startTime: new Date('2024-07-05T01:00:00.000Z'),
    endTime: new Date('2024-07-11T10:00:00.000Z'),
    estimateTime: 7,
    tags: ['collecting_data'],
    requireAssign: {
      english: 5,
      degree: 1
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9,
    taskLq: "Task 11 of data phan bo"

  },
  {
    id: 47,
    name: "Thu thập phản hồi của người dùng",
    status: "done",
    project: "",
    startTime: new Date('2024-07-05T06:00:00.000Z'),
    endTime: new Date('2024-07-11T10:00:00.000Z'),
    estimateTime: 6.5,
    tags: ['collecting_data'],
    requireAssign: {
      english: 5,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.95,
    taskLq: "Task 11 of data phan bo"

  },

  // Task 12
  {
    id: 48,
    name: "Điều chỉnh module quản lý thầu",
    status: "done",
    project: "",
    startTime: new Date('2024-07-21T01:00:00.000Z'),
    endTime: new Date('2024-07-25T05:00:00.000Z'),
    estimateTime: 4.5,
    tags: ['backend', 'frontend'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      ci_cd: 2,
      frontend: 1,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95,
    taskLq: "Task 12 of data phan bo"

  },
  {
    id: 49,
    name: "Điều chỉnh module phân quyền",
    status: "done",
    project: "",
    startTime: new Date('2024-07-19T06:00:00.000Z'),
    endTime: new Date('2024-07-24T06:00:00.000Z'),
    estimateTime: 7,
    tags: ['backend', 'frontend'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.95,
    taskLq: "Task 12 of data phan bo"
  },
  {
    id: 50,
    name: "Điều chỉnh module quản lý nhân viên",
    status: "done",
    project: "",
    startTime: new Date('2024-07-12T01:00:00.000Z'),
    endTime: new Date('2024-07-17T03:00:00.000Z'),
    tags: ['backend', 'frontend'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.85,
    taskLq: "Task 12 of data phan bo"

  },
  // 7 tương tự 3
  // {
  //   id: 51,
  //   name: "Điều chỉnh chức năng tái phân bổ",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['backend', 'frontend'],
  //   requireAssign: {
  //     year_of_exp: 2,
  //     backend: 2,
  //     ci_cd: 2,
  //   },
  //   assignee: {
  //     id: 4
  //   },
  //   evaluatePoint: -1
  // },

  // Task 13
  {
    id: 52,
    name: "Đề xuất chiến lược kinh doanh gạch lát",
    status: "done",
    project: "",
    startTime: new Date('2024-06-27T07:00:00.000Z'),
    endTime: new Date('2024-06-29T10:00:00.000Z'),
    estimateTime: 2.375,
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95,
    taskLq: "Task 13 of data phan bo"

  },
  {
    id: 53,
    name: "Đề xuất chiến lược mua hàng",
    status: "done",
    project: "",
    startTime: new Date('2024-06-17T01:00:00.000Z'),
    endTime: new Date('2024-06-20T02:00:00.000Z'),
    estimateTime: 3.125,
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.95,
    taskLq: "Task 13 of data phan bo"

  },
  {
    id: 54,
    name: "Đề xuất chiến lược kinh doanh trực tuyến",
    status: "done",
    project: "",
    startTime: new Date('2024-07-13T01:00:00.000Z'),
    endTime: new Date('2024-07-17T05:00:00.000Z'),
    estimateTime: 4.5,
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.8,
    taskLq: "Task 13 of data phan bo"

  },

  {
    id: 55,
    name: "Đề xuất chiến lược nhập kho",
    status: "done",
    project: "",
    startTime: new Date('2024-06-18T01:00:00.000Z'),
    endTime: new Date('2024-06-22T03:00:00.000Z'),
    estimateTime: 4.25,
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9,
    taskLq: "Task 13 of data phan bo"

  },

  // Task 14
  {
    id: 56,
    name: "Lập tài liệu cuộc họp với khách hàng",
    status: "done",
    project: "",
    startTime: new Date('2024-07-17T06:00:00.000Z'),
    endTime: new Date('2024-07-20T06:00:00.000Z'),
    estimateTime: 3,
    tags: ['document'],
    requireAssign: {
      year_of_exp: 2,
      english: 5,
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.8,
    taskLq: "Task 14 of data phan bo"

  },
  {
    id: 57,
    name: "Lập tài liệu cuộc họp với đối tác",
    status: "done",
    project: "",
    startTime: new Date('2024-06-24T06:00:00.000Z'),
    endTime: new Date('2024-06-27T05:00:00.000Z'),
    estimateTime: 3,
    tags: ['document'],
    requireAssign: {
      year_of_exp: 2,
      english: 5,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.9,
    taskLq: "Task 14 of data phan bo"

  },

  // Task 15
  {
    id: 58,
    name: "Viết tài liệu công nghệ sử dụng",
    status: "done",
    project: "",
    startTime: new Date('2024-07-25T06:00:00.000Z'),
    endTime: new Date('2024-07-26T10:00:00.000Z'),
    estimateTime: 1.5,
    tags: ['document'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      frontend: 2,
      docker: 2,
      ci_cd: 2
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95,
    taskLq: "Task 15 of data phan bo"
  },
  {
    id: 59,
    name: "Viết tài liệu hướng dẫn cài đặt",
    status: "done",
    project: "",
    startTime: new Date('2024-07-24T06:00:00.000Z'),
    endTime: new Date('2024-07-26T10:00:00.000Z'),
    estimateTime: 2.5,
    tags: ['document'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      frontend: 2,
      docker: 2,
      ci_cd: 2
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.95,
    taskLq: "Task 15 of data phan bo"
  },
  {
    id: 60,
    name: "Viết tài liệu triển khai",
    status: "done",
    project: "",
    startTime: new Date('2024-07-22T06:00:00.000Z'),
    endTime: new Date('2024-07-24T10:00:00.000Z'),
    estimateTime: 2.5,
    tags: ['document'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      frontend: 2,
      docker: 2,
      ci_cd: 2
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9,
    taskLq: "Task 15 of data phan bo"

  },
  // {
  //   id: 61,
  //   name: "Viết tài liệu hướng dẫn cài đặt",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['document'],
  //   requireAssign: {
  //     year_of_exp: 2,
  //     backend: 2,
  //     frontend: 2,
  //     docker: 1,
  //     ci_cd: 2
  //   },
  //   assignee: {
  //     id: 8
  //   },
  //   evaluatePoint: -1
  // },
  // Task 16 tương tự

  // Task 17
  {
    id: 62,
    name: "Lập trình phía server module quản lý thầu",
    status: "done",
    project: "",
    startTime: new Date('2024-07-08T06:00:00.000Z'),
    endTime: new Date('2024-07-14T10:00:00.000Z'),
    estimateTime: 6.5,
    tags: ['backend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95,
    taskLq: "Task 17 of data phan bo"
  },
  {
    id: 63,
    name: "Lập trình phía server module quản lý sách",
    status: "done",
    project: "",
    startTime: new Date('2024-07-01T03:00:00.000Z'),
    endTime: new Date('2024-07-05T05:00:00.000Z'),
    estimateTime: 4.25,
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.95,
    taskLq: "Task 17 of data phan bo"
  },
  {
    id: 64,
    name: "Lập trình service phân quyền",
    status: "done",
    project: "",
    startTime: new Date('2024-06-29T07:00:00.000Z'),
    endTime: new Date('2024-07-02T07:00:00.000Z'),
    estimateTime: 3,
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 1,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9,
    taskLq: "Task 17 of data phan bo"

  },

  // {
  //   id: 65,
  //   name: "Lập trình service chia tài sản",
  //   status: "done",
  //   project: "",
  //   startTime: new Date(),
  //   endTime: new Date(),
  //   tags: ['backend'],
  //   requireAssign: {
  //     backend: 2,
  //     frontend: 2,
  //   },
  //   assignee: {
  //     id: 3
  //   },
  //   evaluatePoint: 0.85
  // },
  {
    id: 66,
    name: "Lập trình service gán nguồn lực",
    status: "done",
    project: "",
    startTime: new Date('2024-06-30T01:00:00.000Z'),
    endTime: new Date('2024-07-03T05:00:00.000Z'),
    estimateTime: 3.5,
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.85,
    taskLq: "Task 17 of data phan bo"

  },
  {
    id: 67,
    name: "Lập trình service module quản lý thẻ",
    status: "done",
    project: "",
    startTime: new Date('2024-07-18T06:00:00.000Z'),
    endTime: new Date('2024-07-22T06:00:00.000Z'),
    estimateTime: 4,
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 4
    },
    evaluatePoint: -1,
    taskLq: "Task 17 of data phan bo"

  },

  // Task 18
  {
    id: 68,
    name: "Tách service quản lý thầu",
    status: "done",
    project: "",
    startTime: new Date('2024-07-15T01:00:00.000Z'),
    endTime: new Date('2024-07-19T02:00:00.000Z'),
    estimateTime: 4.25,
    tags: ['frontend', 'backend'],
    requireAssign: {
      backend: 2,
      frontend: 1,
      manual_test: 1
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.85,
    taskLq: "Task 18 of data phan bo"

  },
  {
    id: 69,
    name: "Lập trình micro-service module quản lý sách",
    status: "done",
    project: "",
    startTime: new Date('2024-06-10T02:00:00.000Z'),
    endTime: new Date('2024-06-13T05:00:00.000Z'),
    estimateTime: 3.375,
    tags: ['frontend', 'backend'],
    requireAssign: {
      backend: 1,
      frontend: 2,
      manual_test: 1
    },
    assignee: {
      id: 2
    },
    evaluatePoint: -1,
    taskLq: "Task 18 of data phan bo"

  },
  {
    id: 70,
    name: "Lập trình micro-service module phân quyền",
    status: "done",
    project: "",
    startTime: new Date('2024-07-02T03:00:00.000Z'),
    endTime: new Date('2024-07-09T05:00:00.000Z'),
    estimateTime: 7.25,
    tags: ['frontend', 'backend'],
    requireAssign: {
      backend: 1,
      frontend: 2,
      manual_test: 1
    },
    assignee: {
      id: 7
    },
    evaluatePoint: -1,
    taskLq: "Task 18 of data phan bo"

  },
  
  {
    id: 71,
    name: "Lập trình service kết nối database",
    status: "done",
    project: "",
    startTime: new Date('2024-07-06T08:00:00.000Z'),
    endTime: new Date('2024-07-12T08:00:00.000Z'),
    estimateTime: 6,
    tags: ['backend', 'frontend'],
    requireAssign: {
      backend: 1,
      frontend: 2,
      manual_test: 1
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.85,
    taskLq: "Task 18 of data phan bo"
  },
]

module.exports = {
  allTasksInPast
}