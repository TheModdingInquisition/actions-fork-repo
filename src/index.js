import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';

run();

async function run() {
    const token = core.getInput('token', {required: true});
    const org = core.getInput('organization');
    const toFork = core.getInput('repo', {required: true}).toLocaleLowerCase();
    try {
        const toForkSplit = toFork.split('/');

        if (toForkSplit.length < 2) {
            core.setFailed(`Invalid repository to fork: ${toFork}`);
        }

        const octokit = getOctokit(token);
        const response = await octokit.rest.repos.createFork({
            owner: toForkSplit[0],
            repo: toForkSplit[1],
        } & {
            organization: org
        });

        if (response.status == 403) {
            core.setFailed(`The authenticated user cannot create forks under ${org}`);
        } else if (response.status == 404) {
            core.setFailed(`Unknown repository '${toFork}'`);
        }
        console.log(`The request status code was ${response.status}`);
        core.info(`Forked repository '${toFork}' under "${org}": ${response.data}`);
        
        core.setOutput('fork_url', response.data.html_url);
    } catch (err) {
        console.log(err.stack);
        core.setFailed(`Error while trying to fork "${toFork}": ${err}`);
    }
}