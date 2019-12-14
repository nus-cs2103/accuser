# Accuser

[![Build Status](https://travis-ci.org/nus-cs2103/accuser.svg?branch=master)](https://travis-ci.org/nus-cs2103/accuser)

Accuser is a lightweight framework to help you write Github bots that monitor issues and pull requests and work with them. The framework wraps around the [octokit](https://github.com/octokit/rest.js) library to make it easier to monitor pull requests, assign people and write comments.

- [x] Issues and Pull Requests filtering
- [x] Accuse / Assigning PRs
- [x] Commenting
- [x] Labels

## Getting Started

To use Accuser, installed Accuser to your application/project via npm:

```bash
npm install --save accuser
```

Notice: your Node.js version should be greater or equal to `6.0`.

## Future Implementation

- [ ] Webhooks / Event Implementation
- [ ] Renaming Title

## Testing

Accuser uses Mocha for unit testing. To perform testing:

- Ensure that development dependencies are installed.
- Run the following command `npm test`.

## Contributing

- Make sure all your code changes have been merged into the `master` branch via [pull requests](https://github.com/nus-cs2103/accuser/pulls) **(preferred)**, direct commits, etc.
- Update the `version` defined in [`package.json`](package.json). Please use [semantic versioning](https://semver.org).
- Create a new [release](https://github.com/nus-cs2103/accuser/releases/new) using the new `version` you defined just now.
- Ask any project member with required privileges to sync the `release` branch with the `master` branch _(a Git rebase may be needed)_.

## License

[MIT License](LICENSE)
