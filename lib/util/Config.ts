export interface Config{
  protocol?:'ftp'|'sftp',
  host:string,
  port?:number,
  auth:{
    username:string,
    password:string
  },
  localRoot:string,
  remoteRoot:string,
  includes?:string[],
  excludes?:string[],
  deleteRemote?:boolean,
  forcePasv?:boolean
}
