import GoogleMapReact from "google-map-react"
import Long = require("long")
import { CircularProgress } from "material-ui"
import Dialog from "material-ui/Dialog"
import * as React from "react"
import { Redirect } from "react-router"
import { Link } from "react-router-dom"
import { IBlock, IHyconWallet, IRest } from "./rest"
import { hyconfromString, hycontoString } from "./util/commonUtil"
export class Transaction extends React.Component<any, any> {
    public currentMinerFee = 0
    public currentReturnedFee = 0

    public mounted = false

    constructor(props: any) {
        super(props)

        const random = this.getRandomInt(0, 150)

        this.state = {
            address: "",
            amount: 0,
            dialogFee: "0,0",
            isLoading: false,
            left: 0,
            minerFee: 0,
            name: props.name,
            piggyBank: "0",
            rest: props.rest,
            visible: false,
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.handleOpenDialog = this.handleOpenDialog.bind(this)
        this.handleCloseDialog = this.handleCloseDialog.bind(this)
    }

    public getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    public componentWillUnmount() {
        this.mounted = false
    }
    public componentWillMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        this.state.rest
            .getWalletDetail(this.state.name)
            .then((data: IHyconWallet) => {
                this.state.rest.setLoading(false)
                if (this.mounted) {
                    this.setState({ wallet: data, piggyBank: data.balance })
                }
            })
    }
    public handleOpenDialog() {
        if (this.state.amount !== 0) {
            this.setState({ visible: true })
        } else {
            alert("Please select a trasaction amount")
        }
    }

    public handleCloseDialog() {
        this.setState({ visible: false })
    }

    public handlePassword(data: any) {
        this.setState({ password: data.target.value })
    }

    public handleSubmitDialog() {
        const tempMinerFee = this.state.dialogFee.split(",")[0]
        const tempLeft = this.state.dialogFee.split(",")[1]
        this.setState({
            left: tempLeft,
            minerFee: tempMinerFee,
        })
        this.handleCloseDialog()
    }

    public handleInputChange(event: any) {
        const target = event.target
        const value = target.value
        const name = target.name

        let newMinerFee = 0
        const newReturnedFee = 0

        if (name === "amount") {
            const temp: string = value
            if (temp.match("(^[0-9]*)([.]{0,1}[0-9]{0,8}$)") == null) {
                alert("Please enter only numbers")
            } else if (hyconfromString(value).greaterThan(hyconfromString(this.state.piggyBank))) {
                alert("You can't spend the money you don't have")
            } else {
                newMinerFee = 1
                if (target.value === 0) {
                    newMinerFee = 0
                }
                this.setState({
                    dialogFee: newMinerFee + "," + 0,
                    left: newReturnedFee,
                    minerFee: newMinerFee,
                    [name]: value,
                })
                this.currentMinerFee = newMinerFee
                this.currentReturnedFee = 0
            }
        } else if (name === "address") {
            this.setState({
                [name]: value,
            })
        } else if (name === "minerFee") {
            const temp: string = value
            if (temp.match("(^[0-9]*)([.]{0,1}[0-9]{0,8}$)") == null) {
                alert("Please enter only numbers")
            } else if (value > this.currentMinerFee) {
                alert("You can't spend the money you don't have")
            } else {
                newMinerFee = this.state.piggyBank - target.value
                if (target.value === 0) {
                    newMinerFee = 0
                }
                this.currentReturnedFee = this.currentMinerFee - target.value
                this.setState({
                    dialogFee: target.value + "," + this.currentReturnedFee,
                })
            }
        }
    }

    public handleSubmit(event: any) {
        if (this.state.address !== "" && this.state.address !== undefined) {
            if (this.state.amount > 0) {
                this.setState({
                    isLoading: true,
                })
                this.state.rest
                    .sendTx({ name: this.state.name, password: this.state.password, address: this.state.address, amount: this.state.amount.toString(), minerFee: this.state.minerFee.toString() })
                    .then((result: boolean) => {
                        if (result === true) {
                            const newBank =
                                hyconfromString(this.state.piggyBank).subtract(hyconfromString((this.state.amount + this.state.minerFee).toString()))
                            alert(
                                "A transaction of " +
                                this.formatDecimal(this.state.amount + "") +
                                "Hc has been submitted to " +
                                this.state.address +
                                " with " +
                                this.roundTo(this.state.minerFee) +
                                "Hc as miner fees.",
                            )

                            this.setState({
                                address: "who",
                                amount: 0,
                                dialogFee: "0,0",
                                isLoading: false,
                                left: 0,
                                minerFee: 0,
                                piggyBank: hycontoString(newBank),
                                redirect: true,
                                visible: false,
                            })
                        } else {
                            alert("Fail to transfer hycon")
                            this.setState({ redirect: true })
                        }
                    })
            } else {
                alert("Enter a valid transaction amount")
            }
        } else {
            alert("Enter a to address")
        }
        event.preventDefault()
    }

