import GoogleMap from "google-map-react"
import * as React from "react"
import { Link } from "react-router-dom"

import { Marker } from "./marker"
import { PeersLine } from "./peersLine"
import { PeersList } from "./peersList"
import { ILocationDetails, IPeer, IRest } from "./rest"

interface IPeersProps {
    rest: IRest
    hash: string
    peer: IPeer
}

// tslint:disable-next-line:no-var-requires
const googleMapsClient = require("@google/maps").createClient({
    key: "AIzaSyAp-2W8_T6dZjq71yOhxW1kRkbY6E1iyuk",
})

export class PeersView extends React.Component<any, any> {
    public mounted: boolean = false
    public count: number = 0
    constructor(props: any) {
        super(props)
        this.state = {
            center: [59.938043, 30.337157],
            rest: props.rest,
            zoom: 0,
        }
    }
    public componentWillUnMount() {
        this.mounted = false
    }
    public componentWillMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        this.state.rest.getPeerList().then((data: IPeer[]) => {
            this.state.rest.setLoading(false)
            if (this.mounted) {
                this.setState({ peer: data })
            }
        })
    }
    public render() {
        if (this.state.peer === undefined) {
            return <div />
        }
        return (
            <div>
                <div className="contentTitle">Peers</div>
                <div>
                    <PeersList rest={this.state.rest} peer={this.state.peer} />
                </div>

                <div style={{ width: "90%", height: "400px", margin: "auto" }}>
                    <GoogleMap
                        bootstrapURLKeys={{
                            key: "AIzaSyAp-2W8_T6dZjq71yOhxW1kRkbY6E1iyuk",
                        }}
                        defaultCenter={this.state.center}
                        defaultZoom={this.state.zoom}
                    >
                        {this.state.peer.map((peer: IPeer) => {
                            return (
                                <Marker
                                    key={this.count++}
                                    className="marker"
                                    lat={peer.latitude}
                                    lng={peer.longitude}
                                    text={"0"}
                                />
                            )
                        })}
                    </GoogleMap>
                </div>
            </div>
        )
    }
}
