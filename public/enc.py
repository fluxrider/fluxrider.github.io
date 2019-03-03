#!/usr/bin/python

# WARNING:
# The whole message and encrypted message are stored in memory.
# This is poor in case of large files.
# At this time, libsodium has stream support, but not for public key cryptography.
# An ad-hoc solution would have to be developed if needs be.

# WARNING:
# The filename is not encrypted.
# The script works best with data preprosesed (e.g. tar),
# instead of being called in batch.

# INSTALL:
# pip install pynacl
# arch linux package: python-pynacl

# POST PROCESSING:
# Windows:
# certutil -encode data.txt tmp.b64 && findstr /v /c:- tmp.b64 > data.b64
# certutil -decode data.b64 data.txt
# Linux:
# base64 data.txt > data.b64
# base64 -d data.b64 > data.txt
# maxOS:
# base64 -i data.txt -o data.b64
# base64 -D -i data.b64 -o data.txt

import sys
from nacl.public import PublicKey, SealedBox

# hardcoded public key
public = PublicKey( \
  b'\xbc\x51\xcb\x58\xb7\xe1\xee\x09' + \
  b'\xc6\xbd\x87\x4f\xde\xfa\x39\x9d' + \
  b'\xaa\x19\xdd\x55\xbd\xfd\xbc\xb9' + \
  b'\x7b\xc0\x22\x0c\x89\xac\x38\x45')

# message
filename = sys.argv[1]
with open(filename, mode='rb') as file:
  message = file.read()

# encrypt
encrypted = SealedBox(public).encrypt(message)

# save encrypted message
with open('out.enc','wb') as f:
  f.write(encrypted)
