import { Service } from 'typedi';
// import { EmailService } from './email.service';
import { base64Encode, sleep, getProxy } from '../common/utils';
import { URLSearchParams } from 'url';
import { AppConfig, ItemToScan, ProxyData } from '../types';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'hpagent';

@Service()
export class ItemOrderHistoryService {
  appConfig: AppConfig;
  proxy: string;

  // @Inject()
  // emailService: EmailService;

  // baseUrl = 'https://steamcommunity-a.akamaihd.net/market/itemordershistogram?norender=1&country=HK&language=schinese&currency=1&item_nameid=';
  baseUrl = 'https://steamcommunity-a.akamaihd.net/market/itemordershistogram?norender=1&country=HK&language=schinese&currency=1&item_nameid=';

  // @Retryable({ maxAttempts: 1, backOff: 1 })
  async getItemById(itemNameId: number): Promise<ItemOrderHistory> {
    const url = `${this.baseUrl}${itemNameId}`;
    const res = await fetch(url, {
      agent: new HttpsProxyAgent({ proxy: this.proxy })
    });
    if(!res.ok) throw new Error(res.statusText)
    const json = await res.json() as ItemOrderHistory;
    return json;
  }

  async scanItems(itemIndex: number): Promise<void> {
    const currentItem: ItemToScan = this.appConfig.items[itemIndex % this.appConfig.items.length];
    try {
      const itemOrderHistory: ItemOrderHistory = await this.getItemById(currentItem.nameId);
      this.handleNewItem(currentItem, itemOrderHistory);
    } catch (e: any) {
      console.error(`刷新物品'${currentItem.description}'错误: ${e.message}`);
    }
    setTimeout(() => this.scanItems(++itemIndex), this.appConfig.scanInterval * 1000);
  }

  // 扫描所有配置的物品.
  async scanAll(refreshProxy = false): Promise<void> {
    if (refreshProxy) {
      const proxyData: ProxyData[] = await getProxy();
      this.proxy = `http://${proxyData[0].ip}:${proxyData[0].port}`;

      refreshProxy = false;
    }
    const itemPromises = this.appConfig.items.map(item => this.getItemById(item.nameId));
    const results = await Promise.allSettled(itemPromises);
    results.forEach((settledResult, index) => {
      const currentItem = this.appConfig.items[index];
      if (settledResult.status === 'fulfilled') {
        this.handleNewItem(currentItem, settledResult.value);
      } else {
        console.error(`Error getting count for ${currentItem.description}, reason: '${settledResult.reason}'.`);
        refreshProxy = true;
        // if (settledResult.reason?.statusCode === 429) { }
      }
    });

    // 打开关闭飞行模式
    // await this.toggleAirPlainMode();
    setTimeout(() => this.scanAll(refreshProxy), this.appConfig.scanInterval * 1000);
  }


  handleNewItem(currentItem: ItemToScan, itemOrderHistory: ItemOrderHistory): void {
    try {
      const newItemCount: number = !itemOrderHistory.sell_order_count ? 0 : parseInt(itemOrderHistory.sell_order_count?.replace(/,/g, ''));
      console.info(`###'${newItemCount}': ${currentItem.description.padEnd(40, '.')} '${new Date().toLocaleString()}'`);
      if (currentItem.count !== undefined && currentItem.count! >= 0 && currentItem.count! < newItemCount) {
        const parseTime: string = new Date().toLocaleString();
        const msg = `${parseTime} 数量变化:${currentItem.count}->${newItemCount}-${currentItem.description} 最低求购价: ${itemOrderHistory.buy_order_price}`;
        /*
         * this.emailService.sendEmail(msg, `
         *   <a href="${currentItem.url}">购买链接</a>
         *   <br/> ${msg}
         *   <br/> <a href="https://steamcommunity-a.akamaihd.net/market/itemordershistogram?norender=1&country=HK&language=schinese&currency=23&item_nameid=${currentItem.nameId}">API链接</a>
         *   <br/>`,
         * );
         */
        // notify server on item change
        this.callItemChangeApi(currentItem, newItemCount, parseTime, itemOrderHistory);
      }
      currentItem.count = newItemCount;
      currentItem.sellPrice = itemOrderHistory.sell_order_price;
    } catch (e) {
      console.error(`Cannot compare item ${currentItem.description} with the order history: ${itemOrderHistory}.`, e);
    }
  }

  callItemChangeApi(currentItem: ItemToScan, newItemCount: number, parseTime: string, itemOrderHistory: ItemOrderHistory): void {
    // extract standard English name from url
    const itemName = decodeURIComponent(currentItem.url.substring('https://steamcommunity.com/market/listings/730/'.length));
    const apiItem: ApiItem = {
      appId: 730,
      name: itemName,
      hashName: itemName,
      count: newItemCount,
      parseTime,
      hostId: this.appConfig.serverConfig.hostId,
      sort: currentItem.sellPrice == itemOrderHistory.sell_order_price ? '0' : '1',
      countChnange: `${currentItem.count}->${newItemCount}`,
      reciveTime: parseTime,
      isIncrease: true,
      showlink: currentItem.url,
      apiUrl: `${this.baseUrl}${currentItem.nameId}`,
      price: itemOrderHistory.sell_order_price,
      wastage: itemOrderHistory.buy_order_price,
    };
    const apiItemEncoded: string = base64Encode(JSON.stringify({ itemList: [apiItem] }));
    const query = new URLSearchParams([['content', apiItemEncoded]]);
    const serverApiUrl = `${this.appConfig.serverConfig.serverUrl}/api/server/dotnet/itemChange`;
    const url = new URL(serverApiUrl);
    url.search = query.toString();
    console.info(`calling API '${serverApiUrl}' with param: '${query.toString()}'`);
    fetch(url.toString());
  }
}

export interface SellOrderTable {
  price: string;
  price_with_fee: string;
  quantity: string;
}

export interface BuyOrderTable {
  price: string;
  quantity: string;
}

export interface ItemOrderHistory {
  success: number;
  sell_order_count: string | 0;
  sell_order_price: string;
  sell_order_table: SellOrderTable[];
  buy_order_count: string;
  buy_order_price: string;
  buy_order_table: BuyOrderTable[];
  highest_buy_order: string;
  lowest_sell_order: string;
  buy_order_graph: any[][];
  sell_order_graph: any[][];
  graph_max_y: number;
  graph_min_x: number;
  graph_max_x: number;
  price_prefix: string;
  price_suffix: string;
}

export interface ApiItem {
  appId: number;
  name: string;
  hashName: string;
  count: number;
  parseTime: string;
  hostId?: number;
  version?: number;
  countChnange: string;
  reciveTime: string;
  isIncrease: boolean;
  showlink: string;
  price: string;
  apiUrl: string;
  checkUrl?: string;
  sort?: string;
  wastage?: string;
}

