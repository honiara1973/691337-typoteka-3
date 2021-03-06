'use strict';
const app = require(`./app`);
const {getLogger} = require(`../../logger`);
const {connectDb} = require(`../../db-service/db`);

const DEFAULT_PORT = 3000;

const logger = getLogger();

module.exports = {
  name: `--server`,
  async run(args) {

    const [userPort] = args;
    const port = Number.parseInt(userPort, 10) || DEFAULT_PORT;

    connectDb();

    app.listen(port, () => {
      logger.info(`Server start on ${port}`);
    })
    .on(`err`, (err) => {
      logger.error(`Server can't start. Error: ${err}`);
    });
  },
};
