// Các hằng số
const POPULATION_SIZE = 100; // Kích thước quần thể
const GENERATIONS = 100; // Số thế hệ
const CROSSOVER_RATE = 0.8; // Tỷ lệ giao phối
const MUTATION_RATE = 0.2; // Tỷ lệ đột biến

// Các biến toàn cục
let employees; // Danh sách nhân viên
let tasks; // Danh sách nhiệm vụ
let kpis; // Danh sách KPI gần nhất

// Hàm khởi tạo
function init() {
  // Đọc dữ liệu đầu vào từ các biến toàn cục
  employees = require('./data/employee')
  tasks = require("./data/task");
  kpis = require("./data/kpi");
}

// Hàm mã hóa
function encode(assignment) {
  // Tạo chuỗi nhị phân với số bit bằng số nhân viên
  let binaryString = "";
  for (let i = 0; i < employees.length; i++) {
    binaryString += assignment[i] ? "1" : "0";
  }
  return binaryString;
}

// Hàm giải mã
function decode(binaryString) {
  // Tạo mảng gán nhiệm vụ
  let assignment = [];
  for (let i = 0; i < employees.length; i++) {
    assignment[i] = binaryString[i] === "1";
  }
  return assignment;
}

// Hàm đánh giá
function evaluate(individual) {
  // Giải mã cá thể để lấy việc gán nhiệm vụ
  let assignment = decode(individual);

  // Tính tổng chi phí thực hiện
  let totalCost = 0;
  for (let i = 0; i < employees.length; i++) {
    if (assignment[i]) {
      totalCost += employees[i].costPerHour * tasks[i].estimateTime;
    }
  }

  // Tính tổng KPI đạt được
  let totalKpi = 0;
  for (let i = 0; i < employees.length; i++) {
    if (assignment[i]) {
      totalKpi += kpis[i].kpiInTask[tasks[i].id];
    }
  }

  // Tính độ chênh lệch tỷ lệ KPI/Lương
  let kpiSalaryRatios = [];
  for (let i = 0; i < employees.length; i++) {
    if (assignment[i]) {
      kpiSalaryRatios.push(kpis[i].kpiInTask[tasks[i].id] / employees[i].costPerHour);
    }
  }
  let kpiSalaryDifference = Math.max(...kpiSalaryRatios) - Math.min(...kpiSalaryRatios);

  // Trả về giá trị đánh giá
  return [totalCost, totalKpi, kpiSalaryDifference];
}

// Hàm chọn lọc
function select(population) {
  // Sắp xếp quần thể theo giá trị đánh giá
  population.sort((a, b) => a[3] - b[3]);

  // Chọn các cá thể hàng đầu
  let selectedPopulation = [];
  for (let i = 0; i < Math.floor(POPULATION_SIZE / 2); i++) {
    selectedPopulation.push(population[i]);
  }

  return selectedPopulation;
}

// Hàm giao phối
function crossover(parent1, parent2) {
  // Tạo điểm giao phối ngẫu nhiên
  let crossoverPoint = Math.floor(Math.random() * parent1.length);

  // Tạo con cái bằng cách kết hợp các phần của cha mẹ
  let child1 = parent1.substring(0, crossoverPoint) + parent2.substring(crossoverPoint);
  let child2 = parent2.substring(0, crossoverPoint) + parent1.substring(crossoverPoint);

  return [child1, child2];
}

// Hàm đột biến
function mutate(individual) {
  // Tạo một bản sao của cá thể
  let mutatedIndividual = individual;

  // Đột biến từng bit với tỷ lệ đột biến
  for (let i = 0; i < individual.length; i++) {
    if (Math.random() < MUTATION_RATE) {
      mutatedIndividual = mutatedIndividual.substring(0, i) + (mutatedIndividual[i] === "1" ? "0" : "1") + mutatedIndividual.substring(i + 1);
    }
  }

  return mutatedIndividual;
}

// Hàm tiến hóa
function evolve() {
  // Khởi tạo quần thể ngẫu nhiên
  let population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    let randomAssignment = [];
    for (let j = 0; j < employees.length; j++) {
      randomAssignment[j] = Math.random() < 0.5;
    }
    population.push(encode(randomAssignment));
  }

  // Tiến hóa quần thể trong nhiều thế hệ
  for (let generation = 0; generation < GENERATIONS; generation++) {
    // Đánh giá quần thể
    let evaluatedPopulation = [];
    for (let i = 0; i < population.length; i++) {
      evaluatedPopulation.push([...population[i], ...evaluate(population[i])]);
    }

    // Chọn lọc quần thể
    let selectedPopulation = select(evaluatedPopulation);

    // Giao phối quần thể
    let newPopulation = [];
    for (let i = 0; i < selectedPopulation.length; i += 2) {
      if (Math.random() < CROSSOVER_RATE) {
        let children = crossover(selectedPopulation[i][0], selectedPopulation[i + 1][0]);
        newPopulation.push(children[0], children[1]);
      } else {
        newPopulation.push(selectedPopulation[i][0], selectedPopulation[i + 1][0]);
      }
    }

    // Đột biến quần thể
    for (let i = 0; i < newPopulation.length; i++) {
      newPopulation[i] = mutate(newPopulation[i]);
    }

    // Cập nhật quần thể
    population = newPopulation;
  }

  // Trả về quần thể tối ưu
  return population;
}

// Hàm chính
function main() {
  // Khởi tạo
  init();

  // Tiến hóa
  let evolvedPopulation = evolve();

  // Đánh giá quần thể tối ưu
  let evaluatedPopulation = [];
  for (let i = 0; i < evolvedPopulation.length; i++) {
    evaluatedPopulation.push([...evolvedPopulation[i], ...evaluate(evolvedPopulation[i])]);
  }

  // Sắp xếp quần thể tối ưu theo giá trị đánh giá
  evaluatedPopulation.sort((a, b) => a[3] - b[3]);

  // In ra kết quả
  console.log("Giải pháp tối ưu:");
  console.log("Tổng chi phí thực hiện:", evaluatedPopulation[0][1]);
  console.log("Tổng KPI đạt được:", evaluatedPopulation[0][2]);
  console.log("Độ chênh lệch tỷ lệ KPI/Lương:", evaluatedPopulation[0][3]);
  console.log("Việc gán nhiệm vụ:");
  for (let i = 0; i < employees.length; i++) {
    if (decode(evaluatedPopulation[0][0])[i]) {
      console.log(`${employees[i].name}: Nhiệm vụ ${tasks[i].name}`);
    }
  }
}

// Gọi hàm chính
main();