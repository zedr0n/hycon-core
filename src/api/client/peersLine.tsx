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
                    <span>{this.state.peer.host}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.port}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.location}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.FailCount} nodes</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.LastSeen} ms</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.Latitude}</span>
                </td>
                <td className="mdl-data-table__cell--non-numeric">
                    <span>{this.state.peer.Longitude}</span>
                </td>
            </tr>
        )
    }
}
