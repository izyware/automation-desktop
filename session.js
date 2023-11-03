/* izy-loadobject nodejs-require */
module.exports = function() {
  const modtask = () => {};
  const serviceCompose = {
    "verbose" : {
      "forceUpToLevel": 2,
      "extraInfoInLogs": true,
      "useANSIColors": true,
      "filter": {
        "services": ["session"],
        "_invokeStrings": ["session?userInterface"],
        "_devices": ["ethernet1"],
        "_actions": ["setup"]
      },
      "fieldsSchema": {
        "timestamp": true,
        "service": { "len": 10, "prefix": "[", "postfix": "]" }, 
        "context": { "len": 3, "prefix": "{", "postfix": "}" }, 
        "invokeString": { "len": -30, "prefix": "(", "postfix": ")" }, 
        "action": { "len": 10 }, 
        "device": { "len": 0 }, 
        "outcome": true,
        "misc": true
      }
    },
    "user": {
      "id": "1"
    },
    "process": {
      "pkgModuleString": "lib/process"
    },
    "session": {
      "pkgModuleString": "session"
    }
  };

  modtask.new = async queryObject => {
    const { workflow } = queryObject;
    const queryObjectBase64 = Buffer.from(JSON.stringify(queryObject)).toString('base64');
    const pathToJXA = `${__dirname}/workflow/${workflow}/newsession.jxa.js`;
    await modtask.newChainAsync([
      ['//inline/service?compose', serviceCompose],
      ['//service/session?userInterface'],
      [`//service/process?spawn`, {
        id: workflow,
        command: 'osascript', 
        args: ['-l', 'JavaScript', pathToJXA, queryObjectBase64]
      }]
    ]);
    return { success: true, data: '' };
  }

  modtask.userInterface = async queryObject => await modtask.newChainAsync([
    ['service.subscribeTo', 'process'],
    ['outcome', { success : true }]
  ]);

  modtask.onservice = function(queryObject) {
    const { serviceName, notification } = queryObject;
    const {
      datastreamMonitor
    } = modtask;

    if (serviceName != 'process') return;
    let { action, id, data } = notification;
    if (!data) data = '';
    if (action == 'close' && notification.exitCode) {
      datastreamMonitor.log({ level: 2, msg: {
        action,
        id,
        data,
        outcome: { reason: 'non zero exit code ' + notification.exitCode }
      }});
      return process.exit(notification.exitCode);
    }
    datastreamMonitor.log({ msg: {
      action,
      id,
      data
    }});
  };

  return modtask;
};
module.exports.forcemodulereload = true;