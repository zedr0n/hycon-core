import * as React from "react"
import { Link } from "react-router-dom"
import { PeersLine } from "./peersLine"
import { IPeer, IRest } from "./rest"

interface IPeerListView {
    rest: IRest
    peers: IPeer[]
}
export class PeersList extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = { peers: props.peer, rest: props.rest }
    }
    public render() {
        let count = 0
        return (
            <div>
                <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp table_margined">
                    <thead>
                        <tr>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Name</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Ip</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Port</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Location</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Is Miner</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Nodes</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Node Latency</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Last Block</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Pending Transaction</span>
                            </th>
                            <th className="mdl-data-table__cell--non-numeric">
                                <span>Number of Peers</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.peers.map((peer: IPeer) => {
                            return (
                                <PeersLine key={count++} peer={peer} rest={this.state.rest} />
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}
