import { getLogger } from "log4js"
import { Block } from "../common/block"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { PublicKey } from "../common/publicKey"
import { GenesisSignedTx } from "../common/txGenesisSigned"
import { SignedTx } from "../common/txSigned"
import { MinerServer } from "../miner/minerServer"
import { Hash } from "../util/hash"
import { Database } from "./database/database"
import { IStateTransition, WorldState } from "./database/worldState"
import { Difficulty } from "./difficulty"
import { DifficultyAdjuster } from "./difficultyAdjuster"

const logger = getLogger("Verify")
export class Verify {
    public static async blockHeader(header: BlockHeader): Promise<boolean> {
        const preHash = header.preHash()
        return MinerServer.checkNonce(preHash, header.nonce, Difficulty.decode(header.difficulty))
    }
    public static async block(givenBlock: Block, previousHeader: AnyBlockHeader, worldState: WorldState, database: Database): Promise<{ isVerified: boolean, stateTransition?: IStateTransition }> {
        const isValidHeader = await Verify.blockHeader(givenBlock.header)
        if (!isValidHeader) {
            logger.warn(`Invalid header`)
            return { isVerified: false }
        }

        const verifyResult = await Verify.preBlock(givenBlock, previousHeader, worldState, database)
        if (!verifyResult.isVerified) {
            return { isVerified: false }
        }

        return verifyResult
    }
    public static async preBlock(block: Block, previousHeader: AnyBlockHeader, worldState: WorldState, database: Database): Promise<{ isVerified: boolean, stateTransition?: IStateTransition }> {
        const txVerify = block.txs.every((tx) => Verify.tx(tx))
        if (!txVerify) { return { isVerified: false } }

        const merkleRoot = block.calculateMerkleRoot()
        const merkleRootVerify = merkleRoot.equals(block.header.merkleRoot)
        if (!merkleRootVerify) {
            logger.warn(`Invalid merkleRoot expected ${block.header.merkleRoot}, got ${merkleRoot}`)
            return { isVerified: false }
        }
        const { stateTransition, validTxs, invalidTxs } = await worldState.next(block.txs, previousHeader.stateRoot, block.miner)
        if (!stateTransition.currentStateRoot.equals(block.header.stateRoot)) {
            logger.warn(`State root(${stateTransition.currentStateRoot.toString()}) is incorrect, expected: ${block.header.stateRoot.toString()}, previous: ${previousHeader.stateRoot.toString()}`)
            return { isVerified: false }
        }
        if (invalidTxs.length > 0) {
            logger.warn(`Block contains invalid Txs`)
            return { isVerified: false }
        }

        if (validTxs.length !== block.txs.length) {
            logger.warn(`Not all txs were valid`)
            return { isVerified: false }
        }

        const prevHash = new Hash(previousHeader)
        const prevDBBlock = await database.getDBBlock(prevHash)

        const prevTimeEMA = prevDBBlock.timeEMA
        const prevWorkEMA = prevDBBlock.workEMA

        const blockDifficulty = Difficulty.decode(block.header.difficulty)
        const timeDelta = block.header.timeStamp - previousHeader.timeStamp
        const workDelta = Difficulty.decode(previousHeader.difficulty)

        if (!(DifficultyAdjuster.verifyDifficulty(timeDelta, prevTimeEMA, workDelta, prevWorkEMA, blockDifficulty))) {
            logger.warn(`Invalid block difficulty`)
            return { isVerified: false }
        }

        logger.debug(`Verified stateRoot: ${block.header.stateRoot}, Block: ${block.header.merkleRoot.toString()}`)

        return { isVerified: true, stateTransition }
    }

    public static tx(givenTx: SignedTx | GenesisSignedTx): boolean {
        try {
            const pubKey = new PublicKey(givenTx)
            if (!pubKey.verify(givenTx)) { return false }
            return true
        } catch (e) { return false }
    }
}
