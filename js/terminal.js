/*jshint esversion: 6 */
/*
 * Terminal class used to combine command line input tracking with file system
 * and command line functionality
 */
class Terminal{
  constructor(commandLineElement){
    console.log('Terminal: constructor start');
    this.td = new TerminalDocument(commandLineElement);
    this.fs = new FileSystem();

    /* Add event listeners to command line element */
    console.log('Terminal: constructor end');
  }

  eventFunctionFinder(eventName, eventObject){
    this.keydown(eventObject);
  }

  keydown(event){
    /* Do not allow deletion of prompt on 'backspace' click */
    if(event.keyCode == 8){
      if(this.td.getText()[this.td.getText().length-2] == '>'){
        this.td.setOutput('  ');
      }
    }
  }

  keyup(event){
    /*
     * On carriage return:
     *      - Read command
     *      - Add the prompt to the cmd line string
     */
    if(event.keyCode == 13){
      this.td.setHistory();
      commandAndFlags = this.fs.findFlags(this.td.getLatestCommand());
      resrult = this.fs.executeCommand(commandAndFlags[0], commandAndFlags[1]);
      if(resrult)
        this.td.setOutput(result);
      this.td.setOutput("> ");
    }
  }

}


































/* EOF */
