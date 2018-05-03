declare module "network" {
    export function get_public_ip(func:(err:any, ip:any)=>void):void
}