const vscode = require("vscode");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Constants
const EXTENSION_ID = 'jacamo-vscode-extension';
const COMMANDS = {
    CREATE_APP: `${EXTENSION_ID}.createApp`,
    RUN_APP: `${EXTENSION_ID}.runApp`,
    ORG_DIM_VIEW: `${EXTENSION_ID}.orgDimView`,
    AGENT_DIM_VIEW: `${EXTENSION_ID}.agentDimView`,
    ENV_DIM_VIEW: `${EXTENSION_ID}.envDimView`,
    STOP_MAS: `${EXTENSION_ID}.stopMas`
};
const OUTPUT_CHANNEL_NAME = 'JaCaMo Output';

// Configuration
class Configuration {
    static get jacamoPath() {
        // Use the setting if set, otherwise fallback to 'jacamo' (system PATH)
        const configured = vscode.workspace.getConfiguration(EXTENSION_ID).get('jacamoPath');
        return configured && configured.trim() !== '' ? configured : 'jacamo';
    }

    static async validateJacamoPath() {
        // Only show error if neither the setting nor the fallback is available
        if (this.jacamoPath === 'jacamo') {
            // Try to check if 'jacamo' is available in PATH
            return new Promise((resolve) => {
                const { exec } = require('child_process');
                exec('jacamo --version', (error) => {
                    if (error) {
                        vscode.window.showErrorMessage(
                            'JaCaMo path is not configured and the jacamo command is not available in your PATH. Please set it in VSCode settings.',
                            'Open Settings'
                        ).then(selection => {
                            if (selection === 'Open Settings') {
                                vscode.commands.executeCommand('workbench.action.openSettings', `${EXTENSION_ID}.jacamoPath`);
                            }
                        });
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
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
        // Ensure shell: true so PATH is resolved like in terminal
        const process = spawn(command, args, { ...options, shell: true });
        
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

    static async runApp() {
        if (!await Configuration.validateJacamoPath()) {
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;

        // Find all .jcm files in the root of the opened folder
        let jcmFiles;
        try {
            jcmFiles = fs.readdirSync(workspacePath).filter(file => file.endsWith('.jcm'));
        } catch (err) {
            vscode.window.showErrorMessage('Error reading workspace directory: ' + err.message);
            return;
        }

        if (jcmFiles.length === 0) {
            vscode.window.showErrorMessage('No .jcm files found in the opened folder.');
            return;
        }

        OutputManager.clear();
        OutputManager.show();
        OutputManager.appendLine('🚀 Starting JaCaMo Application(s)...');
        OutputManager.appendLine(`📂 Running all .jcm files in: ${workspacePath}`);
        OutputManager.appendLine('─'.repeat(50));

        for (const appFileName of jcmFiles) {
            OutputManager.appendLine(`▶️ Running: ${appFileName}`);
            const process = ProcessManager.spawnProcess(
                Configuration.jacamoPath,
                [appFileName],
                { cwd: workspacePath }
            );

            await new Promise((resolve) => {
                process.on('error', (error) => {
                    OutputManager.appendLine(`❌ Execution Error: ${error.message}`);
                    vscode.window.showErrorMessage(
                        `Error running application: ${error.message}`
                    );
                    resolve();
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
                    resolve();
                });
            });
        }
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
            new JacamoTreeItem('Organization Dimension View', COMMANDS.ORG_DIM_VIEW),
            new JacamoTreeItem('Agent Dimension View', COMMANDS.AGENT_DIM_VIEW),
            new JacamoTreeItem('Environment Dimension View', COMMANDS.ENV_DIM_VIEW),
            new JacamoTreeItem('Stop MAS Execution', COMMANDS.STOP_MAS),
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
                await JaCaMoAppManager.runApp();
            } catch (error) {
                vscode.window.showErrorMessage(error.message);
            }
        }
    );

    const orgDimViewCommand = vscode.commands.registerCommand(
        COMMANDS.ORG_DIM_VIEW,
        () => {
            vscode.env.openExternal(vscode.Uri.parse('http://localhost:3271/'));
        }
    );
    const agentDimViewCommand = vscode.commands.registerCommand(
        COMMANDS.AGENT_DIM_VIEW,
        () => {
            vscode.env.openExternal(vscode.Uri.parse('http://localhost:3272/'));
        }
    );
    const envDimViewCommand = vscode.commands.registerCommand(
        COMMANDS.ENV_DIM_VIEW,
        () => {
            vscode.env.openExternal(vscode.Uri.parse('http://localhost:3273/'));
        }
    );

    const stopMasExecution = async () => {
        if (!await Configuration.validateJacamoPath()) {
            return;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;
        OutputManager.clear();
        OutputManager.show();
        OutputManager.appendLine('🔍 Listing running MAS...');
        try {
            const { stdout } = await ProcessManager.executeCommand('jacamo mas list', { cwd });
            OutputManager.appendLine(stdout);
            // Improved regex: match MAS name before @, ignoring whitespace
            const match = stdout.match(/^(\s*)(\S+)@/m);
            if (!match) {
                OutputManager.appendLine('❌ No running MAS found.');
                vscode.window.showWarningMessage('No running MAS found.');
                return;
            }
            const masName = match[2];
            OutputManager.appendLine(`🛑 Stopping MAS: ${masName}`);
            const stopCmd = `jacamo mas stop ${masName} --exit`;
            const { stdout: stopOut, stderr: stopErr } = await ProcessManager.executeCommand(stopCmd, { cwd });
            OutputManager.appendLine(stopOut);
            if (stopErr) OutputManager.appendLine(stopErr);
            vscode.window.showInformationMessage(`MAS '${masName}' stopped.`);
        } catch (err) {
            OutputManager.appendLine(`❌ Error stopping MAS: ${err.message}`);
            vscode.window.showErrorMessage(`Error stopping MAS: ${err.message}`);
        }
    }

    const stopMasCommand = vscode.commands.registerCommand(
        COMMANDS.STOP_MAS,
        async () => {
            await stopMasExecution();
        }
    );

    const jacamoViewProvider = new JacamoViewProvider();
    context.subscriptions.push(
        createAppCommand,
        runAppCommand,
        orgDimViewCommand,
        agentDimViewCommand,
        envDimViewCommand,
        stopMasCommand,
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
