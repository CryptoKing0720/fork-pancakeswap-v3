// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "../src/StdCheats.sol";
import "../src/Test.sol";
import "../src/StdJson.sol";

contract StdCheatsTest is Test {
    Bar test;

    using stdJson for string;

    function setUp() public {
        test = new Bar();
    }

    function testSkip() public {
        vm.warp(100);
        skip(25);
        assertEq(block.timestamp, 125);
    }

    function testRewind() public {
        vm.warp(100);
        rewind(25);
        assertEq(block.timestamp, 75);
    }

    function testHoax() public {
        hoax(address(1337));
        test.bar{value: 100}(address(1337));
    }

    function testHoaxOrigin() public {
        hoax(address(1337), address(1337));
        test.origin{value: 100}(address(1337));
    }

    function testHoaxDifferentAddresses() public {
        hoax(address(1337), address(7331));
        test.origin{value: 100}(address(1337), address(7331));
    }

    function testStartHoax() public {
        startHoax(address(1337));
        test.bar{value: 100}(address(1337));
        test.bar{value: 100}(address(1337));
        vm.stopPrank();
        test.bar(address(this));
    }

    function testStartHoaxOrigin() public {
        startHoax(address(1337), address(1337));
        test.origin{value: 100}(address(1337));
        test.origin{value: 100}(address(1337));
        vm.stopPrank();
        test.bar(address(this));
    }

    function testChangePrankMsgSender() public {
        vm.startPrank(address(1337));
        test.bar(address(1337));
        changePrank(address(0xdead));
        test.bar(address(0xdead));
        changePrank(address(1337));
        test.bar(address(1337));
        vm.stopPrank();
    }

    function testChangePrankMsgSenderAndTxOrigin() public {
        vm.startPrank(address(1337), address(1338));
        test.origin(address(1337), address(1338));
        changePrank(address(0xdead), address(0xbeef));
        test.origin(address(0xdead), address(0xbeef));
        changePrank(address(1337), address(1338));
        test.origin(address(1337), address(1338));
        vm.stopPrank();
    }

    function testMakeAccountEquivalence() public {
        Account memory account = makeAccount("1337");
        (address addr, uint256 key) = makeAddrAndKey("1337");
        assertEq(account.addr, addr);
        assertEq(account.key, key);
    }

    function testMakeAddrEquivalence() public {
        (address addr,) = makeAddrAndKey("1337");
        assertEq(makeAddr("1337"), addr);
    }

    function testMakeAddrSigning() public {
        (address addr, uint256 key) = makeAddrAndKey("1337");
        bytes32 hash = keccak256("some_message");

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, hash);
        assertEq(ecrecover(hash, v, r, s), addr);
    }

    function testDeal() public {
        deal(address(this), 1 ether);
        assertEq(address(this).balance, 1 ether);
    }

    function testDealToken() public {
        Bar barToken = new Bar();
        address bar = address(barToken);
        deal(bar, address(this), 10000e18);
        assertEq(barToken.balanceOf(address(this)), 10000e18);
    }

    function testDealTokenAdjustTotalSupply() public {
        Bar barToken = new Bar();
        address bar = address(barToken);
        deal(bar, address(this), 10000e18, true);
        assertEq(barToken.balanceOf(address(this)), 10000e18);
        assertEq(barToken.totalSupply(), 20000e18);
        deal(bar, address(this), 0, true);
        assertEq(barToken.balanceOf(address(this)), 0);
        assertEq(barToken.totalSupply(), 10000e18);
    }

    function testDealERC1155Token() public {
        BarERC1155 barToken = new BarERC1155();
        address bar = address(barToken);
        dealERC1155(bar, address(this), 0, 10000e18, false);
        assertEq(barToken.balanceOf(address(this), 0), 10000e18);
    }

    function testDealERC1155TokenAdjustTotalSupply() public {
        BarERC1155 barToken = new BarERC1155();
        address bar = address(barToken);
        dealERC1155(bar, address(this), 0, 10000e18, true);
        assertEq(barToken.balanceOf(address(this), 0), 10000e18);
        assertEq(barToken.totalSupply(0), 20000e18);
        dealERC1155(bar, address(this), 0, 0, true);
        assertEq(barToken.balanceOf(address(this), 0), 0);
        assertEq(barToken.totalSupply(0), 10000e18);
    }

    function testDealERC721Token() public {
        BarERC721 barToken = new BarERC721();
        address bar = address(barToken);
        dealERC721(bar, address(2), 1);
        assertEq(barToken.balanceOf(address(2)), 1);
        assertEq(barToken.balanceOf(address(1)), 0);
        dealERC721(bar, address(1), 2);
        assertEq(barToken.balanceOf(address(1)), 1);
        assertEq(barToken.balanceOf(bar), 1);
    }

    function testDeployCode() public {
        address deployed = deployCode("StdCheats.t.sol:Bar", bytes(""));
        assertEq(string(getCode(deployed)), string(getCode(address(test))));
    }

    function testDestroyAccount() public {
        // deploy something to destroy it
        BarERC721 barToken = new BarERC721();
        address bar = address(barToken);
        vm.setNonce(bar, 10);
        deal(bar, 100);

        uint256 prevThisBalance = address(this).balance;
        uint256 size;
        assembly {
            size := extcodesize(bar)
        }

        assertGt(size, 0);
        assertEq(bar.balance, 100);
        assertEq(vm.getNonce(bar), 10);

        destroyAccount(bar, address(this));
        assembly {
            size := extcodesize(bar)
        }
        assertEq(address(this).balance, prevThisBalance + 100);
        assertEq(vm.getNonce(bar), 0);
        assertEq(size, 0);
        assertEq(bar.balance, 0);
    }

    function testDeployCodeNoArgs() public {
        address deployed = deployCode("StdCheats.t.sol:Bar");
        assertEq(string(getCode(deployed)), string(getCode(address(test))));
    }

    function testDeployCodeVal() public {
        address deployed = deployCode("StdCheats.t.sol:Bar", bytes(""), 1 ether);
        assertEq(string(getCode(deployed)), string(getCode(address(test))));
        assertEq(deployed.balance, 1 ether);
    }

    function testDeployCodeValNoArgs() public {
        address deployed = deployCode("StdCheats.t.sol:Bar", 1 ether);
        assertEq(string(getCode(deployed)), string(getCode(address(test))));
        assertEq(deployed.balance, 1 ether);
    }

    // We need this so we can call "this.deployCode" rather than "deployCode" directly
    function deployCodeHelper(string memory what) external {
        deployCode(what);
    }

    function testDeployCodeFail() public {
        vm.expectRevert(bytes("StdCheats deployCode(string): Deployment failed."));
        this.deployCodeHelper("StdCheats.t.sol:RevertingContract");
    }

    function getCode(address who) internal view returns (bytes memory o_code) {
        /// @solidity memory-safe-assembly
        assembly {
            // retrieve the size of the code, this needs assembly
            let size := extcodesize(who)
            // allocate output byte array - this could also be done without assembly
            // by using o_code = new bytes(size)
            o_code := mload(0x40)
            // new "memory end" including padding
            mstore(0x40, add(o_code, and(add(add(size, 0x20), 0x1f), not(0x1f))))
            // store length in memory
            mstore(o_code, size)
            // actually retrieve the code, this needs assembly
            extcodecopy(who, add(o_code, 0x20), 0, size)
        }
    }

    function testDeriveRememberKey() public {
        string memory mnemonic = "test test test test test test test test test test test junk";

        (address deployer, uint256 privateKey) = deriveRememberKey(mnemonic, 0);
        assertEq(deployer, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        assertEq(privateKey, 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80);
    }

    function testBytesToUint() public {
        assertEq(3, bytesToUint_test(hex"03"));
        assertEq(2, bytesToUint_test(hex"02"));
        assertEq(255, bytesToUint_test(hex"ff"));
        assertEq(29625, bytesToUint_test(hex"73b9"));
    }

    function testParseJsonTxDetail() public {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/test/fixtures/broadcast.log.json");
        string memory json = vm.readFile(path);
        bytes memory transactionDetails = json.parseRaw(".transactions[0].tx");
        RawTx1559Detail memory rawTxDetail = abi.decode(transactionDetails, (RawTx1559Detail));
        Tx1559Detail memory txDetail = rawToConvertedEIP1559Detail(rawTxDetail);
        assertEq(txDetail.from, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        assertEq(txDetail.to, 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
        assertEq(
            txDetail.data,
            hex"23e99187000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000013370000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004"
        );
        assertEq(txDetail.nonce, 3);
        assertEq(txDetail.txType, 2);
        assertEq(txDetail.gas, 29625);
        assertEq(txDetail.value, 0);
    }

    function testReadEIP1559Transaction() public view {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/test/fixtures/broadcast.log.json");
        uint256 index = 0;
        Tx1559 memory transaction = readTx1559(path, index);
        transaction;
    }

    function testReadEIP1559Transactions() public view {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/test/fixtures/broadcast.log.json");
        Tx1559[] memory transactions = readTx1559s(path);
        transactions;
    }

    function testReadReceipt() public {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/test/fixtures/broadcast.log.json");
        uint256 index = 5;
        Receipt memory receipt = readReceipt(path, index);
        assertEq(
            receipt.logsBloom,
            hex"00000000000800000000000000000010000000000000000000000000000180000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100"
        );
    }

    function testReadReceipts() public view {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/test/fixtures/broadcast.log.json");
        Receipt[] memory receipts = readReceipts(path);
        receipts;
    }

    function testGasMeteringModifier() public {
        uint256 gas_start_normal = gasleft();
        addInLoop();
        uint256 gas_used_normal = gas_start_normal - gasleft();

        uint256 gas_start_single = gasleft();
        addInLoopNoGas();
        uint256 gas_used_single = gas_start_single - gasleft();

        uint256 gas_start_double = gasleft();
        addInLoopNoGasNoGas();
        uint256 gas_used_double = gas_start_double - gasleft();

        emit log_named_uint("Normal gas", gas_used_normal);
        emit log_named_uint("Single modifier gas", gas_used_single);
        emit log_named_uint("Double modifier  gas", gas_used_double);
        assertTrue(gas_used_double + gas_used_single < gas_used_normal);
    }

    function addInLoop() internal pure returns (uint256) {
        uint256 b;
        for (uint256 i; i < 10000; i++) {
            b += i;
        }
        return b;
    }

    function addInLoopNoGas() internal noGasMetering returns (uint256) {
        return addInLoop();
    }

    function addInLoopNoGasNoGas() internal noGasMetering returns (uint256) {
        return addInLoopNoGas();
    }

    function bytesToUint_test(bytes memory b) private pure returns (uint256) {
        uint256 number;
        for (uint256 i = 0; i < b.length; i++) {
            number = number + uint256(uint8(b[i])) * (2 ** (8 * (b.length - (i + 1))));
        }
        return number;
    }

    function testAssumeNoPrecompiles(address addr) external {
        assumeNoPrecompiles(addr, getChain("optimism_goerli").chainId);
        assertTrue(
            addr < address(1) || (addr > address(9) && addr < address(0x4200000000000000000000000000000000000000))
                || addr > address(0x4200000000000000000000000000000000000800)
        );
    }

    function testAssumePayable() external {
        // all should revert since these addresses are not payable

        // VM address
        vm.expectRevert();
        assumePayable(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

        // Console address
        vm.expectRevert();
        assumePayable(0x000000000000000000636F6e736F6c652e6c6f67);

        // Create2Deployer
        vm.expectRevert();
        assumePayable(0x4e59b44847b379578588920cA78FbF26c0B4956C);
    }

    function testAssumePayable(address addr) external {
        assumePayable(addr);
        assertTrue(
            addr != 0x7109709ECfa91a80626fF3989D68f67F5b1DD12D && addr != 0x000000000000000000636F6e736F6c652e6c6f67
                && addr != 0x4e59b44847b379578588920cA78FbF26c0B4956C
        );
    }
}

contract StdCheatsMock is StdCheats {
    // We deploy a mock version so we can properly test expected reverts.
    function assumeNoBlacklisted_(address token, address addr) external {
        return assumeNoBlacklisted(token, addr);
    }
}

contract StdCheatsForkTest is Test {
    address internal constant SHIB = 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE;
    address internal constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address internal constant USDC_BLACKLISTED_USER = 0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD;
    address internal constant USDT = 0x51B279055E4f264BbB38AAB6FB4f62E18Cc2a234;
    address internal constant USDT_BLACKLISTED_USER = 0x8f8a8F4B54a2aAC7799d7bc81368aC27b852822A;

    // We deploy a mock version so we can properly test the revert.
    StdCheatsMock private stdCheats = new StdCheatsMock();

    function setUp() public {
        // All tests of the `assumeNoBlacklisted` method are fork tests using live contracts.
        vm.createSelectFork({urlOrAlias: "mainnet", blockNumber: 16_428_900});
    }

    function testCannotAssumeNoBlacklisted_EOA() external {
        address eoa = vm.addr({privateKey: 1});
        vm.expectRevert("StdCheats assumeNoBlacklisted(address,address): Token address is not a contract.");
        assumeNoBlacklisted(eoa, address(0));
    }

    function testAssumeNoBlacklisted_TokenWithoutBlacklist(address addr) external {
        assumeNoBlacklisted(SHIB, addr);
        assertTrue(true);
    }

    function testAssumeNoBlacklisted_USDC() external {
        vm.expectRevert();
        stdCheats.assumeNoBlacklisted_(USDC, USDC_BLACKLISTED_USER);
    }

    function testAssumeNoBlacklisted_USDC(address addr) external {
        assumeNoBlacklisted(USDC, addr);
        assertFalse(USDCLike(USDC).isBlacklisted(addr));
    }

    function testAssumeNoBlacklisted_USDT() external {
        vm.expectRevert();
        stdCheats.assumeNoBlacklisted_(USDT, USDT_BLACKLISTED_USER);
    }

    function testAssumeNoBlacklisted_USDT(address addr) external {
        assumeNoBlacklisted(USDT, addr);
        assertFalse(USDTLike(USDT).isBlackListed(addr));
    }
}

contract Bar {
    constructor() payable {
        /// `DEAL` STDCHEAT
        totalSupply = 10000e18;
        balanceOf[address(this)] = totalSupply;
    }

    /// `HOAX` and `CHANGEPRANK` STDCHEATS
    function bar(address expectedSender) public payable {
        require(msg.sender == expectedSender, "!prank");
    }

    function origin(address expectedSender) public payable {
        require(msg.sender == expectedSender, "!prank");
        require(tx.origin == expectedSender, "!prank");
    }

    function origin(address expectedSender, address expectedOrigin) public payable {
        require(msg.sender == expectedSender, "!prank");
        require(tx.origin == expectedOrigin, "!prank");
    }

    /// `DEAL` STDCHEAT
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
}

contract BarERC1155 {
    constructor() payable {
        /// `DEALERC1155` STDCHEAT
        _totalSupply[0] = 10000e18;
        _balances[0][address(this)] = _totalSupply[0];
    }

    function balanceOf(address account, uint256 id) public view virtual returns (uint256) {
        return _balances[id][account];
    }

    function totalSupply(uint256 id) public view virtual returns (uint256) {
        return _totalSupply[id];
    }

    /// `DEALERC1155` STDCHEAT
    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(uint256 => uint256) private _totalSupply;
}

contract BarERC721 {
    constructor() payable {
        /// `DEALERC721` STDCHEAT
        _owners[1] = address(1);
        _balances[address(1)] = 1;
        _owners[2] = address(this);
        _owners[3] = address(this);
        _balances[address(this)] = 2;
    }

    function balanceOf(address owner) public view virtual returns (uint256) {
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        address owner = _owners[tokenId];
        return owner;
    }

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
}

interface USDCLike {
    function isBlacklisted(address) external view returns (bool);
}

interface USDTLike {
    function isBlackListed(address) external view returns (bool);
}

contract RevertingContract {
    constructor() {
        revert();
    }
}
