pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/lifecycle/Pausable.sol";

import "./PxCoinFactory.sol";



/**

    @dev    This is the entry point for the property exchange application. This has functions           to do the following operations:

            A user can register and unregister as a customer or an escrow
            An agreement on sale of a property is signed by both the buyer and the seller
            Payment is transferred from the buyer to the escrow once the agreement is signed
            Escrow transfers ownership from the seller to the buyer once the agreement is signed and all the payment due is transferred

 */

contract PropertyExchange is PxCoinFactory, Pausable{

    using SafeMath for uint;

    struct User {
        // to make sure that the user is not registered during signup
        bool isRegistered;
    }

    struct Escrow {
        bool isRegistered;
        mapping(address => Agreement) agreements;
    }

    struct Agreement {
        uint owed;
        uint paid;
        address buyer;
        address seller;
        bool signedBySeller;
        bool signedByBuyer;
    }

    mapping(address => User) public users;
    mapping(address => Escrow) public escrows;
    address payable public owner;

    constructor() public payable {
        owner = address(uint160(address(this)));

        // owner of the contract can pause the execution of the contract during emergency
        addPauser(owner);
    }

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered || escrows[msg.sender].isRegistered, "Only registered users can call this");
        _;
    }

    modifier onlyUser() {
        require(users[msg.sender].isRegistered == true, "Only user can call this");
        _;
    }


    modifier onlyEscrow() {
        require(escrows[msg.sender].isRegistered == true, "Only escrow can call this");
        _;
    }

    modifier onlyOwner(uint _coinId) {
        require(ownerOf(_coinId) == msg.sender,
        "Only owner of the given coin can call this"
        );
        _;
    }

    modifier isOwedToEscrow(address payable _to) {
        require(escrows[_to].isRegistered == true, "Only allowed to transfer to escrow");
        require(escrows[_to].agreements[msg.sender].owed > 0, "You do not owe the escrow anything");
        _;
    }

    modifier requireSignedByBothParties(address _escrow, address _buyer) {
        Agreement memory _agreement = escrows[_escrow].agreements[_buyer];
        require(_agreement.signedByBuyer && _agreement.signedBySeller, "Not signed by both parties");
        _;
    }

    modifier requireEscrowBuyerRelationship(address _escrow, address _buyer) {
        require(escrows[_escrow].agreements[_buyer].buyer == _buyer, "No escrow relationship exists");
        _;
    }


    event LogUserRegistered(address indexed _user, bool _isEscrow);
    event LogUserUnregistered(address indexed _user, bool _isEscrow);
    event LogPropertyAdded(uint indexed _propertyId, uint _coinId, uint _value);
    event LogAgreementSigned(address indexed _user, uint _coinId, address _owner);
    event LogTransferToEscrow(address indexed _from, address _escrow, uint _amount);
    event LogPropertyTransfer(address indexed _from, address _to, uint _coinId);
    event LogEscrowAdded(address indexed _buyer, address _escrow);


    /**
        @dev    registers msg.sender with the contract for users of type Escrow or Customer
        @param  _isEscrow true for escrow, false for other users
     */
    function register(bool _isEscrow) public whenNotPaused {

        if (_isEscrow) {
            require(users[msg.sender].isRegistered == false, "already registered as user, cannot be an escrow");
            require(escrows[msg.sender].isRegistered == false, "already registered as escrow");
            escrows[msg.sender].isRegistered = true;
        }

        else {
            require(escrows[msg.sender].isRegistered == false, "already registered as escrow, cannot be a user");
            require(users[msg.sender].isRegistered == false, "already registered user");
            users[msg.sender].isRegistered = true;
        }

        emit LogUserRegistered(msg.sender, _isEscrow);

    }

    /**
        @dev    unregisters msg.sender from the contract
                requires:       only a registered user can call this
        @param  _isEscrow true for escrow, false for customers

     */
    function unregister(bool _isEscrow) public whenNotPaused onlyRegistered  {
        if(_isEscrow) {
            delete escrows[msg.sender];
        } else {
            delete users[msg.sender];
        }

        emit LogUserUnregistered(msg.sender, _isEscrow);

    }


     /**

        @dev    adds new property to the blockchain by generating a unique ERC721 PxCoin token
                requires   -    only a registered user can call this
        @param  _propertyId     unique id of the property
        @param  _value          price of the property


     */
    function addNewProperty(uint _propertyId, uint _value) public payable whenNotPaused onlyUser  {
        uint _coinId = mint(_propertyId, _value);

        emit LogPropertyAdded(_propertyId, _coinId, _value);

    }

    /**

        @dev    a buyer can add an escrow by calling this function
        @param  _escrow     ethereum address of the escrow
     */
    function addEscrow(address _escrow) public payable whenNotPaused onlyUser  {
        require(escrows[_escrow].agreements[msg.sender].buyer == address(0), "buyer escrow relationship already exists");

        escrows[_escrow].agreements[msg.sender].buyer = msg.sender;

        emit LogEscrowAdded(msg.sender, _escrow);
    }



    /**

        @dev    when a buyer signs the agreement they owe money to the escrow
        @dev    when a seller signs the agreement they approve the escrow to sell the house(coin) on their behalf

                requires -  buyer and seller should be registered
                         -  given escrow should be registered

        @param  _escrow     escrow account
        @param  _coinId     ERC721 coin associated with the property



     */

    function signAgreement(address payable _escrow, address _buyer, uint _coinId) public
    whenNotPaused
    onlyUser
    requireEscrowBuyerRelationship(_escrow, _buyer)

    {

        address _ownerId = ownerOf(_coinId);

        escrows[_escrow].agreements[_buyer].owed = getPropertyValue(_coinId);
        escrows[_escrow].agreements[_buyer].seller = _ownerId;

        if (_ownerId == msg.sender) {
            approve(_escrow, _coinId);
            escrows[_escrow].agreements[_buyer].signedBySeller = true;
        } else {
            require(msg.sender == _buyer, "Buyer address doesn't match the caller");
            escrows[_escrow].agreements[_buyer].signedByBuyer = true;
        }

        emit LogAgreementSigned(msg.sender, _coinId, _ownerId);
    }

    /**
        @dev    if msg.value is greater than required amount to be paid it is refunded to the msg.sender
        @param  target - total due to be paid
        @param  given - current amount the msg.sender supplied

     */
    function _refundExcess(uint target, uint given) public payable whenNotPaused returns (uint) {

        if (given > target) {
            msg.sender.transfer(given-target);
            return target;
        }

        return given;
    }


    /**

        @dev        buyer transfers eth to escrow as a payment for the property
                    can make partial or full payments

                    requires   requireSignedByBothParties - agreement should be signed by both            parties
                               isOwedToEscrow - requires that the buyer owes money to the escrow before  transferring ether

        @param      _to     escrow account address


     */
    function transferEth(address payable _to) public payable
    whenNotPaused
    onlyUser
    requireEscrowBuyerRelationship(_to, msg.sender)
    requireSignedByBothParties(_to, msg.sender)
    isOwedToEscrow(_to)
    {


        uint _owed = escrows[_to].agreements[msg.sender].owed;

        uint _paid = escrows[_to].agreements[msg.sender].paid;

        uint _balance = _owed - _paid;

        uint _amountToBePaid = _refundExcess(_balance, msg.value);

        _to.transfer(_amountToBePaid);

        escrows[_to].agreements[msg.sender].paid += _amountToBePaid;

        emit LogTransferToEscrow(msg.sender, _to, _amountToBePaid);
    }

    /**

        @dev        transfer property from buyer to seller
        @dev        check if the property's value in ether has been paid, if equal, transfer property from seller to buyer
        requires   - only the escrow can call this
                    - agreement should be signed by both parties
                    - the calling escrow should be authorized to transfer this property
                    - all the payment needed should be cleared before transferring the property
     */

    function transferProperty(address payable _from, address payable _to, uint _coinId) public payable
    whenNotPaused
    onlyEscrow
    requireEscrowBuyerRelationship(msg.sender, _to)
    requireSignedByBothParties(msg.sender, _to)
     {

        require(escrows[msg.sender].agreements[_to].owed <= escrows[msg.sender].agreements[_to].paid, "Insufficient balance to buy the property");
        require(escrows[msg.sender].agreements[_to].owed <= msg.value, "msg.value should be >= property's sale price");


        uint _owed = escrows[msg.sender].agreements[_to].owed;

        // refund excess amount provided as msg.value
        uint _amountToBePaid = _refundExcess(_owed*1 ether, msg.value);

        // transfer the money from escrow to seller
        _from.transfer(_amountToBePaid);

        // transfer the ownership of the coin
        transferFrom(address(_from), address(_to), _coinId);

        escrows[msg.sender].agreements[_to].owed = 0 ether;
        escrows[msg.sender].agreements[_to].paid = 0 ether;
        escrows[msg.sender].agreements[_to].seller = address(0x0);

        emit LogPropertyTransfer(_from, _to, _coinId);
    }



}