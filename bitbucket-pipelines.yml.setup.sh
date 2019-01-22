#!/bin/bash

echo "const configLocal = {api: { lock: '' }, https: { port: 40443 }, debug: false, mongo: { host: '', port: ''} }; module.exports = configLocal;" > config/config.local.js