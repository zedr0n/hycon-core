import * as bodyParser from "body-parser"
import * as express from "express"
import * as jwt from "jsonwebtoken"
import { getLogger } from "log4js"
import * as React from "react"
import { matchPath } from "react-router"
import { matchRoutes, renderRoutes } from "react-router-config"
import { SignedTx } from "../../common/txSigned"
import { IConsensus } from "../../consensus/iconsensus"
import { RestManager } from "../../rest/restManager"
import * as Hycon from "../../server"
import { App, routes } from "../client/app"
import { indexRender } from "./index"
import { RestServer } from "./restServer"
const logger = getLogger("RestClient")
const apiVersion = "v1"

// tslint:disable:object-literal-sort-keys
export class HttpServer {
    public app: express.Application
    public rest: RestServer
    public hyconServer: RestManager
    private consensus: IConsensus
    constructor(hyconServer: RestManager, port: number = 8080) {
        this.app = express()
        this.config()
        this.app.all("/*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.header("Access-Control-Allow-Origin", "*")
            res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
            res.header("Access-Control-Allow-Headers", "Content-type, Accept, X-Access-Token, X-Key")
            if (req.method === "OPTIONS") {
                res.status(200).end()
            } else {
                next()
            }
        })
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => this.reactRoute(req, res, next))
        this.app.use(express.static("node_modules"))
        this.routeRest()
        this.rest = new RestServer(this.consensus)
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(404)
            res.json({
                status: 404,
                timestamp: Date.now(),
                error: "INVALID_ROUTE",
                message: "resource not found",
            })
        })
        this.app.listen(port)
        this.hyconServer = hyconServer
        logger.info(">>>>>>> Started RESTful API")
    }

    public reactRoute(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        const branches = matchRoutes(routes, req.url)
        if (branches.length > 0) {
            logger.info("react: " + req.url)
            const context: { url?: string } = {}
            const page = indexRender(this.rest, req.url, context)
            if (context.url) {
                res.redirect(context.url, 301)
            } else {
                res.send(page)
            }
        } else {
            logger.info("other: " + req.url)
            next()
        }
    }

    public routeRest() {
        let router: express.Router
        router = express.Router()

        router.post("/login", async (req: express.Request, res: express.Response) => {
            // Mock user to test (db authentication done here)
            const user = {
                idx: 1,
                uname: "test",
                pw: "test",
            }
            res.json(await this.rest.apiLogin(user))
        })

        function verifyToken(req: express.Request, res: express.Response, next: express.NextFunction) {
            const bearerHeader = req.headers.authorization as string
            if (typeof bearerHeader !== "undefined") {
                const bearerToken = bearerHeader.split(" ")[1]

                jwt.verify(bearerToken, "secretkey", (err: any, authData: string) => {
                    if (!err) {
                        next()
                    } else {
                        res.status(403)
                        res.json({
                            status: 403,
                            timestamp: Date.now(),
                            error: "BAD_TOKEN",
                            tokenError: err,
                        })
                    }
                })
            } else {
                res.status(403)
                res.json({
                    status: 403,
                    timestamp: Date.now(),
                    error: "NO_AUTH",
                    message: "no authentication header found",
                })
            }
        }

        router.post("/wallet", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(await this.rest.createNewWallet({
                mnemonic: req.body.mnemonic,
                language: req.body.language,
            }))
        })
        router.get("/wallet/:address/balance", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(await this.rest.getWalletBalance(req.params.address))
        })
        router.get("/wallet/:address/txs/:nonce?", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(await this.rest.getWalletTransactions(req.params.address, req.params.nonce))
        })
        router.put("/wallet/:address/callback", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(await this.hyconServer.createSubscription({
                address: req.params.address,
                url: req.body.url,
                from: req.body.from,
                to: req.body.to,
            }))
        })
        router.delete("/wallet/:address/callback/:id", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(await this.hyconServer.deleteSubscription(req.params.address, req.params.id))
        })
        router.post("/signedtx", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(
                await this.rest.outgoingSignedTx({
                    privateKey: req.body.privateKey,
                    from: req.body.from,
                    to: req.body.to,
                    amount: req.body.amount,
                    fee: req.body.fee,
                }, (tx: SignedTx) => {
                    this.hyconServer.txQueue.putTxs([tx])
                }),
            )
        })
        router.post("/tx", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(
                await this.rest.outgoingTx({
                    signature: req.body.signature,
                    from: req.body.from,
                    to: req.body.to,
                    amount: req.body.amount,
                    fee: req.body.fee,
                    nonce: req.body.nonce,
                    recovery: req.body.recovery,
                }, (tx: SignedTx) => {
                    this.hyconServer.txQueue.putTxs([tx])
                }),
            )
        })
        router.get("/tx/:hash", verifyToken, async (req: express.Request, res: express.Response) => {
            res.json(await this.rest.getTx(req.params.hash))
        })
        router.get("/address/:address", async (req: express.Request, res: express.Response) => {
            res.json(await this.rest.getAddressInfo(req.params.address))
        })

        this.app.use(`/api/${apiVersion}`, router)
    }

    public config() {
        this.app.use(bodyParser.json())
    }
}
