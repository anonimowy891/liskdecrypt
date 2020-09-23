
const {
    transactions: { BaseTransaction, utils },
        BigNum,
      } = require('lisk-sdk');

  class Decrypt extends BaseTransaction {
    static get TYPE() {
      return 1050;
    }
  
    static get FEE() {
      return utils.convertLSKToBeddows("1");
    }
  
    async prepare(store) {
      await store.account.cache([
        {
          address: this.senderId
        },
        {
          address: this.asset.recipientId
        },
      ]);
    }
  
    validateAsset() {
      const errors = [];
    
      return errors;
    }
  
    applyAsset(store) {
      const errors = [];

      const recipient = store.account.get(this.asset.recipientId)
      const sender = store.account.get(this.senderId)

      const NewBalanceRecipient = new BigNum(recipient.balance).add(
            new BigNum(this.asset.amount)
            );

      const NewBalanceSender = new BigNum(sender.balance).sub(
            new BigNum(this.asset.amount)
            );
           
        const updatedSender = {
                ...sender,
                balance: NewBalanceSender.toString(),
            };
            store.account.set(sender.address, updatedSender);

        const updatedRecipient = {
                ...recipient,
                balance: NewBalanceRecipient.toString(),
            };
            store.account.set(recipient.address, updatedRecipient);

    
      return errors;
    }
  
    undoAsset(store) {
    }
  }
  module.exports = Decrypt;
  