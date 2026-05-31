import * as bip39lib from "bip39"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"
import { err, ok, type Result } from "@/lib/types/result"

/** Converts a 32-byte private key to a human-readable 12-word mnemonic */
export function keyToSeedWords(
  key: Uint8Array
): Result<string[], "invalid_key_length"> {
  if (key.length !== 32) return err("invalid_key_length")
  const mnemonic = bip39lib.entropyToMnemonic(Buffer.from(key))
  return ok(mnemonic.split(" "))
}

/** Recovers a 32-byte key from a 12-word mnemonic */
export function seedWordsToKey(
  words: string[]
): Result<Uint8Array, "invalid_mnemonic"> {
  const mnemonic = words.join(" ").trim()
  if (!bip39lib.validateMnemonic(mnemonic)) return err("invalid_mnemonic")
  const entropy = bip39lib.mnemonicToEntropy(mnemonic)
  return ok(hexToBytes(entropy))
}
