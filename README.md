# Accuser

[![Version](https://img.shields.io/github/package-json/v/nus-cs2103/accuser/release)](https://github.com/nus-cs2103/accuser/tree/release)
[![License](https://img.shields.io/github/license/nus-cs2103/accuser)](LICENSE)
[![Build Status](https://travis-ci.org/nus-cs2103/accuser.svg?branch=master)](https://travis-ci.org/nus-cs2103/accuser)

Accuser is a lightweight framework to help you write Github bots that monitor issues and pull requests and work with them. The framework wraps around the [octokit](https://github.com/octokit/rest.js) library to make it easier to monitor pull requests, assign people and write comments.

- [x] Issues and Pull Requests filtering
- [x] Accuse / Assigning PRs
- [x] Commenting
- [x] Labels

## Getting Started

To use Accuser in your project, run `npm install --save nus-cs2103/accuser#release`. Please note:

- Always use the `release` branch, as other branches may be unstable or broken.
- Your Node.js version should be greater or equal to `8.10.0`.

## Future Implementation

- [ ] Webhooks / Event Implementation
- [ ] Renaming Title

## Testing

Accuser uses Mocha for unit testing. To perform testing:

- Ensure that development dependencies are installed.
- Run the following command `npm test`.

## Contributing

To make changes:

- Follow Airbnb's JavaScript Style Guide at [here](https://github.com/airbnb/javascript).
    - In this project, we use the [`eslint-config-airbnb-base`](https://www.npmjs.com/package/eslint-config-airbnb-base) preset and make reasonable adjustments in [`.eslintrc.js`](.eslintrc.js).
- Try not to break existing APIs.

To include your changes in the next release:

- Make sure all your code changes have been merged into the `master` branch via [pull requests](https://github.com/nus-cs2103/accuser/pulls) **(preferred)**, direct commits, etc.
- Update the `version` defined in [`package.json`](package.json). Please use [semantic versioning](https://semver.org).
- Create a new [release](https://github.com/nus-cs2103/accuser/releases/new) using the new `version` you defined just now.
- Ask any project member with required privileges to sync the `release` branch with the `master` branch _(a Git rebase may be needed)_.

## License

[MIT License](LICENSE)
