/*
  Accuser - Github wrapper for issue and pull request automation.
  Written by Sam-Mauris Yong
  Code licensed under MIT License.
 */

const GitHubAPI = require('@octokit/rest');
const Repository = require('./Repository');

class Accuser {
  constructor(options = {}) {
    this.workers = [];
    this.repos = [];
    this.interval = options.interval || 300000;
    this.github = new GitHubAPI(options);
  }

  authenticate(config) {
    return this.github.authenticate(config);
  }

  accuse(repository, issue, usernames) {
    var self = this;
    self.github.issues.addAssignees({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      assignees: usernames.constructor === Array ? usernames : [usernames]
    });
  }

  requestReview(repository, pr, reviewers) {
    var self = this;
    self.github.pullRequests.createReviewRequest({
      owner: repository.user,
      repo: repository.repo,
      number: pr.number,
      reviewers: Array.isArray(reviewers) ? reviewers : [reviewers]
    });
  }

  comment(repository, issue, comment) {
    var self = this;
    self.github.issues.createComment({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      body: comment
    });
  }

  addLabels(repository, issue, labels) {
    var self = this;
    self.github.issues.addLabels({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      labels: Array.isArray(labels) ? labels : [labels]
    });
  }

  removeLabel(repository, issue, label) {
    var self = this;
    self.github.issues.removeLabel({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      name: label
    });
  }

  open(repository, issue) {
    var self = this;
    self.github.issues.update({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      state: 'open'
    });
  }

  close(repository, issue) {
    var self = this;
    self.github.issues.update({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      state: 'closed'
    });
  }

  addRepository(user, repo) {
    var self = this;
    var repository = new Repository(user, repo);
    self.repos.push(repository);
    return repository;
  }

  static runWorkers(repository, prList) {
    // the list is now done, run all workers
    repository.workers.forEach(worker => {
      prList.data.forEach(pr => {
        let activateWorker = true;
        worker.filters.forEach(filter => {
          activateWorker = activateWorker && filter(repository, pr);
        });

        if (activateWorker) {
          worker.do.forEach(doCallback => {
            doCallback(repository, pr);
          });
        }
      });
    });
  }

  static createResponseCallback(github, resolve, repository) {
    return result => {
      Accuser.runWorkers(repository, result);

      // Stop if already done with all pages.
      if (!github.hasNextPage(result)) {
        resolve();
        return;
      }

      github.getNextPage(result, (err, res) => {
        const callback = Accuser.createResponseCallback(github, resolve, repository);
        if (err === null) {
          callback(res);
        }
      });
    };
  }

  tick(filters = {}, type = 'issues') {
    var self = this;
    var promises = [];

    self.repos.forEach(repository => {
      const repoPromise = new Promise(resolve => {
        const params = {
          owner: repository.user,
          repo: repository.repo,
          state: filters.state || 'open'
        };
        const callback = Accuser.createResponseCallback(self.github, resolve, repository);

        switch (type) {
          case 'issues':
            params.assignee = filters.assignee || '*';
            self.github.issues.listForRepo(params)
              .then(callback);
            break;
          case 'pulls':
            self.github.pulls.list(params)
              .then(callback);
            break;
          default:
            console.log('Unable to handle this type: ' + type);
        }
      });
      promises.push(repoPromise);
    });

    return Promise.all(promises);
  }

  run(filters = {}) {
    var self = this;

    const tickInterval = () => {
      self.tick(filters)
        .then(() => setTimeout(tickInterval, self.interval));
    };
    self.tick(filters)
      .then(() => setTimeout(tickInterval, self.interval));
  }
}

module.exports = Accuser;
