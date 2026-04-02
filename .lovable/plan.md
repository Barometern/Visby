

# Retry Build

The build failure is caused by HTTP 429 (Too Many Requests) from the npm package cache — a transient infrastructure issue, not a code problem.

## Action
Make a trivial no-op change to trigger a fresh build attempt. Add/remove a blank line in a harmless file like `src/main.tsx`.

