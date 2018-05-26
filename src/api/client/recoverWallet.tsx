import * as React from "react"
import { Redirect } from "react-router"
import { IBlock, IHyconWallet, IRest } from "./rest"
import { encodingMnemonic } from "./util/commonUtil"

export class RecoverWallet extends React.Component<any, any> {
    public mounted: boolean = false
    public errMsg1: string = "필수값을 입력하세요"
    public errMsg2: string = "비밀번호가 일치하지 않습니다"
    public errMsg3: string = "Mnemonic이 유효하지 않습니다"
    public errMsg4: string = "Fail to recover wallet"
    constructor(props: any) {
        super(props)
        this.state = {
            isUnValid: false,
            language: "english",
            languages: ["english", "Chinese - Simplified", "Chinese - Traditional", "korean"],
            mnemonic: "",
            redirect: false,
            rest: props.rest,
        }
    }

    public handleName(data: any) {
        this.setState({ name: data.target.value })
    }
    public handlePassword(data: any) {
        this.setState({ password: data.target.value })
    }
    public handleConfirmPassword(data: any) {
        this.setState({ confirmPassword: data.target.value })
    }
    public handleHint(data: any) {
        this.setState({ hint: data.target.value })
    }
    public handleTypeMnemonic(data: any) {
        this.setState({ mnemonic: data.target.value })
    }

    public handleLanguage(data: any) {
        let opt = data.target.value
        if (opt === "Chinese - Traditional") {
            opt = "chinese_traditional"
        } else if (opt === "Chinese - Simplified") {
            opt = "chinese_simplified"
        }
        this.setState({ language: opt })
    }

    public recoverWallet() {
        if (this.state.name === undefined || this.state.password === undefined || this.state.hint === undefined) {
            alert(this.errMsg1)
        } else {
            if (this.state.password !== this.state.confirmPassword) {
                alert(this.errMsg2)
            } else {
                let mnemonic = this.state.mnemonic
                if (mnemonic.charCodeAt(0) >= 0xAC00 && mnemonic.charCodeAt(0) <= 0xD7A3) {
                    mnemonic = encodingMnemonic(mnemonic)
                }
                this.state.rest.recoverWallet({
                    hint: this.state.hint,
                    language: this.state.language,
                    mnemonic,
                    name: this.state.name,
                    password: this.state.password,
                }).then((data: string | boolean) => {
                    if (typeof data !== "string") {
                        alert(this.errMsg3)
                        this.setState({ isUnValid: true })
                    } else {
                        this.setState({ redirect: true })
                    }
                })
            }
        }
    }
    public recoverWalletForce() {
        let mnemonic = this.state.mnemonic
        if (mnemonic.charCodeAt(0) >= 0xAC00 && mnemonic.charCodeAt(0) <= 0xD7A3) {
            mnemonic = encodingMnemonic(mnemonic)
        }
        this.state.rest
            .recoverWalletForce({
                hint: this.state.hint,
                language: this.state.language,
                mnemonic,
                name: this.state.name,
                password: this.state.password,
            })
            .then((data: string) => {
                if (typeof data !== "string") {
                    alert(this.errMsg4)
                }
                this.setState({ redirect: true })
            })
    }

    public cancelWallet() {
        this.setState({ redirect: true })
    }

    public render() {
        if (this.state.redirect) {
            return <Redirect to="/wallet" />
        }
        return (
            <div>
                <div className={`${this.state.isUnValid ? "hide" : ""}`}>
                    <div className="contentTitle">Recover Wallet</div>
                    <table className="recoverTable">
                        <tbody>
                            <tr>
                                <td className="subTitle_width20">Name</td>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <input
                                                className="mdl-textfield__input"
                                                type="text"
                                                id="walletName"
                                                onChange={(data) => {
                                                    this.handleName(data)
                                                }}
                                            />
                                        </div>
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td className="subTitle_width20">New Password</td>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <input
                                                className="mdl-textfield__input"
                                                type="password"
                                                id="walletPwd"
                                                onChange={(data) => {
                                                    this.handlePassword(data)
                                                }}
                                            />
                                        </div>
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td className="subTitle_width20">Confirm Password</td>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <input
                                                className="mdl-textfield__input"
                                                type="password"
                                                id="walletConfirmPwd"
                                                onChange={(data) => {
                                                    this.handleConfirmPassword(data)
                                                }}
                                            />
                                        </div>
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td className="subTitle_width20">Password Hint</td>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <input
                                                className="mdl-textfield__input"
                                                type="text"
                                                id="walletPwdHint"
                                                onChange={(data) => {
                                                    this.handleHint(data)
                                                }}
                                            />
                                        </div>
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td className="subTitle_width20">Language of Mnemonic</td>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <select className="selectBox" value={this.state.language} onChange={(data) => { this.handleLanguage(data) }}>
                                                {this.state.languages.map((lang: string) => {
                                                    return (<option key={lang} value={lang}>{lang}</option>)
                                                })}
                                            </select>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td className="subTitle_width20">Type Your Mnemonic</td>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <input
                                                className="mdl-textfield__input mnemonicInput"
                                                type="text"
                                                id="confirmMnemonic"
                                                onChange={(data) => {
                                                    this.handleTypeMnemonic(data)
                                                }}
                                            />
                                        </div>
                                    </form>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="addAccountBtnTd">
                                    <button
                                        onClick={() => {
                                            this.cancelWallet()
                                        }}
                                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent addAccountBtn"
                                    >
                                        CANCEL
                  </button>
                                    <button
                                        onClick={() => {
                                            this.recoverWallet()
                                        }}
                                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored addAccountBtn"
                                    >
                                        RECOVER
                  </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className={`${this.state.isUnValid ? "" : "hide"}`}>
                    <div className="warningMsg">
                        Mnemonic not valid. Do you want to continue to recover wallet?
          </div>
                    <button
                        onClick={() => {
                            this.cancelWallet()
                        }}
                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent addAccountBtn"
                    >
                        CANCEL
          </button>
                    <button
                        onClick={() => {
                            this.recoverWallet()
                        }}
                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored addAccountBtn"
                    >
                        CONTINUE
          </button>
                </div>
            </div>
        )
    }
}
