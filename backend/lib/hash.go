package lib

import "crypto/sha256"

func SHA256Digest(value []byte) []byte {
	digest := sha256.Sum256(value)
	return digest[:]
}
