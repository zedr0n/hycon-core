import * as React from "react"
import { Link } from "react-router-dom"
import { IRest, ITxProp } from "./rest"
import { TxLine } from "./txLine"
interface ITxProps {
    rest: IRest
    hash: string
    tx: ITxProp
}

export class TxView extends React.Component<any, any> {
    public mounted: boolean = false
    constructor(props: any) {
        super(props)
        this.state = {
            hash: props.hash,
            rest: props.rest,
        }
    }
    public componentWillUnMount() {
        this.mounted = false
    }
    public componentWillMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        this.state.rest.getTx(this.state.hash).then((data: ITxProp) => {
            this.state.rest.setLoading(false)
            if (this.mounted) {
                this.setState({ tx: data })
            }
        })
    }
    public render() {
        if (this.state.tx === undefined) {
            return < div ></div >
        }
        return (
            <div>
                <div className="contentTitle">Transaction</div>
                <div>
                    <TxLine rest={this.state.rest} tx={this.state.tx} />
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn green">
                        {this.state.tx.amount} HYCON
          </button>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn">
                        {this.state.tx.confirmation} Confirmations
          </button>
                </div>
                <div className="mdl-grid">
                    <table className="mdl-cell mdl-data-table mdl-js-data-table mdl-shadow--2dp table_margined tablesInRow txSummaryTable">
                        <thead>
                            <tr>
                                <th
                                    colSpan={2}
                                    className="mdl-data-table__cell--non-numeric tableHeader_floatLeft"
                                >
                                    Summary
                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">
                                    Received Time
                </td>
                                <td className="numericTd">{this.state.tx.receivedTime}</td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">Lock Time</td>
                                <td className="numericTd">{this.state.tx.lockTime}</td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">
                                    Included In Blocks
                </td>
                                <td className="numericTd">
                                    <Link to="/block">{this.state.tx.includedInBlocks}</Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">
                                    Confirmations
                </td>
                                <td className="numericTd">
                                    {this.state.tx.confirmation} Confirmations
                </td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">Visualize</td>
                                <td className="numericTd">
                                    <Link to="/chart">View Tree Chart</Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="mdl-cell mdl-data-table mdl-js-data-table mdl-shadow--2dp table_margined tablesInRow txSummaryTable">
                        <thead>
                            <tr>
                                <th
                                    colSpan={2}
                                    className="mdl-data-table__cell--non-numeric tableHeader_floatLeft"
                                >
                                    Inputs and Outputs
                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">Fees</td>
                                <td className="numericTd">{this.state.tx.fee} HYCON</td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">
                                    Estimated Transacted
                </td>
                                <td className="numericTd">{this.state.tx.estimated} HYCON</td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">Scripts</td>
                                <td className="numericTd">Show scripts and coinbase</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
