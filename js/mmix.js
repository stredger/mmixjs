// https://code.google.com/p/closure-library/source/browse/closure/goog/math/long.js

fs = require('fs');


var registers = [];
var regLabels = {};
var specialReg = {};
var memory = [];
var labels = {};
var iptr;

var dbgopts = false;

function debug(str) {
	if (dbgopts) {
		console.log(str);		
	}
}

var trapOps = {
	'Fputs' : function() {
		debug('Fputs:');
		var data = memory[registers['$255']];
		var args = data[1].split(',');
		console.log(args[0]);
		iptr++;
	},
	'Halt' : function() {
		debug('Halt:');
		iptr = 'undefined';
	}
};


function getReg(symbol) {
	return regLabels[symbol] || symbol;
}

function getAddr(addr) {
	return labels[addr] || addr;
}

var ops = {
	// the following don't exist in knuth's book
	'LDA' : function(args) {
		// var reg = args[0];
		// var addr = args[1];
		debug('LDA: ' + args);
		registers[getReg(args[0])] = getAddr(args[1]);
		iptr++;
	},

	// The following are in knuth's book
	'2ADDU' : function(args) {console.log('2ADDU: Not Implemented');iptr++;},
	'2ADDUI' : function(args) {console.log('2ADDUI: Not Implemented');iptr++;},
	'4ADDU' : function(args) {console.log('4ADDU: Not Implemented');iptr++;},
	'4ADDUI' : function(args) {console.log('4ADDUI: Not Implemented');iptr++;},
	'8ADDU' : function(args) {console.log('8ADDU: Not Implemented');iptr++;},
	'8ADDUI' : function(args) {console.log('8ADDUI: Not Implemented');iptr++;},
	'16ADDU' : function(args) {console.log('16ADDU: Not Implemented');iptr++;},
	'16ADDUI' : function(args) {console.log('16ADDUI: Not Implemented');iptr++;},
	'ADD' : function(args) {
		// rega = regb + regc
		// var rega = args[0];
		// var regb = args[1];
		// var regc = args[2];		
		debug('ADD: ' + args);
		registers[getReg(args[0])] = registers[getReg(args[1])] + registers[getReg(args[2])];
		iptr++;
	},
	'ADDI' : function(args) {console.log('ADDI: Not Implemented');iptr++;},
	'ADDU' : function(args) {console.log('ADDU: Not Implemented');iptr++;},
	'ADDUI' : function(args) {console.log('ADDUI: Not Implemented');iptr++;},
	'AND' : function(args) {
		// rega = regb & regc
		// var rega = args[0];
		// var regb = args[1];
		// var regc = args[2];
		debug('AND - UNTESTED: ' + args);
		registers[getReg(args[0])] = registers[getReg(args[1])] & registers[getReg(args[2])];
		iptr++;
	},
	'ANDI' : function(args) {console.log('ANDI: Not Implemented');iptr++;},
	'ANDN' : function(args) {console.log('ANDN: Not Implemented');iptr++;},
	'ANDNH' : function(args) {console.log('ANDNH: Not Implemented');iptr++;},
	'ANDNI' : function(args) {console.log('ANDNI: Not Implemented');iptr++;},
	'ANDNL' : function(args) {console.log('ANDNL: Not Implemented');iptr++;},
	'ANDNMH' : function(args) {console.log('ANDNMH: Not Implemented');iptr++;},
	'ANDNML' : function(args) {console.log('ANDNML: Not Implemented');iptr++;},
	'BDIF' : function(args) {console.log('BDIF: Not Implemented');iptr++;},
	'BDIFI' : function(args) {console.log('BDIFI: Not Implemented');iptr++;},
	'BEV' : function(args) {console.log('BEV: Not Implemented');iptr++;},
	'BEVB' : function(args) {console.log('BEVB: Not Implemented');iptr++;},
	'BN' : function(args) {console.log('BN: Not Implemented');iptr++;},
	'BNB' : function(args) {console.log('BNB: Not Implemented');iptr++;},
	'BNN' : function(args) {console.log('BNN: Not Implemented');iptr++;},
	'BNNB' : function(args) {console.log('BNNB: Not Implemented');iptr++;},
	'BNP' : function(args) {console.log('BNP: Not Implemented');iptr++;},
	'BNPB' : function(args) {console.log('BNPB: Not Implemented');iptr++;},
	'BNZ' : function(args) {console.log('BNZ: Not Implemented');iptr++;},
	'BNZB' : function(args) {console.log('BNZB: Not Implemented');iptr++;},
	'BOD' : function(args) {console.log('BOD: Not Implemented');iptr++;},
	'BODB' : function(args) {console.log('BODB: Not Implemented');iptr++;},
	'BP' : function(args) {console.log('BP: Not Implemented');iptr++;},
	'BPB' : function(args) {console.log('BPB: Not Implemented');iptr++;},
	'BZ' : function(args) {console.log('BZ: Not Implemented');iptr++;},
	'BZB' : function(args) {console.log('BZB: Not Implemented');iptr++;},
	'CMP' : function(args) {console.log('CMP: Not Implemented');iptr++;},
	'CMPI' : function(args) {console.log('CMPI: Not Implemented');iptr++;},
	'CMPU' : function(args) {console.log('CMPU: Not Implemented');iptr++;},
	'CMPUI' : function(args) {console.log('CMPUI: Not Implemented');iptr++;},
	'CSEV' : function(args) {console.log('CSEV: Not Implemented');iptr++;},
	'CSEVI' : function(args) {console.log('CSEVI: Not Implemented');iptr++;},
	'CSN' : function(args) {console.log('CSN: Not Implemented');iptr++;},
	'CSNI' : function(args) {console.log('CSNI: Not Implemented');iptr++;},
	'CSNN' : function(args) {console.log('CSNN: Not Implemented');iptr++;},
	'CSNNI' : function(args) {console.log('CSNNI: Not Implemented');iptr++;},
	'CSNP' : function(args) {console.log('CSNP: Not Implemented');iptr++;},
	'CSNPI' : function(args) {console.log('CSNPI: Not Implemented');iptr++;},
	'CSNZ' : function(args) {console.log('CSNZ: Not Implemented');iptr++;},
	'CSNZI' : function(args) {console.log('CSNZI: Not Implemented');iptr++;},
	'CSOD' : function(args) {console.log('CSOD: Not Implemented');iptr++;},
	'CSODI' : function(args) {console.log('CSODI: Not Implemented');iptr++;},
	'CSP' : function(args) {console.log('CSP: Not Implemented');iptr++;},
	'CSPI' : function(args) {console.log('CSPI: Not Implemented');iptr++;},
	'CSWAP' : function(args) {console.log('CSWAP: Not Implemented');iptr++;},
	'CSWAPI' : function(args) {console.log('CSWAPI: Not Implemented');iptr++;},
	'CSZ' : function(args) {console.log('CSZ: Not Implemented');iptr++;},
	'CSZI' : function(args) {console.log('CSZI: Not Implemented');iptr++;},
	'DIV' : function(args) {console.log('DIV: Not Implemented');iptr++;},
	'DIVI' : function(args) {console.log('DIVI: Not Implemented');iptr++;},
	'DIVU' : function(args) {console.log('DIVU: Not Implemented');iptr++;},
	'DIVUI' : function(args) {console.log('DIVUI: Not Implemented');iptr++;},
	'FADD' : function(args) {
		debug('FADD: Wrapper around ADD');
		ops.ADD(args);
	},
	'FCMP' : function(args) {console.log('FCMP: Not Implemented');iptr++;},
	'FCMPE' : function(args) {console.log('FCMPE: Not Implemented');iptr++;},
	'FDIV' : function(args) {
		// rega = regb / regc
		// var rega = args[0];
		// var regb = args[1];
		// var regc = args[2];
		debug('FDIV: ' + args);
		registers[getReg(args[0])] = registers[getReg(args[1])] / registers[getReg(args[2])];
		iptr++;		
	},
	'FEQL' : function(args) {console.log('FEQL: Not Implemented');iptr++;},
	'FEQLE' : function(args) {console.log('FEQLE: Not Implemented');iptr++;},
	'FINT' : function(args) {console.log('FINT: Not Implemented');iptr++;},
	'FIX' : function(args) {console.log('FIX: Not Implemented');iptr++;},
	'FIXU' : function(args) {console.log('FIXU: Not Implemented');iptr++;},
	'FLOT' : function(args) {
		// var reg = args[0];
		// var num = args[1];
		debug('FLOT: ' + args);
		registers[getReg(args[0])] = Number(args[1]);
		iptr++;
	},
	'FLOTI' : function(args) {console.log('FLOTI: Not Implemented');iptr++;},
	'FLOTU' : function(args) {console.log('FLOTU: Not Implemented');iptr++;},
	'FLOTUI' : function(args) {console.log('FLOTUI: Not Implemented');iptr++;},
	'FMUL' : function(args) {
		// rega = regb / regc
		// var rega = args[0];
		// var regb = args[1];
		// var regc = args[2];
		debug('FMUL: ' + args);
		registers[getReg(args[0])] = registers[getReg(args[1])] * registers[getReg(args[2])];
		iptr++;			
	},
	'FREM' : function(args) {console.log('FREM: Not Implemented');iptr++;},
	'FSQRT' : function(args) {
		// rega = sqrt(regb)
		// var rega = args[0];
		// var regb = args[1];
		registers[getReg(args[0])] = Math.sqrt(registers[getReg(args[1])]);
		iptr++;
	},
	'FSUB' : function(args) {
		debug('FSUB: Wrapper around SUB');
		ops.SUB(args);
	},
	'FUN' : function(args) {console.log('FUN: Not Implemented');iptr++;},
	'FUNE' : function(args) {console.log('FUNE: Not Implemented');iptr++;},
	'GET' : function(args) {console.log('GET: Not Implemented');iptr++;},
	'GETA' : function(args) {console.log('GETA: Not Implemented');iptr++;},
	'GETAB' : function(args) {console.log('GETAB: Not Implemented');iptr++;},
	'GO' : function(args) {console.log('GO: Not Implemented');iptr++;},
	'GOI' : function(args) {console.log('GOI: Not Implemented');iptr++;},
	'INCH' : function(args) {console.log('INCH: Not Implemented');iptr++;},
	'INCL' : function(args) {console.log('INCL: Not Implemented');iptr++;},
	'INCMH' : function(args) {console.log('INCMH: Not Implemented');iptr++;},
	'INCML' : function(args) {console.log('INCML: Not Implemented');iptr++;},
	'JMP' : function(args) {console.log('JMP: Not Implemented');iptr++;},
	'JMPB' : function(args) {console.log('JMPB: Not Implemented');iptr++;},
	'LDB' : function(args) {console.log('LDB: Not Implemented');iptr++;},
	'LDBI' : function(args) {console.log('LDBI: Not Implemented');iptr++;},
	'LDBU' : function(args) {console.log('LDBU: Not Implemented');iptr++;},
	'LDBUI' : function(args) {console.log('LDBUI: Not Implemented');iptr++;},
	'LDHT' : function(args) {console.log('LDHT: Not Implemented');iptr++;},
	'LDHTI' : function(args) {console.log('LDHTI: Not Implemented');iptr++;},
	'LDO' : function(args) {console.log('LDO: Not Implemented');iptr++;},
	'LDOI' : function(args) {console.log('LDOI: Not Implemented');iptr++;},
	'LDOU' : function(args) {console.log('LDOU: Not Implemented');iptr++;},
	'LDUNC' : function(args) {console.log('LDUNC: Not Implemented');iptr++;},
	'LDUNCI' : function(args) {console.log('LDUNCI: Not Implemented');iptr++;},
	'LDOUI' : function(args) {console.log('LDOUI: Not Implemented');iptr++;},
	'LDSF' : function(args) {console.log('LDSF: Not Implemented');iptr++;},
	'LDSFI' : function(args) {console.log('LDSFI: Not Implemented');iptr++;},
	'LDT' : function(args) {console.log('LDT: Not Implemented');iptr++;},
	'LDTI' : function(args) {console.log('LDTI: Not Implemented');iptr++;},
	'LDTU' : function(args) {console.log('LDTU: Not Implemented');iptr++;},
	'LDTUI' : function(args) {console.log('LDTUI: Not Implemented');iptr++;},
	'LDVTS' : function(args) {console.log('LDVTS: Not Implemented');iptr++;},
	'LDVTSI' : function(args) {console.log('LDVTSI: Not Implemented');iptr++;},
	'LDW' : function(args) {console.log('LDW: Not Implemented');iptr++;},
	'LDWI' : function(args) {console.log('LDWI: Not Implemented');iptr++;},
	'LDWU' : function(args) {console.log('LDWU: Not Implemented');iptr++;},
	'LDWUI' : function(args) {console.log('LDWUI: Not Implemented');iptr++;},
	'MOR' : function(args) {console.log('MOR: Not Implemented');iptr++;},
	'MORI' : function(args) {console.log('MORI: Not Implemented');iptr++;},
	'MUL' : function(args) {	
		console.log('MUL: Not Implemented');iptr++;
	},
	'MULI' : function(args) {console.log('MULI: Not Implemented');iptr++;},
	'MULU' : function(args) {console.log('MULU: Not Implemented');iptr++;},
	'MULUI' : function(args) {console.log('MULUI: Not Implemented');iptr++;},
	'MUX' : function(args) {console.log('MUX: Not Implemented');iptr++;},
	'MUXI' : function(args) {console.log('MUXI: Not Implemented');iptr++;},
	'MXOR' : function(args) {console.log('MXOR: Not Implemented');iptr++;},
	'MXORI' : function(args) {console.log('MXORI: Not Implemented');iptr++;},
	'NAND' : function(args) {console.log('NAND: Not Implemented');iptr++;},
	'NANDI' : function(args) {console.log('NANDI: Not Implemented');iptr++;},
	'NEG' : function(args) {console.log('NEG: Not Implemented');iptr++;},
	'NEGI' : function(args) {console.log('NEGI: Not Implemented');iptr++;},
	'NEGU' : function(args) {console.log('NEGU: Not Implemented');iptr++;},
	'NEGUI' : function(args) {console.log('NEGUI: Not Implemented');iptr++;},
	'NOR' : function(args) {console.log('NOR: Not Implemented');iptr++;},
	'NORI' : function(args) {console.log('NORI: Not Implemented');iptr++;},
	'NXOR' : function(args) {console.log('NXOR: Not Implemented');iptr++;},
	'NXORI' : function(args) {console.log('NXORI: Not Implemented');iptr++;},
	'ODIF' : function(args) {console.log('ODIF: Not Implemented');iptr++;},
	'ODIFI' : function(args) {console.log('ODIFI: Not Implemented');iptr++;},
	'OR' : function(args) {console.log('OR: Not Implemented');iptr++;},
	'ORH' : function(args) {console.log('ORH: Not Implemented');iptr++;},
	'ORI' : function(args) {console.log('ORI: Not Implemented');iptr++;},
	'ORL' : function(args) {console.log('ORL: Not Implemented');iptr++;},
	'ORMH' : function(args) {console.log('ORMH: Not Implemented');iptr++;},
	'ORML' : function(args) {console.log('ORML: Not Implemented');iptr++;},
	'ORN' : function(args) {console.log('ORN: Not Implemented');iptr++;},
	'ORNI' : function(args) {console.log('ORNI: Not Implemented');iptr++;},
	'PBEV' : function(args) {console.log('PBEV: Not Implemented');iptr++;},
	'PBEVB' : function(args) {console.log('PBEVB: Not Implemented');iptr++;},
	'PBN' : function(args) {console.log('PBN: Not Implemented');iptr++;},
	'PBNB' : function(args) {console.log('PBNB: Not Implemented');iptr++;},
	'PBNN' : function(args) {console.log('PBNN: Not Implemented');iptr++;},
	'PBNNB' : function(args) {console.log('PBNNB: Not Implemented');iptr++;},
	'PBNP' : function(args) {console.log('PBNP: Not Implemented');iptr++;},
	'PBNPB' : function(args) {console.log('PBNPB: Not Implemented');iptr++;},
	'PBNZ' : function(args) {console.log('PBNZ: Not Implemented');iptr++;},
	'PBNZB' : function(args) {console.log('PBNZB: Not Implemented');iptr++;},
	'PBOD' : function(args) {console.log('PBOD: Not Implemented');iptr++;},
	'PBODB' : function(args) {console.log('PBODB: Not Implemented');iptr++;},
	'PBP' : function(args) {console.log('PBP: Not Implemented');iptr++;},
	'PBPB' : function(args) {console.log('PBPB: Not Implemented');iptr++;},
	'PBZ' : function(args) {console.log('PBZ: Not Implemented');iptr++;},
	'PBZB' : function(args) {console.log('PBZB: Not Implemented');iptr++;},
	'POP' : function(args) {console.log('POP: Not Implemented');iptr++;},
	'PREGO' : function(args) {console.log('PREGO: Not Implemented');iptr++;},
	'PREGOI' : function(args) {console.log('PREGOI: Not Implemented');iptr++;},
	'PRELD' : function(args) {console.log('PRELD: Not Implemented');iptr++;},
	'PRELDI' : function(args) {console.log('PRELDI: Not Implemented');iptr++;},
	'PREST' : function(args) {console.log('PREST: Not Implemented');iptr++;},
	'PRESTI' : function(args) {console.log('PRESTI: Not Implemented');iptr++;},
	'PUSHGO' : function(args) {console.log('PUSHGO: Not Implemented');iptr++;},
	'PUSHGOI' : function(args) {console.log('PUSHGOI: Not Implemented');iptr++;},
	'PUSHJ' : function(args) {console.log('PUSHJ: Not Implemented');iptr++;},
	'PUSHJB' : function(args) {console.log('PUSHJB: Not Implemented');iptr++;},
	'PUT' : function(args) {console.log('PUT: Not Implemented');iptr++;},
	'PUTI' : function(args) {console.log('PUTI: Not Implemented');iptr++;},
	'RESUME' : function(args) {console.log('RESUME: Not Implemented');iptr++;},
	'SADD' : function(args) {console.log('SADD: Not Implemented');iptr++;},
	'SADDI' : function(args) {console.log('SADDI: Not Implemented');iptr++;},
	'SAVE' : function(args) {console.log('SAVE: Not Implemented');iptr++;},
	'SETH' : function(args) {console.log('SETH: Not Implemented');iptr++;},
	'SETL' : function(args) {console.log('SETL: Not Implemented');iptr++;},
	'SETMH' : function(args) {console.log('SETMH: Not Implemented');iptr++;},
	'SETML' : function(args) {console.log('SETML: Not Implemented');iptr++;},
	'SFLOT' : function(args) {console.log('SFLOT: Not Implemented');iptr++;},
	'SFLOTI' : function(args) {console.log('SFLOTI: Not Implemented');iptr++;},
	'SFLOTU' : function(args) {console.log('SFLOTU: Not Implemented');iptr++;},
	'SFLOTUI' : function(args) {console.log('SFLOTUI: Not Implemented');iptr++;},
	'SL' : function(args) {console.log('SL: Not Implemented');iptr++;},
	'SLI' : function(args) {console.log('SLI: Not Implemented');iptr++;},
	'SLU' : function(args) {console.log('SLU: Not Implemented');iptr++;},
	'SLUI' : function(args) {console.log('SLUI: Not Implemented');iptr++;},
	'SR' : function(args) {console.log('SR: Not Implemented');iptr++;},
	'SRI' : function(args) {console.log('SRI: Not Implemented');iptr++;},
	'SRU' : function(args) {console.log('SRU: Not Implemented');iptr++;},
	'SRUI' : function(args) {console.log('SRUI: Not Implemented');iptr++;},
	'STB' : function(args) {console.log('STB: Not Implemented');iptr++;},
	'STBI' : function(args) {console.log('STBI: Not Implemented');iptr++;},
	'STBU' : function(args) {console.log('STBU: Not Implemented');iptr++;},
	'STBUI' : function(args) {console.log('STBUI: Not Implemented');iptr++;},
	'STCO' : function(args) {console.log('STCO: Not Implemented');iptr++;},
	'STCOI' : function(args) {console.log('STCOI: Not Implemented');iptr++;},
	'STHT' : function(args) {console.log('STHT: Not Implemented');iptr++;},
	'STHTI' : function(args) {console.log('STHTI: Not Implemented');iptr++;},
	'STO' : function(args) {console.log('STO: Not Implemented');iptr++;},
	'STOI' : function(args) {console.log('STOI: Not Implemented');iptr++;},
	'STOU' : function(args) {console.log('STOU: Not Implemented');iptr++;},
	'STUNC' : function(args) {console.log('STUNC: Not Implemented');iptr++;},
	'STUNCI' : function(args) {console.log('STUNCI: Not Implemented');iptr++;},
	'STOUI' : function(args) {console.log('STOUI: Not Implemented');iptr++;},
	'STSF' : function(args) {console.log('STSF: Not Implemented');iptr++;},
	'STSFI' : function(args) {console.log('STSFI: Not Implemented');iptr++;},
	'STT' : function(args) {console.log('STT: Not Implemented');iptr++;},
	'STTI' : function(args) {console.log('STTI: Not Implemented');iptr++;},
	'STTU' : function(args) {console.log('STTU: Not Implemented');iptr++;},
	'STTUI' : function(args) {console.log('STTUI: Not Implemented');iptr++;},
	'STW' : function(args) {console.log('STW: Not Implemented');iptr++;},
	'STWI' : function(args) {console.log('STWI: Not Implemented');iptr++;},
	'STWU' : function(args) {console.log('STWU: Not Implemented');iptr++;},
	'STWUI' : function(args) {console.log('STWUI: Not Implemented');iptr++;},
	'SUB' : function(args) {
		// rega = regb + regc
		// var rega = args[0];
		// var regb = args[1];
		// var regc = args[2];		
		debug('SUB: ' + args);
		registers[getReg(args[0])] = registers[getReg(args[1])] - registers[getReg(args[2])];
		iptr++;
	},
	'SUBI' : function(args) {console.log('SUBI: Not Implemented');iptr++;},
	'SUBU' : function(args) {console.log('SUBU: Not Implemented');iptr++;},
	'SUBUI' : function(args) {console.log('SUBUI: Not Implemented');iptr++;},
	'SWYM' : function(args) {console.log('SWYM: Not Implemented');iptr++;},
	'SYNC' : function(args) {console.log('SYNC: Not Implemented');iptr++;},
	'SYNCD' : function(args) {console.log('SYNCD: Not Implemented');iptr++;},
	'SYNCDI' : function(args) {console.log('SYNCDI: Not Implemented');iptr++;},
	'SYNCID' : function(args) {console.log('SYNCID: Not Implemented');iptr++;},
	'SYNCIDI' : function(args) {console.log('SYNCIDI: Not Implemented');iptr++;},
	'TDIF' : function(args) {console.log('TDIF: Not Implemented');iptr++;},
	'TDIFI' : function(args) {console.log('TDIFI: Not Implemented');iptr++;},
	'TRIP' : function(args) {console.log('TRIP: Not Implemented');iptr++;},
	'TRAP' : function(args) {
		// var trapaction = args[1];
		debug('TRAP: ' + args);
		trapOps[args[1]]();
	},
	'UNSAVE' : function(args) {console.log('UNSAVE: Not Implemented');iptr++;},
	'WDIF' : function(args) {console.log('WDIF: Not Implemented');iptr++;},
	'WDIFI' : function(args) {console.log('WDIFI: Not Implemented');iptr++;},
	'XOR' : function(args) {console.log('XOR: Not Implemented');iptr++;},
	'XORI' : function(args) {console.log('XORI: Not Implemented');iptr++;},
	'ZSEV' : function(args) {console.log('ZSEV: Not Implemented');iptr++;},
	'ZSEVI' : function(args) {console.log('ZSEVI: Not Implemented');iptr++;},
	'ZSN' : function(args) {console.log('ZSN: Not Implemented');iptr++;},
	'ZSNI' : function(args) {console.log('ZSNI: Not Implemented');iptr++;},
	'ZSNN' : function(args) {console.log('ZSNN: Not Implemented');iptr++;},
	'ZSNNI' : function(args) {console.log('ZSNNI: Not Implemented');iptr++;},
	'ZSNP' : function(args) {console.log('ZSNP: Not Implemented');iptr++;},
	'ZSNPI' : function(args) {console.log('ZSNPI: Not Implemented');iptr++;},
	'ZSNZ' : function(args) {console.log('ZSNZ: Not Implemented');iptr++;},
	'ZSNZI' : function(args) {console.log('ZSNZI: Not Implemented');iptr++;},
	'ZSOD' : function(args) {console.log('ZSOD: Not Implemented');iptr++;},
	'ZSODI' : function(args) {console.log('ZSODI: Not Implemented');iptr++;},
	'ZSP' : function(args) {console.log('ZSP: Not Implemented');iptr++;},
	'ZSPI' : function(args) {console.log('ZSPI: Not Implemented');iptr++;},
	'ZSZ' : function(args) {console.log('ZSZ: Not Implemented');iptr++;},
	'ZSZI' : function(args) {console.log('ZSZI: Not Implemented');iptr++;}
};

