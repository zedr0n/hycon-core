import GoogleMapReact from "google-map-react"
import Long = require("long")
import { CircularProgress } from "material-ui"
import Dialog from "material-ui/Dialog"
import * as React from "react"
import { Redirect } from "react-router"
import { Link } from "react-router-dom"
import { IBlock, IHyconWallet, IRest } from "./rest"
import { hyconfromString, hycontoString } from "./stringUtil"
export class Transaction extends React.Component<any, any> {
    public currentMinerFee = "0"
    public currentReturnedFee = 0

    public mounted = false

    constructor(props: any) {
        super(props)

        const random = this.getRandomInt(0, 150)

        this.state = {
            address: "",
            amount: 0,
            hint: "",
            isHint: false,
            isLoading: false,
            minerFee: 1,
            name: props.name,
            piggyBank: "0",
            rest: props.rest,
            visible: false,
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

    }

    public getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    public componentWillUnmount() {
        this.mounted = false
    }
    public componentDidMount() {
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

    public handlePassword(data: any) {
        this.setState({ password: data.target.value })
    }

    public handleInputChange(event: any) {
        const target = event.target
        let value = target.value
        const name = target.name

        if (name === "amount") {
            const temp: string = value
            try {
                if (temp.match("(^[0-9]*)([.]{0,1}[0-9]{0,9})$") == null) {
                    alert("Please enter a number with up to 9 decimal places")
                    return
                }
            } catch (error) {

            }
            if (hyconfromString(target.value).add(hyconfromString(this.state.minerFee)).greaterThan(hyconfromString(this.state.piggyBank).sub(hyconfromString(this.state.wallet.pendingAmount)))) {
                alert(`You can't spend the money you don't have`)
                value = 0
            }
            this.setState({ [name]: value })
            this.currentMinerFee = hycontoString(hyconfromString(this.state.piggyBank).sub(hyconfromString(target.value).sub(this.state.wallet.pendingAmount)))

        } else if (name === "address") {
            if (value === this.state.wallet.address) {
                alert(`You can not send HYCON to yourself.`)
            } else {
                this.setState({
                    [name]: value,
                })
            }
        } else if (name === "minerFee") {
            if (this.state.amount === 0 || this.state.address === "") {
                alert(`Please should enter amount and address before enter miner fee.`)
            } else {
                const temp: string = value
                if (temp.match("(^[0-9]*)([.]{0,1}[0-9]{0,9}$)") == null) {
                    alert("Please enter a number with up to 9 decimal places")
                } else if (hyconfromString(value).greaterThan(hyconfromString(this.currentMinerFee))) {
                    alert(`You can't spend the money you don't have : ${this.currentMinerFee}`)
                    if (hyconfromString("1").greaterThan(hyconfromString(this.currentMinerFee))) {
                        value = this.currentMinerFee
                    } else { value = 1 }
                }
                this.setState({ minerFee: value })
            }
        }
    }

    public handleSubmit(event: any) {
        if (this.state.address !== "" && this.state.address !== undefined) {
            if (this.state.amount > 0) {
                if (this.state.wallet.address === this.state.address) {
                    alert(`You can not send HYCON to yourself.`)
                } else {
                    this.setState({ isLoading: true })
                    this.state.rest.sendTx({ name: this.state.name, password: this.state.password, address: this.state.address, amount: this.state.amount.toString(), minerFee: this.state.minerFee.toString() })
                        .then((result: boolean) => {
                            if (result === true) {
                                alert("A transaction of " + this.state.amount +
                                    "HYCON has been submitted to " + this.state.address +
                                    " with " + this.state.minerFee + "HYCON as miner fees.",
                                )
                                this.setState({ redirect: true })
                            } else {
                                alert("Fail to transfer hycon")
                                this.setState({ redirect: true })
                            }
                        })
                }
            } else {
                alert("Enter a valid transaction amount")
            }
        } else {
            alert("Enter a to address")
        }
        event.preventDefault()
    }

    public roundTo(n: number) {
        const digits = 9
        const multiplicator = Math.pow(10, digits)
        n = parseFloat((n * multiplicator).toFixed(11))
        const test = Math.round(n) / multiplicator
        return +test.toFixed(digits)
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
                <h2 className="contentSubTitle">{this.state.name} Balance : {this.state.piggyBank} Hycon</h2>
                <h3 className="contentSubTitle">Pending amount : {this.state.wallet.pendingAmount} Hycon</h3>
                <form className="form" >
                    <label className="">From Address : {this.state.wallet.address}
                    </label>
                    <br />
                    <br />
                    <label className="txLabel">To Address<br />
                        <input name="address" className="txSendInput" type="text" value={this.state.address} onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <label className="txLabel">Amount<br />
                        <input name="amount" className="txSendInput" type="text" value={this.state.amount} max={this.state.piggyBank} onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <label className="txLabel">Miner fee<br />
                        <input name="minerFee" className="txSendInput" type="text" value={this.state.minerFee} onChange={this.handleInputChange} />
                    </label>
                    <br />
                    <label className="txLabel">Wallet Password<br />
                        <div>
                            <input name="password" className="txSendInput txSendInputPwd" type="password" autoComplete="off" onChange={(data) => { this.handlePassword(data) }} />
                            {this.state.isHint ? (this.state.hint) : (<button className="btn btn-block btn-info blue hintBtn" onClick={(e) => this.showHint(e)}>Hint</button>)}
                        </div>
                    </label>
                    <br />

                    <br />
                    {this.state.isLoading ? (
                        <CircularProgress size={50} thickness={2} />
                    ) : (
                            <button className="btn btn-block btn-info green" onClick={this.handleSubmit}>Submit</button>
                        )}
                </form>
            </div >
        )
    }
    private showHint(e: any) {
        this.state.rest.getHint(this.state.name).then((result: string) => {
            this.setState({ isHint: true, hint: result })
        })
        e.preventDefault()
    }
}
