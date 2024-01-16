
const { datastreamMonitor, queryObject, sleep, exit, module, process, browserAction, runBrowserAutomation, fs } = izyNodePolyFill();
console.log(JSON.stringify(module));
datastreamMonitor.log('Start');
datastreamMonitor.log('queryObject: ' + JSON.stringify(queryObject));
if (queryObject.sleep) sleep(queryObject.sleep);

let { action, url } = queryObject;
if (action) {
  if (url) {
    browserAction({ action, url });
  }
  switch(action) {
    case 'addcurrentcontext':
      const javascript = fs.readFileSync(`${module.__dirname}/${action}.js`);
      const taskId = fs.readFileSync(`~/.izyware/taskId`);
      const url = 'https://izyware.com/#settings/app/device-extension/info';
      browserAction({ action: 'close', url })
      sleep(1);
      browserAction({ action: 'open', url });
runBrowserAutomation({ urlGrepStr: url, javascript, sleepBetweenCommandsSeconds: 1, enableKeyboard: false, javascriptQueryObject: { taskId }});
}
};

datastreamMonitor.log('Finish');
exit(queryObject.exitCode);
/**************************************************************************************
* Provide izy-proxy compatible environment:
***************************************************************************************/
function izyNodePolyFill() {
  var app = Application.currentApplication()
  app.includeStandardAdditions = true
  var system = Application("System Events");
  console.log = function() {
    ObjC.import('Foundation');
    for (argument of arguments) {
        $.NSFileHandle.fileHandleWithStandardOutput.writeData($.NSString.alloc.initWithString(String(argument)).dataUsingEncoding($.NSNEXTSTEPStringEncoding));
    }
  }
  const datastreamMonitor = { log: function(x) { console.log(typeof(x) == 'object' ? JSON.stringify(x) : x); } };
  function sleep(seconds) {
    datastreamMonitor.log({ action: 'sleep', seconds });
    app.doShellScript("sleep " + seconds);
  }
  function exit(code) {
    ObjC.import('stdlib');
    $.exit(code);
  }
  function buildArgv() {
    var args = $.NSProcessInfo.processInfo.arguments;// NSArray
    var argv = []
    var argc = args.count
    for (var i = 0; i < argc; i++) {
        argv.push(ObjC.unwrap(args.objectAtIndex(i)));
    }
    return argv;
  }
  var process = {
    argv: buildArgv()
  };
  const queryObject= JSON.parse(app.doShellScript(`echo ${process.argv[4]} | base64 --decode`));
  const module = {
    __filename: process.argv[3]
  };
  module.__dirname = module.__filename.split('/');
  module.__dirname.pop();
  module.__dirname = module.__dirname.join('/');

  function browserAction(queryObject) {
    const { action } = queryObject;
    var outcome = { success: false }
    var chrome = Application("Google Chrome");
    chrome.activate();
    var windows = chrome.windows;
    for(var windowIdx = 0; windowIdx < windows.length; windowIdx++){
      var window = windows[windowIdx];
      if (action == 'open') {
        if (!queryObject.url) throw new Error('you must specify url for open action.');
        datastreamMonitor.log({ action, url: queryObject.url });
        var tab = chrome.Tab({
          url: queryObject.url
        });
        window.tabs.push(tab);
        outcome = { success: true };
        break;
      }
      var tabs = window.tabs;
      for(var tabIdx = 0; tabIdx < tabs.length; tabIdx++){
        var tab = tabs[tabIdx];
        var url = tab.url();
        if(url.indexOf(queryObject.url) >= 0) {
          datastreamMonitor.log({ action, tabIdx, windowIdx });
          switch(action) {
            case 'close':
              tab.close();
              tabIdx--;
              outcome.success = true;
              break;
            case 'execute': 
              // (optional) Make sure the window is visible and in front 
              window.visible = true// window.index = windowIdx;
              // This will focus on the tab. 
              window.activeTabIndex = tabIdx+1;
              outcome = { 
                success: true,
                data: tab.execute({
                  javascript: queryObject.javascript
                })
              };
              break;
          }
        }
      }
    }
    return outcome;
  };

  function runBrowserAutomation(queryObject) {
    let { javascript, sleepBetweenCommandsSeconds, enableKeyboard, javascriptQueryObject } = queryObject;
    javascript = javascript.replace('__izyCallerExitValue=__izyStart({})', `__izyCallerExitValue=__izyStart(${JSON.stringify(javascriptQueryObject)});`);
    var map = {
      sendKeystroke: function(keystroke) {
        datastreamMonitor.log({ action: 'sendKeyStroke', keystroke });
        system.keystroke(keystroke);
      },
      showBrowserState: function(state) {
        console.log('========================================== showBrowserState: ' + state);
      }
    };
  
    var browserSessionInProgress = true;
    while(browserSessionInProgress) {
      var outcome = browserAction({ action: 'execute', url: queryObject.urlGrepStr, javascript });
      datastreamMonitor.log({ browserActionOutcome: outcome });
      if (!outcome.success) {
        break;
      }
      if (typeof(outcome.data) != 'string') {
        datastreamMonitor.log('will exit since nonstring returned from javascript: ' + typeof(outcome.data));
        return;
      }
      var cmds = JSON.parse(outcome.data);
      for(var i=0; i < cmds.length; ++i) {
        var cmd = cmds[i];
        datastreamMonitor.log({ cmd });
        if (cmd == 'done') {
          browserSessionInProgress = false;
          break;
        };
        for(var p in map) {
          if (cmd.indexOf(p) == 0) {
            var cmdParameter = cmd.substr(p.length);
            datastreamMonitor.log({ cmdParameter });
            if (cmdParameter.indexOf('$parameters.') == 0) {
              cmdParameter = cmdParameter.substr('$parameters.'.length);
              cmdParameter = parameters[cmdParameter];
              datastreamMonitor.log({ parameterized: true, cmdParameter });
            }
            if (enableKeyboard) {
              map[p](cmdParameter);
            } else {
              datastreamMonitor.log({ msg: 'enableKeyboard is disabled' });
            }
          }
        }
      }
      if (browserSessionInProgress) {
        console.log('========================================== sleep');
        sleep(sleepBetweenCommandsSeconds);
      }
    }
  };

  const fs = {};
  fs.readFileSync = filePath => app.doShellScript(`cat ${filePath}`);

  return { datastreamMonitor, queryObject, sleep, exit, process, module, browserAction, runBrowserAutomation, fs };
}
