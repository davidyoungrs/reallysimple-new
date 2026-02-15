#!/bin/bash
set -e

# Define variables matching the pass.json config
PASS_TYPE_ID="pass.com.reallysimpleapps.card"
TEAM_ID="A1B2C3D4E5"
COMMON_NAME="Pass Generator"

# Create a config file for OpenSSL to include the O and OU fields
cat > openssl.cnf <<EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = $PASS_TYPE_ID
OU = $TEAM_ID
O = Really Simple Apps
C = US

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
EOF

# Generate private key
openssl genrsa -out certs/signerKey.pem 2048

# Generate self-signed certificate with the specific config
openssl req -new -x509 -nodes -sha256 -days 365 \
  -key certs/signerKey.pem \
  -out certs/signerCert.pem \
  -config openssl.cnf

# Clean up config
rm openssl.cnf

echo "Generated new self-signed certificates with:"
echo "  CN (PassTypeID): $PASS_TYPE_ID"
echo "  OU (TeamID):     $TEAM_ID"
