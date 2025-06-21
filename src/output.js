const vscode = require("vscode");
const { OUTPUT_CHANNEL_NAME } = require("./constants");

const logPatterns = {
    agentMessage: /^\s*\[(.*?)\]\s*(.*)/,
    goldFound: /gold/i,
    winner: /(winning|winner|leader)/i,
    bragging: /bragging/i,
    location: /(location|going to|moving to|near)/i,
    reached: /reached/i,
    unreachable: /(not reachable|unreachable)/i,
    broadcast: /broadcast/i,
    tweet: /tweet/i,
    beliefAdded: /^\s*\+/i,
    beliefRemoved: /^\s*-/i
};

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
        const lines = data.toString().split('\\n');
        for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.includes('Error:')) {
                if (line.includes('[Moise]') || line.includes('[Cartago]') || 
                    line.includes('focus on') || line.includes('join workspace')) {
                    this.appendLine(`ℹ️ ${line.replace('Error:', '').trim()}`);
                } else {
                    this.appendLine(`❌ ${line.replace('Error:', '').trim()}`);
                }
            } else if (line.includes('BUILD SUCCESSFUL')) {
                this.appendLine(`✅ ${line.trim()}`);
            } else if (line.includes('Runtime Services') || line.includes('Agent mind inspector') || 
                      line.includes('CArtAgO Http Server') || line.includes('Moise Http Server')) {
                this.appendLine(`🌐 ${line.trim()}`);
            } else if (line.includes('parsed successfully')) {
                this.appendLine(`✨ ${line.trim()}`);
            } else {
                const agentMatch = line.trim().match(logPatterns.agentMessage);
                if (agentMatch) {
                    const agentName = agentMatch[1];
                    const message = agentMatch[2];
                    let icon = '🤖';
                    if (logPatterns.goldFound.test(message)) icon = '💰';
                    if (logPatterns.winner.test(message)) icon = '🏆';
                    if (logPatterns.bragging.test(message)) icon = '😎';
                    if (logPatterns.location.test(message)) icon = '🗺️';
                    if (logPatterns.reached.test(message)) icon = '✅';
                    if (logPatterns.unreachable.test(message)) icon = '🚫';
                    if (logPatterns.broadcast.test(message)) icon = '📢';
                    if (logPatterns.tweet.test(message)) icon = '🐦';
                    
                    this.appendLine(`${icon} [${agentName}] ${message}`);
                } else if (logPatterns.beliefAdded.test(line)) {
                    this.appendLine(`➕ ${line.trim()}`);
                } else if (logPatterns.beliefRemoved.test(line)) {
                    this.appendLine(`➖ ${line.trim()}`);
                }
                else {
                    this.appendLine(line.trim());
                }
            }
        }
    }

    static formatError(data) {
        const lines = data.toString().split('\\n');
        for (const line of lines) {
            if (line.trim() === '') continue;
            this.appendLine(`⚠️ ${line.trim()}`);
        }
    }
}

module.exports = {
    OutputManager
}; 