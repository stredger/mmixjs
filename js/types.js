

function ByteArray() {
	// our array of 8 bytes
	this.bytes = new ArrayBuffer(8);
	// these views allow us to extract data from 
	//  the buffer like a union in c!
	this.float64 = new Float64Array(this.bytes);
	this.int64 = new Int32Array(this.bytes);
	this.uint64 = new Uint32Array(this.bytes);
}

ByteArray.prototype.setFloat64 = function(num) {
	num = Number(num);
	this.float64[0] = num;
};
ByteArray.prototype.getFloat64 = function() {
	return this.float64[0];
};

ByteArray.prototype.setUint64 = function(num) {
	num = Number(num);
	this.uint64[1] = num / 4294967296; // decimals just turn into 0
	this.uint64[0] = num % 4294967296;
};
ByteArray.prototype.getUint64 = function() {
	return this.uint64[0] + 4294967296*this.uint64[1];
};

ByteArray.prototype.setInt64 = function(num) {
	num = Number(num);
	if (num < 0) {
		num = Math.abs(num)
		// 2's compliment low bits
		var lowbits = -(num % 4294967296);
		// in case of overflow, get the low bits again
		this.int64[0] = -(Math.abs(lowbits) % 4294967296);
		// if we have overflow (r == 0), take the 2's compliment of
		//  the high bits, otherwise we just want the compliment
		this.int64[1] = (lowbits == 0) ? -(num / 4294967296) : ~(num / 4294967296);
	} else {
		this.int64[1] = num / 4294967296;
		this.uint64[0] = num % 4294967296;
	}
};
ByteArray.prototype.getInt64 = function() {
	if (this.int64[1] < 0) {
		// If we are negative then we have to either do the 2's complement on 
		//  the high bits or the low bits, and just compliment the other. If the  
		//  low bits are all 0 then we know we have to 2's comp the high bits as 
		//  we had overflow when we 2's comped it before. This get the magnitude 
		//  of the value, we negate to get the actual val back.
		var lowbits = (this.uint64[0] == 0) ? ~(this.uint64[0]): ~(this.uint64[0]) + 1;
		var highbits = (this.uint64[0] == 0) ? ~(this.uint64[1]) + 1: ~(this.uint64[1]);
		return -(lowbits + 4294967296*highbits);
	} else {
		return this.getUint64();
	}
};

ByteArray.prototype.setUint32 = function(num) {
	num = Number(num);
	this.uint64[0] = num;
	this.uint64[1] = 0;	
};
ByteArray.prototype.getUint32 = function() {
	return this.uint64[0];
};

ByteArray.prototype.setInt32 = function(num) {
	num = Number(num);
	this.int64[0] = num;
	this.int64[1] = 0;
};
ByteArray.prototype.getInt32 = function() {
	return this.int64[0];
};

ByteArray.prototype.setInt64FromHexString = function(numstr) {
	var zerostoadd = Array(16 - numstr.length + 1).join('0');
	numstr = zerostoadd + numstr;
	var highbits = '0x' + numstr.slice(0,8);
	var lowbits = '0x' + numstr.slice(8);
	this.int64[1] = parseInt(highbits);
	this.int64[0] = parseInt(lowbits);
}

ByteArray.prototype.setFromString = function(numstr) {
	if ('#' === numstr[0]) {
		this.setInt64FromHexString(numstr.slice(1));
	} else if (numstr.indexOf('.') != -1) {
		this.setFloat64(numstr);
	} else {
		this.setInt64(numstr);
	}
}


ByteArray.prototype.inspect = function() {
	// gives the hex value of whatever is in the ByteArray buffer
	var hival = Number(this.uint64[1]).toString(16);
	var lowval = Number(this.uint64[0]).toString(16);
	var hizerostoadd = Array(8 - hival.length + 1).join('0');
	var lowzerostoadd = Array(8 - lowval.length + 1).join('0');
	return '0x' + hizerostoadd + hival + lowzerostoadd + lowval;
}
ByteArray.prototype.toString = function() {
	return ByteArray.prototype.inspect();
}


exports.ByteArray = ByteArray;

// var a = new ByteArray();
// a.setFromString('#156546cfd678643');
// console.log(a);