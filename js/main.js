/* Local vairables -----------------------------------------------------------*/
var commandLineElement = document.getElementById("command-line");
var termDoc = new TerminalDocument(commandLineElement);
var fileSys = new FileSystem();
// var terminal = new Terminal(commandLineElement);

/* Command line event listeners ----------------------------------------------*/

commandLineElement.addEventListener("keydown", function(event){
  /* Get length of command line */
  cmd_ln_length = commandLineElement.value.length;

  /* Do not allow deletion of prompt on 'backspace' click */
  if(event.keyCode == 8){
    cmd_string = commandLineElement.value;
    cmd_length = cmd_string.length;

    if(cmd_string[cmd_length-2] == ">"){
      commandLineElement.value = cmd_string.substring(0, cmd_length-2)+">  ";
    }
  }
});

commandLineElement.addEventListener("keyup", function(event){
  /*
   * On carriage return:
   *      - Read command
   *      - Add the prompt to the cmd line string
   */
  if(event.keyCode == 13){
    termDoc.setHistory();
    console.log("position: "+termDoc.getPostion());
    console.log("history: "+termDoc.getHistory().toString());
    console.log(termDoc.getLatestCommand());
    commandAndFlags = fileSys.findFlags(termDoc.getLatestCommand());
    res = fileSys.executeCommand(commandAndFlags[0], commandAndFlags[1]);
    if(res)
      termDoc.setOutput(res+'\n');
    commandLineElement.value += "> ";
  }
});
































/* EOF */
