var assert = require('assert');
var sinon = require('sinon');
var Accuser = require('../');

describe("Accuser", function() {
  var accuser;

  var sampleIssue = {
    number: 20,
    base: {
      repo: {
        name: "accuser",
        owner: {
          login: "mauris"
        }
      }
    }
  };

  beforeEach(function() {
    accuser = new Accuser();
  });

  it("should authenticate with Github", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");
    assert(repository);
    assert(accuser.repos[0] === repository);
    next();
  });

  it("should be able to add a new repository", function(next) {
    accuser.github = {
      authenticate: function(config){
        assert(config.type === "oauth");
        assert(config.token === "some token");
      }
    };
    var mock = sinon.mock(accuser.github);
    mock.expects("authenticate").once();
    accuser.authenticate({
      "type": "oauth",
      "token": "some token"
    });
    mock.verify();
    next();
  });

  it("should accuse someone based on an issue object and username", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");

    accuser.github = {
      issues: {
        addAssignees: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.assignees[0] === "mauris");
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("addAssignees").once();
    accuser.accuse(repository, sampleIssue, "mauris");
    mock.verify();
    next();
  });

  it("should accuse someone based on an issue object and multiple username", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");

    accuser.github = {
      issues: {
        addAssignees: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.assignees[0] === "mauris");
          assert(obj.assignees[1] === "octocat");
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("addAssignees").once();
    accuser.accuse(repository, sampleIssue, ["mauris", "octocat"]);
    mock.verify();
    next();
  });

  it("should request reviewers based on a pr object and username", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");

    accuser.github = {
      pullRequests: {
        createReviewRequest: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.reviewers[0] === "mauris");
        }
      }
    };
    var mock = sinon.mock(accuser.github.pullRequests);
    mock.expects("createReviewRequest").once();
    accuser.requestReview(repository, sampleIssue, "mauris");
    mock.verify();
    next();
  });

  it("should request reviewers based on a pr object and multiple usernames", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");

    accuser.github = {
      pullRequests: {
        createReviewRequest: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.reviewers[0] === "mauris");
          assert(obj.reviewers[1] === "octocat");
        }
      }
    };
    var mock = sinon.mock(accuser.github.pullRequests);
    mock.expects("createReviewRequest").once();
    accuser.requestReview(repository, sampleIssue, ["mauris", "octocat"]);
    mock.verify();
    next();
  });

  it("should add a comment to an issue", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");

    accuser.github = {
      issues: {
        createComment: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.body === "some comment");
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("createComment").once();
    accuser.comment(repository, sampleIssue, "some comment");
    mock.verify();
    next();
  });

  it("should add a label to an issue", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");
    var testLabel = "testingonly";
    accuser.github = {
      issues: {
        addLabels: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.body[0] === testLabel);
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("addLabels").once();
    accuser.addLabels(repository, sampleIssue, testLabel);
    mock.verify();
    next();
  });

  it("should open an issue", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");
    accuser.github = {
      issues: {
        update: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.state === 'open');
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("update").once();
    accuser.open(repository, sampleIssue);
    mock.verify();
    next();
  });

  it("should close an issue", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");
    accuser.github = {
      issues: {
        update: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.state === 'closed');
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("update").once();
    accuser.open(repository, sampleIssue);
    mock.verify();
    next();
  });

  it("should add some labels to an issue", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");
    var testLabel = [
      "testingonly",
      "noway"
    ];
    accuser.github = {
      issues: {
        addLabels: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.body === testLabel);
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("addLabels").once();
    accuser.addLabels(repository, sampleIssue, testLabel);
    mock.verify();
    next();
  });

  it("should remove a label from an issue", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");
    var testLabel = "noway";
    accuser.github = {
      issues: {
        removeLabel: function(obj) {
          assert(obj.repo === repository.repo);
          assert(obj.user === repository.user);
          assert(obj.number === sampleIssue.number);
          assert(obj.body === testLabel);
        }
      }
    };
    var mock = sinon.mock(accuser.github.issues);
    mock.expects("removeLabel").once();
    accuser.removeLabel(repository, sampleIssue, testLabel);
    mock.verify();
    next();
  });

  it("should fetch issues from an added repository", function(next) {
    var repository = accuser.addRepository("mauris", "accuser");

    var filterSpy = sinon.spy();
    var workerFilter = function(repo, issue) {
      assert(repository === repo);
      assert(issue == sampleIssue);
      filterSpy();
      return true;
    };

    var doSpy = sinon.spy();
    var workerDo = function(repo, issue) {
      assert(repository === repo);
      assert(issue == sampleIssue);
      doSpy();
    };

    repository.newWorker()
      .filter(workerFilter)
      .do(workerDo);

    accuser.github = {
      paginate: obj => {
        return new Promise(function(resolve, reject) {
          resolve([sampleIssue]);
        });
      }
    };
    var mock = sinon.mock(accuser.github);
    mock.expects("paginate").once().returns(new Promise(function(resolve, reject) {
      resolve({ data: [sampleIssue] });
    }));

    accuser.tick({}, 'others')
      .then(function(){
        assert(filterSpy.calledOnce);
        assert(doSpy.calledOnce);
        mock.verify();
        next();
      });
  });
});
