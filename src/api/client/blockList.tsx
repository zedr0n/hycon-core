import Long = require("long")
import * as React from "react"
import update = require("react-addons-update")
import { Link } from "react-router-dom"
import { BlockLine } from "./blockLine"
import { IBlock, IRest } from "./rest"
import { hyconfromString, hycontoString } from "./util/commonUtil"

interface IBlockListView {
    rest: IRest
    blocks: IBlock[]
}
export class BlockList extends React.Component<any, any> {
    public intervalId: any // NodeJS.Timer
    public mounted: boolean = false
    constructor(props: any) {
        super(props)
        this.state = { blocks: [], rest: props.rest }
    }
    public componentWillUnmount() {
        this.mounted = false
    }
    public componentWillMount() {
        this.mounted = true
        this.props.rest.setLoading(true)
        this.props.rest.getBlockList().then((data: IBlock[]) => {
            for (const block of data) {
                let sum = Long.fromInt(0)
                for (const tx of block.txs) {
                    sum = sum.add(hyconfromString(tx.amount))
                }
                block.txSummary = hycontoString(sum)
            }
            if (this.mounted) {
                this.setState({ blocks: data })
            }
            this.props.rest.setLoading(false)
        })
    }

    public componentDidMount() {
        this.intervalId = setInterval(() => {
            this.getRecentBlockList()
        }, 10000)
    }

    public getRecentBlockList() {
        this.state.rest.getBlockList().then((data: IBlock[]) => {
            for (const block of data) {
                let sum = Long.fromInt(0)
                for (const tx of block.txs) {
                    sum = sum.add(hyconfromString(tx.amount))
                }
                block.txSummary = hycontoString(sum)
            }
            this.setState({
                blocks: update(
                    this.state.blocks, {
                        $splice: [[0, this.state.blocks.length]],
                    },
                ),
            })
            this.setState({
                blocks: update(
                    this.state.blocks, {
                        $push: data,
                    },
                ),
            })
        })
    }
    public render() {
        let blockIndex = 0
        if (this.state.blocks.length === 0) {
            return < div ></div >
        }
        return (
            <div>
                <div className="contentTitle">
                    LATEST BLOCKS
          <span className="seeMoreLink">
                        <Link to="/block">SEE MORE ></Link>
                    </span>
                </div>
                <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp table_margined">
                    <thead>
                        <tr>
                            <th className="mdl-data-table__cell--non-numeric">Height</th>
                            <th className="mdl-data-table__cell--non-numeric">Age</th>
                            <th className="mdl-data-table__cell--non-numeric">Transactions</th>
                            <th className="mdl-data-table__cell--non-numeric">Total Sent</th>
                            <th className="mdl-data-table__cell--non-numeric">Relayed By</th>
                            <th className="mdl-data-table__cell--non-numeric">Size(kB)</th>
                            <th className="mdl-data-table__cell--non-numeric">Weight(kWU)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.blocks.map((block: IBlock) => {
                            return <BlockLine key={blockIndex++} block={block} />
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}
