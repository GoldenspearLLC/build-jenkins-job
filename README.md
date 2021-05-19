# Build jenkins job from Github Action :rocket:

This action builds/triggers a jenkins job, waiting it to be finished and
enabling to pass job params.

## Inputs

### `jenkins-token`

**Required**

### `jenkins-url`

**Required**

### `jenkins-user`

**Required**

### `job-path`

**Required**

E.g.

```
if job inside folder:
 "job/folder_name/job/job_name"

if job in jenkins root:
 "job/job_name"
```

### `job-params`

Set jenkins params as JSON string:

E.g.

```
 {"param1": "value1", "param2": "value2"}
```

### `poll-interval`

The time interval between polls of the build status. Time in seconds. Defaults
to 10 seconds.

E.g.

```
10
```

### `timeout`

If the build does not complete within the `timeout` time, this github action
will be marked as failed. Time in seconds. Defaults to 180 (3 minutes).

E.g.

```
180
```

## Outputs

### `job_status`

- FAILURE
- SUCCESS
- ABORTED

### `build_url`

URL to view the build in Jenkins.

## Example usage

```
    - name: "Trigger jenkins job"
      uses: loveholidays/build-jenkins-job@master
      with:
        jenkins-url: ${{ secrets.JENKINS_URL }}
        jenkins-token: ${{ secrets.JENKINS_TOKEN }}
        user: "jenkins-username"
        job-path: "job/folder_name/job/job_name"
        job-params: '{"param1": "value1", "param2": "value2"}'
    - name: Get job status
      run: echo "Job status is ${{ steps.job-build.outputs.job_status }}"
```
