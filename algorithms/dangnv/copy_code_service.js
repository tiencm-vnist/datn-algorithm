exports.proposalForBiddingPackage = async (portal, body, params, companyId) => {
    //bid, estimateTime = 0, unitOfTime = "days", task
    const { tags, tasks, biddingPackage, unitOfTime, executionTime, type, isPreferedHighSkill } = body;
    const { bidId } = params;

    // lấy all user
    const allUser = await User(connect(DB_CONNECTION, portal)).find({});

    // lấy all user
    const allTag = await Tag(connect(DB_CONNECTION, portal)).find({});

    // lấy all employee active
    const listAllEmployees = await Employee(connect(DB_CONNECTION, portal)).find({
        // biddingPackagePersonalStatus: 1,
        status: "active"
    })

    // lấy ra tất cả các task
    const allTask = await Task(connect(DB_CONNECTION, portal)).find({
        isArchived: false,
        status: {
            $in: ["inprocess", "wait_for_approval"],
        },
    });

    let logs = biddingPackage?.proposals?.logs ?? []
    let proposalTask = [];
    let isComplete = 0;
    let startOfTask = Date.now();
    let endOfTask = Date.now();
    let prevTask = null;
    let oldEmployees = [];
    let compareVersion = [];
    // return task đề xuất
    // xử lý task để trả về nhân viên với thông tin các task sẽ phải làm
    for (let t of tasks) {
        startOfTask = endOfTask;

        // danh sách tất cả nhân viên với task
        let empWithTask = await this.getEmployeeInfoWithTask(
            allUser, 
            listAllEmployees, 
            allTask, 
            startOfTask, 
            t.estimateTime, 
            unitOfTime, 
            prevTask, 
            biddingPackage, 
            oldEmployees, 
            allTag, 
            t.tag,
            t.suitableEmployees,
            isPreferedHighSkill,
        );
        endOfTask = moment(startOfTask).add(Number(t.estimateTime), unitOfTime).toDate();
        oldEmployees = empWithTask;

        // tìm danh sách emp tương ứng với tag
        // let tagOfTask = tags.find(x => x.name === t.tag)


        // let listEmpByTag = [];
        // if (allTag?.length > 0) listEmpByTag = allTag.find(x => String(t.tag) === String(x._id))?.employees ?? [];

        // if (!listEmpByTag?.length) listEmpByTag = [...empWithTask];

        let listSuitableEmp = t.suitableEmployees ?? [];
        // if (!listSuitableEmp?.length) listSuitableEmp = empWithTask.map(x => String(x.empId));
        console.log(listSuitableEmp);


        let directEmpAvailable = empWithTask.filter(x => listSuitableEmp.indexOf(String(x.empId)) !== -1).map(x => x.empId);
        let backupEmpAvailable = empWithTask.filter(x => listSuitableEmp.indexOf(String(x.empId)) !== -1).map(x => x.empId);
        let proposalEmpArr = [directEmpAvailable, backupEmpAvailable];
        console.log(directEmpAvailable);

        // let numBackupEmpRequired = t.numberOfEmployees; // t.numberOfEmployees <= listSuitableEmp?.length
        let numDirectpEmpRequired = t.numberOfEmployees;
        let numBackupEmpRequired = (listSuitableEmp?.length - numDirectpEmpRequired) <= numDirectpEmpRequired + 2 ? (listSuitableEmp?.length - numDirectpEmpRequired) : numDirectpEmpRequired;
        let numOfEmpRequireArr = [numDirectpEmpRequired, numBackupEmpRequired];

        // let data = await findEmployee(proposalEmpArr, [], [], [], numOfEmpRequireArr, 0);
        let data = {
            isComplete: 0,
        }

        let flag = 1;
        while(flag === 1) {
            flag = 1;
            numOfEmpRequireArr = [numDirectpEmpRequired, numBackupEmpRequired];
            data = await findEmployee(proposalEmpArr, [], [], [], numOfEmpRequireArr, 0);
            
            if (data.isComplete == 1) {
                // console.log(data.result[0]);

                const newTask = {
                    ...t,
                    directEmployees: data.result[0],
                    backupEmployees: data.result[1],
                };
                prevTask = newTask;

                compareVersion.push({
                    isComplete: 1,
                    code: t.code,
                    tag: t.tag,
                    name: t.taskName,
                    old: t,
                    new: newTask
                })

                proposalTask.push(newTask);

                isComplete = 1;
                flag = 0
            } else {
                isComplete = 0;
            }

            numBackupEmpRequired = numBackupEmpRequired - 1;
            if(numBackupEmpRequired <= 0) {
                flag = 0
            }
        }
        console.log(1718, data);
        if (isComplete === 0) {
            console.log(data);
            if (numDirectpEmpRequired === listSuitableEmp.length) {

            }
            const newTaskErr = {
                ...t,
                directEmployees: numDirectpEmpRequired >= listSuitableEmp.length ? listSuitableEmp : [],
                backupEmployees: [],
            };
            prevTask = newTaskErr;

            compareVersion.push({
                isComplete: 0,
                code: t.code,
                tag: t.tag,
                name: t.taskName,
                old: t,
                new: newTaskErr
            })

            proposalTask.push(newTaskErr);

            isComplete = 0;
        }
    }

    let countResult = 0;
    for (let item of compareVersion) {
        if (item.isComplete === 1) {
            countResult = countResult + 1;
        }
    }
    if (countResult === tasks.length) {
        isComplete = 1;
    } else {
        isComplete = 0;
    }

    console.log(proposalTask.map(x => {return {d: x.directEmployees, b: x.backupEmployees}}));

    return {
        type: type,
        id: bidId,
        compareVersion: compareVersion,
        proposal: {
            executionTime,
            unitOfTime,
            tags,
            tasks: proposalTask,
            logs: logs,
        },
        isComplete
    }
}

