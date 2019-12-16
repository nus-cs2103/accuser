class Repository {
  constructor(user, repo) {
    this.user = user;
    this.repo = repo;
    this.workers = [];
  }

  newWorker() {
    const self = this;
    const worker = {
      filters: [],
      do: []
    };
    self.workers.push(worker);

    const workerChain = {
      filter: filterCallback => {
        worker.filters.push(filterCallback);
        return workerChain;
      },
      do: doCallback => {
        worker.do.push(doCallback);
        return workerChain;
      }
    };
    return workerChain;
  }
}

module.exports = Repository;
