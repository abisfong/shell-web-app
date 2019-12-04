/* Local vairables -----------------------------------------------------------*/
var cmd_ln_el = document.getElementById("command-line");
var termDoc = new TermDoc(cmd_ln_el);
var fileSys = new FileSystem();

/* Command line event listeners ----------------------------------------------*/

cmd_ln_el.addEventListener("keydown", function(event){
  /* Get length of command line */
  cmd_ln_length = cmd_ln_el.value.length;

  /* Do not allow deletion of prompt on 'backspace' click */
  if(event.keyCode == 8){
    cmd_string = cmd_ln_el.value;
    cmd_length = cmd_string.length;

    if(cmd_string[cmd_length-2] == ">"){
      cmd_ln_el.value = cmd_string.substring(0, cmd_length-2)+">  ";
    }
  }
});

cmd_ln_el.addEventListener("keyup", function(event){
  /*
   * On carriage return:
   *      - Read command
   *      - Add the prompt to the cmd line string
   */
  if(event.keyCode == 13){
    termDoc.setPosition();
    console.log("position: "+termDoc.getPostion());
    console.log("history: "+termDoc.getHistory().toString());
    console.log(termDoc.getLatestCommand());
    res = fileSys.executeCommand(termDoc.getLatestCommand().trim().split(' '));
    if(res)
      termDoc.setOutput(res);
    cmd_ln_el.value += "> ";
  }
});
































/* EOF */
