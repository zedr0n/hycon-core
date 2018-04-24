import * as bip39 from 'bip39'
import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import { PrivateKey } from '../common/privateKey'
import { PublicKey } from '../common/publicKey'
import { Address } from '../common/address'
import { Tx, SignedTx, GenesisTx, GenesisSignedTx } from '../common/tx'
import { getLogger } from 'log4js'
const logger = getLogger('Wallet')
const HDKey  = require('hdkey')
const secp256k1 = require('secp256k1')
const blake2b = require('blake2b')

const CHINESE_SIMPLIFIED_WORDLIST = require(`${process.cwd()}/mnemonic/chinese_simplified.json`)
const CHINESE_TRADITIONAL_WORDLIST = require(`${process.cwd()}/mnemonic/chinese_traditional.json`)
const ENGLISH_WORDLIST = require(`${process.cwd()}/mnemonic/english.json`)
const FRENCH_WORDLIST = require(`${process.cwd()}/mnemonic/french.json`)
const ITALIAN_WORDLIST = require(`${process.cwd()}/mnemonic/italian.json`)
const JAPANESE_WORDLIST = require(`${process.cwd()}/mnemonic/japanese.json`)
const KOREAN_WORDLIST = require(`${process.cwd()}/mnemonic/korean.json`)
const SPANISH_WORDLIST = require(`${process.cwd()}/mnemonic/spanish.json`)

const coinNumber: number = 1397;

export class Wallet {
    readonly privateKey: PrivateKey
    readonly publicKey: PublicKey

    constructor (privKey: (Buffer | PrivateKey), pubKey?: Buffer) {
        this.privateKey = privKey instanceof Buffer ? new PrivateKey(privKey) : privKey
        this.publicKey = (pubKey == undefined) ? this.privateKey.publicKey() : new PublicKey(pubKey)
    }

    public static generateKeyWithMnemonic (mnemonic: string, language?: string, password?: string, index: number = 0): Wallet {
        language = (language == undefined) ? 'english' : language
        if (!bip39.validateMnemonic(mnemonic, Wallet.getWordList(language))) {
            logger.error('invalid mnemonic or language when generating key')
            throw new Error('mnemonic or language is invalid/mismatched')
        }

        let seed: Buffer = bip39.mnemonicToSeed(mnemonic, password)
        let masterKey = HDKey.parseMasterSeed(seed)
        let derived = masterKey.derive(`m/44'/${coinNumber}'/0'/0`)
        if (!derived.extendedPrivateKey || !masterKey.extendedPrivateKey) {
            logger.error('Extended PrivateKey does not have privateKey')
            throw new Error('Extended PrivateKey does not have privateKey')
        }

        let child = HDKey.parseExtendedKey(derived.extendedPrivateKey)
        let wallet = child.derive(`${index}`)
        if (!wallet.privateKey) {
            logger.error('No private key to save wallet')
            throw new Error('No private key to save wallet')
        }

        if (!secp256k1.privateKeyVerify(wallet.privateKey)) {
            logger.error('Could not verify private key with mnemonic')
            throw new Error('Could not verify private key with mnemonic')
        }

        if (!Wallet.checkPublicKey(wallet.publicKey, wallet.privateKey)) {
            logger.error('Public key generated from master key is not equal to private key')
            throw new Error('Public key generated from master key is not equal to private key')
        }

        return new Wallet(wallet.privateKey, wallet.publicKey)
    }
    public static randomWallet(): Wallet {
        let privateKey = new PrivateKey()
        return new Wallet(privateKey)
    }

    public static generateKey(language: string = 'english'): [ Wallet, string ] {
        let mnemonic = bip39.generateMnemonic(128, undefined, Wallet.getWordList(language))
        return [Wallet.generateKeyWithMnemonic(mnemonic, 'english'), mnemonic]
    }

    public static getRandomMnemonic(language?: string): string {
        if (language == undefined) {
            language = 'english'
        }
        return 
    }

    public static generate(wallet?: { name: string, password: string, mnemonic: string, language: string, hint: string }): Wallet {
        if (wallet && wallet.mnemonic) {
            let language = (wallet.language) ? wallet.language : 'english'
            return Wallet.generateKeyWithMnemonic(wallet.mnemonic, language.toLowerCase(), wallet.password)
        } else {
            return Wallet.generateKey()[0]
        }
    }

