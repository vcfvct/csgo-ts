import 'reflect-metadata';
import { Container } from 'typedi';
import { EmailProfileInjectionToken } from './common/constants';
import { TencentEmail1 } from './config/email.config';
import { ItemOrderHistoryService } from './service/item-order-history.service';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import fs from 'fs';

const args = yargs(hideBin(process.argv)).options({
  config: {
    alias: 'c',
    description: 'specify config file number',
  },
  proxy: {
    alias: 'p',
    description: 'specify use proxy or not',
  }
}).parseSync();

(async () => {
  // Container.set(EmailProfileInjectionToken, TencentEmail1);
  const configFile = await import(`./config/config${args.config ?? 1}`);
  const itemOrderHistoryService: ItemOrderHistoryService = Container.get(ItemOrderHistoryService);
  itemOrderHistoryService.appConfig = configFile.appConfig;
  const ipAnalysisFile = itemOrderHistoryService.appConfig.ipAnalysisFile;
  if (ipAnalysisFile && fs.existsSync(ipAnalysisFile)) fs.unlinkSync(ipAnalysisFile);
  await itemOrderHistoryService.scanAll(true);
})();

