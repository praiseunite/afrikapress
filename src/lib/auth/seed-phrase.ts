import * as bip39lib from "bip39"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js"
import { err, ok, type Result } from "@/lib/types/result"

export function keyToSeedWords(
  key: Uint8Array
): Result<string[], "invalid_key_length"> {
  if (key.length !== 32) return err("invalid_key_length")
  const mnemonic = bip39lib.entropyToMnemonic(Buffer.from(key))
  return ok(mnemonic.split(" "))
}

export function seedWordsToKey(
  words: string[]
): Result<Uint8Array, "invalid_mnemonic"> {
  const mnemonic = words.join(" ").trim()
  if (!bip39lib.validateMnemonic(mnemonic)) return err("invalid_mnemonic")
  return ok(hexToBytes(bip39lib.mnemonicToEntropy(mnemonic)))
}
