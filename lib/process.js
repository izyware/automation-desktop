var modtask = function() {};
modtask.spawn = async (queryObject, cb, context) => {
  const {
    datastreamMonitor
  } = modtask;
  const {
      service,
      monitoringConfig
  } = context;

  let { command, args, id } = queryObject;
  if (!id) id = 'process_' + Math.random();
  const { spawn } = require('node:child_process');
  const child = spawn(command, args);
  child.stdout.on('data', dataBuffer => {
    const data = dataBuffer.toString(); 
    modtask.newChainAsync([
      ['//inline/service?notifySubscribers', {
        source: modtask.__myname,
        notification: {
          id,
          action: 'stdout',
          pid: child.pid,
          data
        }
      }]
    ]);
  });
  
  child.stderr.on('data', dataBuffer => {
    modtask.newChainAsync([
      ['//inline/service?notifySubscribers', {
        source: modtask.__myname,
        notification: {
          id,
          action: 'stderr',
          pid: child.pid,
          data: dataBuffer.toString()
        }
      }]
    ]);
  });
  
  child.on('close', exitCode => {
    modtask.newChainAsync([
      ['//inline/service?notifySubscribers', {
        source: modtask.__myname,
        notification: {
          id,
          action: 'close',
          pid: child.pid,
          exitCode
        }
      }]
    ]);
  }); 

  return await modtask.newChainAsync([
    ['//inline/service?notifySubscribers', {
      source: modtask.__myname,
      notification: {
          id,
          action: 'start',
          pid: child.pid
      }
    }]
  ]);
};
