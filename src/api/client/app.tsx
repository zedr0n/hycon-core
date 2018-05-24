import * as React from "react"
import { match, Redirect, RouteComponentProps, RouteProps } from "react-router"
import { RouteConfig } from "react-router-config"
import { Link, Route, Switch } from "react-router-dom"

import { AddressInfo } from "./addressInfo"
import { BlockView } from "./blockView"
import { Home } from "./home"
import { PeerDetailsView } from "./peerDetails"
// import { PeersList } from "./peersList"
import { PeersView } from "./peersView"
import { IRest } from "./rest"
import { Transaction } from "./transaction"
import { TxPoolList } from "./txPoolList"
import { TxView } from "./txView"

import { AddWallet } from "./addWallet"
import { RecoverWallet } from "./recoverWallet"
import { WalletDetail } from "./walletDetail"
import { WalletList } from "./walletList"
import { WalletSummary } from "./walletSummary"
import { WalletView } from "./walletView"

export const routes: RouteConfig[] = [
    { exact: true, path: "/" },
    { exact: true, path: "/tx/:hash" },
    { exact: true, path: "/block/:hash" },
    { exact: true, path: "/txPool" },
    { exact: true, path: "/address/:hash" },
    { exact: true, path: "/wallet" },
    { exact: true, path: "/transaction/:name" },
    { exact: true, path: "/peersView" },
    // { exact: true, path: "/peer/:hash" },
    { exact: true, path: "/wallet/addWallet" },
    { exact: true, path: "/wallet/recoverWallet" },
    { exact: true, path: "/wallet/:name" },
]

// tslint:disable:no-shadowed-variable
export class App extends React.Component<{ rest: IRest }, any> {
    public rest: IRest
    public blockView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element
    public home: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addressInfo: (
        { match }: RouteComponentProps<{ hash: string }>,
    ) => JSX.Element
    public txView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element
    public txPool: ({ match }: RouteComponentProps<{}>) => JSX.Element

    public transaction: ({ match }: RouteComponentProps<{ name: string }>) => JSX.Element
    public peersView: ({ match }: RouteComponentProps<{}>) => JSX.Element
    // public peerDetails: (
    //     { match }: RouteComponentProps<{ hash: string }>,
    // ) => JSX.Element

    public wallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public recoverWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public walletDetail: ({ match }: RouteComponentProps<{ name: string }>) => JSX.Element

    constructor(props: any) {
        super(props)
        this.state = {
            block: "block",
            isParity: false,
            loading: false,
            name: "BlockExplorer",
            searchVal: "",
            tx: "Tx 1",
        }
        this.rest = props.rest
        this.rest.loadingListener((loading: boolean) => {
            this.setState({ loading })
        })
        this.blockView = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <BlockView hash={match.params.hash} rest={this.rest} />
        )
        this.home = ({ match }: RouteComponentProps<{}>) => (
            <Home rest={props.rest} />
        )
        this.addressInfo = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <AddressInfo hash={match.params.hash} rest={this.rest} />
        )
        this.txView = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <TxView hash={match.params.hash} rest={this.rest} />
        )
        this.txPool = ({ match }: RouteComponentProps<{}>) => (
            <TxPoolList rest={this.rest} />
        )
        this.transaction = ({ match }: RouteComponentProps<{ name: string }>) => (
            <Transaction name={match.params.name} rest={this.rest} />
        )
        this.peersView = ({ match }: RouteComponentProps<{}>) => (
            <PeersView rest={props.rest} />
        )
        // this.peerDetails = ({ match }: RouteComponentProps<{ hash: string }>) => (
        //     <PeerDetailsView hash={match.params.hash} rest={this.rest} />
        // )
        this.wallet = ({ match }: RouteComponentProps<{}>) => (
            <WalletView rest={props.rest} />
        )
        this.addWallet = ({ match }: RouteComponentProps<{}>) => (
            <AddWallet rest={props.rest} />
        )
        this.recoverWallet = ({ match }: RouteComponentProps<{}>) => (
            <RecoverWallet rest={props.rest} />
        )
        this.walletDetail = ({ match }: RouteComponentProps<{ name: string }>) => (
            <WalletDetail name={match.params.name} rest={this.rest} />
        )
    }
    public render() {
        return (
            <div className="mdl-layout mdl-js-layout">
                <header className="mdl-layout__header" >
                    <div className="mdl-layout__header-row">
                        <span className="mdl-layout-title">Hycon Blockexplorer</span>
                        <div className="mdl-layout-spacer" />
                        <nav className="mdl-navigation mdl-layout--large-screen-only">
                            <form action={`/block/${this.state.searchVal}`}>
                                <div className="mdl-textfield mdl-js-textfield mdl-textfield--expandable">
                                    <label
                                        className="mdl-button mdl-js-button mdl-button--icon"
                                        htmlFor="search"
                                    >
                                        <i className="material-icons">search</i>
                                    </label>
                                    <div className="mdl-textfield__expandable-holder">
                                        <input
                                            className="mdl-textfield__input searchBox"
                                            type="text"
                                            id="search"
                                            placeholder="Block Hash"
                                            onChange={(event) => this.updateSearchVal(event)}
                                        />
                                    </div>
                                </div>
                            </form>
                            <Link className="mdl-navigation__link navMargin" to="/">Home</Link>
                            {/* <Link className="mdl-navigation__link" to="/block">Block</Link> */}
                            <Link className="mdl-navigation__link" to="/txPool">Tx</Link>
                            <Link className="mdl-navigation__link" to="/wallet">Wallet</Link>
                            <Link className="mdl-navigation__link" to="/peersView">Peers List</Link>
                        </nav>
                    </div>
                    <div
                        className={`mdl-progress mdl-js-progress mdl-progress__indeterminate progressBar ${
                            this.state.loading ? "" : "hide"
                            }`}
                    />
                </header>
                <main className="mdl-layout__content main">
                    <div className="page-content">
                        <Switch>
                            {/* <Route exact path='/' component={() => { return <Home name={this.state.name} /> }} /> */}
                            <Route exact path="/" component={this.home} />
                            <Route exact path="/tx/:hash" component={this.txView} />
                            <Route exact path="/block/:hash" component={this.blockView} />
                            <Route exact path="/txPool" component={this.txPool} />
                            <Route exact path="/address/:hash" component={this.addressInfo} />
                            <Route exact path="/transaction/:name" component={this.transaction} />
                            <Route exact path="/wallet/addWallet" component={this.addWallet} />
                            <Route exact path="/wallet" component={this.wallet} />
                            <Route exact path="/wallet/recoverWallet" component={this.recoverWallet} />
                            <Route exact path="/wallet/:name" component={this.walletDetail} />
                            <Route exact path="/peersView" component={this.peersView} />
                        </Switch>
                    </div>
                </main>
            </div>
        )
    }
    public updateSearchVal(event: any) {
        this.setState({ searchVal: event.target.value })
    }
}
