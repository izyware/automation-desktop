# Installation
Clone the repository then:

    npm install 
    npm link

# Basic CLI

    izy.auto "session?new" queryObject.workflow default queryObject.sleep 1 queryObject.exitCode
    izy.auto "session?new" queryObject.workflow default queryObject.action open queryObject.url https://wikipedia.org
    izy.auto "session?new" queryObject.workflow default queryObject.action close queryObject.url wikipedia.org
    izy.auto "session?new" queryObject.workflow default queryObject.action addcurrentcontext



# Links
* [github]
* [automation-projects]


# ChangeLog

## V7.1
* 7100005: add support for fs.readFileSync. Implement addcurrentcontext to default workflow.
* 7100004: add support for module and browser automation
* 7100003: migrate from AI LLM module


[automation-projects]: https://izyware.com/help/article/automation-projects
[github]: https://github.com/izyware/automation-desktop