    public static checkPublicKey(privateKey: Buffer, publicKey: Buffer): boolean {
        let secpPublicKey = secp256k1.publicKeyCreate(privateKey)
        if (publicKey.length !== secpPublicKey.length) {
            return false
        } else {
            for (let i = 0; i < publicKey.length; i++) {
                if (publicKey[i] !== secpPublicKey[i]) {
                    return false
                }
            }
        }
        return true
    }
    public static getWordList(language: string): string[] {
        let returnWordList
        switch (language) {
            case 'english':
                returnWordList = ENGLISH_WORDLIST
                break;
            case 'korean':
                returnWordList = KOREAN_WORDLIST
                break;
            case 'chinese':
                throw new Error("Did you mean chinese_simplified or chinese_traditional?")
            case 'chinese_simplified':
                returnWordList = CHINESE_SIMPLIFIED_WORDLIST
                break;
            case 'chinese_traditional':
                returnWordList = CHINESE_TRADITIONAL_WORDLIST
                break;
            case 'french':
                returnWordList = FRENCH_WORDLIST
                break;
            case 'italian':
                returnWordList = ITALIAN_WORDLIST
                break;
            case 'japanese':
                returnWordList = JAPANESE_WORDLIST
                break;
            case 'spanish':
                returnWordList = SPANISH_WORDLIST
                break;
            default:
                returnWordList = ENGLISH_WORDLIST
                break;
        }
        return returnWordList
    }

    public static encryptAES(password: string, data: string): string {
        let iv = crypto.randomBytes(16)
        let key = Buffer.from(blake2b(32).update(password).digest())
        let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        let dataBuffer = Buffer.from(data)
        let encryptedData1 = cipher.update(dataBuffer)
        let encryptedData2 = cipher.final()
        let encryptedData = Buffer.concat([encryptedData1, encryptedData2])
        let encrtypedDataWithIV = iv.toString('hex') + ':' + encryptedData.toString('hex')
        return encrtypedDataWithIV
    }

    public static decryptAES(password: string, rawBufferData: Buffer): string {
        let rawData = rawBufferData.toString()
        let stringArray = rawData.split(':')
        let iv = new Buffer(stringArray[0], 'hex')
        let encryptedData = new Buffer(stringArray[1], 'hex')
        let key = blake2b(32).update(password).digest()
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let originalData1 = decipher.update(encryptedData)
        let originalData2 = decipher.final()
        let originalData = Buffer.concat([originalData1, originalData2])
        return originalData.toString()
    }

    public static async getAllPublicAddr(): Promise<{ name: string, address: string }[]> {
        let walletArray: { name: string, address: string }[] = []
        try {
            await fs.ensureFile('./wallet/public')
            let fileData = await fs.readFile('./wallet/public')
            let walletList = fileData.toString().split(',')
            for (let i = 0; i < walletList.length; i++) {
                let wallet = walletList[i].split(':')
                if (wallet.length >= 2) {
                    walletArray.push({ name: wallet[0], address: wallet[1] })
                }
            }
            return Promise.resolve(walletArray)
        } catch (e) {
            logger.error(`Failed to get public list of wallets: ${e}`)
            return Promise.reject(e)
        }
    }

    public static async getAddress(name: string): Promise<string> {
        try {
            let walletList = await Wallet.getAllPublicAddr()
            for (let wallet of walletList) {
                if (wallet.name == name) {
                    return wallet.address
                }
            }
            return Promise.reject("Could not find this wallet's address")
        } catch (e) {
            logger.error('Failed to get AddressList')
            return Promise.reject('Failed to get list of addresses')
        }
    }

    public send(to: Address, amount: number, nonce: number, fee?: number): SignedTx {
        const from = this.publicKey.address()
        const tx = new Tx({ from, to, amount, fee, nonce })
        const stx = this.privateKey.sign(tx)
        if (!(stx instanceof SignedTx)) {
            logger.error('sign() did not return a signed transaction')
            throw new Error('sign() method did not return a signed transaction')
        }
        return stx
    }
}