import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import './index.css';

import Web3 from 'web3';
import {render} from 'react-dom'
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from 'constants';
let blockdiceAddress = '0xA18255066Df0ce8bef4E94C4A6bb79d40fCe104a';
let blockdiceABI = [ { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function", "signature": "0x8da5cb5b" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor", "signature": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenge1", "type": "uint8" }, { "indexed": false, "name": "challenge2", "type": "uint8" }, { "indexed": false, "name": "rotate", "type": "uint256" } ], "name": "BET", "type": "event", "signature": "0x962ed598110d672085c6e947f639274cc98adeb685a3f8a4a452f86ff3fa1828" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenge1", "type": "uint8" }, { "indexed": false, "name": "challenge2", "type": "uint8" }, { "indexed": false, "name": "rotate", "type": "uint256" }, { "indexed": false, "name": "dice1", "type": "uint8" }, { "indexed": false, "name": "dice2", "type": "uint8" } ], "name": "WIN", "type": "event", "signature": "0x4fabaa316796ee2772553b31099cc32e0f4de4f7ea708f3ea8175f3f7b2b5ece" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenge1", "type": "uint8" }, { "indexed": false, "name": "challenge2", "type": "uint8" }, { "indexed": false, "name": "rotate", "type": "uint256" }, { "indexed": false, "name": "dice1", "type": "uint8" }, { "indexed": false, "name": "dice2", "type": "uint8" } ], "name": "FAIL", "type": "event", "signature": "0x3db5ef04dbc2e33679055d07a3a5f84c2fd6497e2e2081313a49578c8dd4a57a" }, { "constant": true, "inputs": [], "name": "getPot", "outputs": [ { "name": "pot", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function", "signature": "0x403c9fa8" }, { "constant": true, "inputs": [], "name": "getRotate", "outputs": [ { "name": "rotate", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function", "signature": "0xad62d4a6" }, { "constant": false, "inputs": [ { "name": "challenge1", "type": "uint8" }, { "name": "challenge2", "type": "uint8" }, { "name": "rotate", "type": "uint256" } ], "name": "bet", "outputs": [ { "name": "result", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function", "signature": "0x18ab30e6" }, { "constant": false, "inputs": [ { "name": "dice1", "type": "uint8" }, { "name": "dice2", "type": "uint8" }, { "name": "rotate", "type": "uint256" } ], "name": "distribute", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function", "signature": "0xc593017f" }, { "constant": true, "inputs": [ { "name": "challenge1", "type": "uint8" }, { "name": "challenge2", "type": "uint8" }, { "name": "dice1", "type": "uint8" }, { "name": "dice2", "type": "uint8" } ], "name": "isMatch", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "pure", "type": "function", "signature": "0xb713c298" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getBetInfo", "outputs": [ { "name": "bettor", "type": "address" }, { "name": "challenge1", "type": "uint8" }, { "name": "challenge2", "type": "uint8" }, { "name": "rotate", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function", "signature": "0x79141f80" } ];

class App extends React.Component { 

  constructor(props){
    super(props);
    this.tick = this.tick.bind(this)

    this.state = {
      seconds : props.seconds,
      betRecords: [],
      winRecords: [],
      failRecords: [],
      pot : '0',
      challenge1: '1',
      challenge2: '2',
      rotate: 1,
      dice1: 0,
      dice2: 0,
      finalRecords: [{
        bettor:'0xabcd...',
        index:'0',
        challenge1: '1',
        challenge2: '2',
        dice1: 0,
        dice2: 0,
        rotate: 1,
        pot:'0'
      }]
    }
  }

 async componentDidMount() {
  await this.initWeb3();  
  //await this.pollData();
  setInterval(this.pollData, 3000);
 }

 pollData = async () => {
  await this.getPot();
  await this.getRotate();
  await this.getBetEvents();
  await this.getWinEvents();
  await this.getFailEvents();
  this.makeFinalRecords();

}
 initWeb3 = async () => {
  if (window.ethereum) {
    this.web3 = new Web3(window.ethereum);
     try {
         // Request account access if needed
         await window.ethereum.enable();
         // Acccounts now exposed
         //this.web3.eth.sendTransaction({/* ... */});
     } catch (error) {
         // User denied account access...
         console.log(`User denied account access: ${error}`)
     }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    console.log(`legacy mode`)
      this.web3 = new Web3(Web3.currentProvider);
      // Acccounts always exposed
      //web3.eth.sendTransaction({/* ... */});
  }
  // Non-dapp browsers...
  else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }

  let accounts = await this.web3.eth.getAccounts();
  this.account = accounts[0];
  
  this.blockdiceContract = new this.web3.eth.Contract(blockdiceABI, blockdiceAddress);

 }

 getPot = async () => {
  console.log(`getPot`)
   let gpot = await this.blockdiceContract.methods.getPot().call();
   gpot = this.web3.utils.fromWei(gpot,"ether");
   this.setState({pot:gpot});
   console.log(gpot);
 }

 getRotate = async () => {
  console.log(`getRotate`)
   let gRotate = await this.blockdiceContract.methods.getRotate().call();
   this.setState({rotate:gRotate});
   console.log(gRotate);
 }

 makeFinalRecords = () => {
  console.log(`makeFinalRecords`)
  let f=0 , w=0;
  const records = [...this.state.betRecords];
  console.log(this.state);
  for(let i=0; i<this.state.betRecords.length; i+=1){
    if(this.state.winRecords.length > 0 && this.state.betRecords[i].index === this.state.winRecords[w].index){
      console.log(`WIN`)
      records[i].win = 'WIN'
      records[i].dice1 = this.state.winRecords[w].dice1;
      records[i].dice2 = this.state.winRecords[w].dice2;
      records[i].rotate = this.state.winRecords[w].rotate;
      records[i].pot = this.web3.utils.fromWei(this.state.winRecords[w].amount, 'ether');
      if(this.state.winRecords.length - 1 > w ) w++;

    } else if(this.state.failRecords.length > 0 && this.state.betRecords[i].index === this.state.failRecords[f].index){
      console.log(`FAIL`)
      records[i].win = 'FAIL'
      records[i].dice1 = this.state.failRecords[f].dice1;
      records[i].dice2 = this.state.failRecords[f].dice2;
      records[i].rotate = this.state.failRecords[f].rotate;
      records[i].pot = 0 ;
      if(this.state.failRecords.length - 1 > f ) f++;

    } 
  }
  this.setState({finalRecords:records})
}

getBetEvents = async () => {
  console.log(`getBetEvents`)
  const records = [];
  let events = await this.blockdiceContract.getPastEvents('BET', {fromBlock:0, toBlock:'latest'});
  console.log("events.length : " + events.length)
  for(let i=0; i<events.length;i+=1){
    const record = {}
    record.index = parseInt(events[i].returnValues.index, 10).toString();
    record.bettor = events[i].returnValues.bettor.slice(0,4) + '...' + events[i].returnValues.bettor.slice(40,42);    
    record.challenge1 = events[i].returnValues.challenge1;
    record.challenge2 = events[i].returnValues.challenge2;
    record.dice1 =this.state.dice1;
    record.dice2 =this.state.dice2;
    record.rotate = events[i].returnValues.rotate;
    records.unshift(record);
  }
   this.setState({betRecords:records})
}

getFailEvents = async () =>{
  console.log(`getFailEvents`)
  const records = [];
  let events = await this.blockdiceContract.getPastEvents('FAIL', {fromBlock:0, toBlock:'latest'});
  console.log(events)
  console.log("events.length : " + events.length)
  for(let i=0; i<events.length;i+=1){
    const record = {}
    record.index = parseInt(events[i].returnValues.index, 10).toString();
    record.dice1 = events[i].returnValues.dice1;
    record.dice2 = events[i].returnValues.dice2;
    record.rotate = events[i].returnValues.rotate;
    records.unshift(record);
  }
  console.log(records);
   this.setState({failRecords:records})
}

getWinEvents = async () =>{
  console.log(`getWinEvents`)
  const records = [];
  let events = await this.blockdiceContract.getPastEvents('WIN', {fromBlock:0, toBlock:'latest'});
  console.log(events)
  console.log("events.length : " + events.length)
  for(let i=0; i<events.length;i+=1){
    const record = {}
    record.index = parseInt(events[i].returnValues.index, 10).toString();
    record.amount = parseInt(events[i].returnValues.amount, 10).toString();
    record.dice1 = events[i].returnValues.dice1;
    record.dice2 = events[i].returnValues.dice2;
    record.rotate = events[i].returnValues.rotate;
    records.unshift(record);
  }
   this.setState({winRecords:records})
}

 bet = async () => {
   let challenge1 = this.state.challenge1;
   let challenge2 = this.state.challenge2;
   let rotate = this.state.rotate;
   let nonce = await this.web3.eth.getTransactionCount(this.account);
   this.blockdiceContract.methods.bet(challenge1, challenge2, rotate).send({from:this.account, value:10000000000000000, gas:300000, nonce:nonce})
   .then(receipt => console.log(receipt));
    
 }

 // History table
  onClickCard_1 = (_Character) => {
    this.setState({
      challenge1 : [_Character]
    })
  }

  onClickCard_2 = (_Character) => {
    this.setState({
      challenge2 : [_Character]
    })
  }

  getCard_1 = (_Character, _cardStyle) => {
    let _card = '';
    if(_Character === '1'){
      _card = '⚀'
    }
    if(_Character === '2'){
      _card = '⚁'
    }
    if(_Character === '3'){
      _card = '⚂'
    }
    if(_Character === '4'){
      _card = '⚃'
    }
    if(_Character === '5'){
      _card = '⚄'
    }
    if(_Character === '6'){
      _card = '⚅'
    }

    return(
      <button className={_cardStyle} onClick = {() => {this.onClickCard_1(_Character)}}>
        <div className="card-body text-center">          
          <p className="card-text " style={{fontSize:100, width : 100, height:100, marginTop:-30}}>{_card}</p>        
        </div>
      </button>
    )   
  }

  getCard_2 = (_Character, _cardStyle) => {
    let _card = '';
    if(_Character === '1'){
      _card = '⚀'
    }
    if(_Character === '2'){
      _card = '⚁'
    }
    if(_Character === '3'){
      _card = '⚂'
    }
    if(_Character === '4'){
      _card = '⚃'
    }
    if(_Character === '5'){
      _card = '⚄'
    }
    if(_Character === '6'){
      _card = '⚅'
    }

    return(
      <button className={_cardStyle} onClick = {() => {this.onClickCard_2(_Character)}}>
        <div className="card-body text-center">          
          <p className="card-text" style={{fontSize:100, width : 100, height:100, marginTop:-30}}>{_card}</p>        
        </div>
      </button>
    )   
  }


  start = async () =>  {   
    //this.state.rotate++;
    //console.log(this.state.rotate);
    this.timer = setInterval(this.tick, 1000);
  }
  
  stop = async () => {   
     clearInterval(this.timer);
  }

  reset = async () => {
        this.setState({seconds : 30})
  }

  tick = async () => {
    if (this.state.seconds > 0) {
      this.setState({seconds: this.state.seconds - 1})
    } else {
      clearInterval(this.timer);
      
      console.log("@@@@@@@@@@@@@@@@@@@@@@@");
      //window.location.reload();
      this.throwDice();

    }
  }

  distribute = async () => {
   
    let nonce = await this.web3.eth.getTransactionCount(this.account);
    let dis = await this.blockdiceContract.methods.distribute(3, 4 , this.state.rotate).send({from:this.account, value:10000000000000000, gas:300000, nonce:nonce});
    //let dis = await this.blockdiceContract.methods.distribute(this.state.dice1, this.state.dice2 , this.state.rotate).send({from:this.account, value:10000000000000000, gas:300000, nonce:nonce});
    console.log(dis);
    //await this.pollData();
  }

  fRandom = async (s , e) => {
        return 1 + Math.floor(Math.random() * 6);
  }

  throwDice = async () => {   
    let num1 =  await this.fRandom(1,6);
    let num2 =  await this.fRandom(1,6);

    this.setState({
      dice1 : 3,
      dice2 : 4
    })

    /*this.setState({
      dice1 : num1,
      dice2 : num2
    })*/
    
    //this.getDice_1(num1,'card bg-dark');   
    //this.getDice_2(num2,'card bg-dark');   
    this.getDice_1(3,'card bg-dark');   
    this.getDice_2(4,'card bg-dark');  

    this.distribute();
    
    

  }

  getDice_1 = (_Character, _cardStyle) => {
    //console.log("dice1 :" + _Character);
    let _card = '?';
    if(_Character === 1){
      _card = '⚀'
    }
    if(_Character === 2){
      _card = '⚁'
    }
    if(_Character === 3){
      _card = '⚂'
    }
    if(_Character === 4){
      _card = '⚃'
    }
    if(_Character === 5){
      _card = '⚄'
    }
    if(_Character === 6){
      _card = '⚅'
    }
    return(  
      <button className={_cardStyle} >
          <div className="card-body text-center"  style={{width:125}} >          
            <p className="card-text " style={{fontSize:100,color:"#ffffff",height:100, marginTop:-35}}>{_card}</p>        
          </div>
      </button>
    )   
  }

  getDice_2 = (_Character, _cardStyle) => {
    //console.log("dice2 :" +_Character);
    let _card = '?';
    if(_Character === 1){
      _card = '⚀'
    }
    if(_Character === 2){
      _card = '⚁'
    }
    if(_Character === 3){
      _card = '⚂'
    }
    if(_Character === 4){
      _card = '⚃'
    }
    if(_Character === 5){
      _card = '⚄'
    }
    if(_Character === 6){
      _card = '⚅'
    }

    return(
      <button className={_cardStyle} >
        <div className="card-body text-center" style={{width:125}}>          
          <p className="card-text" style={{fontSize:100, color:"#ffffff",height:100, marginTop:-35}}>{_card}</p>        
        </div>
      </button>
    )   
  }
 
  

 render() {
   const REDStyle={
     color: '#ff0000'
   }
   const BlueStyle={
    color: '#0054FF'
  }
   const titleStyle={
     fontSize : 80,
     marginTop :-30
   }
  
  return (
    <div className="App">
        {/* Header - Pot, Betting characters */}
        <div className="container">
          <div className="jumbotron">
            <h1 style={titleStyle}>Block Dice</h1><br></br>
            <h2 style={REDStyle}> {this.state.rotate} 회차  누적 금액: {this.state.pot} ETH</h2> 
            <h2 style={BlueStyle}> 배팅 시간 : {this.state.seconds} 초</h2>
            <br></br>

            <h4>선택한 주사위1  &nbsp; 선택한 주사위2  </h4>
            <h2 style={REDStyle}> {this.state.challenge1} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {this.state.challenge2}</h2>
            
            <br></br>
            <button className="btn btn-warning btn-lg" onClick={this.start}> 시작 </button> &nbsp;
            <button className="btn btn-primary btn-lg" onClick={this.stop}> 정지 </button> &nbsp;
            <button className="btn btn-danger btn-lg" onClick={this.reset}> 초기화 </button>           
          </div>
        </div>

        {/* Card section*/}
        <div className="container" style={{width:300,textAlign:"center"}}>
          <h2>주사위 결과</h2>
          <div className="card-group" style={{textAlign:"center"}}>
            {this.getDice_1(this.state.dice1,'card bg-dark')}
            {this.getDice_2(this.state.dice2,'card bg-dark')}
          </div>
        </div>
        <br></br><br></br>

        {/* Card section*/}
        <div className="container" style={{width:1000, textAlign:"center"}}>
          <h2>주사위1</h2>
          <div className="card-group" style={{textAlign:"center"}}>
            {this.getCard_1('1','card bg-primary')}
            {this.getCard_1('2','card bg-warning')}
            {this.getCard_1('3','card bg-danger')}
            {this.getCard_1('4','card bg-success')}
            {this.getCard_1('5','card bg-info')}
            {this.getCard_1('6','card bg-secondary')}
          </div>
        </div>
        <br></br><br></br>
        {/* Card section*/}
        <div className="container" style={{width:1000, textAlign:"center"}}>
        <h2>주사위2</h2>
          <div className="card-group" style={{textAlign:"center"}}>
            {this.getCard_2('1','card bg-primary')}
            {this.getCard_2('2','card bg-warning')}
            {this.getCard_2('3','card bg-danger')}
            {this.getCard_2('4','card bg-success')}
            {this.getCard_2('5','card bg-info')}
            {this.getCard_2('6','card bg-secondary')}
          </div>
        </div>
      

      <br></br>

      <div className="container">
        <button className="btn btn-danger btn-lg" onClick={this.bet}> 배팅! </button>
      </div>

      <br></br>
      <div className="container">
        <table className="table table-dark table-striped">
          <thead style={{fontFamily:"Segoe UI"}}>
            <tr>
              <th>회차</th>
              <th>순번</th>
              <th>계좌</th>
              <th>선택한 주사위1</th>
              <th>선택한 주사위2</th>
              <th>주사위 결과1</th>
              <th>주사위 결과2</th>
              <th>획득 금액</th>
              <th>게임 결과</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.finalRecords.map((record, index) => {
                return(
                  <tr key={index}>
                    <td>{record.rotate}</td>
                    <td>{record.index}</td>
                    <td>{record.bettor}</td>
                    <td>{record.challenge1}</td>
                    <td>{record.challenge2}</td>
                    <td>{record.dice1}</td>
                    <td>{record.dice2}</td>
                    <td>{record.pot}</td>
                    <td>{record.win}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );

 }
  
}

render(<App seconds={30} />, document.getElementById("root"));

export default App;
