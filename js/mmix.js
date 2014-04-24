
'use strict';

var NodeEnv = false;
if (typeof window === 'undefined') {
	var fs = require('fs');
	var types = require('./types.js');
	var ByteArray = types.ByteArray;
	NodeEnv = true;
}


function MmixInterpreter() {}

var Registers = {}; // array of registers, registers look like $0, $1 etc.
var RegLabels = {}; // mapping of labels to actual registers eg. {a : $1}
var SpecialReg = {}; // special registers for overflow and such
var Memory = []; // Our array of Memory cells
var Code = []; // Array of instructions, sould only have entries on multiples of 8
var RegStack = []; // list of lists, one for each 'frame' (set of reg's) we push
var Labels = {}; // mapping of labels to code positions in the Code array 
var Constants = {}; // mapping of labels to constant values
var iptr = 'undefined'; // instruction pointer
var stkptr; // current pointer into available Stack
var gregptr = 255; // points to the last allocated global reg ($255 is alwyas global)

// quick hack for re initializing mmix interpreter without acutally moving 
//  the values into the object (which should be done!!)
function initInterpreter() {
	Registers = {};
	RegLabels = {};
	SpecialReg = {};
	Memory = [];
	Code = [];
	RegStack = [];
	Labels = {};
	Constants = {};
	iptr = 'undefined';
	gregptr = 255;	
}


var dbgopts = true;
function debug(str) {
	if (dbgopts) {
		console.log('DBG - ' + str);		
	}
}

var warnings = true;
function warning(str) {
	if (warnings) {
		console.log('Warning - ' + str);
		if (!NodeEnv) {
			showWarning(str);
		}
	}	
}

function getReg(symbol) {
	return RegLabels[symbol] || symbol;
}

function getAddr(addr) {
	return Labels[addr] || addr;
}

function getValue(symbol) {
	if (RegLabels[symbol]) {
		// we are a symbol for a register
		return Registers[RegLabels[symbol]];
	} else if (Registers[symbol]) {
		// we are a normal register
		return Registers[symbol];
	} else if (Constants[symbol]) {
		// we are a constant
		return Constants[symbol];
	} 
	var	val = new ByteArray();
	if (Labels[symbol]) {
		// we are a lable so return the address as a 64 bit val
		val.setUint64(Labels[symbol]);
	} else {
		// we are an immediate so put the val in
		val.setFromString(symbol);
	}
	return val;
}

function copyValue(val) {
	var copyval = new ByteArray();
	copyval.uint64[0] = val.uint64[0];
	copyval.uint64[1] = val.uint64[1];
	return copyval;
}


var TrapOps = {
	'Fputs' : function() {
		debug('TRAP -> Fputs');
		var data = Code[Registers['$255']];
		var args = data[1].split(',');
		console.log(args[0]);
		iptr += 4;
	},
	'Halt' : function() {
		debug('TRAP -> Halt');
		iptr = 'undefined';
	}
};


function Opcodes() {};

Opcodes.prototype.LDA = function(args) {
	// var reg = args[0];
	// var addr = args[1];
	debug('LDA: ' + args);
	Registers[getReg(args[0])] = getAddr(args[1]);
	iptr += 4;
};

