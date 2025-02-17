const vscode = require("vscode");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const createAppCommand = vscode.commands.registerCommand(
    "jacamo-vscode-extension.createApp",
    async () => {
      const appName = await vscode.window.showInputBox({
        prompt: "Enter the name of your JaCaMo application",
        placeHolder: "multiagentSystem",
      });

      if (!appName) {
        vscode.window.showErrorMessage("Application name is required.");
        return;
      }

      const workspaceFolders = vscode.workspace.workspaceFolders;
      const workingDirectory = workspaceFolders
        ? workspaceFolders[0].uri.fsPath
        : require("os").homedir(); // Fallback to the home directory

      exec(
        `jacamo app create ${appName} --console`,
        { cwd: workingDirectory },
        (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(
              `Error creating application: ${error.message}`
            );
            return;
          }

          if (stderr) {
            vscode.window.showWarningMessage(`Warning: ${stderr}`);
          }

          vscode.window.showInformationMessage(
            `JaCaMo application '${appName}' created successfully in ${workingDirectory}`
          );
        }
      );
    }
  );

  const runAppCommand = vscode.commands.registerCommand(
    "jacamo-vscode-extension.runApp",
    async () => {
      const folders = vscode.workspace.workspaceFolders;

      if (!folders) {
        vscode.window.showErrorMessage(
          "Please open the folder containing your JaCaMo application."
        );
        return;
      }

      const workspacePath = folders[0].uri.fsPath;

      // Retrieve jacamoPath from extension settings
      const jacamoPath = vscode.workspace
        .getConfiguration("jacamo-vscode-extension")
        .get("jacamoPath");

      if (!jacamoPath) {
        vscode.window.showErrorMessage(
          "JaCaMo path is not configured. Please set it in VSCode settings."
        );
        vscode.window.showInformationMessage(
          "Go to 'Settings' -> 'Extensions' -> 'JaCaMo VSCode Extension' -> 'JaCaMo Path'."
        );
        return;
      }

      // Ask the user for the name of the application directory (or assume it's the first folder)
      const appName = await vscode.window.showInputBox({
        prompt: "Enter the name of your JaCaMo application directory",
        placeHolder: "e.g., multiagentSystem",
      });

      if (!appName) {
        vscode.window.showErrorMessage(
          "Application name is required to run the application."
        );
        return;
      }

      // Construct the path to the `.jcm` file
      const appDirectory = path.join(workspacePath, appName);
      const appFileName = `${appName}.jcm`; // Assuming the `.jcm` file matches the directory name
      const fullPath = path.join(appDirectory, appFileName);

      if (!fs.existsSync(fullPath)) {
        vscode.window.showErrorMessage(
          `The JaCaMo application file '${appFileName}' does not exist in '${appDirectory}'.`
        );
        return;
      }

      // Create an OutputChannel for displaying output
      const outputChannel = vscode.window.createOutputChannel("JaCaMo Output");
      outputChannel.show(true); // Show the output channel

      outputChannel.appendLine(
        `Executing: jacamo ${appFileName} in directory ${appDirectory}`
      );

      const process = spawn(jacamoPath, [appFileName], { cwd: appDirectory });

      process.stdout.on("data", (data) => {
        outputChannel.appendLine(`Output: ${data}`);
      });

      process.stderr.on("data", (data) => {
        outputChannel.appendLine(`Error: ${data}`);
        vscode.window.showWarningMessage(`Warning: ${data}`);
      });

      process.on("error", (error) => {
        outputChannel.appendLine(`Execution Error: ${error.message}`);
        vscode.window.showErrorMessage(
          `Error running application: ${error.message}`
        );
      });

      process.on("close", (code) => {
        vscode.window.showInformationMessage(
          `JaCaMo application '${appFileName}' exited with code ${code}.`
        );
      });
    }
  );

  context.subscriptions.push(createAppCommand, runAppCommand);

  const jacamoViewProvider = new JacamoViewProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("jacamoView", jacamoViewProvider)
  );

  
}

function deactivate() {}

class JacamoViewProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    return [
      new JacamoTreeItem("Create JaCaMo App", "jacamo-vscode-extension.createApp"),
      new JacamoTreeItem("Run JaCaMo App", "jacamo-vscode-extension.runApp"),
    ];
  }
}

/**
 * Custom Tree Item with Command Binding
 */
class JacamoTreeItem extends vscode.TreeItem {
  constructor(label, command) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: command,
      title: label,
    };
  }
}


module.exports = {
  activate,
  deactivate,
};