var nop = function(x){
	debug('NOP: ' + x);
	iptr++;
};


function run() {

	console.log('Started execution at addr: ' + iptr);
	var numops = 0;

	while (iptr !== 'undefined') {
		// get the current instruction from memory at 'iptr'
		var icurr = memory[iptr];
		// find the operation in 'ops' if we can't find it, we turn into a nop
		var op = ops[icurr[0]] || nop;
		// get the arguments for the operation, if none set to null
		var args = icurr[1] ? icurr[1].split(',') : null;
		// perform the operation, passing in the args
		op(args);
		//op.apply(this, args);
		numops++;
	}

	console.log('Finished execution after ' + numops + ' operations');
}


function loadIntoMem(code) {
	for (var i = 0; i < code.length; i++) {
		// console.log(code[i]);
		var line = code[i];
		if (line[0]) {
			// if we are a label, add to the labels list
			labels[line[0]] = i;
		} else if (line[2] === 'IS') {
			// if we are an 'IS' statement, set up a ref to the actual register
			regLabels[line[1]] = line[3];
			line = '';
		}
		memory[i] = [line[1], line[2]];
	}
}


function readSrcFile(fname) {
	data = fs.readFileSync(fname, 'utf8');
	data = data.split('\n');
	for (var i = 0; i < data.length; i++) {
		data[i] = data[i].split('\t');
	}
	return data
}


code = readSrcFile('../mms/tri_test.mms');
loadIntoMem(code);
// console.log(memory);
// console.log(regLabels);
iptr = labels['Main'];
run()
console.log(registers);

