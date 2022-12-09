export interface ItemToScan {
  nameId: number;
  description: string;
  url: string;
  count?: number;
  sellPrice?: string;
}

export interface NotifyServerConfig {
  serverUrl: string;
  hostId: number;
}

export interface AppConfig {
  items: Array<ItemToScan>;
  serverConfig: NotifyServerConfig;
  scanInterval: number;
  apiTimeout: number;
  adbPath: string;
  airplaneToggleWaitTime: number;
  ipAnalysisFile?: string;
}


export interface ProxyData {
  ip: string;
  port: number;
  expire_time: string;
  city: string;
  isp: string;
}

export interface ProxyResponse {
  code: number;
  success: boolean;
  msg: string;
  data: ProxyData[];
}
