import * as React from "react"
import { Link } from "react-router-dom"
import { IPeer, IRest } from "./rest"

interface IPeersLineView {
    rest: IRest
    peer: IPeer
}

export class PeersLine extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = { peer: props.peer, rest: props.rest }
    }

    public render() {
        return (
            <tr>
                <td className="mdl-data-table__cell--non-numeric">
                    <Link to={`/peer/${this.state.peer.name}`}>
                        {this.state.peer.name}
                    </Link>
                    {/* <span>{this.state.peer.name}</span> */}
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.ip}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.port}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.location}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    {this.state.peer.isMiner ? (
                        <span>Mining</span>
                    ) : (
                            <span>Not mining</span>
                        )}
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.nodes} nodes</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.nodeLatency} ms</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>
                        <Link to={`/block/${this.state.peer.lastBlock}`}>
                            {this.state.peer.lastBlock}
                        </Link>
                    </span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.pendingTransaction}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.peersNumber}</span>
                </td>
            </tr>
        )
    }
}
