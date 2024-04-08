function topologicalSort(tasks) {
  const result = [];
  const visited = new Set();
  const inProgress = new Set();

  function visit(task) {
    if (inProgress.has(task)) {
      throw new Error('Tasks have cyclic dependencies.');
    }

    if (!visited.has(task)) {
      inProgress.add(task);

      const dependencies = task.preceedTasks || [];
      dependencies.forEach(depId => {
        const dependency = tasks.find(t => t.id === depId);
        if (!dependency) {
          throw new Error(`Dependency with id ${depId} not found.`);
        }
        visit(dependency);
      });

      inProgress.delete(task);
      visited.add(task);
      result.unshift(task);
    }
  }

  tasks.forEach(task => visit(task));

  return result;
}

function scheduleTasks(job) {
  // Sắp xếp các nhiệm vụ theo thứ tự topological
  const sortedTasks = topologicalSort(job.tasks);

  // Gán startTime và endTime cho từng nhiệm vụ
  let currentTime = job.startTime;
  for (const task of sortedTasks) {
    // Kiểm tra xem tất cả các nhiệm vụ tiên quyết đã hoàn thành chưa
    const preceedingTasksCompleted = task.preceedTasks.every(id => job.tasks.find(t => t.id === id).endTime <= currentTime);
    if (preceedingTasksCompleted) {
      task.startTime = currentTime;
      task.endTime = new Date(currentTime.getTime() + task.duration);
      currentTime = task.endTime;
    } else {
      // Nếu không, nhiệm vụ phải chờ đến khi các nhiệm vụ tiên quyết hoàn thành
      const maxPreceedTaskEndTime = Math.max(...task.preceedTasks.map(id => job.tasks.find(t => t.id === id).endTime));
      currentTime = new Date(maxPreceedTaskEndTime.getTime() + 1); // Bắt đầu sau khi các nhiệm vụ tiên quyết hoàn thành
      task.startTime = currentTime;
      task.endTime = new Date(currentTime.getTime() + task.duration);
      currentTime = task.endTime;
    }
  }

  return sortedTasks;
}
