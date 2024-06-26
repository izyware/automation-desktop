# Installation
To install the tools for global access to `izy.auto` command, use:

    curl -o- https://raw.githubusercontent.com/izyware/automation-desktop/master/sh/install.sh | bash

# Basic CLI

    izy.auto "session?new" queryObject.workflow default queryObject.sleep 1 queryObject.exitCode
    izy.auto "session?new" queryObject.workflow default queryObject.action open queryObject.url https://wikipedia.org
    izy.auto "session?new" queryObject.workflow default queryObject.action close queryObject.url wikipedia.org
    izy.auto "session?new" queryObject.workflow default queryObject.action addcurrentcontext



# Links
* [github]
* [automation-projects]


# ChangeLog

## v7.3
* 7300001: implement install script

## v7.2
* 7200001:implement showBrowserState and improve sleep command to happen after command execution

## V7.1
* 7100005: add support for fs.readFileSync. Implement addcurrentcontext to default workflow.
* 7100004: add support for module and browser automation
* 7100003: migrate from AI LLM module


[automation-projects]: https://izyware.com/help/article/automation-projects
[github]: https://github.com/izyware/automation-desktop