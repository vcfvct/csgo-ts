import { AppConfig } from '../types';

export const appConfig: AppConfig = {
  // 扫描间隔时间
  scanInterval: 5,
  // API 超时时间
  apiTimeout: 2,
  // adb.exe 路径
  adbPath: '%HOMEDRIVE%%HOMEPATH%\\Documents\\platform-tools\\adb.exe',
  // 打开/关闭飞行模式间隔时间
  airplaneToggleWaitTime: 5,
  ipAnalysisFile: 'ip-analysis.txt',
  serverConfig: {
    serverUrl: 'http://192.168.0.202:9012',
    hostId: 888,
  },
  items: [
    {
      nameId: 15162283,
      description: '★ StatTrak™ Butterfly Knife | Case Hardened (Well-Worn)',
      url: 'https://steamcommunity.com/market/listings/730/%E2%98%85%20StatTrak%E2%84%A2%20Butterfly%20Knife%20%7C%20Case%20Hardened%20%28Well-Worn%29',
    },
    {
      nameId: 16965260,
      description: '★ StatTrak™ Butterfly Knife | Case Hardened (Minimal Wear)',
      url: 'https://steamcommunity.com/market/listings/730/%E2%98%85%20StatTrak%E2%84%A2%20Butterfly%20Knife%20%7C%20Case%20Hardened%20%28Minimal%20Wear%29',
    },
    {
      nameId: 20120134,
      description: '★ StatTrak™ Butterfly Knife | Case Hardened (Factory New)',
      url: 'https://steamcommunity.com/market/listings/730/%E2%98%85%20StatTrak%E2%84%A2%20Butterfly%20Knife%20%7C%20Case%20Hardened%20%28Factory%20New%29',
    },
    {
      nameId: 15434948,
      description: '★ Butterfly Knife | Case Hardened (Factory New)',
      url: 'https://steamcommunity.com/market/listings/730/%E2%98%85%20Butterfly%20Knife%20%7C%20Case%20Hardened%20%28Factory%20New%29',
    },
    {
      nameId: 15038000,
      description: '★ Butterfly Knife | Case Hardened (Minimal Wear)',
      url: 'https://steamcommunity.com/market/listings/730/%E2%98%85%20Butterfly%20Knife%20%7C%20Case%20Hardened%20%28Minimal%20Wear%29',
    },
  ],
};
