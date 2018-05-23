import Long = require("long")
import * as QRCode from "qrcode.react"
import * as React from "react"
import { IRest, ITxProp, IWalletAddress } from "./rest"
import { TxLine } from "./txLine"
import { hyconfromString, hycontoString } from "./util/commonUtil"
interface IAddressProps {
    rest: IRest
    hash: string
}
interface IAddressView {
    rest: IRest
    hash: string
    address?: IWalletAddress
    totalReceive?: string
    totalSend?: string
}
export class AddressInfo extends React.Component<IAddressProps, IAddressView> {
    public mounted: boolean = false
    constructor(props: IAddressProps) {
        super(props)
        this.state = { hash: props.hash, rest: props.rest }
    }
    public componentWillUnmount() {
        this.mounted = false
    }
    public componentWillMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        this.state.rest.getAddressInfo(this.state.hash).then((data: IWalletAddress) => {
            let sumRec = Long.fromInt(0)
            let sumSnd = Long.fromInt(0)
            for (const tx of data.txs) {
                if (tx.to === this.state.hash) {
                    sumRec = sumRec.add(hyconfromString(tx.amount))
                } else {
                    sumSnd = sumSnd.add(hyconfromString(tx.amount))
                }
            }
            if (this.mounted) {
                this.setState({
                    address: data,
                    totalReceive: hycontoString(sumRec),
                    totalSend: hycontoString(sumSnd),
                })
            }
            this.state.rest.setLoading(false)
        })
    }
    public render() {
        if (this.state.address === undefined) {
            return < div ></div >
        }
        let count = 0
        return (
            <div>
                <div className="contentTitle">Hycon Address</div>
                <div className="sumTablesDiv">
                    <table className="tablesInRow twoTablesInRow">
                        <thead>
                            <tr>
                                <th
                                    colSpan={2}
                                    className="tableBorder_Header tableHeader_floatLeft"
                                >
                                    Summary
                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="tdSubTitle subTitle_width20">Address</td>
                                <td>{this.state.hash}</td>
                            </tr>
                            <tr>
                                <td className="tdSubTitle subTitle_width40">No.Transactions</td>
                                <td>{this.state.address.txs.length}</td>
                            </tr>
                            <tr>
                                <td className="tdSubTitle subTitle_width40">Final balance</td>
                                <td>{this.state.address.balance}</td>
                            </tr>
                        </tbody>
                    </table>
                    <span className="QRSpan">
                        <QRCode size={170} value={this.state.hash} />
                    </span>
                </div>
                <div className="contentTitle">Transactions</div>
                {this.state.address.txs.map((tx: ITxProp) => {
                    return (
                        <div key={count++}>
                            <TxLine tx={tx} rest={this.state.rest} address={this.state.address} />
                            <div>
                                {tx.from === this.state.hash ? (
                                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent txAmtBtn">
                                        -{tx.amount} HYCON
                  </button>
                                ) : (
                                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn">
                                            {tx.amount} HYCON
                  </button>
                                    )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}