exports.proposalForTaskBidding = async(portal, packageId, companyId) => {
  const allTask = await Task(connect(DB_CONNECTION, portal)).find({
    status: {
        $in: ["inprocess", "wait_for_approval"],
    },
  }).lean().exec();
  var salaries = await Salary(connect(DB_CONNECTION, portal)).find({}).lean().exec();
  const employees = await Employee(connect(DB_CONNECTION, portal)).find({}).limit(3).lean().exec();

  employees.forEach(employ => {
    employ.salary = salaries.filter(_ => _.employee == employ._id.toString())[0]?.mainSalary;
  });
  const biddingPackage = await BiddingPackage(
        connect(DB_CONNECTION, portal)
    ).findOne({
        _id: {
            $in: mongoose.Types.ObjectId(packageId),
        },
    }).lean().exec();
  biddingPackage.proposals.tasks.forEach(_ => _.threadIndex = null);
  const job = {
    startTime: biddingPackage.startDate,
    tasks: biddingPackage.proposals.tasks,
  };

  let numThreads = employees.length;
  // Xử lý dữ liệu các task đầu vào sao cho task tiền nhiệm phải được sắp xếp trước
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
        
        const dependencies = task.preceedingTasks || [];
        tasks.filter(_=> dependencies.includes(_.code)).forEach(visit);    
        
        inProgress.delete(task);
        visited.add(task);
        result.unshift(task);
      }
    }
    
    for (const task of tasks) {
      visit(task);
    }
    
    return result.reverse();
  }
  
  job.tasks = topologicalSort(job.tasks)
  const test = await BiddingPackage(connect(DB_CONNECTION, portal)).find({}).lean().exec();

  const listAssetReadyToUse = await Asset(connect(DB_CONNECTION, portal)).find({ status : "ready_to_use"}).lean().exec();
  const listAssetInUse = await Asset(connect(DB_CONNECTION, portal)).find({ status : "in_use"}).lean().exec();    // const list = listAssetReadyToUse[0]._doc.usageLogs;
  const asset = {
    inUse: listAssetInUse,
    readyToUse: listAssetReadyToUse
  };

  function initBestAssignment(job) {
    let nextEndTime = job.startTime;
    job.tasks.forEach(function(task) {
      const numDay = Math.floor(task.hours / 8);
      const remainHour = task.hours % 8;
      task.startTime = reCalculateStartTime(nextEndTime);
      task.endTime = new Date(86400000000000);
      nextEndTime = task.endTime;
    });

    return job.tasks;
  }

  function getAvailableTimeForAsset(task, asset) {
    if (task.requireAsset.length == 0) {
      return new Date(0);
    }

    let availableTime = [];
    task.requireAsset.forEach(require => {
      let readyToUse = asset.readyToUse.filter(_ => JSON.stringify(_.assetType).includes(require.requireType));
      if (readyToUse.length >= require.count) {
        availableTime.push(new Date(0));
      }
      else {
        let remain = require.count - readyToUse.length;
        let inUse = asset.inUse.filter(_ => JSON.stringify(_.assetType).includes(require.requireType));
        let logs = inUse.map(_=>_.usageLogs.sort((a, b) => b.endDate - a.endDate)[0].endDate).sort((a, b) =>  a - b);
        availableTime.push(logs[remain - 1])
      }
    });
    return new Date(Math.max(...availableTime));
  }

  function calculateLatestStartTime(index, currentAssignment, task, asset) {
    let taskInThread = currentAssignment.filter(_ => _.threadIndex == index);
    let prevTaskEndTime = currentAssignment.filter(_ => task.preceedingTasks.includes(_.code)).map(_ => new Date(_.endTime));
    let availableTimeForAsset = getAvailableTimeForAsset(task, asset);
    prevTaskEndTime.push(availableTimeForAsset)

    if (taskInThread.length == 0) {
      prevTaskEndTime.push(job.startTime)

      return new Date(Math.max(...prevTaskEndTime));
    }

    let listEndTimeInThread = taskInThread.map(_ => new Date(_.endTime));

    return new Date(Math.max(...listEndTimeInThread.concat(prevTaskEndTime)));
  }

  function calculateLatestCompletionTime(job) {
    let latestCompletionTime = job.startTime;

    for (let i = 0; i < job.tasks.length; i++) {
      const task = job.tasks[i];
      const taskEndTime = new Date(task.endTime);
      if (taskEndTime > latestCompletionTime) {
        latestCompletionTime = taskEndTime;
      }
    }

    return latestCompletionTime;
  }

  function isStartIndex(currentAssignment, index) {
    let taskInThread = currentAssignment.filter(_ => _.threadIndex == index);

    if (taskInThread.length == 0){
       return true
    }

    return false;
  }

  function branchAndBound(numThreads, job, currentDepth, currentEndTime, currentAssignment, bestAssignment, asset) {
    if (currentDepth === job.tasks.length) {
      if (currentEndTime < calculateLatestCompletionTime(job)) {
        bestAssignment.splice(0, bestAssignment.length, ...currentAssignment);
      }
      return;
    }

    const task = job.tasks[currentDepth];

    for (let index = 0; index < numThreads; index++) {
      const numDay = Math.floor(task.estimateTime);
      const remainHour = (task.estimateTime - numDay) * 8;
      const startTime = reCalculateTimeWorking(calculateLatestStartTime(index, currentAssignment, task, asset), 
                                                                        isStartIndex(currentAssignment, index));
      const endTime = reCalculateTimeWorking(new Date(startTime.getTime() + numDay * 86400000 + remainHour * 3600000));
      const threadIndex = index;
      const newAssignment = [...currentAssignment];
      newAssignment[currentDepth] = { ...task, startTime, endTime, threadIndex };

      if (calculateLatestCompletionTime({ startTime: job.startTime, tasks: newAssignment }) > calculateLatestCompletionTime(job)) {
        continue;
      }

      branchAndBound(numThreads, job, currentDepth + 1, endTime, newAssignment, bestAssignment, asset);
    }
  }

  function findOptimalAssignment(job, numThreads, asset) {
    const bestAssignment = initBestAssignment(job);
    branchAndBound(numThreads, job, 0, job.startTime, [], bestAssignment, asset);
    bestAssignment.sort((a, b) => a.index - b.index);
  
    return bestAssignment;
  }


  const optimalAssignment = findOptimalAssignment(job, numThreads, asset);
  console.log('Optimal Assignment:', optimalAssignment);
  console.log('Latest Completion Time:', calculateLatestCompletionTime(job));
  // Gán tài nguyên con người

  function groupBy(array, property) {
    return array.reduce((result, obj) => {
      const key = obj[property];
  
      if (!result[key]) {
        result[key] = [];
      }
  
      result[key].push(obj);
      return result;
    }, {});
  }

  const jobs = groupBy(optimalAssignment, 'threadIndex');
  function calculateRandomAssigneCost(job) {
    let totalCost = 0;
    for (let i = 0; i < Object.keys(job).length; i++) {
        const tasks = job[i];
        const startTime = new Date(Math.min(...tasks.map(_ => new Date(_.startTime))));
        const endTime = new Date(Math.max(...tasks.map(_ => new Date(_.endTime))));
        let salary = 0;
        if (tasks[0].assignee == null){
            salary = Math.max(...employees.map(_ => _.salary))
        } else {
            salary = tasks[0].assignee.salary
        };
        const taskCost = (endTime - startTime) / (1000 * 60 * 60 * 24) * salary;
        totalCost = totalCost + taskCost;
    }

    return totalCost;
  }

  function duplicateSchedule(employee, startTime, endTime){
    let currentTask = allTask.filter(_ => _.responsibleEmployees.toString().split(',').includes(employee._id.toString()));
    let duplicateTask = [];

    for (let i = 0; i < currentTask.length; i++){
      if (((startTime <= currentTask[i].startDate) && (endTime <= currentTask[i].startDate)) ||
        ((startTime >= currentTask[i].endDate) && (endTime >= currentTask[i].endDate))) {
        continue;
      }
      duplicateTask.push(currentTask[i]);
    }

    return duplicateTask;
  }

  function assignTasks(jobIndex, assignments, bestAssignment, currentCost, minCost, checkDuplicateFlag) {
    if (jobIndex === Object.keys(jobs).length) {
      if (currentCost < calculateRandomAssigneCost(bestAssignment)) {
        if ((JSON.stringify(assignments) != undefined) && (Object.keys(assignments).length == Object.keys(jobs).length)) {
          Object.keys(bestAssignment).forEach(key => bestAssignment[key] = JSON.parse(JSON.stringify(assignments[key])));
          Object.keys(assignments).forEach(key => delete assignments[key]);
        }
        return;
      }
      return;
    }

    const jobKey = Object.keys(jobs)[jobIndex];
    const tasks = JSON.parse(JSON.stringify(jobs[jobKey]));

    for (let i = 0; i < employees.length; i++) {
      const startTime = new Date(Math.min(...tasks.map(_ => new Date( _.startTime))));
      const endTime = new Date(Math.max(...tasks.map(_ => new Date(_.endTime))));
      let noneDuplicate = !checkDuplicateFlag || (duplicateSchedule(employees[i], startTime, endTime).length === 0);
      if ((!Object.values(assignments).flat().some(assignment => assignment.assignee === employees[i])) && noneDuplicate) {
        const taskCost = (endTime - startTime) / (1000 * 30 * 60 * 60 * 24) * employees[i].salary;

        if((currentCost + taskCost) > calculateRandomAssigneCost(bestAssignment)){
          Object.keys(assignments).forEach(key => delete assignments[key]);
          continue;
        }
        tasks.forEach(task =>
          task.assignee = employees[i]
        )
        let obj = {}
        obj[jobKey] = tasks
        assignments = Object.assign(assignments, obj);

        minCost = currentCost + taskCost
        assignTasks(jobIndex + 1, assignments, bestAssignment, currentCost + taskCost, minCost, checkDuplicateFlag);

      }
    }
  }


  function branchAndBoundEmployee(jobs, employees, checkDuplicateFlag) {
    var bestAssignment = Object.assign({}, JSON.parse(JSON.stringify(jobs)));
    const minCost = Number.MAX_SAFE_INTEGER;
    var assignments = Object.assign({});
    assignTasks(0, assignments, bestAssignment, 0, minCost, checkDuplicateFlag);
  
    return bestAssignment;
  }

  const result = branchAndBoundEmployee(jobs, employees, true);
  if (Object.values(result).flat().map(_ => _.assignee).includes(null) ||
    Object.values(result).flat().map(_ => _.assignee).includes(undefined)) {
    let tempResult = branchAndBoundEmployee(jobs, employees, false);
    let tempAssign = Object.values(tempResult).flat();
    let listReAssign = [];
    employees.forEach(employ => {
      let assignTask = tempAssign.filter(_ => _.assignee._id == employ._id);
      let startTime = new Date(Math.min(...assignTask.map(_ => new Date( _.startTime))));
      let endTime = new Date(Math.max(...assignTask.map(_ => new Date(_.endTime))));
      let duplicate = duplicateSchedule(employ, startTime, endTime);
      duplicate.forEach(dup => dup.employeeName = employ.fullName);
      listReAssign.push(duplicate);
    })

    Object.values(tempAssign).flat().forEach(_ => {
      _.assignee = _.assignee.fullName
    })
    
    return {
      ...biddingPackage,
      proposals: {
        ...biddingPackage.proposals,
        tasks: Object.values(tempAssign).flat(),
        reAssigns: listReAssign.flat()
      }
    }
  }

  Object.values(result).flat().forEach(_ => {
    _.assignee = _.assignee.fullName
  })

  console.log("Best assignment:", result);
  return {
    ...biddingPackage,
    proposals: {
        ...biddingPackage.proposals,
        tasks: Object.values(result).flat(),
        reAssigns: null
    }
  }
}