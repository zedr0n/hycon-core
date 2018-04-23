const stratum = require('stratum')
const LibStratum = stratum.Server
import * as bigInteger from 'big-integer'
type BigInteger = bigInteger.BigInteger
import { MinerServer } from './minerSever';
import { getLogger } from 'log4js'
import { zeroPad } from '../util/miningUtil';
const logger = getLogger('Stratum')

export class StratumServer {
    private minerServer: MinerServer
    
    public static port: number
    private net: any = undefined

    private prehash: Uint8Array | undefined
    private target: Uint8Array | undefined
    private socketsId: any[] = []
    private mapSocket: Map<string, any> = new Map<string, any>()

    constructor(minerServer: MinerServer) {
        logger.debug(`Stratum Server`)
        this.net = new LibStratum({settings: {port: StratumServer.port}})

        this.initialize()
    }

    public getMinerCount() {
        return this.socketsId.length

    }

    public start() {
        this.prehash = undefined
        this.target = undefined
    }
    public stop() {
        this.prehash = undefined
        this.target = undefined
    }

    public putWork(prehash: Uint8Array, target: Uint8Array, jobUnit: BigInteger) {
        logger.debug(`>>>>>>>>>Put Work in stratumServer : ${prehash.toString()}`)
        this.prehash = prehash
        this.target = target

        for (let index = 0; index < this.socketsId.length; index++) {
            let socket = this.mapSocket.get(this.socketsId[index])
            if (socket !== undefined) {
                socket.notify([
                    zeroPad((jobUnit.multiply(index + (MinerServer.useCpuMiner ? 1 : 0))).toString(MinerServer.LEN_HEX_NONCE), MinerServer.LEN_HEX_NONCE), // job_id
                    new Buffer(this.prehash).toString('hex'),
                    new Buffer(this.target).toString('hex'),
                    zeroPad((jobUnit).toString(MinerServer.LEN_HEX_NONCE), MinerServer.LEN_HEX_NONCE), // job_unit
                    [
                        '0000000000000000000000000000000000000000000000000000000000000000'
                    ], // branches
                    '00000001', // block_version
                    '00000000', // nbit
                    '00000000', // ntime
                    true, // clean
                ]).then(
                    function () {
                        logger.debug(`Put work - ${index} miner success `)
                    },
                    function () {
                        logger.debug(`Put work - ${index} miner fail `)
                    },
                )
            }
        }
    }

    private initialize() {
        var self = this
        this.net.on('mining', async function (req: any, deferred: any, socket: any) {
            if (self.socketsId.indexOf(socket.id) == -1) {
                logger.info(`New miner socket is connected : ${socket.id}`)
                self.socketsId.push(socket.id)
                self.mapSocket.set(socket.id, socket)
            }

            switch (req.method) {
                case 'subscribe':
                    deferred.resolve([
                        '0000', // difficulty
                        '00000000000000000000000000000000', // subscription_id
                        '00000000', // extranonce1
                        4, // extranonce2_size
                    ])
                    break
                case 'authorize':
                    logger.debug('authorize=', req)
                    logger.debug('Authorizing worker ' + req.params[0] + '   ' + req.params[1])
                    deferred.resolve([true])
                    deferred.promise.then(function () { })
                    break
                case 'submit':
                    logger.debug(`Submit id : ${req.id} / nonce : ${req.params.nonce} / result : ${req.params.result}`)
                    deferred.resolve([await self.completeWork(req.params.nonce)])
                    break
                default:
                    deferred.reject(LibStratum.errors.METHOD_NOT_FOUND)
            }
        })

        this.net.on('mining.error', function (error: any, socket: any) {
            logger.error('Mining error: ', error)
        })

        this.net.listen().done(function (msg: any) {
            logger.debug(msg)
        })

        this.net.on('close', function (socketId: any) {
            logger.info(`Stratum Socket closed : ${socketId}`)
            self.mapSocket.delete(socketId)
            self.socketsId.splice(self.socketsId.indexOf(socketId), 1)
        })
    }

    private async completeWork(nonce: string): Promise<boolean> {
        try {
            if(this.prehash === undefined || this.target === undefined) {
                return await this.minerServer.submitNonce(nonce)
            } else {
                return Promise.reject(`This nonce(${nonce}) is already confirm`)
            }
        } catch (e) {
            return Promise.reject(`Fail to submit nonce : ${e}`)
        }
    }

}