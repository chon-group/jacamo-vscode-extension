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

module.exports = {
    EXTENSION_ID,
    COMMANDS,
    OUTPUT_CHANNEL_NAME
}; 