Opcodes.prototype['2ADDU'] = function(args) {warning('2ADDU: Not Implemented');iptr += 4};
Opcodes.prototype['2ADDUI'] = function(args) {
	Opcodes.prototype['2ADDU'](args);
};
Opcodes.prototype['4ADDU'] = function(args) {warning('4ADDU: Not Implemented');iptr += 4};
Opcodes.prototype['4ADDUI'] = function(args) {
	Opcodes.prototype['4ADDU'](args);
};
Opcodes.prototype['8ADDU'] = function(args) {warning('8ADDU: Not Implemented');iptr += 4};
Opcodes.prototype['8ADDUI'] = function(args) {
	Opcodes.prototype['8ADDU'](args);
};
Opcodes.prototype['16ADDU'] = function(args) {warning('16ADDU: Not Implemented');iptr += 4};
Opcodes.prototype['16ADDUI'] = function(args) {
	Opcodes.prototype['16ADDU'](args);
};
Opcodes.prototype.ADD = function(args) {
	// a = b + c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('ADD: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var offset = 0;
	a.uint64[0] = b.uint64[0] + c.uint64[0];
	if (a.uint64[0] < b.uint64[0]) {
		offset = 1;
	}
	a.uint64[1] = b.uint64[1] + c.uint64[1] + offset;
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.ADDI = function(args) {
	Opcodes.prototype.ADD(args);
};
Opcodes.prototype.ADDU = function(args) {
	// a = b + c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];	
	debug('ADDU: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var offset = 0;
	a.uint64[0] = b.uint64[0] + c.uint64[0];
	if (a.uint64[0] < b.uint64[0]) {
		offset = 1;
	}
	a.uint64[1] = b.uint64[1] + c.uint64[1] + offset;
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.ADDUI = function(args) {
	Opcodes.prototype.ADDU(args);
};
Opcodes.prototype.AND = function(args) {
	// rega = regb & regc
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('AND: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = b.uint64[0] & c.uint64[0];
	a.uint64[1] = b.uint64[1] & c.uint64[1];
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.ANDI = function(args) {
	Opcodes.prototype.AND(args);
};
Opcodes.prototype.ANDN = function(args) {
	// rega = regb & ~regc
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('ANDN: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = b.uint64[0] & ~c.uint64[0];
	a.uint64[1] = b.uint64[1] & ~c.uint64[1];
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.ANDNH = function(args) {warning('ANDNH: Not Implemented');iptr += 4};
Opcodes.prototype.ANDNI = function(args) {
	Opcodes.prototype.ANDN(args);
};
Opcodes.prototype.ANDNL = function(args) {warning('ANDNL: Not Implemented');iptr += 4};
Opcodes.prototype.ANDNMH = function(args) {warning('ANDNMH: Not Implemented');iptr += 4};
Opcodes.prototype.ANDNML = function(args) {warning('ANDNML: Not Implemented');iptr += 4};
Opcodes.prototype.BDIF = function(args) {warning('BDIF: Not Implemented');iptr += 4};
Opcodes.prototype.BDIFI = function(args) {
	Opcodes.prototype.BDIF(args);
};
Opcodes.prototype.BEV = function(args) {
	// if x % 2 == 0; iptr += offset;
	// x = args[0]
	debug('BEV: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.uint64[0] % 2 == 0) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BEVB = function(args) {
	Opcodes.prototype.BEV(args);
};
Opcodes.prototype.BN = function(args) {
	// if x < 0; iptr += offset;
	// x = args[0]
	debug('BN: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.getInt64() < 0) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BNB = function(args) {
	Opcodes.prototype.BN(args);
};
Opcodes.prototype.BNN = function(args) {
	// if x >= 0; iptr += offset;
	// x = args[0]
	debug('BNN: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.getInt64() >= 0) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BNNB = function(args) {
	Opcodes.prototype.BNN(args);
};
Opcodes.prototype.BNP = function(args) {
	// if x < 0; iptr += offset;
	// x = args[0]
	debug('BNP: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.getInt64() <= 0) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BNPB = function(args) {
	Opcodes.prototype.BNP(args);
};
Opcodes.prototype.BNZ = function(args) {
	// if x != 0; iptr += offset;
	// x = args[0]
	debug('BNZ: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.getInt64() != 0) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BNZB = function(args) {
	Opcodes.prototype.BNZ(args);
};
Opcodes.prototype.BOD = function(args) {
	// if x % 2 == 1; iptr += offset;
	// x = args[0]
	debug('BOD: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.uint64[0] % 2 == 1) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BODB = function(args) {
	Opcodes.prototype.BOD(args);
};
Opcodes.prototype.BP = function(args) {
	// if x > 0; iptr += offset;
	// x = args[0]
	debug('BP: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.getInt64() > 0) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BPB = function(args) {
	Opcodes.prototype.BP(args);
};
Opcodes.prototype.BZ = function(args) {
	// if x == 0; iptr += offset;
	// x = args[0]
	debug('BZ: ' + args);
	var x = Registers[getReg(args[0])];
	if (x.getInt64() == 0) {
		var reladdr = getValue(args[1]);
		iptr += 4*reladdr.getInt64();
	} else {
		iptr += 4;
	}
};
Opcodes.prototype.BZB = function(args) {
	Opcodes.prototype.BZ(args);
};
Opcodes.prototype.CMP = function(args) {
	// a > b ? 1 : -1, 0 if eq
	// res = args[0]
	// a = args[1]
	// b = args[2]
	debug('CMP: ' + args);
	var a = Registers[getReg(args[1])];
	var b = getValue(args[2]);
	var val = new ByteArray();
	// do hi bits first, if they are equal check the low bits
	var result = (a.int64[1] > b.int64[1]) ? 1 : (a.int64[1] == b.int64[1] ? 0 : -1);
	if (!result) {
		// use unsigned for the low bits b/c the sign bit is in the high 32 bits
		result = (a.uint64[0] > b.uint64[0]) ? 1 : (a.uint64[0] == b.uint64[0] ? 0 : -1);
	}
	val.setInt64(result);
	Registers[getReg(args[0])] = val;
	iptr += 4;
};
Opcodes.prototype.CMPI = function(args) {
	Opcodes.prototype.CMP(args);
};
Opcodes.prototype.CMPU = function(args) {
	// a > b ? 1 : -1, 0 if eq
	// res = args[0]
	// a = args[1]
	// b = args[2]
	debug('CMPU: ' + args);
	var a = Registers[getReg(args[1])];
	var b = getValue(args[2]);
	var val = new ByteArray();
	var result = (a.uint64[1] > b.uint64[1]) ? 1 : (a.uint64[1] == b.uint64[1] ? 0 : -1);
	if (!result) {
		result = (a.uint64[0] > b.uint64[0]) ? 1 : (a.uint64[0] == b.uint64[0] ? 0 : -1);
	}
	val.setInt64(result);
	Registers[getReg(args[0])] = val;
	iptr += 4;
};
Opcodes.prototype.CMPUI = function(args) {
	Opcodes.prototype.CMPU(args);
};
Opcodes.prototype.CSEV = function(args) {
	// if y % 2 == 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSEV: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.uint64[0] % 2 == 0) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSEVI = function(args) {
	Opcodes.prototype.CSEV(args);
};
Opcodes.prototype.CSN = function(args) {
	// if y < 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSN: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.getInt64() < 0) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSNI = function(args) {
	Opcodes.prototype.CSN(args);
};
Opcodes.prototype.CSNN = function(args) {
	// if y >= 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSNN: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.getInt64() >= 0) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSNNI = function(args) {
	Opcodes.prototype.CSNN(args);
};
Opcodes.prototype.CSNP = function(args) {
	// if y <= 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSNP: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.getInt64() <= 0) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSNPI = function(args) {
	Opcodes.prototype.CSNP(args);
};
Opcodes.prototype.CSNZ = function(args) {
	// if y != 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSNZ: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.getInt64() != 0) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSNZI = function(args) {
	Opcodes.prototype.CSNZ(args);
};
Opcodes.prototype.CSOD = function(args) {
	// if y % 2 == 1 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSOD: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.uint64[0] % 2 == 1) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSODI = function(args) {
	Opcodes.prototype.CSOD(args);
};
Opcodes.prototype.CSP = function(args) {
	// if y > 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSP: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.getInt64() > 0) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSPI = function(args) {
	Opcodes.prototype.CSP(args);
};
Opcodes.prototype.CSWAP = function(args) {warning('CSWAP: Not Implemented');iptr += 4};
Opcodes.prototype.CSWAPI = function(args) {
	Opcodes.prototype.CSWAP(args);
};
Opcodes.prototype.CSZ = function(args) {
	// if y == 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('CSZ: ' + args);	
	var y = Registers[getReg(args[1])];
	if (y.getInt64() == 0) {
		var z = getValue(args[2]);
		var x = copyValue(z);
		Registers[getReg(args[0])] = x;
	}
	iptr += 4;
};
Opcodes.prototype.CSZI = function(args) {
	Opcodes.prototype.CSZ(args);
};
Opcodes.prototype.DIV = function(args) {
	// x = y / z
	// x = args[0]
	// y = args[1]
	// z = args[2]		
	debug('DIV: ' + args);
	var x = new ByteArray();
	var y = Registers[getReg(args[1])];
	var z = getValue(args[2]);
	var yval = y.getInt64();
	var zval = z.getInt64();
	var large = Math.pow(2, 52); // largest js num that doesn't lose precision
	if (Math.abs(yval) > large || Math.abs(zval) > large) {
		warning('Division with possible loss of precision:' + args);
	}
	x.setInt64( zval ? yval / zval : 0 );
	Registers[getReg(args[0])] = x;
	SpecialReg.rR = zval ? yval % zval : yval;	
	iptr += 4;
};
Opcodes.prototype.DIVI = function(args) {
	Opcodes.prototype.DIV(args);
};
Opcodes.prototype.DIVU = function(args) {
	// x = y / z
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('DIVU: ' + args);
	var x = new ByteArray();
	var y = Registers[getReg(args[1])];
	var z = getValue(args[2]);
	var yval = y.getUint64();
	var zval = z.getUint64();
	var large = Math.pow(2, 52); // largest js num that doesn't lose precision
	if (yval > large || zval > large) {
		warning('Division with possible loss of precision:' + args);
	}
	// missing rD stuff
	x.setInt64( zval ? yval / zval : 0 );
	Registers[getReg(args[0])] = x;
	SpecialReg.rR = zval ? yval % zval : yval;	
	iptr += 4;
};
Opcodes.prototype.DIVUI = function(args) {
	Opcodes.prototype.DIVU(args);
};
Opcodes.prototype.FADD = function(args) {
	// a = b + c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('FADD: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.setFloat64(b.float64[0] + c.float64[0]);
	Registers[getReg(args[0])] = a;		
	iptr += 4;
};
Opcodes.prototype.FCMP = function(args) {
	// a > b ? 1 : -1, 0 if eq
	// res = args[0]
	// a = args[1]
	// b = args[2]
	debug('FCMP: ' + args);
	var a = Registers[getReg(args[1])];
	var b = getValue(args[2]);
	var val = new ByteArray();
	var result = (a.getFloat64() > b.getFloat64()) ? 1 : (a.getFloat64() == b.getFloat64() ? 0 : -1);
	val.setInt64(result);
	Registers[getReg(args[0])] = val;
	iptr += 4;
};
Opcodes.prototype.FCMPE = function(args) {warning('FCMPE: Not Implemented');iptr += 4};
Opcodes.prototype.FDIV = function(args) {
	// a = b / c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('FDIV: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.setFloat64(b.float64[0] / c.float64[0]);
	Registers[getReg(args[0])] = a;		
	iptr += 4;		
};
Opcodes.prototype.FEQL = function(args) {
	// a = b ? 1 : 0
	// res = args[0]
	// a = args[1]
	// b = args[2]
	debug('FEQL: ' + args);
	var a = Registers[getReg(args[1])];
	var b = getValue(args[2]);
	var val = new ByteArray();
	var result = a.getFloat64() === b.getFloat64() ? 1 : 0;
	val.setInt64(result);
	Registers[getReg(args[0])] = val;
	iptr += 4;
};
Opcodes.prototype.FEQLE = function(args) {warning('FEQLE: Not Implemented');iptr += 4};
Opcodes.prototype.FINT = function(args) {warning('FINT: Not Implemented');iptr += 4};
Opcodes.prototype.FIX = function(args) {
	// a = (int) b
	// var a = args[0];
	// var b = args[1];
	debug('FIX: ' + args);
	warning('Floating point special modes not implemented')
	var a = new ByteArray();
	var b = getValue(args[1]);
	a.setInt64(b.getFloat64());
	Registers[getReg(args[0])] = a;	
	iptr += 4;
};
Opcodes.prototype.FIXU = function(args) {
	// a = (int) b
	// var a = args[0];
	// var b = args[1];
	debug('FINT: ' + args);
	warning('Floating point special modes not implemented')
	var a = new ByteArray();
	var b = getValue(args[1]);
	a.setUint64(b.getFloat64());
	Registers[getReg(args[0])] = a;	
	iptr += 4;
};
Opcodes.prototype.FLOT = function(args) {
	// a = (float) b
	// var rega = args[0];
	// var regb = args[1];
	debug('FLOT: ' + args);
	var a = new ByteArray();
	var b = getValue(args[1]);
	a.setFloat64(b.getInt64());
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.FLOTI = function(args) {
	Opcodes.prototype.FLOT(args);
};
Opcodes.prototype.FLOTU = function(args) {warning('FLOTU: Not Implemented');iptr += 4};
Opcodes.prototype.FLOTUI = function(args) {warning('FLOTUI: Not Implemented');iptr += 4};
Opcodes.prototype.FMUL = function(args) {
	// a = b * c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('FMUL: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.setFloat64(b.float64[0] * c.float64[0]);
	Registers[getReg(args[0])] = a;		
	iptr += 4;
};
Opcodes.prototype.FREM = function(args) {warning('FREM: Not Implemented');iptr += 4};
Opcodes.prototype.FSQRT = function(args) {
	// a = sqrt(b)
	// var rega = args[0];
	// var regb = args[1];
	debug('FSQRT: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])]
	a.setFloat64(Math.sqrt(b.float64[0]));
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.FSUB = function(args) {
	// a = b - c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('FSUB: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.setFloat64(b.float64[0] - c.float64[0]);
	Registers[getReg(args[0])] = a;		
	iptr += 4;
};
Opcodes.prototype.FUN = function(args) {warning('FUN: Not Implemented');iptr += 4};
Opcodes.prototype.FUNE = function(args) {warning('FUNE: Not Implemented');iptr += 4};
Opcodes.prototype.GET = function(args) {warning('GET: Not Implemented');iptr += 4};
Opcodes.prototype.GETA = function(args) {warning('GETA: Not Implemented');iptr += 4};
Opcodes.prototype.GETAB = function(args) {warning('GETAB: Not Implemented');iptr += 4};
Opcodes.prototype.GO = function(args) {
	// oldaddr = args[0] = iptr + 4
	debug('GO: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	if (!Labels[args[2]]) {
		// we index our code array as multiples of 4
		//  and start from 0 (so -1 as the first line isn't line 0)
		var offval = offset.getUint64();
		offset.setUint64( offval ? (offval - 1)*4 : 0 );
	}
	var	oldaddr = new ByteArray();
	oldaddr.setUint64((iptr + 4) / 4);

	Registers[getReg(args[0])] = oldaddr;
	iptr = addr.getUint64()*4 + offset.getUint64();
};
Opcodes.prototype.GOI = function(args) {
	Opcodes.prototype.GO(args);
};
Opcodes.prototype.INCH = function(args) {warning('INCH: Not Implemented');iptr += 4};
Opcodes.prototype.INCL = function(args) {warning('INCL: Not Implemented');iptr += 4};
Opcodes.prototype.INCMH = function(args) {warning('INCMH: Not Implemented');iptr += 4};
Opcodes.prototype.INCML = function(args) {warning('INCML: Not Implemented');iptr += 4};
Opcodes.prototype.JMP = function(args) {
	// relative address = args[0]
	debug('JMP: ' + args);
	var reladdr = getValue(args[0]);
	iptr += 4*reladdr.getInt64();
};
Opcodes.prototype.JMPB = function(args) {warning('JMPB: Not Implemented');iptr += 4};
Opcodes.prototype.LDB = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('LDB: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	// byteoffset gives us the position of the byte we want
	var byteoffset = Math.abs((memaddr % 4) * 8 - 24);
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	var val = new ByteArray();	
	if (!memval) {
		warning('Loading Memory from unset location with LDBU:' + args);
		val.setUint64(0);
	} else {
		mask = 0xff;
		val.uint64[0] = (memval.uint64[bytepos] >> byteoffset) & mask;
		val.uint64[1] = 0;
		if (val.uint64[0] & 0x80) {
			// the most sig bit in the byte is set, we have to propogate it left
			val.uint64[0] |= 0xffffff00;
			val.uint64[1] = ~0;
		}
	}
	Registers[getReg(args[0])] = val;	
	iptr += 4;
};
Opcodes.prototype.LDBI = function(args) {
	Opcodes.prototype.LDB(args);
};
Opcodes.prototype.LDBU = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('LDBU: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	// byteoffset gives us the position of the byte we want
	var byteoffset = Math.abs((memaddr % 4) * 8 - 24);
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	var val = new ByteArray();	
	if (!memval) {
		warning('Loading Memory from unset location with LDBU:' + args);
		val.setUint64(0);
	} else {
		mask = 0xff;
		val.uint64[0] = (memval.uint64[bytepos] >> byteoffset) & mask;
		val.uint64[1] = 0;
	}
	Registers[getReg(args[0])] = val;	
	iptr += 4;
};
Opcodes.prototype.LDBUI = function(args) {
	Opcodes.prototype.LDBU(args);
};
Opcodes.prototype.LDHT = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('LDHT: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	var val = new ByteArray();	
	if (!memval) {
		warning('Loading Memory from unset location with LDHT:' + args);
		// we are loading nothing so just set to zero
		val.setUint64(0);
	} else {
		val.uint64[0] = 0;
		val.uint64[1] = memval.uint64[bytepos];
	}
	Registers[getReg(args[0])] = val;	
	iptr += 4;
};
Opcodes.prototype.LDHTI = function(args) {
	Opcodes.prototype.LDHT(args);
};
Opcodes.prototype.LDO = function(args) {
	// reg = args[0];
	// memaddr = args[1] + args[2];
	debug('LDO:' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();	
	memaddr -= memaddr % 8;
	var memval = Memory[memaddr];
	if (!memval) {
		warning('Loading Memory from unset location with LDO:' + args);
		memval = new ByteArray();
		memval.setUint64(0);		
	}
	var regval = copyValue(memval);
	Registers[getReg(args[0])] = regval;
	iptr += 4;
};
Opcodes.prototype.LDOI = function(args) {
	Opcodes.prototype.LDO(args);
};
Opcodes.prototype.LDOU = function(args) {
	Opcodes.prototype.LDO(args);
};
Opcodes.prototype.LDUNC = function(args) {warning('LDUNC: Not Implemented');iptr += 4};
Opcodes.prototype.LDUNCI = function(args) {
	Opcodes.prototype.LDUNC(args);
};
Opcodes.prototype.LDOUI = function(args) {
	Opcodes.prototype.LDOU(args);
};
Opcodes.prototype.LDSF = function(args) {warning('LDSF: Not Implemented');iptr += 4};
Opcodes.prototype.LDSFI = function(args) {
	Opcodes.prototype.LDSF(args);
};
Opcodes.prototype.LDT = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('LDT: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	var val = new ByteArray();	
	if (!memval) {
		warning('Loading Memory from unset location with LDT:' + args);
		// we are loading nothing so just set to zero
		val.setUint64(0);
	} else {
		val.uint64[0] = memval.uint64[bytepos];
		val.uint64[1] = (val.int64[0] < 0) ? ~0 : 0;
	}
	Registers[getReg(args[0])] = val;	
	iptr += 4;
};
Opcodes.prototype.LDTI = function(args) {
	Opcodes.prototype.LDT(args);
};
Opcodes.prototype.LDTU = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('LDTU: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	var val = new ByteArray();	
	if (!memval) {
		warning('Loading Memory from unset location with LDTU:' + args);
		// we are loading nothing so just set to zero
		val.setUint64(0);
	} else {
		val.uint64[0] = memval.uint64[bytepos];
		val.uint64[1] = 0;
	}
	Registers[getReg(args[0])] = val;	
	iptr += 4;
};
Opcodes.prototype.LDTUI = function(args) {
	Opcodes.prototype.LDTU(args);
};
Opcodes.prototype.LDVTS = function(args) {warning('LDVTS: Not Implemented');iptr += 4};
Opcodes.prototype.LDVTSI = function(args) {
	Opcodes.prototype.LDVTS(args);
};
Opcodes.prototype.LDW = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('LDW: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	// the wideoffset gives us the 16 bits that we want to keep in the tetra
	var wideoffset = ((Math.floor((memaddr % 4) / 2) + 1) % 2) * 16;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	var val = new ByteArray();	
	if (!memval) {
		warning('Loading Memory from unset location with LDWU:' + args);
		val.setUint64(0);
	} else {
		mask = 0xffff;
		val.uint64[0] = (memval.uint64[bytepos] >> wideoffset) & mask;
		val.uint64[1] = 0;
		if (val.uint64[0] & 0x8000) {
			// the most sig bit in the wide is set, we have to propogate it left
			val.uint64[0] |= 0xffff0000;
			val.uint64[1] = ~0;
		}
	}
	Registers[getReg(args[0])] = val;	
	iptr += 4;
};
Opcodes.prototype.LDWI = function(args) {
	Opcodes.prototype.LDW(args);
};
Opcodes.prototype.LDWU = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('LDWU: ' + args);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	// the wideoffset gives us the 16 bits that we want to keep in the tetra
	var wideoffset = ((Math.floor((memaddr % 4) / 2) + 1) % 2) * 16;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	var val = new ByteArray();	
	if (!memval) {
		warning('Loading Memory from unset location with LDWU:' + args);
		val.setUint64(0);
	} else {
		mask = 0xffff;
		val.uint64[0] = (memval.uint64[bytepos] >> wideoffset) & mask;
		val.uint64[1] = 0;
	}
	Registers[getReg(args[0])] = val;	
	iptr += 4;
};
Opcodes.prototype.LDWUI = function(args) {
	Opcodes.prototype.LDWU(args);
};
Opcodes.prototype.MOR = function(args) {warning('MOR: Not Implemented');iptr += 4};
Opcodes.prototype.MORI = function(args) {
	Opcodes.prototype.MOR(args);
};
Opcodes.prototype.MUL = function(args) {
	// x = y * z
	// x = args[0]
	// y = args[1]
	// z = args[2]		
	debug('MUL: ' + args);
	var x = new ByteArray();
	var y = Registers[getReg(args[1])];
	var z = getValue(args[2]);
	var yval = y.getInt64();
	var zval = z.getInt64();
	var large = Math.pow(2, 52); // largest js num that doesn't lose precision
	if (Math.abs(yval * zval) > large) {
		warning('Multiplication with possible loss of precision:' + args);
	}
	x.setInt64(yval * zval);
	Registers[getReg(args[0])] = x;
	iptr += 4;
};
Opcodes.prototype.MULI = function(args) {
	Opcodes.prototype.MUL(args);
};
Opcodes.prototype.MULU = function(args) {
	// x = y * z
	// x = args[0]
	// y = args[1]
	// z = args[2]		
	debug('MULU: ' + args);
	var x = new ByteArray();
	var y = Registers[getReg(args[1])];
	var z = getValue(args[2]);
	var lowbits = y.uint64[0] * z.uint64[0];
	x.uint64[0] = lowbits % 4294967296;
	x.uint64[1] = lowbits / 4294967296;
	var highbits = y.uint64[0] * z.uint64[1] + y.uint64[1] * z.uint64[0] + x.uint64[1];
	var overflowbits = new ByteArray();
	overflowbits.setUint64( highbits / 4294967296 + y.uint64[1] * z.uint64[1] );
	x.uint64[1] = highbits % 4294967296;
	Registers[getReg(args[0])] = x;
	SpecialReg.rH = overflowbits;
	iptr += 4;
};
Opcodes.prototype.MULUI = function(args) {
	Opcodes.prototype.MULU(args);
};
Opcodes.prototype.MUX = function(args) {warning('MUX: Not Implemented');iptr += 4};
Opcodes.prototype.MUXI = function(args) {
	Opcodes.prototype.MUX(args);
};
Opcodes.prototype.MXOR = function(args) {warning('MXOR: Not Implemented');iptr += 4};
Opcodes.prototype.MXORI = function(args) {
	Opcodes.prototype.MXOR(args);
};
Opcodes.prototype.NAND = function(args) {
	// rega = ~(regb & regc)
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('NAND: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = ~(b.uint64[0] & c.uint64[0]);
	a.uint64[1] = ~(b.uint64[1] & c.uint64[1]);
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.NANDI = function(args) {
	Opcodes.prototype.NAND(args);
};
Opcodes.prototype.NEG = function(args) {
	// a = y - b
	// if y not present (ie only 2 args), then y = 0
	// a = args[0]
	// y = args[1] or 0
	// b = args[2] or args[1] if y = 0
	debug('NEG: ' + args);
	var a = new ByteArray();
	if (args.length == 3) {
		var b = getValue(args[2]);
		a.setFromString(args[1]);
	} else {
		var b = Registers[getReg(args[1])];
		a.setInt64(0);
	}
	a.int64[0] -= b.int64[0];
	a.int64[1] -= b.int64[1];
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.NEGI = function(args) {
	Opcodes.prototype.NEG(args);
};
Opcodes.prototype.NEGU = function(args) {
	// a = y - b
	// if y not present (ie only 2 args), then y = 0
	// a = args[0]
	// y = args[1] or 0
	// b = args[2] or args[1] if y = 0
	debug('NEGU: ' + args);
	var a = new ByteArray();
	if (args.length == 3) {
		var b = getValue(args[2]);
		a.setFromString(args[1]);
	} else {
		var b = Registers[getReg(args[1])];
		a.setInt64(0);
	}
	a.uint64[0] -= b.uint64[0];
	a.uint64[1] -= b.uint64[1];
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.NEGUI = function(args) {
	Opcodes.prototype.NEGU(args);
};
Opcodes.prototype.NOR = function(args) {
	// a = b | c
	// var a = args[0];
	// var b = args[1];
	// var c = args[2];
	debug('NOR: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = ~(b.uint64[0] | c.uint64[0]);
	a.uint64[1] = ~(b.uint64[1] | c.uint64[1]);
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.NORI = function(args) {
	Opcodes.prototype.NOR(args);
};
Opcodes.prototype.NXOR = function(args) {
	// rega = ~(regb ^ regc)
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('NXOR: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = ~(b.uint64[0] ^ c.uint64[0]);
	a.uint64[1] = ~(b.uint64[1] ^ c.uint64[1]);
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.NXORI = function(args) {
	Opcodes.prototype.NXOR(args);
};
Opcodes.prototype.ODIF = function(args) {warning('ODIF: Not Implemented');iptr += 4};
Opcodes.prototype.ODIFI = function(args) {
	Opcodes.prototype.ODIF(args);
};
Opcodes.prototype.OR = function(args) {
	// rega = regb | regc
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('OR: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = b.uint64[0] | c.uint64[0];
	a.uint64[1] = b.uint64[1] | c.uint64[1];
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.ORH = function(args) {warning('ORH: Not Implemented');iptr += 4};
Opcodes.prototype.ORI = function(args) {
	Opcodes.prototype.OR(args);
};
Opcodes.prototype.ORL = function(args) {warning('ORL: Not Implemented');iptr += 4};
Opcodes.prototype.ORMH = function(args) {warning('ORMH: Not Implemented');iptr += 4};
Opcodes.prototype.ORML = function(args) {warning('ORML: Not Implemented');iptr += 4};
Opcodes.prototype.ORN = function(args) {
	// rega = regb | ~regc
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('ORN: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = b.uint64[0] | ~c.uint64[0];
	a.uint64[1] = b.uint64[1] | ~c.uint64[1];
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.ORNI = function(args) {
	Opcodes.prototype.ORN(args);
};
Opcodes.prototype.PBEV = function(args) {
	Opcodes.prototype.BEV(args);
};
Opcodes.prototype.PBEVB = function(args) {
	Opcodes.prototype.PBEV(args);
};
Opcodes.prototype.PBN = function(args) {
	Opcodes.prototype.BN(args);
};
Opcodes.prototype.PBNB = function(args) {
	Opcodes.prototype.PBN(args);
};
Opcodes.prototype.PBNN = function(args) {
	Opcodes.prototype.BNN(args);
};
Opcodes.prototype.PBNNB = function(args) {
	Opcodes.prototype.PBNN(args);
};
Opcodes.prototype.PBNP = function(args) {
	Opcodes.prototype.BNP(args);
};
Opcodes.prototype.PBNPB = function(args) {
	Opcodes.prototype.PBNP(args);
};
Opcodes.prototype.PBNZ = function(args) {
	Opcodes.prototype.BNZ(args);
};
Opcodes.prototype.PBNZB = function(args) {
	Opcodes.prototype.PBNZ(args);
};
Opcodes.prototype.PBOD = function(args) {
	Opcodes.prototype.BOD(args);
};
Opcodes.prototype.PBODB = function(args) {
	Opcodes.prototype.PBOD(args);
};
Opcodes.prototype.PBP = function(args) {
	Opcodes.prototype.BP(args);
};
Opcodes.prototype.PBPB = function(args) {
	Opcodes.prototype.PBP(args);
};
Opcodes.prototype.PBZ = function(args) {
	Opcodes.prototype.BZ(args);
};
Opcodes.prototype.PBZB = function(args) {
	Opcodes.prototype.PBZ(args);
};
Opcodes.prototype.POP = function(args) {warning('POP: Not Implemented');iptr += 4};
Opcodes.prototype.PREGO = function(args) {warning('PREGO: Not Implemented');iptr += 4};
Opcodes.prototype.PREGOI = function(args) {
	Opcodes.prototype.PREGO(args);
};
Opcodes.prototype.PRELD = function(args) {warning('PRELD: Not Implemented');iptr += 4};
Opcodes.prototype.PRELDI = function(args) {
	Opcodes.prototype.PRELD(args);
};
Opcodes.prototype.PREST = function(args) {warning('PREST: Not Implemented');iptr += 4};
Opcodes.prototype.PRESTI = function(args) {
	Opcodes.prototype.PREST(args);
};
Opcodes.prototype.PUSHGO = function(args) {warning('PUSHGO: Not Implemented');iptr += 4};
Opcodes.prototype.PUSHGOI = function(args) {
	Opcodes.prototype.PUSHGO(args);
};
Opcodes.prototype.PUSHJ = function(args) {warning('PUSHJ: Not Implemented');iptr += 4};
Opcodes.prototype.PUSHJB = function(args) {warning('PUSHJB: Not Implemented');iptr += 4};
Opcodes.prototype.PUT = function(args) {warning('PUT: Not Implemented');iptr += 4};
Opcodes.prototype.PUTI = function(args) {
	Opcodes.prototype.PUT(args);
};
Opcodes.prototype.RESUME = function(args) {warning('RESUME: Not Implemented');iptr += 4};
Opcodes.prototype.SADD = function(args) {warning('SADD: Not Implemented');iptr += 4};
Opcodes.prototype.SADDI = function(args) {
	Opcodes.prototype.SADD(args);
};
Opcodes.prototype.SAVE = function(args) {warning('SAVE: Not Implemented');iptr += 4};
Opcodes.prototype.SETH = function(args) {warning('SETH: Not Implemented');iptr += 4};
Opcodes.prototype.SETL = function(args) {warning('SETL: Not Implemented');iptr += 4};
Opcodes.prototype.SETMH = function(args) {warning('SETMH: Not Implemented');iptr += 4};
Opcodes.prototype.SETML = function(args) {warning('SETML: Not Implemented');iptr += 4};
Opcodes.prototype.SFLOT = function(args) {warning('SFLOT: Not Implemented');iptr += 4};
Opcodes.prototype.SFLOTI = function(args) {
	Opcodes.prototype.SFLOT(args);
};
Opcodes.prototype.SFLOTU = function(args) {warning('SFLOTU: Not Implemented');iptr += 4};
Opcodes.prototype.SFLOTUI = function(args) {
	Opcodes.prototype.SFLOTU(args);
};
Opcodes.prototype.SL = function(args) {
	// a = b << c
	// a = args[0]
	// b = args[1]
	// c = args[2]
	debug('SL: ' + args);
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var shiftamount = c.getUint64();
	var a = new ByteArray();
	if (shiftamount < 32) {
		var mask = 0xffffffff << (32 - shiftamount);
		var overflowbits = (b.uint64[1] & mask) >>> (32 - shiftamount);
		a.uint64[1] = (b.uint64[1] << shiftamount) | overflowbits;
		a.uint64[0] = b.uint64[0] << shiftamount;
	} else {
		var overflowbits = b.uint64[1] << (shiftamount % 32);
		a.uint64[0] = 0;
		a.uint64[1] = overflowbits;
	}
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.SLI = function(args) {
	Opcodes.prototype.SL(args);
};
Opcodes.prototype.SLU = function(args) {
	// a = b << c
	// a = args[0]
	// b = args[1]
	// c = args[2]
	debug('SLU: ' + args);
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var shiftamount = c.getUint64();
	var a = new ByteArray();
	if (shiftamount < 32) {
		var mask = 0xffffffff << (32 - shiftamount);
		var overflowbits = (b.uint64[1] & mask) >>> (32 - shiftamount);
		a.uint64[1] = (b.uint64[1] << shiftamount) | overflowbits;
		a.uint64[0] = b.uint64[0] << shiftamount;
	} else {
		var overflowbits = b.uint64[1] << (shiftamount % 32);
		a.uint64[0] = 0;
		a.uint64[1] = overflowbits;
	}
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.SLUI = function(args) {
	Opcodes.prototype.SLU(args);
};
Opcodes.prototype.SR = function(args) {
	// a = b >> c
	// a = args[0]
	// b = args[1]
	// c = args[2]
	debug('SR: ' + args);
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var shiftamount = c.getUint64();
	var a = new ByteArray();
	if (shiftamount < 32) {
		var mask = ~(0xffffffff << shiftamount);
		var overflowbits = (b.uint64[1] & mask) << (32 - shiftamount);
		a.uint64[1] = b.uint64[1] >> shiftamount;
		a.uint64[0] = (b.uint64[0] >>> shiftamount) | overflowbits;
	} else {
		var mask = 0xffffffff << (shiftamount % 32);
		var overflowbits = (b.uint64[1] & mask) >> (shiftamount % 32);
		a.uint64[1] = b.int64[1] < 0 ? 0xffffffff : 0;
		a.uint64[0] = overflowbits;
	}
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.SRI = function(args) {
	Opcodes.prototype.SR(args);
};
Opcodes.prototype.SRU = function(args) {
	// a = b >>> c
	// a = args[0]
	// b = args[1]
	// c = args[2]
	debug('SRU: ' + args);
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var shiftamount = c.getUint64();
	var a = new ByteArray();
	if (shiftamount < 32) {
		var mask = ~(0xffffffff << shiftamount);
		var overflowbits = (b.uint64[1] & mask) << (32 - shiftamount);
		a.uint64[1] = b.uint64[1] >>> shiftamount;
		a.uint64[0] = (b.uint64[0] >>> shiftamount) | overflowbits;
	} else {
		var mask = 0xffffffff << (shiftamount % 32);
		var overflowbits = (b.uint64[1] & mask) >>> (shiftamount % 32);
		a.uint64[1] = 0;
		a.uint64[0] = overflowbits;
	}
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.SRUI = function(args) {
	Opcodes.prototype.SRU(args);
};
Opcodes.prototype.STB = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('STB: ' + args);
	var val = Registers[getReg(args[0])];
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var byteoffset = Math.abs((memaddr % 4) * 8 - 24);
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	if (!memval) {
		memval = new ByteArray();
		memval.setUint64(0);
		Memory[memaddr] = memval;
	}
	var mask = 0xff;
	memval.uint64[bytepos] &= ~(mask << byteoffset);
	memval.uint64[bytepos] |= (val.uint64[0] & mask) << byteoffset;
	iptr += 4;
};
Opcodes.prototype.STBI = function(args) {
	Opcodes.prototype.STB(args);
};
Opcodes.prototype.STBU = function(args) {
	Opcodes.prototype.STB(args);
};
Opcodes.prototype.STBUI = function(args) {
	Opcodes.prototype.STBU(args);
};
Opcodes.prototype.STCO = function(args) {
	// const = args[0]
	// addr = args[1] + args[2]
	debug('STCO: ' + args);
	var val = new  ByteArray();
	val.setFromString(args[0]);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	Memory[memaddr] = val; 
	iptr += 4;
};
Opcodes.prototype.STCOI = function(args) {
	Opcodes.prototype.STCO(args);
};
Opcodes.prototype.STHT = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('STHT: ' + args);
	var val = Registers[getReg(args[0])];
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	if (!memval) {
		memval = new ByteArray();
		memval.setUint64(0);
		Memory[memaddr] = memval;
	}
	memval.uint64[bytepos] = val.uint64[1];
	iptr += 4;
};
Opcodes.prototype.STHTI = function(args) {
	Opcodes.prototype.STHT(args);
};
Opcodes.prototype.STO = function(args) {
	// reg = args[0]
	// addr = args[1] + args[2]
	debug('STO: ' + args);
	var val = copyValue(Registers[getReg(args[0])]);
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	Memory[memaddr] = val; 
	iptr += 4;
};
Opcodes.prototype.STOI = function(args) {
	Opcodes.prototype.STO(args);
};
Opcodes.prototype.STOU = function(args) {
	Opcodes.prototype.STO(args);
};
Opcodes.prototype.STUNC = function(args) {warning('STUNC: Not Implemented');iptr += 4};
Opcodes.prototype.STUNCI = function(args) {
	Opcodes.prototype.STUNC(args);
};
Opcodes.prototype.STOUI = function(args) {
	Opcodes.prototype.STOU(args);
};
Opcodes.prototype.STSF = function(args) {warning('STSF: Not Implemented');iptr += 4};
Opcodes.prototype.STSFI = function(args) {
	Opcodes.prototype.STSF(args);
};
Opcodes.prototype.STT = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('STT: ' + args);
	var val = Registers[getReg(args[0])];
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	if (!memval) {
		memval = new ByteArray();
		memval.setUint64(0);
		Memory[memaddr] = memval;
	}
	memval.uint64[bytepos] = val.uint64[0];
	iptr += 4;
};
Opcodes.prototype.STTI = function(args) {
	Opcodes.prototype.STT(args);
};
Opcodes.prototype.STTU = function(args) {
	Opcodes.prototype.STT(args);
};
Opcodes.prototype.STTUI = function(args) {
	Opcodes.prototype.STTU(args);
};
Opcodes.prototype.STW = function(args) {
	// val = args[0]
	// addr = args[1] + args[2]
	debug('STW: ' + args);
	var val = Registers[getReg(args[0])];
	var addr = Registers[getReg(args[1])];
	var offset = getValue(args[2]);
	var memaddr = addr.getUint64() + offset.getUint64();
	var wideoffset = ((Math.floor((memaddr % 4) / 2) + 1) % 2) * 16;
	var bytepos = (Math.floor((memaddr % 8) / 4) + 1) % 2;
	memaddr -= memaddr % 8; // take the floor to the nearest multiple of 8
	var memval = Memory[memaddr];
	if (!memval) {
		memval = new ByteArray();
		memval.setUint64(0);
		Memory[memaddr] = memval;
	}
	var mask = 0xffff;
	memval.uint64[bytepos] &= ~(mask << wideoffset);
	memval.uint64[bytepos] |= (val.uint64[0] & mask) << wideoffset;
	iptr += 4;
};
Opcodes.prototype.STWI = function(args) {
	Opcodes.prototype.STW(args);
};
Opcodes.prototype.STWU = function(args) {
	Opcodes.prototype.STW(args);
};
Opcodes.prototype.STWUI = function(args) {
	Opcodes.prototype.STWU(args);
};
Opcodes.prototype.SUB = function(args) {
	// a = b - c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('SUB: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var offset = 0;
	a.uint64[0] = b.uint64[0] - c.uint64[0];
	if (a.uint64[0] > b.uint64[0]) {
		offset = 1;
	}
	a.uint64[1] = b.uint64[1] - c.uint64[1] - offset;
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.SUBI = function(args) {
	Opcodes.prototype.SUB(args);
};
Opcodes.prototype.SUBU = function(args) {
	// a = b - c
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('SUBU: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	var offset = 0;
	a.uint64[0] = b.uint64[0] - c.uint64[0];
	if (a.uint64[0] > b.uint64[0]) {
		offset = 1;
	}
	a.uint64[1] = b.uint64[1] - c.uint64[1] - offset;
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.SUBUI = function(args) {
	Opcodes.prototype.SUBU(args);
};
Opcodes.prototype.SWYM = function(args) {warning('SWYM: Not Implemented');iptr += 4};
Opcodes.prototype.SYNC = function(args) {warning('SYNC: Not Implemented');iptr += 4};
Opcodes.prototype.SYNCD = function(args) {warning('SYNCD: Not Implemented');iptr += 4};
Opcodes.prototype.SYNCDI = function(args) {
	Opcodes.prototype.SYNCD(args);
};
Opcodes.prototype.SYNCID = function(args) {warning('SYNCID: Not Implemented');iptr += 4};
Opcodes.prototype.SYNCIDI = function(args) {
	Opcodes.prototype.SYNCID(args);
};
Opcodes.prototype.TDIF = function(args) {warning('TDIF: Not Implemented');iptr += 4};
Opcodes.prototype.TDIFI = function(args) {
	Opcodes.prototype.TDIF(args);
};
Opcodes.prototype.TRIP = function(args) {warning('TRIP: Not Implemented');iptr += 4};
Opcodes.prototype.TRAP = function(args) {
	debug('TRAP: ' + args);
	TrapOps[args[1]]();
};
Opcodes.prototype.UNSAVE = function(args) {warning('UNSAVE: Not Implemented');iptr += 4};
Opcodes.prototype.WDIF = function(args) {warning('WDIF: Not Implemented');iptr += 4};
Opcodes.prototype.WDIFI = function(args) {
	Opcodes.prototype.WDIF(args);
};
Opcodes.prototype.XOR = function(args) {
	// rega = regb ^ regc
	// var rega = args[0];
	// var regb = args[1];
	// var regc = args[2];
	debug('XOR: ' + args);
	var a = new ByteArray();
	var b = Registers[getReg(args[1])];
	var c = getValue(args[2]);
	a.uint64[0] = b.uint64[0] ^ c.uint64[0];
	a.uint64[1] = b.uint64[1] ^ c.uint64[1];
	Registers[getReg(args[0])] = a;
	iptr += 4;
};
Opcodes.prototype.XORI = function(args) {
	Opcodes.prototype.XOR(args);
};
Opcodes.prototype.ZSEV = function(args) {
	// if y % 2 == 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSEV: ' + args);
	var y = Registers[getReg(args[1])];
	var x;
	if (y.uint64[0] % 2 == 0) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;
	iptr += 4;
};
Opcodes.prototype.ZSEVI = function(args) {
	Opcodes.prototype.ZSEV(args);
};
Opcodes.prototype.ZSN = function(args) {
	// if y < 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSN: ' + args);	
	var y = Registers[getReg(args[1])];
	var x;
	if (y.getInt64() < 0) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;
	iptr += 4;
};
Opcodes.prototype.ZSNI = function(args) {
	Opcodes.prototype.ZSN(args);
};
Opcodes.prototype.ZSNN = function(args) {
	// if y >= 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSNN: ' + args);	
	var y = Registers[getReg(args[1])];
	var x;
	if (y.getInt64() >= 0) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;
	iptr += 4;
};
Opcodes.prototype.ZSNNI = function(args) {
	Opcodes.prototype.ZSNN(args);
};
Opcodes.prototype.ZSNP = function(args) {
	// if y <= 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSNP: ' + args);	
	var y = Registers[getReg(args[1])];
	var x;
	if (y.getInt64() <= 0) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;
	iptr += 4;
};
Opcodes.prototype.ZSNPI = function(args) {
	Opcodes.prototype.ZSNP(args);
};
Opcodes.prototype.ZSNZ = function(args) {
	// if y != 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSNZ: ' + args);	
	var y = Registers[getReg(args[1])];
	var x;
	if (y.getInt64() != 0) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;
	iptr += 4;
};
Opcodes.prototype.ZSNZI = function(args) {
	Opcodes.prototype.ZSNZ(args);
};
Opcodes.prototype.ZSOD = function(args) {
	// if y % 2 == 1 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSOD: ' + args);
	var y = Registers[getReg(args[1])];
	var x;
	if (y.uint64[0] % 2 == 1) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;	
	iptr += 4;
};
Opcodes.prototype.ZSODI = function(args) {
	Opcodes.prototype.ZSOD(args);
};
Opcodes.prototype.ZSP = function(args) {
	// if y > 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSP: ' + args);	
	var y = Registers[getReg(args[1])];
	var x;
	if (y.getInt64() > 0) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;	
	iptr += 4;
};
Opcodes.prototype.ZSPI = function(args) {
	Opcodes.prototype.ZSP(args);
};
Opcodes.prototype.ZSZ = function(args) {
	// if y == 0; x = z;
	// x = args[0]
	// y = args[1]
	// z = args[2]
	debug('ZSZ: ' + args);	
	var y = Registers[getReg(args[1])];
	var x;
	if (y.getInt64() == 0) {
		var z = getValue(args[2]);
		x = copyValue(z);
	} else {
		x = new ByteArray();
		x.setUint64(0);
	}
	Registers[getReg(args[0])] = x;	
	iptr += 4;
};
Opcodes.prototype.ZSZI = function(args) {
	Opcodes.prototype.ZSZ(args);
};

var nop = function(x){
	debug('NOP: ' + x);
	warning('NOP: ' + x);
	iptr += 4;
};


function run(maxops) {
	var Ops = new Opcodes();
	console.log('Started execution at addr: ' + iptr);
	var numops = 0;

	while (iptr !== 'undefined') {
		// get the current instruction from our Code at 'iptr'
		var icurr = Code[iptr];
		// find the operation in 'ops' if we can't find it, we turn into a nop
		var op = Ops[icurr[0]];
		// get the arguments for the operation, if none set to null
		var args = icurr[1] ? icurr[1].split(',') : [];
		// perform the operation, passing in the args
		if (!op) {
			op = nop;
			args.unshift(icurr[0]);
		}
		op(args);

		numops++;
		if (maxops && maxops <= numops) {
			break;
		}
	}
	console.log('Finished execution after ' + numops + ' operations');
	return numops;
}


function loadIntoMem(src) {
	for (var i = 0; i < src.length*4; i+=4) {
		// console.log(src[i]);
		// We have line[0] = lable
		// We have line[1] = opcode
		// We have line[2] = args
		var line = src[i/4];
		if (line[0]) {
			// we have a lable so process it
			if (line[1] === 'IS') {
				// we dont handle the case where 'lable IS lable'
				// we are an 'IS' statement
				if (line[2][0] === '$') {
					// set up a ref to an actual register
					RegLabels[line[0]] = line[2];
				} else {
					// we are a constant, so set it up
					var val = new ByteArray();
					val.setFromString(line[2]);
					Constants[line[0]] = val;
				}
				line = ''; // set to empty, so we dont acutally put in mem (well, Code)
			} else if(line[1] === 'GREG') {
				// we are global register, so add to the lables and set the val
				var greg = '$' + --gregptr;
				RegLabels[line[0]] = greg;
				var val = new ByteArray();
				val.setFromString(line[2]);
				Registers[greg] = val;
			} else {
				// we are a normal label, add to the Labels list
				Labels[line[0]] = i;
			}
		}
		Code[i] = [line[1], line[2]];
	}
	stkptr = 0;
}


function parseRawText(data) {
	data = data.split('\n');
	for (var i = 0; i < data.length; i++) {
		data[i] = data[i].split('\t');
	}
	return data;
}

// this should not be called outside of node
function readSrcFile(fname) {
	return parseRawText(fs.readFileSync(fname, 'utf8'));
}

if (NodeEnv) {
	var fname = process.argv[2];
	var src = readSrcFile(fname);
	gregptr = 255
	loadIntoMem(src);
	console.log(RegLabels);
	iptr = Labels['Main'];
	// console.log(Registers);
	run();
	console.log(Registers);
}

	