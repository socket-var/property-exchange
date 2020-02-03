Integer Overflow / Underflow:

SafeMath library from OpenZeppelin is used to avoid integer overflow and underflow and eliminates any possibility of an arithmetic based attack using a statement as simple as:

```
using SafeMath for uint;
```

Circuit Breaker / Emergency stop:

- Openzeppelin provides a Pausable contract that has modifiers like whenPaused and whenNotPaused and functions like addPauser so that the pauser (typically an admin) can pause the contract's execution during an emergency / upgrade.

- The constructor of the contract PropertyExchange.sol (the project's entry point) has the following snippet to add the contract owner as the pauser and has a whenNotPaused modifier on all the functions in the contract.

```javascript
  constructor() public payable {
    owner = address(uint160(address(this)));

    // owner of the contract can pause the execution of the contract during emergency
    addPauser(owner);
  }
```

### Reentrancy:

Check-Effect-Interaction pattern is used to avoid reentrancy bugs. transfer() function is used and call() function is avoided so that we can avoid having an external untrusted entity performing a complex operation.

### DOS attack prevention:

The contracts make smart usage of mappings and structs to avoid using arrays and loops which might yield infinite gas and run forever. Mappings are used for O(1) lookup and they eliminate the need for looping through records for finding a particular item.
