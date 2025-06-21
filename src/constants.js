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
const JACAMO_WEB_APP_URL = 'http://jacamo.sourceforge.net/jacamo-web-app';
const JDT_LS_URL = 'http://download.eclipse.org/jdt/ls/snapshots';
const JDT_LS_VERSION = '0.54.0';
const MAS_EXTENSION = 'mas';
const JCM_EXTENSION = 'jcm';
const ASL_EXTENSION = 'asl';
const DEFAULT_PROJECT_FILE = 'project.jcm';

module.exports = {
    EXTENSION_ID,
    COMMANDS,
    OUTPUT_CHANNEL_NAME,
    JACAMO_WEB_APP_URL,
    JDT_LS_URL,
    JDT_LS_VERSION,
    MAS_EXTENSION,
    JCM_EXTENSION,
    ASL_EXTENSION,
    DEFAULT_PROJECT_FILE
}; 