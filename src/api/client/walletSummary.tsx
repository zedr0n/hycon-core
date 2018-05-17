import * as React from "react"
import { Link } from "react-router-dom"
import { IHyconWallet, IRest } from "./rest"
interface IWalletSummaryView {
    wallet: IHyconWallet
    rest: IRest
}
export class WalletSummary extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = { wallet: props.wallet, rest: props.rest }
    }
    public componentWillMount() { }
    public componentDidMount() { }
    public componentWillUnmount() { }
    public render() {
        if (this.state.wallet.address === undefined) {
            return < div ></div >
        }
        return (
            <div className="demo-card-wide mdl-card mdl-shadow--2dp cardMarginTop">
                <Link to={`/wallet/${this.state.wallet.name}`}>
                    <div className="mdl-card__title walletTitleDiv">
                        <i className="material-icons walletIcon_white">
                            account_balance_wallet
            </i>
                        <table className="walletSummaryTable">
                            <tbody>
                                <tr>
                                    <td className="contentTitle inCardTitle">
                                        {this.state.wallet.name}
                                    </td>
                                    <td rowSpan={2}>
                                        <span className="mdl-chip mdl-chip--contact balanceInfo">
                                            <span className="mdl-chip__contact mdl-color--teal mdl-color-text--white">
                                                H
                      </span>
                                            <span className="mdl-chip__text">
                                                {this.state.wallet.balance}
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="addressFont">{this.state.wallet.address}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Link>
            </div>
        )
    }
}
