import * as QRCode from "qrcode.react"
import * as React from "react"
import { Redirect } from "react-router"
import { IBlock, IHyconWallet, IRest } from "./rest"
import { encodingMnemonic } from "./stringUtil"

export class AddWallet extends React.Component<any, any> {
    public mounted: boolean = false
    public errMsg1: string = "Please enter required value"
    public errMsg2: string = "Not matched password"
    public errMsg3: string = "Check your mnemonic words"
    public errMsg4: string = "Invalid wallet name: the wallet name must be in English, Korean and numbers only"
    public errMsg5: string = "Please enter your mnemonic"
    public errMsg6: string = "Duplicate wallet name"
    public errMsg7: string = "Please select Language"
    public pattern1 = /^[a-zA-Z0-9\uAC00-\uD7A3]+$/
    constructor(props: any) {
        super(props)
        this.state = {
            isLanguageView: true,
            isMnemonicTypeView: false,
            isMnemonicView: false,
            language: "",
            languages: ["English", "Chinese - Simplified", "Chinese - Traditional", "Korean"],
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
    public handleConfirmMnemonic(data: any) {
        this.setState({ confirmMnemonic: data.target.value })
    }
    public handleTypeMnemonic(data: any) {
        this.setState({ typedMnemonic: data.target.value })
    }

    public receiveMnemonic() {
        if (this.state.name === undefined || this.state.password === undefined || this.state.hint === undefined) {
            alert(this.errMsg1)
        } else if (this.state.name.search(/\s/) !== -1 || !this.pattern1.test(this.state.name)) {
            alert(this.errMsg4)
        } else {
            if (this.state.password !== this.state.confirmPassword) {
                alert(this.errMsg2)
            } else {
                this.state.rest.checkDupleName(this.state.name).then((result: boolean) => {
                    if (result) {
                        alert(this.errMsg6)
                    } else {
                        this.setState({ isMnemonicView: true })
                    }
                })
            }
        }
    }
    public checkConfirmMnemonic() {
        if (this.state.confirmMnemonic === "" || this.state.confirmMnemonic === undefined) {
            alert(this.errMsg5)
        } else {
            let mnemonicString = ""
            let coinfirmMnemonicString = ""
            if (this.state.mnemonic.charCodeAt(0) >= 0xAC00 && this.state.mnemonic.charCodeAt(0) <= 0xD7A3) {
                mnemonicString = encodingMnemonic(this.state.mnemonic)
            } else {
                mnemonicString = this.state.mnemonic
            }
            if (this.state.confirmMnemonic.charCodeAt(0) >= 0xAC00 && this.state.confirmMnemonic.charCodeAt(0) <= 0xD7A3) {
                coinfirmMnemonicString = encodingMnemonic(this.state.confirmMnemonic)
            } else {
                coinfirmMnemonicString = this.state.confirmMnemonic
            }
            if (this.state.mnemonic === coinfirmMnemonicString) {
                this.setState({ isMnemonicView: false, isMnemonicTypeView: true })
            } else if (this.state.confirmMnemonic === "pass") {
                this.setState({ isMnemonicView: false, isMnemonicTypeView: true })
            } else {
                alert(this.errMsg3)
            }
        }
    }
    public createWallet() {
        if (this.state.typedMnemonic === "" || this.state.typedMnemonic === undefined) {
            alert(this.errMsg5)
        } else {
            let mnemonicString = this.state.mnemonic
            if (mnemonicString.charCodeAt(0) >= 0xAC00 && mnemonicString.charCodeAt(0) <= 0xD7A3) {
                mnemonicString = encodingMnemonic(mnemonicString)
            }
            let typedMnemonicString = this.state.typedMnemonic
            if (typedMnemonicString.charCodeAt(0) >= 0xAC00 && typedMnemonicString.charCodeAt(0) <= 0xD7A3) {
                typedMnemonicString = encodingMnemonic(typedMnemonicString)
            }
            if (mnemonicString === typedMnemonicString || typedMnemonicString === "pass") {
                this.state.rest.generateWallet({
                    hint: this.state.hint,
                    language: this.state.language,
                    mnemonic: this.state.mnemonic,
                    name: this.state.name,
                    password: this.state.password,
                }).then((data: string) => {
                    this.setState({ walletViewRedirect: true, address: data })
                })
            } else {
                alert(this.errMsg3)
            }
        }
    }
    public cancelWallet() {
        this.setState({ redirect: true })
    }
    public languageSelected() {
        if (this.state.selectedOption === "" || this.state.selectedOption === undefined) {
            alert(this.errMsg7)
        } else {
            this.state.rest.setLoading(true)
            let opt = this.state.selectedOption
            if (opt === "Chinese - Traditional") {
                opt = "chinese_traditional"
            } else if (opt === "Chinese - Simplified") {
                opt = "chinese_simplified"
            }
            this.state.rest.getMnemonic(opt).then((data: string) => {
                this.state.rest.setLoading(false)
                this.setState({ isLanguageView: false, mnemonic: data, language: opt })
            })
        }
    }
    public handleOptionChange(option: any) {
        this.setState({ selectedOption: option.target.value })
    }
    public render() {
        if (this.state.redirect) {
            return <Redirect to="/wallet" />
        }
        if (this.state.walletViewRedirect) {
            return <Redirect to={`/wallet/${this.state.name}`} />
        }
        return (
            <div>
                <div className={`${this.state.isLanguageView ? "" : "hide"}`}>
                    <div className="contentTitle">Select Language</div>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <form>
                                        {this.state.languages.map((lang: string) => {
                                            return (
                                                <div key={lang}>
                                                    <input type="radio" name="language" value={lang}
                                                        onChange={(option) => { this.handleOptionChange(option) }} />
                                                    <label>{lang}</label>
                                                </div>
                                            )
                                        })}
                                    </form>
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={2} className="addAccountBtnTd">
                                    <button onClick={() => { this.cancelWallet() }} className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent addAccountBtn" >
                                        CANCEL</button>
                                    <button onClick={() => { this.languageSelected() }} className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored addAccountBtn" >
                                        NEXT</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className={`${this.state.isLanguageView || this.state.isMnemonicView || this.state.isMnemonicTypeView ? "hide" : ""}`}>
                    <div className="contentTitle">Add Account</div>
                    <table>
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>
                                    <form action="#" id="nameForm" ref="nameForm">
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
                                <td>Password</td>
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
                                <td>Confirm Password</td>
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
                                <td>Password Hint</td>
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
                                            this.receiveMnemonic()
                                        }}
                                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored addAccountBtn"
                                    >
                                        NEXT
                  </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div
                    className={`${
                        this.state.isMnemonicView && !this.state.isMnemonicTypeView ? "" : "hide"
                        }`}
                >
                    <div className="contentTitle">Random Mnemonic</div>
                    <table className="mnemonicTable">
                        <tbody>
                            <tr>
                                <td>{this.state.mnemonic}</td>
                            </tr>
                            <tr>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <input className="mdl-textfield__input mnemonicInput" type="text"
                                                id="confirmMnemonic1"
                                                onChange={(data) => { this.handleConfirmMnemonic(data) }}
                                                onPaste={(e) => { e.preventDefault() }} />
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
                                            this.checkConfirmMnemonic()
                                        }}
                                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored addAccountBtn"
                                    >
                                        NEXT
                  </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div
                    className={`${
                        !this.state.isMnemonicView && this.state.isMnemonicTypeView ? "" : "hide"
                        }`}
                >
                    <div className="contentTitle">Type mnemonic words again</div>
                    <table className="mnemonicTable">
                        <tbody>
                            <tr>
                                <td>
                                    <form action="#">
                                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                                            <input
                                                className="mdl-textfield__input mnemonicInput"
                                                type="text"
                                                id="confirmMnemonic2"
                                                onChange={(data) => {
                                                    this.handleTypeMnemonic(data)
                                                }}
                                                onPaste={(e) => {
                                                    e.preventDefault()
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
                                            this.createWallet()
                                        }}
                                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored addAccountBtn"
                                    >
                                        NEXT
                  </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
