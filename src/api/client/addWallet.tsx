import * as QRCode from "qrcode.react"
import * as React from "react"
import { Redirect } from "react-router"
import { IBlock, IHyconWallet, IRest } from "./rest"

export class AddWallet extends React.Component<any, any> {
    public mounted: boolean = false
    public errMsg1: string = "필수값을 입력하세요"
    public errMsg2: string = "비밀번호가 일치하지 않습니다"
    public errMsg3: string = "단어를 확인해주세요"
    public errMsg4: string = "유효하지 않은 파일명입니다"
    constructor(props: any) {
        super(props)
        this.state = {
            isLanguageView: true,
            isMnemonicTypeView: false,
            isMnemonicView: false,
            language: "",
            languages: ["English", "French", "Spanish", "Italian", "Chinese - Simplified", "Chinese - Traditional", "Japanese", "Korean"],
            mnemonic: "",
            redirect: false,
            rest: props.rest,
        }
    }
    public componentWillMount() {
        this.props.rest.setIsHyconWallet(true)
        this.props.rest.setLoading(true)
    }

    public componentDidMount() {
        this.props.rest.setLoading(false)

    }
    public componentWillUnmount() {
        this.state.rest.setIsHyconWallet(false)
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
        if (
            this.state.name === undefined ||
            this.state.password === undefined ||
            this.state.hint === undefined
        ) {
            alert(this.errMsg1)
        } else if (!/^[a-zA-Z0-9\uAC00-\uD7A3]+$/.test(this.state.name)) {
            alert(this.errMsg4)
        } else {
            if (this.state.password !== this.state.confirmPassword) {
                alert(this.errMsg2)
            } else {
                this.setState({ isMnemonicView: true })
            }
        }
    }
    public encodingString(mnemonic: string): string {
        const wordList = mnemonic.split(" ")
        let strCode
        let returnStr = ""
        for (let j = 0; j < wordList.length; j++) {
            for (let i = 0; i < wordList[j].length; i++) {
                strCode = wordList[j].charCodeAt(i)
                let consonant
                let vowel
                let finalConsonant
                let tmp = strCode - 0xAC00
                finalConsonant = tmp % 28
                tmp = (tmp - finalConsonant) / 28
                vowel = tmp % 21
                consonant = (tmp - vowel) / 21
                consonant += 0x1100
                vowel += 0x1161
                returnStr += String.fromCharCode(consonant) + String.fromCharCode(vowel)
                if (finalConsonant > 0) {
                    finalConsonant += 0x11A7
                    returnStr += String.fromCharCode(finalConsonant)
                }
            }
            if (j !== wordList.length - 1) {
                returnStr += " "
            }
        }
        return returnStr
    }
    public checkConfirmMnemonic() {
        let mnemonicString = ""
        let coinfirmMnemonicString = ""
        if (this.state.mnemonic.charCodeAt(0) >= 0xAC00 && this.state.mnemonic.charCodeAt(0) <= 0xD7A3) {
            mnemonicString = this.encodingString(this.state.mnemonic)
        } else {
            mnemonicString = this.state.mnemonic
        }
        if (this.state.confirmMnemonic.charCodeAt(0) >= 0xAC00 && this.state.confirmMnemonic.charCodeAt(0) <= 0xD7A3) {
            coinfirmMnemonicString = this.encodingString(this.state.confirmMnemonic)
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
    public createWallet() {
        let mnemonicString = this.state.mnemonic
        if (mnemonicString.charCodeAt(0) >= 0xAC00 && mnemonicString.charCodeAt(0) <= 0xD7A3) {
            mnemonicString = this.encodingString(mnemonicString)
        }
        let typedMnemonicString = this.state.typedMnemonic
        if (typedMnemonicString.charCodeAt(0) >= 0xAC00 && typedMnemonicString.charCodeAt(0) <= 0xD7A3) {
            typedMnemonicString = this.encodingString(typedMnemonicString)
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
    public cancelWallet() {
        this.setState({ redirect: true })
    }
    public languageSelected() {
        this.state.rest.setLoading(true)
        let opt = this.state.selectedOption
        if (opt === "Chinese - Traditional") {
            opt = "chinese_traditional"
        } else if (opt === "Chinese - Simplified") {
            opt = "chinese_simplified"
        }
        this.state.rest.getMnemonic(opt).then((data: string) => {
            this.state.rest.setLoading(false)
            this.setState({ isLanguageView: false, mnemonic: data, language: this.state.selectedOption })
        })
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