    public formatDecimal(num: string): string {
        let x
        if (num.toString().split("e").length !== 0) {
            x = Number(num)
            const s = x.toExponential().split("e")
            const r = s[0].split(".")
            let length = Math.abs(Number(s[1]))
            if (r.length > 1) { length += r[1].length }
            return x.toFixed(length)
        } else {
            return num
        }
    }

    public roundTo(n: number) {
        const digits = 8
        const multiplicator = Math.pow(10, digits)
        n = parseFloat((n * multiplicator).toFixed(11))
        const test = Math.round(n) / multiplicator
        return +test.toFixed(digits)
    }

    public precise(value: string) {
        return (value = Number(value).toFixed(8))
    }

    public render() {
        if (this.state.redirect) {
            return <Redirect to={`/wallet/${this.state.name}`} />
        }
        if (this.state.wallet === undefined) {
            return < div ></div >
        }
        return (
            <div>
                <h1 className="contentTransactionTitle">Transaction Process</h1>
                <h2 className="contentSubTitle">Money Box : {this.state.piggyBank} Hycon</h2>
                {/* <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyAp-2W8_T6dZjq71yOhxW1kRkbY6E1iyuk" }}
                    defaultCenter={this.state.center}
                    defaultZoom={this.state.zoom}
                /> */}

                <form onSubmit={this.handleSubmit} className="form">
                    <label className="">From Address : {this.state.wallet.address}
                    </label>
                    <br />
                    <br />
                    <label className="">To Address :
                        <input name="address" type="text" value={this.state.address} onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <label className="">Amount :
                        <input name="amount" type="text" value={this.state.amount} max={this.state.piggyBank} onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <div className="feeDiv">
                        <div className="inlineDiv">
                            <p className="infoText">
                                {" "}
                                Miner fee : {this.roundTo(this.state.minerFee)}{" "}
                            </p>
                            <p className="infoText">
                                Returned fee : {this.roundTo(this.state.left)}
                            </p>
                        </div>
                        <div className="inlineDiv">
                            <button type="button" onClick={this.handleOpenDialog} className="buttonAjust" >Adjust the fee</button>
                        </div>
                        <label className="">Wallet Password :
                            <input name="password" type="password" onChange={(data) => { this.handlePassword(data) }}
                            />
                        </label>
                    </div>
                    <Dialog title="Dialog With Actions" open={this.state.visible} className="dialog" >
                        <span className="dialogTitle">
                            {" "}Please select how much do you want to spend in the transaction fee:{" "}
                        </span>
                        <input type="range" step={0.00000001} min="0" max={this.currentMinerFee} value={this.state.dialogFee.split(",")[0]}
                            className="slider" onChange={this.handleInputChange} name="minerFee" />
                        {/* <span className="infoText">Miner fee: {this.roundTo((this.state.dialogFee).split(",")[0])} Hc</span> */}
                        <div className="dialogForm">
                            <div className="divDialog">
                                <span className="infoTextDialog">Miner fee: </span>
                                <br />
                                <input name="minerFee" type="text" value={this.state.dialogFee.split(",")[0]} max={this.currentMinerFee}
                                    onChange={this.handleInputChange} className="dialogInput" />
                            </div>
                            <div className="divDialog2">
                                <span className="infoTextDialog">Returned fee:</span>
                                <br />
                                <span className="infoTextDialog">{this.roundTo(this.state.dialogFee.split(",")[1])}Hycon </span>
                            </div>
                        </div>

                        <button onClick={this.handleCloseDialog.bind(this)} className="btn btn--close dialog__btn" >Close</button>
                        <button onClick={this.handleSubmitDialog.bind(this)} className="btn btn--sumit dialog__btn" >Submit</button>
                    </Dialog>
                    <br />
                    {this.state.isLoading ? (
                        <CircularProgress size={50} thickness={2} />
                    ) : (
                            <input type="submit" value="Submit" />
                        )}
                </form>
            </div>
        )
    }
}
