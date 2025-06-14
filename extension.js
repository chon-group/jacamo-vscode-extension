const vscode = require("vscode");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Constants
const EXTENSION_ID = 'jacamo-vscode-extension';
const COMMANDS = {
    CREATE_APP: `${EXTENSION_ID}.createApp`,
    RUN_APP: `${EXTENSION_ID}.runApp`
};
const OUTPUT_CHANNEL_NAME = 'JaCaMo Output';

// Configuration
class Configuration {
    static get jacamoPath() {
        return vscode.workspace.getConfiguration(EXTENSION_ID).get('jacamoPath');
    }

    static async validateJacamoPath() {
        if (!this.jacamoPath) {
            await vscode.window.showErrorMessage(
                'JaCaMo path is not configured. Please set it in VSCode settings.',
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', `${EXTENSION_ID}.jacamoPath`);
                }
            });
            return false;
        }
        return true;
    }
}

// Output Channel Manager
class OutputManager {
    static channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);

    static show() {
        this.channel.show(true);
    }

    static appendLine(message) {
        this.channel.appendLine(message);
    }

    static clear() {
        this.channel.clear();
    }

    static formatOutput(data) {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            if (line.trim() === '') continue;

            // Format different types of messages
            if (line.includes('Error:')) {
                // Check if it's actually an error or just a status message
                if (line.includes('[Moise]') || line.includes('[Cartago]') || 
                    line.includes('focus on') || line.includes('join workspace')) {
                    this.appendLine(`ℹ️ ${line.replace('Error:', '').trim()}`);
                } else {
                    this.appendLine(`❌ ${line.replace('Error:', '').trim()}`);
                }
            } else if (line.includes('Output:')) {
                this.appendLine(`📝 ${line.replace('Output:', '').trim()}`);
            } else if (line.includes('BUILD SUCCESSFUL')) {
                this.appendLine(`✅ ${line.trim()}`);
            } else if (line.includes('Runtime Services') || line.includes('Agent mind inspector') || 
                      line.includes('CArtAgO Http Server') || line.includes('Moise Http Server')) {
                this.appendLine(`🌐 ${line.trim()}`);
            } else if (line.includes('parsed successfully')) {
                this.appendLine(`✨ ${line.trim()}`);
            } else if (line.includes('hello world')) {
                this.appendLine(`👋 ${line.trim()}`);
            } else {
                this.appendLine(line.trim());
            }
        }
    }

    static formatError(data) {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            if (line.trim() === '') continue;
            this.appendLine(`⚠️ ${line.trim()}`);
        }
    }
}

// Process Manager
class ProcessManager {
    static async executeCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({ stdout, stderr });
            });
        });
    }

    static spawnProcess(command, args, options = {}) {
        const process = spawn(command, args, options);
        
        process.stdout.on('data', (data) => {
            OutputManager.formatOutput(data);
        });

        process.stderr.on('data', (data) => {
            OutputManager.formatError(data);
        });

        return process;
    }
}

// JaCaMo Application Manager
class JaCaMoAppManager {
    static async createApp(appName) {
        if (!appName) {
            throw new Error('Application name is required.');
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workingDirectory = workspaceFolders
            ? workspaceFolders[0].uri.fsPath
            : require('os').homedir();

        try {
            await ProcessManager.executeCommand(
                `jacamo app create ${appName} --console`,
                { cwd: workingDirectory }
            );
            
            vscode.window.showInformationMessage(
                `JaCaMo application '${appName}' created successfully in ${workingDirectory}`
            );
        } catch (error) {
            vscode.window.showErrorMessage(
                `Error creating application: ${error.message}`
            );
            throw error;
        }
    }

    static async runApp(appName) {
        if (!appName) {
            throw new Error('Application name is required.');
        }

        if (!await Configuration.validateJacamoPath()) {
            return;
        }

        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const appDirectory = path.join(workspacePath, appName);
        const appFileName = `${appName}.jcm`;
        const fullPath = path.join(appDirectory, appFileName);

        if (!fs.existsSync(fullPath)) {
            throw new Error(
                `The JaCaMo application file '${appFileName}' does not exist in '${appDirectory}'.`
            );
        }

        OutputManager.clear();
        OutputManager.show();
        OutputManager.appendLine('🚀 Starting JaCaMo Application...');
        OutputManager.appendLine(`📂 Running: ${appFileName} in ${appDirectory}`);
        OutputManager.appendLine('─'.repeat(50));

        const process = ProcessManager.spawnProcess(
            Configuration.jacamoPath,
            [appFileName],
            { cwd: appDirectory }
        );

        process.on('error', (error) => {
            OutputManager.appendLine(`❌ Execution Error: ${error.message}`);
            vscode.window.showErrorMessage(
                `Error running application: ${error.message}`
            );
        });

        process.on('close', (code) => {
            OutputManager.appendLine('─'.repeat(50));
            if (code === 0) {
                OutputManager.appendLine(`✅ Application '${appFileName}' completed successfully.`);
            } else {
                OutputManager.appendLine(`⚠️ Application '${appFileName}' exited with code ${code}.`);
            }
            vscode.window.showInformationMessage(
                `JaCaMo application '${appFileName}' ${code === 0 ? 'completed successfully' : `exited with code ${code}`}.`
            );
        });
    }
}

// Tree View Provider
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
            new JacamoTreeItem('Create JaCaMo App', COMMANDS.CREATE_APP),
            new JacamoTreeItem('Run JaCaMo App', COMMANDS.RUN_APP),
        ];
    }
}

class JacamoTreeItem extends vscode.TreeItem {
    constructor(label, command) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: command,
            title: label,
        };
    }
}

// Extension Activation
function activate(context) {
    const createAppCommand = vscode.commands.registerCommand(
        COMMANDS.CREATE_APP,
        async () => {
            try {
                const appName = await vscode.window.showInputBox({
                    prompt: 'Enter the name of your JaCaMo application',
                    placeHolder: 'multiagentSystem',
                });

                await JaCaMoAppManager.createApp(appName);
            } catch (error) {
                vscode.window.showErrorMessage(error.message);
            }
        }
    );

    const runAppCommand = vscode.commands.registerCommand(
        COMMANDS.RUN_APP,
        async () => {
            try {
                const appName = await vscode.window.showInputBox({
                    prompt: 'Enter the name of your JaCaMo application directory',
                    placeHolder: 'e.g., multiagentSystem',
                });

                await JaCaMoAppManager.runApp(appName);
            } catch (error) {
                vscode.window.showErrorMessage(error.message);
            }
        }
    );

    const jacamoViewProvider = new JacamoViewProvider();
    context.subscriptions.push(
        createAppCommand,
        runAppCommand,
        vscode.window.registerTreeDataProvider('jacamoView', jacamoViewProvider)
    );
}

function deactivate() {
    OutputManager.channel.dispose();
}

module.exports = {
    activate,
    deactivate,
};
