import chalkModule from 'chalk';
import log4js from 'log4js';
import { Browser } from "puppeteer";


declare global {
  var browser: Browser | null;
  var saveGuildsTree: SaveGuild[];
  var chalk: typeof chalkModule;
  var logger: log4js.Logger;

  interface SaveGuild {
    name: string,
    id: string,
    channel: SaveChannel[],
  }
  
  export interface SaveChannel {
    name: string,
    id: string,
  }
  
}
