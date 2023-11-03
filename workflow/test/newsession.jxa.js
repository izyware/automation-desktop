/**************************************************************************************
Provide izy-proxy compatible environment:
queryObject
modtask scheme
process namespace
utility functions
***************************************************************************************/
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
  var args = $.NSProcessInfo.processInfo.arguments    // NSArray
  var argv = []
  var argc = args.count
  for (var i = 4; i < argc; i++) {
      // skip 3-word run command at top and this file's name
      argv.push(ObjC.unwrap(args.objectAtIndex(i)))  // collect arguments
  }
  return argv;
}
var process = {
  argv: buildArgv()
};
const queryObject= JSON.parse(app.doShellScript(`echo ${process.argv[0]} | base64 --decode`));
/***************************************************************************************/
datastreamMonitor.log('Start');
datastreamMonitor.log('queryObject: ' + JSON.stringify(queryObject));
sleep(queryObject.sleep);
datastreamMonitor.log('Finish');
exit(queryObject.exitCode);

