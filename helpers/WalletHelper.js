import {PostRequest} from "./ExternalRequest";

class WalletHelper{

    constructor(){
        this.blockCypherBaseUrl = 'https://api.blockcypher.com/';
    }

    //create a wallet api
    async createAddress(){

        let addressInfomation = await PostRequest(
            `${this.blockCypherBaseUrl}v1/bcy/test/addrs`
        );
        return addressInfomation;

    }

}

module.exports = WalletHelper;