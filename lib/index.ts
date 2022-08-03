import { Config } from './util/Config';

export function defineConfig(config:Config){
  return {
    protocol:'ftp',
    ...config
  } as Config;
}
export default {

};