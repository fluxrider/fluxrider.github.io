#!/usr/bin/python
# ./ip_enc.py $(echo -n "password" | hmac256 --binary "app_name" | base64) "$(curl ifconfig.me)"

import sys
import nacl.secret
import base64

# convert base64 encoded key and text message to binary
key = base64.b64decode(sys.argv[1])
message = sys.argv[2].encode('utf-8')

# encrypt
encrypted = nacl.secret.SecretBox(key).encrypt(message)

# print base64 result
print("Key: " + base64.urlsafe_b64encode(key).decode("utf-8"))
print("Secret: " + base64.urlsafe_b64encode(encrypted).decode("utf-8"))

#decrypted = nacl.secret.SecretBox(key).decrypt(encrypted)
#print(decrypted.decode("utf-8"))
