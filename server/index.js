const { Application, genesisBlockDevnet, configDevnet } = require("lisk-sdk");

const { Decrypt } = require("./transactions");



configDevnet.app.label = "Decrypt";
configDevnet.app.version = "1.0.0";
configDevnet.components.storage.password = "password";
configDevnet.modules.http_api.access.public = true;
configDevnet.modules.network.wsPort = 4001;
configDevnet.app.genesisConfig.BLOCK_TIME = 5;
configDevnet.app.genesisConfig.MAX_TRANSACTIONS_PER_BLOCK= 10;

const app = new Application(genesisBlockDevnet, configDevnet);

app.registerTransaction(Decrypt);

app
  .run()
  .then(() => app.logger.info("App started..."))
  .catch((error) => {
    console.error("Faced error in application", error);
    process.exit(1);
  });
