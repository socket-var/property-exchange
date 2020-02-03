let catchRevert = require("./exceptionsHelpers.js").catchRevert;
var PropertyExchange = artifacts.require("./PropertyExchange.sol");

contract("PropertyExchange", function(accounts) {
  const owner = accounts[0];
  const escrow = accounts[1];
  const buyer = accounts[2];
  const seller = accounts[3];

  const propertyValue = 3;

  beforeEach(async () => {
    instance = await PropertyExchange.new();
  });

  it("should register as escrow", async () => {
    await instance.register(true, { from: escrow });

    const escrowRegistered = await instance.escrows(escrow, { from: escrow });

    assert.equal(escrowRegistered, true, "escrow register failed");
  });

  it("should not mark as registered for an non-registered user", async () => {
    const userRegistered = await instance.users(buyer, { from: buyer });

    assert.equal(
      userRegistered,
      false,
      "user is not registered but the contract says registered"
    );
  });

  it("should be able to add a property", async () => {
    await instance.register(false, { from: seller });

    const propertyAdded = await instance.addNewProperty(
      "123456",
      propertyValue,
      { from: seller }
    );

    const returnedProperty = await instance.pxCoins(0, { from: seller });

    assert.equal(
      returnedProperty.propertyId.toString(),
      "123456",
      "failed to add the property"
    );
  });

  it("should log an event when escrow is added by the buyer", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: buyer });

    const result = await instance.addEscrow(escrow, { from: buyer });

    const expectedEventResult = { _buyer: buyer, _escrow: escrow };

    const logBuyer = result.logs[0].args._buyer;
    const logEscrow = result.logs[0].args._escrow;

    assert.equal(
      expectedEventResult._buyer,
      logBuyer,
      "LogEscrowAdded event buyer property not emitted, check addEscrow method"
    );

    assert.equal(
      expectedEventResult._escrow,
      logEscrow,
      "LogEscrowAdded event escrow property not emitted, check addEscrow method"
    );
  });

  it("should log an event when the buyer or the seller signs the agreement", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: seller });
    await instance.register(false, { from: buyer });

    await instance.addNewProperty("123456", propertyValue, { from: seller });

    await instance.addEscrow(escrow, { from: buyer });

    const result = await instance.signAgreement(escrow, buyer, 0, {
      from: buyer
    });

    const expectedEventResult = { _user: buyer, _coinId: 0, _owner: seller };

    const logSigner = result.logs[0].args._user;
    const logOwner = result.logs[0].args._owner;
    const logCoin = result.logs[0].args._coinId;

    assert.equal(
      expectedEventResult._user,
      logSigner,
      "LogAgreementSigned event _user property not emitted, check signAgreement() method"
    );

    assert.equal(
      expectedEventResult._owner,
      logOwner,
      "LogAgreementSigned event _owner property not emitted, check signAgreement() method"
    );

    assert.equal(
      expectedEventResult._coinId,
      logCoin.toNumber(),
      "LogAgreementSigned event _coinId property not emitted, check signAgreement() method"
    );
  });

  it("should be able to make payment to the escrow", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: seller });
    await instance.register(false, { from: buyer });
    await instance.addNewProperty("123456", propertyValue, { from: seller });
    await instance.addEscrow(escrow, { from: buyer });
    await instance.signAgreement(escrow, buyer, 0, {
      from: buyer
    });
    await instance.signAgreement(escrow, buyer, 0, {
      from: seller
    });

    const prevEscrowBalance = parseInt(
      web3.utils.fromWei(await web3.eth.getBalance(escrow), "ether")
    );

    await instance.transferEth(escrow, {
      from: buyer,
      value: web3.utils.toWei("5", "ether")
    });

    const currEscrowBalance = parseInt(
      web3.utils.fromWei(await web3.eth.getBalance(escrow), "ether")
    );

    assert.equal(
      currEscrowBalance - prevEscrowBalance,
      3,
      "Buyer's balance has been wrongfully deducted"
    );
  });

  it("should be able to transfer property from the seller to the buyer", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: seller });
    await instance.register(false, { from: buyer });
    await instance.addNewProperty("123456", propertyValue, { from: seller });
    await instance.addEscrow(escrow, { from: buyer });
    await instance.signAgreement(escrow, buyer, 0, {
      from: buyer
    });
    await instance.signAgreement(escrow, buyer, 0, {
      from: seller
    });

    await instance.transferEth(escrow, {
      from: buyer,
      value: web3.utils.toWei("3", "ether")
    });

    const prevSellerBalance = parseInt(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    await instance.transferProperty(seller, buyer, 0, {
      from: escrow,
      value: web3.utils.toWei("5", "ether")
    });

    const currSellerBalance = parseInt(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    assert.equal(
      currSellerBalance > prevSellerBalance,
      true,
      "Escrow's balance has been wrongfully deducted"
    );
  });

  it("should add an escrow before signing the agreement", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: seller });
    await instance.register(false, { from: buyer });

    await instance.addNewProperty("123456", propertyValue, { from: seller });

    await catchRevert(
      instance.signAgreement(escrow, buyer, 0, {
        from: buyer
      })
    );
  });

  it("escrow should have access to the property's coin once seller signs the agreement", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: seller });
    await instance.register(false, { from: buyer });

    await instance.addNewProperty("123456", propertyValue, { from: seller });

    await instance.addEscrow(escrow, { from: buyer });

    await instance.signAgreement(escrow, buyer, 0, {
      from: buyer
    });

    const result = await instance.signAgreement(escrow, buyer, 0, {
      from: seller
    });

    const expectedEventResult = { owner: seller, approved: escrow, tokenId: 0 };

    const logOwner = result.logs[0].args.owner;
    const logEscrow = result.logs[0].args.approved;
    const logCoin = result.logs[0].args.tokenId;

    assert.equal(
      expectedEventResult.owner,
      logOwner,
      "Approval event owner property not emitted, check signAgreement() method"
    );

    assert.equal(
      expectedEventResult.approved,
      logEscrow,
      "Approval event to property not emitted, check signAgreement() method"
    );

    assert.equal(
      expectedEventResult.tokenId,
      logCoin,
      "Approval event tokenId property not emitted, check signAgreement() method"
    );
  });

  // should transfer money only after signed
  it("should transfer money only after both parties signed the agreement", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: seller });
    await instance.register(false, { from: buyer });
    await instance.addNewProperty("123456", propertyValue, { from: seller });
    await instance.addEscrow(escrow, { from: buyer });

    await catchRevert(
      instance.transferProperty(seller, buyer, 0, {
        from: escrow,
        value: web3.utils.toWei("5", "ether")
      })
    );
  });

  it("should refund excess amount", async () => {
    await instance.register(true, { from: escrow });
    await instance.register(false, { from: seller });
    await instance.register(false, { from: buyer });
    await instance.addNewProperty("123456", propertyValue, { from: seller });
    await instance.addEscrow(escrow, { from: buyer });
    await instance.signAgreement(escrow, buyer, 0, {
      from: buyer
    });
    await instance.signAgreement(escrow, buyer, 0, {
      from: seller
    });

    const prevEscrowBalance = parseInt(
      web3.utils.fromWei(await web3.eth.getBalance(escrow), "ether")
    );

    await instance.transferEth(escrow, {
      from: buyer,
      value: web3.utils.toWei("5", "ether")
    });

    const currEscrowBalance = parseInt(
      web3.utils.fromWei(await web3.eth.getBalance(escrow), "ether")
    );

    assert.equal(
      currEscrowBalance - prevEscrowBalance,
      3,
      "Excess amount hasn't been refunded"
    );
  });

  it("should only transfer property once buyer completely pays what is owed", async () => {
    await instance.register(true, { from: escrow });

    await instance.register(false, { from: seller });

    await instance.register(false, { from: buyer });

    await instance.addNewProperty("123456", propertyValue, { from: seller });

    await instance.addEscrow(escrow, { from: buyer });

    await instance.signAgreement(escrow, buyer, 0, {
      from: buyer
    });

    await instance.signAgreement(escrow, buyer, 0, {
      from: seller
    });

    await catchRevert(
      instance.transferProperty(seller, buyer, 0, {
        from: escrow,
        value: web3.utils.toWei("5", "ether")
      })
    );
  });
});
