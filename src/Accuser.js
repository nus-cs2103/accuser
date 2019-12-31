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
      assignees: Array.isArray(usernames.constructor) ? usernames : [usernames]
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

  static runWorkers(repository, result) {
    repository.workers.forEach(worker => {
      result.data.forEach(item => {
        let activateWorker = true;
        worker.filters.forEach(filter => {
          activateWorker = activateWorker && filter(repository, item);
        });

        if (activateWorker) {
          worker.do.forEach(doCallback => {
            doCallback(repository, item);
          });
        }
      });
    });
  }

  tick(filters = {}, type = 'issues') {
    var self = this;
    var promises = [];

    self.repos.forEach(repository => {
      const repoPromise = new Promise(resolve => {
        // Some parameters common to all types.
        let params = {
          owner: repository.user,
          repo: repository.repo,
          state: filters.state || 'open'
        };

        // Switches endpoint (and additional parameters) based on the type of items being queried.
        switch (type) {
          case 'issues':
            params.assignee = filters.assignee || '*';
            params = self.github.issues.listForRepo.endpoint.merge(params);
            break;
          case 'pulls':
            params = self.github.pulls.list.endpoint.merge(params);
            break;
          default:
            console.log('Unable to handle this type: ' + type);
        }

        // Uses paginate helper method to receive items across all pages.
        self.github.paginate(params).then(result => {
          Accuser.runWorkers(repository, result);
          resolve();
        });
      });
      promises.push(repoPromise);
    });

    return Promise.all(promises);
  }

  run(filters = {}, type = 'issues') {
    var self = this;

    const tickInterval = () => {
      self.tick(filters, type)
        .then(() => setTimeout(tickInterval, self.interval));
    };
    self.tick(filters, type)
      .then(() => setTimeout(tickInterval, self.interval));
  }
}

module.exports = Accuser;
