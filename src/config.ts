// config.ts
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Commitment } from '@solana/web3.js';

export enum KeystoreType {
    Local = "local",
    Ledger = "ledger",
    Turnkey = "turnkey"
}

class coreConfig {
    rpcUrl: string;
    commitment: Commitment;
    keystoreType: KeystoreType;

    constructor(isNew: boolean = false) {
        this.rpcUrl = process.env.RPC_URL;
        this.commitment = (process.env.COMMITMENT as Commitment);
        this.keystoreType = (process.env.KEYSTORE_TYPE as KeystoreType);

        if (isNew) {
            fs.rmSync(this.getConfigPath(), { recursive: false, force: true });
        }
            
        this.read();
    }

    private getConfigPath() {
        const homeDir = os.homedir();
        return path.join(homeDir, '.config', 'hellowallet', 'config.json');
    }

    private read() {
        const configPath = this.getConfigPath();
        
        if (fs.existsSync(configPath)) {
            const rawConfig = fs.readFileSync(configPath, 'utf-8');
            const fileConfig = JSON.parse(rawConfig);
            Object.assign(this, fileConfig);
        }
    }

    write() {
        const configPath = this.getConfigPath()
        const configDir = path.dirname(configPath);

        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, {recursive: true});
        }

        fs.writeFileSync(configPath, JSON.stringify(this, null, 2));
    }
}

const config = new coreConfig(true);
export default config;
