const allTasksInPast = [
  // Task 1
  {
    id: 1,
    name: "Phân tích quy trình nghiệp vụ",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['analysis'],
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.9
  },

  {
    id: 2,
    name: "Phân tích nghiệp vụ mua hàng",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 1,
      english: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.96
  },

  {
    id: 3,
    name: "Phân tích tính khả thi dự án",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.85
  },

  {
    id: 4,
    name: "Phân tích và tư vấn mua hàng cho KH",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9
  },

  {
    id: 5,
    name: "Phân tích quy trình nhập kho",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 7
    },
    evaluatePoint: -1
  },

  {
    id: 6,
    name: "Phân tích nhu cầu học tiếng Anh",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['analysis'],
    // requireAsset: ,
    requireAssign: {
      year_of_exp: 2,
      english: 2,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.95
  },

  // Task 2: backend, frontend
  {
    id: 7,
    name: "Viết Code base Java-Angular",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend', 'frontend'],
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
    evaluatePoint: 0.9
  },

  {
    id: 8,
    name: "Dựng code base Laravel-React",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.95
  },

  {
    id: 9,
    name: "Dựng code base NodeJS-React",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.95
  },

  {
    id: 10,
    name: "Dựng code base NestJS-React",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.9
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
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
      year_of_exp: 1
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95
  },
  {
    id: 13,
    name: "Dựng trang landingpage",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.9
  },
  {
    id: 14,
    name: "Dựng trang chủ phía khách",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
    },
    assignee: {
      id: 7
    },
    evaluatePoint: -1 // For 3 and 16
  },
  {
    id: 15,
    name: "Dựng trang chủ admin",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend'],
    requireAssign: {
      degree: 2,
      frontend: 2,
    },
    assignee: {
      id: 4
    },
    evaluatePoint: 0.8
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
    name: "Dựng giao diện module quản lý dự án",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 1,
      frontend: 2,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.9
  },
  {
    id: 19,
    name: "Dựng giao diện module quản lý nhân sự",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.9
  },
  {
    id: 20,
    name: "Dựng giao diện module quản lý phòng ban",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.85
  },
  {
    id: 21,
    name: "Dựng giao diện thống kê nhân sự",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 1,
      frontend: 2,
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.8
  },
  // 3, 4 tự theo 8

  // Task 5
  {
    id: 22,
    name: "Triển khai ứng dụng ở heroku",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['devops'],
    requireAssign: {
      year_of_exp: 1,
      docker: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 7
    },
    evaluatePoint: 0.8
  },
  {
    id: 23,
    name: "Triển khai module đấu thầu",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['devops'],
    requireAssign: {
      year_of_exp: 1,
      docker: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.9
  },
  {
    id: 24,
    name: "Triển khai module đấu thầu",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.9
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
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 2,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.95
  },
  {
    id: 28,
    name: "Tạo kế hoạch kiểm thử tích hợp",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 2,
      unit_test: 1,
      // automation_test: 1
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.9
  },

  // Task 7
  {
    id: 29,
    name: "Kiểm thử tính năng thanh toán",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 2,
      automation_test: 1
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9
  },
  {
    id: 30,
    name: "Kiểm thử tính năng đồng bộ dữ liệu",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 2,
      automation_test: 1
    },
    assignee: {
      id: 7
    },
    evaluatePoint: 0.9
  },
  {
    id: 31,
    name: "Kiểm thử tính năng thêm vào giỏ",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.95
  },
  {
    id: 32,
    name: "Kiểm thử tính năng sửa tài liệu",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.8
  },
  {
    id: 33,
    name: "Kiểm thử tính năng Thêm chứng chỉ",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.8
  },
  {
    id: 34,
    name: "Kiểm thử tính năng Sửa chứng chỉ",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      manual_test: 1,
      unit_test: 1,
      automation_test: 1
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.75
  },
  // 2, 4 tương tự

  // Task 8: Yêu cầu gần giống task 2, tương tự với 1, 2, 3, 4
  {
    id: 35,
    name: "Sửa lỗi module quản lý khách sạn",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.9
  },

  {
    id: 36,
    name: "Sửa lỗi module quản lý khách sạn",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.9
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
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      degree: 2,
      unit_test: 2,
      year_of_exp: 1
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.95
  },
  {
    id: 38,
    name: "Viết kịch bản kiểm thử cho luồng đặt hàng",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      degree: 2,
      unit_test: 2,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.95
  },
  {
    id: 39,
    name: "Viết kịch bản kiểm thử cho luồng nhập kho",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      degree: 2,
      unit_test: 2,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.9
  },
  {
    id: 40,
    name: "Viết kịch bản kiểm thử cho luồng nhập kho",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['testing'],
    requireAssign: {
      degree: 2,
      unit_test: 2,
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.8
  },
  // 3, 4 tương tự

  // Task 10: 1, 2, 6
  {
    id: 41,
    name: "Lập kế hoạch cho dự án",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['planning'],
    requireAssign: {
      degree: 2,
      year_of_exp: 3,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.9
  },
  {
    id: 42,
    name: "Lập kế hoạch cho dự án",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['planning'],
    requireAssign: {
      degree: 2,
      year_of_exp: 3,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.95
  },

  {
    id: 43,
    name: "Lên kế hoạch cho dự án",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['planning'],
    requireAssign: {
      degree: 2,
      year_of_exp: 3,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.85
  },
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
    startTime: new Date(),
    endTime: new Date(),
    tags: ['collecting_data'],
    requireAssign: {
      english: 5,
      degree: 1
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9
  },
  {
    id: 47,
    name: "Thu thập phản hồi của người dùng",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['collecting_data'],
    requireAssign: {
      english: 5,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.95
  },

  // Task 12
  {
    id: 48,
    name: "Điều chỉnh module đấu thầu",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.95
  },
  {
    id: 49,
    name: "Điều chỉnh module phân quyền",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend', 'frontend'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.95
  },
  {
    id: 50,
    name: "Điều chỉnh module quản lý nhân viên",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend', 'frontend'],
    requireAssign: {
      year_of_exp: 2,
      backend: 2,
      ci_cd: 2,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.85
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
    name: "Đề xuất chiến lược kinh doanh",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95
  },
  {
    id: 53,
    name: "Đề xuất chiến lược mua hàng",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.95
  },
  {
    id: 54,
    name: "Đề xuất chiến lược kinh doanh",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.8
  },

  {
    id: 55,
    name: "Đề xuất chiến lược nhập kho",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['idea'],
    requireAssign: {
      year_of_exp: 2,
      english: 3,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9
  },

  // Task 14
  {
    id: 56,
    name: "Lập tài liệu cuộc họp với đối tác",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['document'],
    requireAssign: {
      year_of_exp: 2,
      english: 5,
    },
    assignee: {
      id: 5
    },
    evaluatePoint: 0.8
  },
  {
    id: 57,
    name: "Lập tài liệu cuộc họp với đối tác",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['document'],
    requireAssign: {
      year_of_exp: 2,
      english: 5,
    },
    assignee: {
      id: 6
    },
    evaluatePoint: 0.9
  },

  // Task 15
  {
    id: 58,
    name: "Viết tài liệu công nghệ sử dụng",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.95
  },
  {
    id: 59,
    name: "Viết tài liệu hướng dẫn cài đặt",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.95
  },
  {
    id: 60,
    name: "Viết tài liệu triển khai",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
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
    evaluatePoint: 0.9
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
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend'],
    requireAssign: {
      year_of_exp: 1,
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.95
  },
  {
    id: 63,
    name: "Lập trình phía server module quản lý sách",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 2
    },
    evaluatePoint: 0.95
  },
  {
    id: 64,
    name: "Lập trình service phân quyền",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 1,
    },
    assignee: {
      id: 3
    },
    evaluatePoint: 0.9
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
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.85
  },
  {
    id: 67,
    name: "Lập trình service module quản lý thẻ",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend'],
    requireAssign: {
      backend: 2,
      frontend: 2,
    },
    assignee: {
      id: 4
    },
    evaluatePoint: -1
  },

  // Task 18
  {
    id: 68,
    name: "Ghép API module quản lý thầu",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend', 'backend'],
    requireAssign: {
      backend: 2,
      frontend: 1,
      manual_test: 1
    },
    assignee: {
      id: 1
    },
    evaluatePoint: 0.85
  },
  {
    id: 69,
    name: "Lập trình micro-service module quản lý thầu",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend', 'backend'],
    requireAssign: {
      backend: 1,
      frontend: 2,
      manual_test: 1
    },
    assignee: {
      id: 2
    },
    evaluatePoint: -1
  },
  {
    id: 70,
    name: "Lập trình micro-service module phân quyền",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['frontend', 'backend'],
    requireAssign: {
      backend: 1,
      frontend: 2,
      manual_test: 1
    },
    assignee: {
      id: 7
    },
    evaluatePoint: -1
  },
  
  {
    id: 71,
    name: "Lập trình service kết nối database",
    status: "done",
    project: "",
    startTime: new Date(),
    endTime: new Date(),
    tags: ['backend', 'frontend'],
    requireAssign: {
      backend: 1,
      frontend: 2,
      manual_test: 1
    },
    assignee: {
      id: 8
    },
    evaluatePoint: 0.85
  },
]

module.exports = {
  allTasksInPast
}