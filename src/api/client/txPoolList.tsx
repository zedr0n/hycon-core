import * as React from "react"
import update = require("react-addons-update")
import * as ReactPaginate from "react-paginate"
import { Link } from "react-router-dom"
import { IRest, ITxProp } from "./rest"
import { TxLine } from "./txLine"
import { TxPoolLine } from "./txPoolLine"
interface ITxListView {
    rest: IRest
    txs: ITxProp[]
}
export class TxPoolList extends React.Component<any, any> {
    public intervalId: any // NodeJS.Timer
    public mounted: boolean = false

    constructor(props: ITxListView) {
        super(props)
        this.state = { txs: [], rest: props.rest, length: 0, index: 0 }
    }

    public componentWillUnmount() {
        this.mounted = false
        clearInterval(this.intervalId)
    }

    public componentDidMount() {
        this.mounted = true
        this.getPendingTxs(this.state.index)
        this.intervalId = setInterval(() => {
            this.getPendingTxs(this.state.index)
        }, 10000)
    }

    public getPendingTxs(index: number) {
        this.state.rest.setLoading(true)
        this.state.rest.getPendingTxs(index).then((result: { txs: ITxProp[], length: number }) => {
            this.setState({
                txs: update(this.state.txs, { $splice: [[0, this.state.txs.length]] }),
            })
            this.setState({
                index: update(this.state.index, { $set: index }),
                length: update(this.state.length, { $set: result.length }),
                txs: update(this.state.txs, { $push: result.txs }),
            })
            this.state.rest.setLoading(false)
        })
    }

    public render() {
        let txIndex = 0
        if (this.state.txs.length === 0) {
            return <div className="contentTitle">Transactions</div>
        }
        return (
            <div>
                <span className="seeMoreLink">
                    <ReactPaginate previousLabel={"PREV"}
                        nextLabel={"NEXT"}
                        breakLabel={<a>...</a>}
                        breakClassName={"break-me"}
                        pageCount={this.state.length}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={9}
                        onPageChange={this.handlePageClick}
                        containerClassName={"pagination"}
                        activeClassName={"active"}
                        initialPage={this.state.index}
                        disableInitialCallback={true}
                    />
                </span>
                <div className="contentTitle">Transactions</div>

                <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp table_margined">
                    <thead>
                        <tr>
                            <th className="mdl-data-table__cell--non-numeric">Hash</th>
                            <th className="mdl-data-table__cell--non-numeric">From</th>
                            <th className="mdl-data-table__cell--non-numeric">To</th>
                            <th className="mdl-data-table__cell--non-numeric">Amount</th>
                            <th className="mdl-data-table__cell--non-numeric">Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.txs.map((tx: ITxProp) => {
                            return <TxPoolLine key={txIndex++} tx={tx} />
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
    private handlePageClick = (data: any) => {
        this.getPendingTxs(data.selected)
    }
}
