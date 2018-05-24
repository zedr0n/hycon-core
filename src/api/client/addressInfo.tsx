import Long = require("long")
import * as QRCode from "qrcode.react"
import * as React from "react"
import update = require("react-addons-update")
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
    txs: ITxProp[],
    hasMore: boolean,
    address?: IWalletAddress
}
export class AddressInfo extends React.Component<IAddressProps, IAddressView> {
    public mounted: boolean = false
    constructor(props: IAddressProps) {
        super(props)
        this.state = { hash: props.hash, rest: props.rest, txs: [], hasMore: true }
    }
    public componentWillUnmount() {
        this.mounted = false
    }
    public componentDidMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        this.state.rest.getAddressInfo(this.state.hash).then((data: IWalletAddress) => {
            if (this.mounted) {
                this.setState({
                    address: data, txs: data.txs,
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
                {this.state.txs.map((tx: ITxProp) => {
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
                {this.state.hasMore ?
                    (<div><button onClick={() => this.fetchNextTxs()}>Load more</button></div>)
                    :
                    (<div></div>)}

            </div>
        )
    }
    private fetchNextTxs() {
        this.state.rest.getNextTxs(this.state.hash, this.state.txs[this.state.txs.length - 1].hash).then((result: ITxProp[]) => {
            if (result.length === 0) { this.setState({ hasMore: false }) }
            this.setState({
                txs: update(this.state.txs, { $push: result }),
            })
        })
    }
}
