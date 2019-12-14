/*
  Accuser - Github wrapper for issue and pull request automation.
  Written by Sam-Mauris Yong
  Code licensed under MIT License.
 */

var GitHubApi = require("@octokit/rest");
var Repository = require("./Repository");

class Accuser {
  constructor(options) {
    options = options || {};
    this.workers = [];
    this.repos = [];
    this.interval = options.interval || 300000;
    this.github = new GitHubApi(options);
  }

  authenticate(config) {
    return this.github.authenticate(config);
  }

  accuse(repository, issue, usernames) {
    var self = this;
    self.github.issues.addAssigneesToIssue({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      assignees: usernames.constructor == Array ? usernames : [usernames]
    });
  }

  requestReview(repository, pr, reviewers) {
    var self = this;
    self.github.pullRequests.createReviewRequest({
      owner: repository.user,
      repo: repository.repo,
      number: pr.number,
      reviewers: reviewers.constructor == Array ? reviewers : [reviewers]
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
      labels: labels.constructor == Array ? labels : [labels]
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
    self.github.issues.edit({
      owner: repository.user,
      repo: repository.repo,
      number: issue.number,
      state: 'open'
    });
  }

  close(repository, issue) {
    var self = this;
    self.github.issues.edit({
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

  tick(filters) {
    var self = this;
    var promises = [];

    filters = filters || {};
    filters.state = filters.state || 'open';
    filters.assignee = filters.assignee || '*';

    self.repos.forEach(function(repository) {
      var repoPromise = new Promise(function(resolve, reject){
        filters.owner = repository.user;
        filters.repo = repository.repo;
        self.github.issues
          .getForRepo(filters)
          .then(createResponseCallback(self.github, resolve, repository));
      });
      promises.push(repoPromise);
    });

    return Promise
      .all(promises);
  }

  run(filters) {
    var self = this;
    var github = self.github;

    filters = filters || {};

    var tickInterval = function() {
      self.tick(filters)
        .then(function() {
          setTimeout(tickInterval, self.interval);
        });
    };

    self.tick(filters)
      .then(function() {
        setTimeout(tickInterval, self.interval);
      });
  }
}

var runWorkers = function(repository, prList) {
  // the list is now done, run all workers
  repository.workers.forEach(function(worker){
    prList.data.forEach(function(pr){
      var activateWorker = true;
      worker.filters.forEach(function(filter){
        activateWorker = activateWorker && filter(repository, pr);
      });
      if (activateWorker) {
        worker.do.forEach(function(doCallback){
          doCallback(repository, pr);
        });
      }
    });
  });
};

var createResponseCallback = function(github, resolve, repository) {
  return function(result) {
    runWorkers(repository, result);
    if (github.hasNextPage(result)) {
      github.getNextPage(result, function(err, res){
        var callback = createResponseCallback(github, resolve, repository);
        if (err === null) {
          callback(res);
        }
      });
    } else {
      // done with all paginations
      resolve();
    }
  };
};

module.exports = Accuser;
