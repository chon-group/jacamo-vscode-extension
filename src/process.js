const { exec, spawn } = require("child_process");
const { OutputManager } = require("./output");

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

module.exports = {
    ProcessManager
}; 