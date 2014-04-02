
fs = require('fs');
types = require('./types.js');
ByteArray = types.ByteArray;


function MmixInterpreter() {
}

var Registers = []; // array of registers, registers look like $0, $1 etc.
var RegLabels = {}; // mapping of labels to actual registers eg. {a : $1}
var SpecialReg = []; // TODO: special registers for overflow and such
var Memory = []; // Our array of Memory cells
var Code = []; // Array of instructions, sould only have entries on multiples of 8
var Labels = {}; // mapping of labels to code positions in the Code array 
var Constants = {}; // mapping of labels to constant values
var iptr; // instruction pointer
var stkptr; // current pointer into available Memory
var gregptr = 255; // points to the last allocated global reg ($255 is alwyas global)

var dbgopts = true;
function debug(str) {
	if (dbgopts) {
		console.log('DBG - ' + str);		
	}
}

var warnings = true;
function warn(str) {
	if (warnings) {
		console.log('Warning - ' + str);
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
	// we are an immediate so create a new ByteArray and put it in
	var val = new ByteArray();
	val.setFromString(symbol);
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
		var data = Memory[Registers['$255']];
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

Opcodes.prototype['2ADDU'] = function(args) {console.log('2ADDU: Not Implemented');iptr += 4};
Opcodes.prototype['2ADDUI'] = function(args) {
	Opcodes.prototype['2ADDU'](args);
};
Opcodes.prototype['4ADDU'] = function(args) {console.log('4ADDU: Not Implemented');iptr += 4};
Opcodes.prototype['4ADDUI'] = function(args) {
	Opcodes.prototype['4ADDU'](args);
};
Opcodes.prototype['8ADDU'] = function(args) {console.log('8ADDU: Not Implemented');iptr += 4};
Opcodes.prototype['8ADDUI'] = function(args) {
	Opcodes.prototype['8ADDU'](args);
};
Opcodes.prototype['16ADDU'] = function(args) {console.log('16ADDU: Not Implemented');iptr += 4};
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
Opcodes.prototype.ANDNH = function(args) {console.log('ANDNH: Not Implemented');iptr += 4};
Opcodes.prototype.ANDNI = function(args) {
	Opcodes.prototype.ANDN(args);
};
Opcodes.prototype.ANDNL = function(args) {console.log('ANDNL: Not Implemented');iptr += 4};
Opcodes.prototype.ANDNMH = function(args) {console.log('ANDNMH: Not Implemented');iptr += 4};
Opcodes.prototype.ANDNML = function(args) {console.log('ANDNML: Not Implemented');iptr += 4};
Opcodes.prototype.BDIF = function(args) {console.log('BDIF: Not Implemented');iptr += 4};
Opcodes.prototype.BDIFI = function(args) {
	Opcodes.prototype.BDIF(args);
};
Opcodes.prototype.BEV = function(args) {console.log('BEV: Not Implemented');iptr += 4};
Opcodes.prototype.BEVB = function(args) {console.log('BEVB: Not Implemented');iptr += 4};
Opcodes.prototype.BN = function(args) {console.log('BN: Not Implemented');iptr += 4};
Opcodes.prototype.BNB = function(args) {console.log('BNB: Not Implemented');iptr += 4};
Opcodes.prototype.BNN = function(args) {console.log('BNN: Not Implemented');iptr += 4};
Opcodes.prototype.BNNB = function(args) {console.log('BNNB: Not Implemented');iptr += 4};
Opcodes.prototype.BNP = function(args) {console.log('BNP: Not Implemented');iptr += 4};
Opcodes.prototype.BNPB = function(args) {console.log('BNPB: Not Implemented');iptr += 4};
Opcodes.prototype.BNZ = function(args) {console.log('BNZ: Not Implemented');iptr += 4};
Opcodes.prototype.BNZB = function(args) {console.log('BNZB: Not Implemented');iptr += 4};
Opcodes.prototype.BOD = function(args) {console.log('BOD: Not Implemented');iptr += 4};
Opcodes.prototype.BODB = function(args) {console.log('BODB: Not Implemented');iptr += 4};
Opcodes.prototype.BP = function(args) {console.log('BP: Not Implemented');iptr += 4};
Opcodes.prototype.BPB = function(args) {console.log('BPB: Not Implemented');iptr += 4};
Opcodes.prototype.BZ = function(args) {console.log('BZ: Not Implemented');iptr += 4};
Opcodes.prototype.BZB = function(args) {console.log('BZB: Not Implemented');iptr += 4};
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
Opcodes.prototype.CSWAP = function(args) {console.log('CSWAP: Not Implemented');iptr += 4};
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
Opcodes.prototype.DIV = function(args) {console.log('DIV: Not Implemented');iptr += 4};
Opcodes.prototype.DIVI = function(args) {
	Opcodes.prototype.DIV(args);
};
Opcodes.prototype.DIVU = function(args) {console.log('DIVU: Not Implemented');iptr += 4};
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
Opcodes.prototype.FCMP = function(args) {console.log('FCMP: Not Implemented');iptr += 4};
Opcodes.prototype.FCMPE = function(args) {console.log('FCMPE: Not Implemented');iptr += 4};
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
Opcodes.prototype.FEQL = function(args) {console.log('FEQL: Not Implemented');iptr += 4};
Opcodes.prototype.FEQLE = function(args) {console.log('FEQLE: Not Implemented');iptr += 4};
Opcodes.prototype.FINT = function(args) {console.log('FINT: Not Implemented');iptr += 4};
Opcodes.prototype.FIX = function(args) {console.log('FIX: Not Implemented');iptr += 4};
Opcodes.prototype.FIXU = function(args) {console.log('FIXU: Not Implemented');iptr += 4};
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
Opcodes.prototype.FLOTU = function(args) {console.log('FLOTU: Not Implemented');iptr += 4};
Opcodes.prototype.FLOTUI = function(args) {console.log('FLOTUI: Not Implemented');iptr += 4};
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
Opcodes.prototype.FREM = function(args) {console.log('FREM: Not Implemented');iptr += 4};
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
Opcodes.prototype.FUN = function(args) {console.log('FUN: Not Implemented');iptr += 4};
Opcodes.prototype.FUNE = function(args) {console.log('FUNE: Not Implemented');iptr += 4};
Opcodes.prototype.GET = function(args) {console.log('GET: Not Implemented');iptr += 4};
Opcodes.prototype.GETA = function(args) {console.log('GETA: Not Implemented');iptr += 4};
Opcodes.prototype.GETAB = function(args) {console.log('GETAB: Not Implemented');iptr += 4};
Opcodes.prototype.GO = function(args) {console.log('GO: Not Implemented');iptr += 4};
Opcodes.prototype.GOI = function(args) {
	Opcodes.prototype.GO(args);
};
Opcodes.prototype.INCH = function(args) {console.log('INCH: Not Implemented');iptr += 4};
Opcodes.prototype.INCL = function(args) {console.log('INCL: Not Implemented');iptr += 4};
Opcodes.prototype.INCMH = function(args) {console.log('INCMH: Not Implemented');iptr += 4};
Opcodes.prototype.INCML = function(args) {console.log('INCML: Not Implemented');iptr += 4};
Opcodes.prototype.JMP = function(args) {console.log('JMP: Not Implemented');iptr += 4};
Opcodes.prototype.JMPB = function(args) {console.log('JMPB: Not Implemented');iptr += 4};
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
		warn('Loading Memory from unset location with LDBU:' + args);
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
		warn('Loading Memory from unset location with LDBU:' + args);
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
		warn('Loading Memory from unset location with LDHT:' + args);
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
		warn('Loading Memory from unset location with LDO:' + args);
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
Opcodes.prototype.LDUNC = function(args) {console.log('LDUNC: Not Implemented');iptr += 4};
Opcodes.prototype.LDUNCI = function(args) {
	Opcodes.prototype.LDUNC(args);
};
Opcodes.prototype.LDOUI = function(args) {
	Opcodes.prototype.LDOU(args);
};
Opcodes.prototype.LDSF = function(args) {console.log('LDSF: Not Implemented');iptr += 4};
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
		warn('Loading Memory from unset location with LDT:' + args);
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
		warn('Loading Memory from unset location with LDTU:' + args);
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
Opcodes.prototype.LDVTS = function(args) {console.log('LDVTS: Not Implemented');iptr += 4};
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
		warn('Loading Memory from unset location with LDWU:' + args);
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
		warn('Loading Memory from unset location with LDWU:' + args);
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
Opcodes.prototype.MOR = function(args) {console.log('MOR: Not Implemented');iptr += 4};
Opcodes.prototype.MORI = function(args) {
	Opcodes.prototype.MOR(args);
};
Opcodes.prototype.MUL = function(args) {console.log('MUL: Not Implemented');iptr += 4};
Opcodes.prototype.MULI = function(args) {
	Opcodes.prototype.MUL(args);
};
Opcodes.prototype.MULU = function(args) {console.log('MULU: Not Implemented');iptr += 4};
Opcodes.prototype.MULUI = function(args) {
	Opcodes.prototype.MULU(args);
};
Opcodes.prototype.MUX = function(args) {console.log('MUX: Not Implemented');iptr += 4};
Opcodes.prototype.MUXI = function(args) {
	Opcodes.prototype.MUX(args);
};
Opcodes.prototype.MXOR = function(args) {console.log('MXOR: Not Implemented');iptr += 4};
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
Opcodes.prototype.ODIF = function(args) {console.log('ODIF: Not Implemented');iptr += 4};
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
Opcodes.prototype.ORH = function(args) {console.log('ORH: Not Implemented');iptr += 4};
Opcodes.prototype.ORI = function(args) {
	Opcodes.prototype.OR(args);
};
Opcodes.prototype.ORL = function(args) {console.log('ORL: Not Implemented');iptr += 4};
Opcodes.prototype.ORMH = function(args) {console.log('ORMH: Not Implemented');iptr += 4};
Opcodes.prototype.ORML = function(args) {console.log('ORML: Not Implemented');iptr += 4};
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
Opcodes.prototype.PBEV = function(args) {console.log('PBEV: Not Implemented');iptr += 4};
Opcodes.prototype.PBEVB = function(args) {console.log('PBEVB: Not Implemented');iptr += 4};
Opcodes.prototype.PBN = function(args) {console.log('PBN: Not Implemented');iptr += 4};
Opcodes.prototype.PBNB = function(args) {console.log('PBNB: Not Implemented');iptr += 4};
Opcodes.prototype.PBNN = function(args) {console.log('PBNN: Not Implemented');iptr += 4};
Opcodes.prototype.PBNNB = function(args) {console.log('PBNNB: Not Implemented');iptr += 4};
Opcodes.prototype.PBNP = function(args) {console.log('PBNP: Not Implemented');iptr += 4};
Opcodes.prototype.PBNPB = function(args) {console.log('PBNPB: Not Implemented');iptr += 4};
Opcodes.prototype.PBNZ = function(args) {console.log('PBNZ: Not Implemented');iptr += 4};
Opcodes.prototype.PBNZB = function(args) {console.log('PBNZB: Not Implemented');iptr += 4};
Opcodes.prototype.PBOD = function(args) {console.log('PBOD: Not Implemented');iptr += 4};
Opcodes.prototype.PBODB = function(args) {console.log('PBODB: Not Implemented');iptr += 4};
Opcodes.prototype.PBP = function(args) {console.log('PBP: Not Implemented');iptr += 4};
Opcodes.prototype.PBPB = function(args) {console.log('PBPB: Not Implemented');iptr += 4};
Opcodes.prototype.PBZ = function(args) {console.log('PBZ: Not Implemented');iptr += 4};
Opcodes.prototype.PBZB = function(args) {console.log('PBZB: Not Implemented');iptr += 4};
Opcodes.prototype.POP = function(args) {console.log('POP: Not Implemented');iptr += 4};
Opcodes.prototype.PREGO = function(args) {console.log('PREGO: Not Implemented');iptr += 4};
Opcodes.prototype.PREGOI = function(args) {
	Opcodes.prototype.PREGO(args);
};
Opcodes.prototype.PRELD = function(args) {console.log('PRELD: Not Implemented');iptr += 4};
Opcodes.prototype.PRELDI = function(args) {
	Opcodes.prototype.PRELD(args);
};
Opcodes.prototype.PREST = function(args) {console.log('PREST: Not Implemented');iptr += 4};
Opcodes.prototype.PRESTI = function(args) {
	Opcodes.prototype.PREST(args);
};
Opcodes.prototype.PUSHGO = function(args) {console.log('PUSHGO: Not Implemented');iptr += 4};
Opcodes.prototype.PUSHGOI = function(args) {
	Opcodes.prototype.PUSHGO(args);
};
Opcodes.prototype.PUSHJ = function(args) {console.log('PUSHJ: Not Implemented');iptr += 4};
Opcodes.prototype.PUSHJB = function(args) {console.log('PUSHJB: Not Implemented');iptr += 4};
Opcodes.prototype.PUT = function(args) {console.log('PUT: Not Implemented');iptr += 4};
Opcodes.prototype.PUTI = function(args) {
	Opcodes.prototype.PUT(args);
};
Opcodes.prototype.RESUME = function(args) {console.log('RESUME: Not Implemented');iptr += 4};
Opcodes.prototype.SADD = function(args) {console.log('SADD: Not Implemented');iptr += 4};
Opcodes.prototype.SADDI = function(args) {
	Opcodes.prototype.SADD(args);
};
Opcodes.prototype.SAVE = function(args) {console.log('SAVE: Not Implemented');iptr += 4};
Opcodes.prototype.SETH = function(args) {console.log('SETH: Not Implemented');iptr += 4};
Opcodes.prototype.SETL = function(args) {console.log('SETL: Not Implemented');iptr += 4};
Opcodes.prototype.SETMH = function(args) {console.log('SETMH: Not Implemented');iptr += 4};
Opcodes.prototype.SETML = function(args) {console.log('SETML: Not Implemented');iptr += 4};
Opcodes.prototype.SFLOT = function(args) {console.log('SFLOT: Not Implemented');iptr += 4};
Opcodes.prototype.SFLOTI = function(args) {
	Opcodes.prototype.SFLOT(args);
};
Opcodes.prototype.SFLOTU = function(args) {console.log('SFLOTU: Not Implemented');iptr += 4};
Opcodes.prototype.SFLOTUI = function(args) {
	Opcodes.prototype.SFLOTU(args);
};
Opcodes.prototype.SL = function(args) {console.log('SL: Not Implemented');iptr += 4};
Opcodes.prototype.SLI = function(args) {
	Opcodes.prototype.SL(args);
};
Opcodes.prototype.SLU = function(args) {console.log('SLU: Not Implemented');iptr += 4};
Opcodes.prototype.SLUI = function(args) {
	Opcodes.prototype.SLU(args);
};
Opcodes.prototype.SR = function(args) {console.log('SR: Not Implemented');iptr += 4};
Opcodes.prototype.SRI = function(args) {
	Opcodes.prototype.SR(args);
};
Opcodes.prototype.SRU = function(args) {console.log('SRU: Not Implemented');iptr += 4};
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
Opcodes.prototype.STUNC = function(args) {console.log('STUNC: Not Implemented');iptr += 4};
Opcodes.prototype.STUNCI = function(args) {
	Opcodes.prototype.STUNC(args);
};
Opcodes.prototype.STOUI = function(args) {
	Opcodes.prototype.STOU(args);
};
Opcodes.prototype.STSF = function(args) {console.log('STSF: Not Implemented');iptr += 4};
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
Opcodes.prototype.SWYM = function(args) {console.log('SWYM: Not Implemented');iptr += 4};
Opcodes.prototype.SYNC = function(args) {console.log('SYNC: Not Implemented');iptr += 4};
Opcodes.prototype.SYNCD = function(args) {console.log('SYNCD: Not Implemented');iptr += 4};
Opcodes.prototype.SYNCDI = function(args) {
	Opcodes.prototype.SYNCD(args);
};
Opcodes.prototype.SYNCID = function(args) {console.log('SYNCID: Not Implemented');iptr += 4};
Opcodes.prototype.SYNCIDI = function(args) {
	Opcodes.prototype.SYNCID(args);
};
Opcodes.prototype.TDIF = function(args) {console.log('TDIF: Not Implemented');iptr += 4};
Opcodes.prototype.TDIFI = function(args) {
	Opcodes.prototype.TDIF(args);
};
Opcodes.prototype.TRIP = function(args) {console.log('TRIP: Not Implemented');iptr += 4};
Opcodes.prototype.TRAP = function(args) {
	debug('TRAP: ' + args);
	TrapOps[args[1]]();
};
Opcodes.prototype.UNSAVE = function(args) {console.log('UNSAVE: Not Implemented');iptr += 4};
Opcodes.prototype.WDIF = function(args) {console.log('WDIF: Not Implemented');iptr += 4};
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
	iptr += 4;
};


function run() {
	var Ops = new Opcodes();
	console.log('Started execution at addr: ' + iptr);
	var numops = 0;

	while (iptr !== 'undefined') {
		// get the current instruction from our Code at 'iptr'
		var icurr = Code[iptr];
		// find the operation in 'ops' if we can't find it, we turn into a nop
		var op = Ops[icurr[0]] || nop;
		// get the arguments for the operation, if none set to null
		var args = icurr[1] ? icurr[1].split(',') : null;
		// perform the operation, passing in the args
		op(args);
		//op.apply(this, args);
		numops++;
	}

	console.log('Finished execution after ' + numops + ' operations');
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
				line = ''; // set to empty, so we dont acutally put in mem
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


function readSrcFile(fname) {
	data = fs.readFileSync(fname, 'utf8');
	data = data.split('\n');
	for (var i = 0; i < data.length; i++) {
		data[i] = data[i].split('\t');
	}
	return data;
}

src = readSrcFile('../mms/test.mms');
loadIntoMem(src);
console.log(RegLabels);
iptr = Labels['Main'];
// console.log(Registers);
run();
console.log(Registers);
// console.log(Memory[ 64 - (64 % 8) ]);

