function reCalculateTimeWorking(time) {
  console.log("time: ", time)
  console.log("time.getH: ", time.getHours())
  console.log("time.getDay: ", time.getDay())
  // Đưa về giờ làm chuẩn
  if (time.getHours() >= 17) { // giờ >=17 chuyển sang ngày hôm sau
    time.setDate(time.getDate() + 1);
    time.setHours(8 + time.getHours() - 17)
  } else if (time.getHours() < 13 && time.getHours() > 12) {
    time.setHours(time.getHours() + 1)
  } else if (time.getHours() < 8) {
    time.setHours(8)
  };

  while (time.getDay() % 6 == 0 || time.getDay() % 7 == 0) { // Không làm T7, chủ nhật
    time.setDate(time.getDate() + 1);
  }

  console.log("return time: ", time)

  return time;
}

console.log("reacsc: ", reCalculateTimeWorking(new Date('2024-08-02T05:00:00.000Z')))