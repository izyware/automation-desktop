// done
// continue
// sendKeystroke=keystrong
function __izyStart(queryObject) {
  const cmds = [];
  const { taskId } = queryObject;
  const button = document.getElementsByTagName('button')[0];
  if (button && button.innerText == 'Check Updates') {
    button.setAttribute('izy-taskId', taskId);
    button.click();
    cmds.push('showBrowserState' + 'done');
    cmds.push('done');
  } else {
    console.log('page not fully loaded yet');
    cmds.push('showBrowserState' + 'not loaded');
    cmds.push('continue');
  };
  return JSON.stringify(cmds);
}
// This gets returned back to the executeScript caller context
__izyCallerExitValue="";
try {
  /* This will get replaced at runtime. Do not change */
  __izyCallerExitValue=__izyStart({});
} catch(e) {
  __izyCallerExitValue=e.toString();
}
