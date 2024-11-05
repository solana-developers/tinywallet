"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.core = exports.KeystoreType = void 0;
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("./config");
Object.defineProperty(exports, "KeystoreType", { enumerable: true, get: function () { return config_1.KeystoreType; } });
const ledgerkeymanager_1 = require("./keymanagers/ledgerkeymanager");
const localkeymanager_1 = require("./keymanagers/localkeymanager");
const turnkeymanager_1 = require("./keymanagers/turnkeymanager");
class core {
    constructor(keymanager) {
        this.keymanager = keymanager;
        this.connection = new web3_js_1.Connection(config_1.default.rpcUrl, config_1.default.commitment);
    }
    static CreateAsync() {
        return __awaiter(this, arguments, void 0, function* (keystoreType = config_1.default.keystoreType) {
            let keymanager;
            switch (keystoreType) {
                case config_1.KeystoreType.Local:
                    keymanager = new localkeymanager_1.LocalKeyManager();
                    break;
                case config_1.KeystoreType.Ledger:
                    keymanager = yield ledgerkeymanager_1.LedgerKeyManager.createAsync();
                    break;
                case config_1.KeystoreType.Turnkey:
                    keymanager = new turnkeymanager_1.TurnKeyManager();
                    break;
                default:
                    throw new Error(`Unsupported keystore type.`);
            }
            return new core(keymanager);
        });
    }
    GetKeystoreType() {
        return config_1.default.keystoreType;
    }
    SetKeystoreType(keystoreType) {
        // Assert string is a valid enum value
        if (!Object.values(config_1.KeystoreType).includes(keystoreType)) {
            throw new Error(`Unsupported keystore type: ${keystoreType}`);
        }
        config_1.default.keystoreType = keystoreType;
        config_1.default.write();
    }
    BuildTransaction(ix, payer) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.connection;
            // create v0 compatible message
            let { blockhash } = yield connection.getLatestBlockhash();
            const messageV0 = new web3_js_1.TransactionMessage({
                payerKey: payer,
                recentBlockhash: blockhash,
                instructions: ix,
            }).compileToV0Message();
            return new web3_js_1.VersionedTransaction(messageV0);
        });
    }
    SignTransaction(txn) {
        return __awaiter(this, void 0, void 0, function* () {
            // Sign a transaction using keymanager.
            yield this.keymanager.sign(txn);
        });
    }
    SendTransaction(txn) {
        return __awaiter(this, void 0, void 0, function* () {
            // Send a transaction to the network.
            return this.connection.sendTransaction(txn);
        });
    }
}
exports.core = core;
