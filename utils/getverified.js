const  { VerusIdInterface, primitives } = require('verusid-ts-client');
const { randomBytes } = require('crypto');
const { I_ADDR_VERSION } = require('verus-typescript-primitives/dist/constants/vdxf.js');
const axios = require('axios');
require('dotenv').config();

const VERUS_RPC_NETWORK = process.env.TESTNET == 'true' ? process.env.TESTNET_VERUS_RPC_NETWORK : process.env.TESTNET_VERUS_RPC_NETWORK 
const VERUS_RPC_SYSTEM = process.env.TESTNET == 'true' ? "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq" : "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV";
const VerusId = new VerusIdInterface(VERUS_RPC_SYSTEM, VERUS_RPC_NETWORK);

function generateChallengeID(len = 20) {
  const buf = randomBytes(len)
  const password = Buffer.from(buf)
  const iaddress = primitives.toBase58Check(password, I_ADDR_VERSION)
  return iaddress
}


const VALU_LOGIN_IADDRESS = process.env.TESTNET == 'true' ? process.env.TESTNET_VALU_LOGIN_IADDRESS : process.env.MAINNET_VALU_LOGIN_IADDRESS
const LOGIN_URL = process.env.TESTNET_LOGIN_URL
const VALU_LOGIN_WIF = process.env.TESTNET == 'true' ? process.env.TESTNET_VALU_LOGIN_WIF : process.env.MAINNET_VALU_LOGIN_WIF

// Login DEEPLINK
const getverified = async (userid) => {

  try {
    const challenge_id = generateChallengeID();

    const response = await VerusId.createLoginConsentRequest(
      VALU_LOGIN_IADDRESS,
      new primitives.LoginConsentChallenge({
        challenge_id: challenge_id,
        requested_access: [
          new primitives.RequestedPermission(primitives.IDENTITY_VIEW.vdxfid),
        ],
        redirect_uris: [ new primitives.RedirectUri(
          `${LOGIN_URL}/registerdiscorduser?id=${userid}`, 
          primitives.LOGIN_CONSENT_WEBHOOK_VDXF_KEY.vdxfid
        ),
        ],
        created_at: Number((Date.now() / 1000).toFixed(0)),
      }),
      VALU_LOGIN_WIF
    );

    console.log(response.toWalletDeeplinkUri())
    console.log(response.challenge.redirect_uris)
    return response.toWalletDeeplinkUri();
    
  } catch (e) {
    console.log(e);
  }

};

const getVerifiedTinyUrl = async (deepLinkUrl) => {

  try {
      const response = await axios.post('https://api.tinyurl.com/create', {
          url: deepLinkUrl
      }, {
          headers: {
              'Authorization': `Bearer ${process.env.TINYURLTOKEN}`
          }
      });

      // Send the response from the TinyURL service back to the user
      return response.data.data.tiny_url;
  } catch (error) {
      console.error(error);
      throw new Error('Error creating TinyURL');
  }
};


exports.getverified = getverified;
exports.getVerifiedTinyUrl = getVerifiedTinyUrl;
