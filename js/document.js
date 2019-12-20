/*jshint esversion: 6 */
/* -----------------------------------------------------------------------------
 * Keeps track of command line input and updates output
 */
class Document {
  constructor(commandLineElement, prompt = "> ") {
    this.commandLineElement = commandLineElement;
    this.prompt = prompt;
    /* Keeps track of all commands for entirety of instance */
    this.history = [];
    /* Keeps track of start position of new command */
    this.position = 0;
  }

  /* Clears scrollback */
  clearScrollback() {
    this.position = 0;
    this.getElement().value = '';
  }

  /* Returns most recent command */
  getCommandLine() {
    return this.history[this.history.length - 1];
  }

  /* Gets command line element attached to this object */
  getElement() {
    return this.commandLineElement;
  }

  /* Gets current input */
  getCurrentInput() {
    return this.currentInput;
  }

  /* Returns array of all inputed commands or specified command*/
  getHistory(num = null) {
    if (num)
      if (num < 0 || num > this.history.length)
        return null;
      else
        return this.history[num - 1];
    return this.history;
  }

  /* Returns index of start position of most recent command */
  getPostion() {
    return this.position;
  }

  /* Returns prompt */
  getPrompt() {
    return this.prompt;
  }

  /* Returns command line text */
  getText() {
    return this.getElement().value;
  }

  /* Returns length of command line text */
  getTextLength() {
    return this.getElement().value.length;
  }

  /* Sets focus to bottom of document page */
  setFocus() {
    this.getElement().scrollTop = this.getElement().scrollHeight;
  }

  /*
   * Updates text position of start of most recent command.
   * Updates command count
   * Updates 'history' to keep track of all commands
   */
  setHistory() {
    /*
     * Search through command element text for what may be a new command
     * starting at 'position'.
     */
    for (var i = this.position; i < this.getTextLength(); ++i) {
      /* If '>' is encountered, treat the following text as the new command */
      if (this.getText()[i] == '>') {
        /* If input entered is not a carriage return, Save input as history */
        /* Update search index to start history search at most recent entry */
        if (this.getText()[i + 2] != '\n') {
          var commandLineText = this.getText().substring(i + 2).trim();
          this.history.push(commandLineText);
          this.searchIndex = this.history.length+1;
        }

        /* Update position in text for next search of possible command */
        this.position = i + 2;

        /* Stop further iterations */
        break;
      }
    }
  }

  /* Sets search index */
  setSearchIndex(num) {
    this.searchIndex = num;
  }

  /* Adds output to command line string */
  setOutput(output) {
    this.getElement().value += output;
    this.setFocus();
  }

  /* Updates prompt or prints prompt to output */
  setPrompt(prompt) {
    if (prompt)
      this.prompt = prompt;
    else
      this.setOutput(this.prompt);
  }

  /* Applies listener to commandLineElement */
  setTracker() {
    /* Update history  */
    this.getElement().addEventListener('keyup', (event) => {
      /* Focus command line when typing */
      this.setFocus();

      if (event.keyCode == 13)
        this.setHistory();
    });
  }
}









/* EOF */
