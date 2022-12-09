import got, { Response } from 'got';
import { exec } from 'child_process';
import util from 'util';
import { ProxyResponse, ProxyData } from '../types';
const execAsync = util.promisify(exec);


export function base64Decode(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('ascii');
}

export function base64Encode(input: string): string {
  return Buffer.from(input).toString('base64');
}

export function throwError(msg?: string): void {
  throw new Error(msg);
}

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const getProxy = async (): Promise<ProxyData[]> => {
  const proxyUrl = 'http://zltiqu.pyhttp.taolop.com/getip?count=1&neek=58008&type=1&yys=0&port=1&sb=&mr=1&sep=1';
  const res = await got.get<ProxyResponse>(proxyUrl, { json: true, https: { rejectUnauthorized: false } });
  return res.body.data;
};

export const toggleAirPlainMode = async (adbPath: string, waitInSeconds: number): Promise<void> => {
  try {
    console.info('即将打开飞行模式!');
    const { stdout: offOut, stderr: offErr } = await execAsync(`${adbPath} shell "${getAdbAirplaneModeCommand(true)}"`);
    console.log('stdout:', offOut);
    offErr && console.log('stderr:', offErr);

    console.info(`${waitInSeconds}秒后关闭飞行模式!`);
    await sleep(waitInSeconds * 1000);

    const { stdout: onOut, stderr: onErr } = await execAsync(`${adbPath} shell "${getAdbAirplaneModeCommand(false)}"`);
    console.log('stdout:', onOut);
    onErr && console.log('stderr:', onErr);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
};

export const getAdbAirplaneModeCommand = (on: boolean): string => `su -c 'settings put global airplane_mode_on ${on ? 1 : 0}; am broadcast -a android.intent.action.AIRPLANE_MODE --ez state ${on ? 'true' : 'false'}'`;
